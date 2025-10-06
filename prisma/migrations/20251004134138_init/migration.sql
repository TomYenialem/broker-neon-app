-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('LAND', 'CAR', 'HOUSE', 'MACHINE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AOA', 'USD');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'PENDING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('SQUARE_METERS', 'HECTARES');

-- CreateEnum
CREATE TYPE "Topography" AS ENUM ('FLAT', 'SLOPED', 'HILLY');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TITLE_DEED', 'SURFACE_RIGHT', 'ASSIGNMENT_CONTRACT', 'LAND_USE_LICENSE');

-- CreateEnum
CREATE TYPE "LandPurpose" AS ENUM ('AGRICULTURAL', 'RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "SoilType" AS ENUM ('SANDY', 'CLAY', 'LOAMY');

-- CreateEnum
CREATE TYPE "ZoningType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "UtilityAccess" AS ENUM ('CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('NEW', 'EXCELLENT', 'GOOD', 'NEEDS_REPAIR');

-- CreateEnum
CREATE TYPE "InteriorType" AS ENUM ('LEATHER', 'FABRIC');

-- CreateEnum
CREATE TYPE "VehicleOrigin" AS ENUM ('EUROPE', 'ASIA', 'AMERICA', 'AFRICA');

-- CreateEnum
CREATE TYPE "CustomsStatus" AS ENUM ('LEGALIZED', 'PENDING', 'NOT_LEGALIZED');

-- CreateEnum
CREATE TYPE "HouseType" AS ENUM ('DETACHED', 'TOWNHOUSE', 'VILLA', 'APARTMENT');

-- CreateEnum
CREATE TYPE "ConstructionQuality" AS ENUM ('NEW_CONSTRUCTION', 'RECENTLY_RENOVATED', 'GOOD_CONDITION', 'NEEDS_RENOVATION');

-- CreateEnum
CREATE TYPE "WaterSource" AS ENUM ('PUBLIC_NETWORK', 'PRIVATE_WELL', 'BOTH');

-- CreateEnum
CREATE TYPE "MachineCondition" AS ENUM ('NEW', 'USED', 'RECONDITIONED');

-- CreateEnum
CREATE TYPE "SparePartsAvailability" AS ENUM ('EASILY_AVAILABLE', 'AVAILABLE', 'DIFFICULT', 'NOT_AVAILABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'AOA',
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "province" TEXT,
    "municipality" TEXT,
    "neighborhood" TEXT,
    "images" JSONB NOT NULL,
    "videoUrl" TEXT,
    "category" "ListingCategory" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandDetails" (
    "listingId" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "areaUnit" "AreaUnit" NOT NULL DEFAULT 'SQUARE_METERS',
    "topography" "Topography",
    "distanceFromMainRoad" DOUBLE PRECISION,
    "isDemarcated" BOOLEAN,
    "documentType" "DocumentType",
    "landPurpose" "LandPurpose" NOT NULL,
    "waterSource" TEXT,
    "hasIrrigationSystem" BOOLEAN,
    "soilType" "SoilType",
    "soilTested" BOOLEAN,
    "previousUse" TEXT,
    "agriculturalSupport" TEXT,
    "climateInfo" TEXT,
    "zoningType" "ZoningType",
    "electricityAccess" "UtilityAccess",
    "waterAccess" "UtilityAccess",
    "sanitationAccess" "UtilityAccess",
    "securityInfo" TEXT,

    CONSTRAINT "LandDetails_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "CarDetails" (
    "listingId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trimLevel" TEXT,
    "manufactureYear" INTEGER,
    "registrationYear" INTEGER,
    "mileage" DOUBLE PRECISION,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "condition" "VehicleCondition" NOT NULL,
    "color" TEXT,
    "interiorType" "InteriorType",
    "vehicleOrigin" "VehicleOrigin",
    "customsStatus" "CustomsStatus" NOT NULL,
    "serviceHistory" BOOLEAN,
    "reasonForSelling" TEXT,
    "features" JSONB NOT NULL,

    CONSTRAINT "CarDetails_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "HouseDetails" (
    "listingId" TEXT NOT NULL,
    "houseType" "HouseType" NOT NULL,
    "plotSize" DOUBLE PRECISION,
    "livingArea" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "constructionQuality" "ConstructionQuality" NOT NULL,
    "waterSource" "WaterSource",
    "hasWaterTank" BOOLEAN,
    "hasGenerator" BOOLEAN,
    "hasInverter" BOOLEAN,
    "securityFeatures" JSONB NOT NULL,
    "interiorFeatures" JSONB NOT NULL,
    "exteriorFeatures" JSONB NOT NULL,
    "distanceToCityCenter" DOUBLE PRECISION,
    "distanceToSchools" DOUBLE PRECISION,
    "distanceToHospitals" DOUBLE PRECISION,
    "distanceToSupermarkets" DOUBLE PRECISION,

    CONSTRAINT "HouseDetails_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "MachineDetails" (
    "listingId" TEXT NOT NULL,
    "machineType" TEXT NOT NULL,
    "modelNumber" TEXT,
    "condition" "MachineCondition" NOT NULL,
    "manufactureYear" INTEGER,
    "hoursOfUse" DOUBLE PRECISION,
    "workingCapacity" TEXT,
    "specifications" TEXT,
    "serviceHistory" BOOLEAN,
    "reasonForSale" TEXT,
    "sparePartsAvailability" "SparePartsAvailability",
    "currentLocation" TEXT,

    CONSTRAINT "MachineDetails_pkey" PRIMARY KEY ("listingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");

-- CreateIndex
CREATE INDEX "idx_listing_cat_status_createdAt" ON "Listing"("category", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_listing_cat_price" ON "Listing"("category", "price");

-- CreateIndex
CREATE INDEX "idx_listing_location" ON "Listing"("province", "municipality", "neighborhood");

-- CreateIndex
CREATE INDEX "idx_listing_user_createdAt" ON "Listing"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_listing_status_createdAt" ON "Listing"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_listing_price" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "idx_listing_title" ON "Listing"("title");

-- CreateIndex
CREATE INDEX "idx_listing_description" ON "Listing"("description");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandDetails" ADD CONSTRAINT "LandDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetails" ADD CONSTRAINT "CarDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseDetails" ADD CONSTRAINT "HouseDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
