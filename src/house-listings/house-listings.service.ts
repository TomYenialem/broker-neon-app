import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHouseListingDto } from './dto/create-house-listing.dto';
import { UpdateHouseListingDto } from './dto/update-house-listing.dto';
import { HouseListingFilterDto } from './dto/house-listing-filter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCategory } from '@prisma/client';

@Injectable()
export class HouseListingsService {
  constructor(private prisma: PrismaService) {}

  async create(createHouseListingDto: CreateHouseListingDto) {
    const { houseDetails, price, priceText, ...listingData } =
      createHouseListingDto as any;
    console.log('🔥 Received body:');

    return this.prisma.listing.create({
      data: {
        ...listingData,
        price: price === undefined || price === null ? undefined : price,
        priceText: priceText,
        category: ListingCategory.HOUSE,
        houseDetails: {
          create: houseDetails,
        },
      },
      include: {
        houseDetails: true,
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

  async findAll(filters: HouseListingFilterDto) {
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
      houseType,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      category: ListingCategory.HOUSE,
    };

    if (status) where.status = status;
    if (province) where.province = { contains: province };
    if (municipality) where.municipality = { contains: municipality };
    if (neighborhood) where.neighborhood = { contains: neighborhood };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (currency) where.currency = currency;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // House-specific filters
    if (
      houseType ||
      minBedrooms ||
      maxBedrooms ||
      minBathrooms ||
      maxBathrooms
    ) {
      where.houseDetails = {};

      if (houseType) where.houseDetails.houseType = houseType;

      if (minBedrooms !== undefined || maxBedrooms !== undefined) {
        where.houseDetails.bedrooms = {};
        if (minBedrooms !== undefined)
          where.houseDetails.bedrooms.gte = minBedrooms;
        if (maxBedrooms !== undefined)
          where.houseDetails.bedrooms.lte = maxBedrooms;
      }

      if (minBathrooms !== undefined || maxBathrooms !== undefined) {
        where.houseDetails.bathrooms = {};
        if (minBathrooms !== undefined)
          where.houseDetails.bathrooms.gte = minBathrooms;
        if (maxBathrooms !== undefined)
          where.houseDetails.bathrooms.lte = maxBathrooms;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          houseDetails: true,
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
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: {
        id,
        category: ListingCategory.HOUSE,
      },
      include: {
        houseDetails: true,
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
      throw new NotFoundException('House listing not found');
    }

    return listing;
  }

  async update(id: string, updateHouseListingDto: UpdateHouseListingDto) {
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
      include: { houseDetails: true },
    });

    if (
      !existingListing ||
      existingListing.category !== ListingCategory.HOUSE
    ) {
      throw new NotFoundException('House listing not found');
    }

    const { houseDetails, price, priceText, ...listingData } =
      updateHouseListingDto as any;

    return this.prisma.listing.update({
      where: { id },
      data: {
        ...listingData,
        price:
          price === undefined || price === null ? existingListing.price : price,
        priceText:
          priceText === undefined ? existingListing.priceText : priceText,
        ...(houseDetails && {
          houseDetails: {
            update: houseDetails,
          },
        }),
      },
      include: {
        houseDetails: true,
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

  async remove(id: string) {
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (
      !existingListing ||
      existingListing.category !== ListingCategory.HOUSE
    ) {
      throw new NotFoundException('House listing not found');
    }

    return this.prisma.listing.delete({
      where: { id },
      include: {
        houseDetails: true,
      },
    });
  }
}
