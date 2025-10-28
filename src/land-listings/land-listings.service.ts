import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLandListingDto } from './dto/create-land-listing.dto';
import { UpdateLandListingDto } from './dto/update-land-listing.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListingCategory } from '@prisma/client';
import { LandListingFilterDto } from './dto/land-listing-filter.dto';

@Injectable()
export class LandListingsService {
  constructor(private prisma: PrismaService) {}
  create(createLandListingDto: CreateLandListingDto) {
    const { landDetails, ...listingData } = createLandListingDto;
    return this.prisma.listing.create({
      data: {
        ...listingData,
        category: ListingCategory.LAND,
        landDetails: {
          create: landDetails,
        },
      },
      include: {
        landDetails: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(filters: LandListingFilterDto) {
    const {
      page = 1,
      limit = 20,
      status,
      province,
      municipality,
      neighborhood,
      minPrice,
      maxPrice,
      currency,
      search,
      sort = 'newest',
    } = filters;

    const skip = (page - 1) * limit;

    // -------------------------------
    // Build the where clause
    // -------------------------------
    const where: any = {
      category: ListingCategory.LAND,
    };

    if (status) {
      where.status = status;
    }

    // Location filters
    if (province) where.province = { contains: province };
    if (municipality) where.municipality = { contains: municipality };
    if (neighborhood) where.neighborhood = { contains: neighborhood };

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Currency
    if (currency) {
      where.currency = currency;
    }

    // Full-text search (title + description)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // -------------------------------
    // Sorting
    // -------------------------------
    let orderBy: any = { createdAt: 'desc' };

    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    // -------------------------------
    // Query DB
    // -------------------------------
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          landDetails: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    // -------------------------------
    // Return response
    // -------------------------------
    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: {
        id,
        category: ListingCategory.LAND,
      },
      include: {
        landDetails: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('land listing not found');
    }

    return listing;
  }

  async update(id: string, updateLandListingDto: UpdateLandListingDto) {
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
      include: { landDetails: true },
    });
    if (!existingListing || existingListing.category !== ListingCategory.LAND) {
      throw new NotFoundException('Land listing not found');
    }
    const { landDetails, ...listingData } = updateLandListingDto;
    return this.prisma.listing.update({
      where: { id },
      data: {
        ...listingData,
        ...(landDetails && {
          landDetails: {
            update: landDetails,
          },
        }),
      },
      include: {
        landDetails: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if listing exists and is a land listing
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing || existingListing.category !== ListingCategory.LAND) {
      throw new NotFoundException('Land listing not found');
    }

    return this.prisma.listing.delete({
      where: { id },
      include: {
        landDetails: true,
      },
    });
  }
}
