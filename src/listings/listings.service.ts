import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCategory, ListingStatus } from '@prisma/client';

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
}

interface GetFeaturedListingsDto {
  page: number;
  limit: number;
  category?: string;
  sort?: string;
}

@Injectable()
export class ListingsService {
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

    // Get listings with pagination
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          carDetails: true,
          houseDetails: true,
          landDetails: true,
          machineDetails: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    // Get featured listings with pagination
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          carDetails: true,
          houseDetails: true,
          landDetails: true,
          machineDetails: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
