import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListingCategory,
  ListingStatus,
  FuelType,
  Transmission,
  VehicleCondition,
  HouseType,
  MachineCondition,
  LandPurpose,
  ZoningType,
} from '@prisma/client';

interface GetAllListingsDto {
  page: number;
  limit: number;
  category?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  province?: string;
  sort?: string;
  // Car-specific filters
  carFuelType?: FuelType;
  carTransmission?: Transmission;
  carCondition?: VehicleCondition;
  // House-specific filters
  houseHouseType?: HouseType;
  houseBedrooms?: number;
  houseBathrooms?: number;
  houseFurnished?: string;
  // Land-specific filters
  landLandPurpose?: LandPurpose;
  landZoningType?: ZoningType;
  landMinArea?: number;
  landMaxArea?: number;
  // Machine-specific filters
  machineMachineType?: string;
  machineCondition?: MachineCondition;
}

interface GetFeaturedListingsDto {
  page: number;
  limit: number;
  category?: string;
  sort?: string;
}

@Injectable()
export class ListingsService {
  private readonly baseListingSelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    priceText: true,
    currency: true,
    status: true,
    province: true,
    municipality: true,
    neighborhood: true,
    images: true,
    videos: true,
    isFeatured: true,
    category: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  } as const;

  constructor(private prisma: PrismaService) {}

  async getAllListings(filters: GetAllListingsDto) {
    const {
      page,
      limit,
      category,
      status,
      search,
      minPrice,
      maxPrice,
      province,
      sort,
    } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category as ListingCategory;
    }

    if (status) {
      where.status = status as ListingStatus;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
        { municipality: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    if (province) {
      where.province = { contains: province, mode: 'insensitive' };
    }

    // Category-specific filters using nested where clauses
    // Car filters
    if (
      filters.carFuelType ||
      filters.carTransmission ||
      filters.carCondition
    ) {
      where.carDetails = {};
      if (filters.carFuelType) {
        where.carDetails.fuelType = filters.carFuelType;
      }
      if (filters.carTransmission) {
        where.carDetails.transmission = filters.carTransmission;
      }
      if (filters.carCondition) {
        where.carDetails.condition = filters.carCondition;
      }
    }

    // House filters
    if (
      filters.houseHouseType ||
      filters.houseBedrooms !== undefined ||
      filters.houseBathrooms !== undefined ||
      filters.houseFurnished
    ) {
      where.houseDetails = {};
      if (filters.houseHouseType) {
        where.houseDetails.houseType = filters.houseHouseType;
      }
      if (filters.houseBedrooms !== undefined) {
        where.houseDetails.bedrooms = filters.houseBedrooms;
      }
      if (filters.houseBathrooms !== undefined) {
        where.houseDetails.bathrooms = filters.houseBathrooms;
      }
      // Note: furnished is stored in interiorFeatures JSON, handled separately if needed
      if (filters.houseFurnished) {
        // This would need to search in the JSON field, which is complex
        // For now, we'll skip it as it's not a direct database field
      }
    }

    // Land filters
    if (
      filters.landLandPurpose ||
      filters.landZoningType ||
      filters.landMinArea !== undefined ||
      filters.landMaxArea !== undefined
    ) {
      where.landDetails = {};
      if (filters.landLandPurpose) {
        where.landDetails.landPurpose = filters.landLandPurpose;
      }
      if (filters.landZoningType) {
        where.landDetails.zoningType = filters.landZoningType;
      }
      if (
        filters.landMinArea !== undefined ||
        filters.landMaxArea !== undefined
      ) {
        where.landDetails.totalArea = {};
        if (filters.landMinArea !== undefined) {
          where.landDetails.totalArea.gte = filters.landMinArea;
        }
        if (filters.landMaxArea !== undefined) {
          where.landDetails.totalArea.lte = filters.landMaxArea;
        }
      }
    }

    // Machine filters
    if (filters.machineMachineType || filters.machineCondition) {
      where.machineDetails = {};
      if (filters.machineMachineType) {
        where.machineDetails.machineType = {
          contains: filters.machineMachineType,
          mode: 'insensitive',
        };
      }
      if (filters.machineCondition) {
        where.machineDetails.condition = filters.machineCondition;
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      switch (sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    try {
      const [baseListings, total] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: this.baseListingSelect,
        }),
        this.prisma.listing.count({ where }),
      ]);

      const listings = await this.hydrateListingDetails(baseListings);

      return {
        data: listings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      const code = err?.code || err?.name || err?.error?.name;
      const isTimeout = code === 'TimeoutError';
      if (code === 'P1001' || isTimeout) {
        // eslint-disable-next-line no-console
        console.error(
          'Database unreachable or timed out. Returning empty listings.',
        );
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
      throw err;
    }
  }

  private async hydrateListingDetails(listings: any[]) {
    if (!listings.length) {
      return listings;
    }

    const listingIds = listings.map((listing: any) => listing.id);

    const [carDetails, houseDetails, landDetails, machineDetails] =
      await Promise.all([
        this.prisma.carDetails.findMany({
          where: { listingId: { in: listingIds } },
        }),
        this.prisma.houseDetails.findMany({
          where: { listingId: { in: listingIds } },
        }),
        this.prisma.landDetails.findMany({
          where: { listingId: { in: listingIds } },
        }),
        this.prisma.machineDetails.findMany({
          where: { listingId: { in: listingIds } },
        }),
      ]);

    const carMap = new Map(
      carDetails.map((detail: any) => [detail.listingId, detail]),
    );
    const houseMap = new Map(
      houseDetails.map((detail: any) => [detail.listingId, detail]),
    );
    const landMap = new Map(
      landDetails.map((detail: any) => [detail.listingId, detail]),
    );
    const machineMap = new Map(
      machineDetails.map((detail: any) => [detail.listingId, detail]),
    );

    return listings.map((listing: any) => ({
      ...listing,
      carDetails: carMap.get(listing.id) ?? null,
      houseDetails: houseMap.get(listing.id) ?? null,
      landDetails: landMap.get(listing.id) ?? null,
      machineDetails: machineMap.get(listing.id) ?? null,
    }));
  }

  async getListingById(id: string) {
    return this.prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        carDetails: true,
        houseDetails: true,
        landDetails: true,
        machineDetails: true,
      },
    });
  }

  async getFeaturedListings(filters: GetFeaturedListingsDto) {
    const { page, limit, category, sort } = filters;
    const skip = (page - 1) * limit;

    // Build where clause - only featured and active listings
    const where: any = {
      isFeatured: true,
      status: ListingStatus.ACTIVE,
    };

    if (category) {
      where.category = category as ListingCategory;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      switch (sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    try {
      const [baseListings, total] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: this.baseListingSelect,
        }),
        this.prisma.listing.count({ where }),
      ]);

      const listings = await this.hydrateListingDetails(baseListings);

      return {
        data: listings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      const code = err?.code || err?.name || err?.error?.name;
      const isTimeout = code === 'TimeoutError';
      if (code === 'P1001' || isTimeout) {
        // eslint-disable-next-line no-console
        console.error(
          'Database unreachable or timed out. Returning empty featured listings.',
        );
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
      throw err;
    }
  }

  async getDashboardStatistics() {
    // Get all statistics in parallel for better performance
    const [
      totalUsers,
      adminCount,
      totalListings,
      activeListings,
      soldListings,
      pendingListings,
      expiredListings,
      featuredListings,
      carListings,
      houseListings,
      landListings,
      machineListings,
      recentListings,
    ] = await Promise.all([
      // User statistics
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),

      // Overall listing statistics
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      this.prisma.listing.count({ where: { status: ListingStatus.SOLD } }),
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
      this.prisma.listing.count({ where: { status: ListingStatus.EXPIRED } }),
      this.prisma.listing.count({ where: { isFeatured: true } }),

      // Category-specific statistics
      this.prisma.listing.groupBy({
        by: ['status'],
        where: { category: ListingCategory.CAR },
        _count: true,
      }),
      this.prisma.listing.groupBy({
        by: ['status'],
        where: { category: ListingCategory.HOUSE },
        _count: true,
      }),
      this.prisma.listing.groupBy({
        by: ['status'],
        where: { category: ListingCategory.LAND },
        _count: true,
      }),
      this.prisma.listing.groupBy({
        by: ['status'],
        where: { category: ListingCategory.MACHINE },
        _count: true,
      }),

      // Recent listings (last 5)
      this.prisma.listing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          price: true,
          currency: true,
          status: true,
          isFeatured: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    // Helper function to organize category stats
    const organizeCategoryStats = (groupedData: any[]) => {
      const stats = {
        total: 0,
        active: 0,
        sold: 0,
        pending: 0,
        expired: 0,
      };

      groupedData.forEach((item) => {
        stats.total += item._count;
        switch (item.status) {
          case ListingStatus.ACTIVE:
            stats.active = item._count;
            break;
          case ListingStatus.SOLD:
            stats.sold = item._count;
            break;
          case ListingStatus.PENDING:
            stats.pending = item._count;
            break;
          case ListingStatus.EXPIRED:
            stats.expired = item._count;
            break;
        }
      });

      return stats;
    };

    return {
      users: {
        total: totalUsers,
        admins: adminCount,
        regularUsers: totalUsers - adminCount,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        pending: pendingListings,
        expired: expiredListings,
        featured: featuredListings,
      },
      byCategory: {
        CAR: organizeCategoryStats(carListings),
        HOUSE: organizeCategoryStats(houseListings),
        LAND: organizeCategoryStats(landListings),
        MACHINE: organizeCategoryStats(machineListings),
      },
      recentListings: recentListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        category: listing.category,
        price: listing.price,
        currency: listing.currency,
        status: listing.status,
        isFeatured: listing.isFeatured,
        createdAt: listing.createdAt,
        createdBy: listing.user
          ? `${listing.user.firstName} ${listing.user.lastName}`
          : 'Unknown',
      })),
    };
  }
}
