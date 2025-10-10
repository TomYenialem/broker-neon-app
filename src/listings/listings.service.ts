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
}
