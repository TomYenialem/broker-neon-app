import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMachineListingDto } from './dto/create-machine-listing.dto';
import { UpdateMachineListingDto } from './dto/update-machine-listing.dto';
import { MachineListingFilterDto } from './dto/machine-listing-filter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ListingCategory } from '@prisma/client';

@Injectable()
export class MachineListingsService {
  constructor(private prisma: PrismaService) {}

  async create(createMachineListingDto: CreateMachineListingDto) {
    const { machineDetails, price, priceText, ...listingData } =
      createMachineListingDto as any;

    return this.prisma.listing.create({
      data: {
        ...listingData,
        price: price === undefined || price === null ? undefined : price,
        priceText: priceText,
        category: ListingCategory.MACHINE,
        machineDetails: {
          create: machineDetails,
        },
      },
      include: {
        machineDetails: true,
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

  async findAll(filters: MachineListingFilterDto) {
    const {
      page = 1,
      limit = 20,
      status,
      province,
      municipality,
      minPrice,
      maxPrice,
      currency,
      search,
      sort = 'newest',
      machineType,
      condition,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      category: ListingCategory.MACHINE,
    };

    if (status) where.status = status;
    if (province) where.province = { contains: province };
    if (municipality) where.municipality = { contains: municipality };

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

    if (machineType || condition) {
      where.machineDetails = {};
      if (machineType)
        where.machineDetails.machineType = { contains: machineType };
      if (condition) where.machineDetails.condition = condition;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          machineDetails: true,
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
        category: ListingCategory.MACHINE,
      },
      include: {
        machineDetails: true,
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
      throw new NotFoundException('Machine listing not found');
    }

    return listing;
  }

  async update(id: string, updateMachineListingDto: UpdateMachineListingDto) {
    const existingListing = await this.prisma.listing.findUnique({
      where: { id },
      include: { machineDetails: true },
    });

    if (
      !existingListing ||
      existingListing.category !== ListingCategory.MACHINE
    ) {
      throw new NotFoundException('Machine listing not found');
    }

    const { machineDetails, price, priceText, ...listingData } =
      updateMachineListingDto as any;

    return this.prisma.listing.update({
      where: { id },
      data: {
        ...listingData,
        price:
          price === undefined || price === null ? existingListing.price : price,
        priceText:
          priceText === undefined ? existingListing.priceText : priceText,
        ...(machineDetails && {
          machineDetails: {
            update: machineDetails,
          },
        }),
      },
      include: {
        machineDetails: true,
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
      existingListing.category !== ListingCategory.MACHINE
    ) {
      throw new NotFoundException('Machine listing not found');
    }

    return this.prisma.listing.delete({
      where: { id },
      include: {
        machineDetails: true,
      },
    });
  }
}
