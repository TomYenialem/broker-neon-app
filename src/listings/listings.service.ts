import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AllListingsFilterDto } from './dto/all-listings-filter.dto';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: AllListingsFilterDto) {
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      status,
      category,
      search,
      province,
      sort = 'newest',
      currency,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Status filter
    if (status) where.status = status;

    // Category filter
    if (category) where.category = category;

    // Currency filter
    if (currency) where.currency = currency;

    // Province filter
    if (province) where.province = { contains: province, mode: 'insensitive' };

    // Search filter (title, description, province)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          status: true,
          category: true,
          province: true,
          municipality: true,
          neighborhood: true,
          images: true,
          videos: true,
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
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        category,
        status,
        priceRange: { min: minPrice, max: maxPrice },
        province,
        search,
      },
    };
  }
}
