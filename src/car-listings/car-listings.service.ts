// src/car-listings/car-listings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CarListingFiltersDto } from './dto/car-listing-filters.dto';
import { ListingCategory, ListingStatus, Prisma } from '@prisma/client';

@Injectable()
export class CarListingsService {
  constructor(private prisma: PrismaService) {}

  create(createCarListingDto: CreateCarListingDto) {
    const {carDetails, ...listingData } = createCarListingDto;

    return this.prisma.listing.create({
      data: {
        ...listingData,
        category: ListingCategory.CAR,
        carDetails: {
          create: carDetails,
        },
      },
      include: {
        carDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(filters?: CarListingFiltersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      province,
      municipality,
      neighborhood,
      make,
      model,
      fuelType,
      transmission,
      condition,
      vehicleOrigin,
      customsStatus,
      minYear,
      maxYear,
      maxMileage,
    } = filters || {};

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      category: ListingCategory.CAR,
      status: ListingStatus.ACTIVE,
    };

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Location filters
    if (province) where.province = { contains: province, mode: 'insensitive' };
    if (municipality)
      where.municipality = { contains: municipality, mode: 'insensitive' };
    if (neighborhood)
      where.neighborhood = { contains: neighborhood, mode: 'insensitive' };

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Car details filters
    if (
      make ||
      model ||
      fuelType ||
      transmission ||
      condition ||
      vehicleOrigin ||
      customsStatus ||
      minYear ||
      maxYear ||
      maxMileage
    ) {
      where.carDetails = {};

      if (make) where.carDetails.make = { contains: make, mode: 'insensitive' };
      if (model)
        where.carDetails.model = { contains: model, mode: 'insensitive' };
      if (fuelType) where.carDetails.fuelType = fuelType;
      if (transmission) where.carDetails.transmission = transmission;
      if (condition) where.carDetails.condition = condition;
      if (vehicleOrigin) where.carDetails.vehicleOrigin = vehicleOrigin;
      if (customsStatus) where.carDetails.customsStatus = customsStatus;

      // Year range filter
      if (minYear !== undefined || maxYear !== undefined) {
        where.carDetails.manufactureYear = {};
        if (minYear !== undefined)
          where.carDetails.manufactureYear.gte = minYear;
        if (maxYear !== undefined)
          where.carDetails.manufactureYear.lte = maxYear;
      }

      // Mileage filter
      if (maxMileage !== undefined) {
        where.carDetails.mileage = { lte: maxMileage };
      }
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          carDetails: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
        category: ListingCategory.CAR,
      },
      include: {
        carDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Car listing not found');
    }

    return listing;
  }

  async update(id: string, updateCarListingDto: UpdateCarListingDto) {
    // Check if listing exists and is a car listing
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
      include: { carDetails: true },
    });

    if (!existingListing || existingListing.category !== ListingCategory.CAR) {
      throw new NotFoundException('Car listing not found');
    }

    const { carDetails, ...listingData } = updateCarListingDto;

    return this.prisma.listing.update({
      where: { id },
      data: {
        ...listingData,
        ...(carDetails && {
          carDetails: {
            update: carDetails,
          },
        }),
      },
      include: {
        carDetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if listing exists and is a car listing
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing || existingListing.category !== ListingCategory.CAR) {
      throw new NotFoundException('Car listing not found');
    }

    return this.prisma.listing.delete({
      where: { id },
      include: {
        carDetails: true,
      },
    });
  }

  // Additional methods for filtering
  async getAvailableMakes() {
    const makes = await this.prisma.carDetails.findMany({
      where: {
        listing: {
          status: ListingStatus.ACTIVE,
        },
      },
      distinct: ['make'],
      select: {
        make: true,
      },
      orderBy: {
        make: 'asc',
      },
    });

    return makes.map((item) => item.make);
  }

  // async getModelsByMake(make: string) {
  //   const models = await this.prisma.carDetails.findMany({
  //     where: {
  //       make: Prisma.validator<Prisma.StringFilter>()({
  //         equals: make,
  //         mode: 'insensitive',
  //       }),

  //       listing: {
  //         status: ListingStatus.ACTIVE,
  //       },
  //     },
  //     distinct: ['model'],
  //     select: {
  //       model: true,
  //     },
  //     orderBy: {
  //       model: 'asc',
  //     },
  //   });

  //   return models.map((item) => item.model);
  // }
}
