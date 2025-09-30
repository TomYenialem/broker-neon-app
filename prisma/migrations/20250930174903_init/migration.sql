-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Listing` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `currency` ENUM('AOA', 'USD') NOT NULL DEFAULT 'AOA',
    `status` ENUM('ACTIVE', 'SOLD', 'PENDING', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `province` VARCHAR(191) NULL,
    `municipality` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NULL,
    `images` JSON NOT NULL,
    `videoUrl` VARCHAR(191) NULL,
    `category` ENUM('LAND', 'CAR', 'HOUSE', 'MACHINE') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `idx_listing_cat_status_createdAt`(`category`, `status`, `createdAt` DESC),
    INDEX `idx_listing_cat_price`(`category`, `price`),
    INDEX `idx_listing_location`(`province`, `municipality`, `neighborhood`),
    INDEX `idx_listing_user_createdAt`(`userId`, `createdAt` DESC),
    INDEX `idx_listing_status_createdAt`(`status`, `createdAt` DESC),
    INDEX `idx_listing_price`(`price`),
    FULLTEXT INDEX `ft_listing_title_desc`(`title`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandDetails` (
    `listingId` VARCHAR(191) NOT NULL,
    `totalArea` DOUBLE NOT NULL,
    `areaUnit` ENUM('SQUARE_METERS', 'HECTARES') NOT NULL DEFAULT 'SQUARE_METERS',
    `topography` ENUM('FLAT', 'SLOPED', 'HILLY') NULL,
    `distanceFromMainRoad` DOUBLE NULL,
    `isDemarcated` BOOLEAN NULL,
    `documentType` ENUM('TITLE_DEED', 'SURFACE_RIGHT', 'ASSIGNMENT_CONTRACT', 'LAND_USE_LICENSE') NULL,
    `landPurpose` ENUM('AGRICULTURAL', 'RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE') NOT NULL,
    `waterSource` VARCHAR(191) NULL,
    `hasIrrigationSystem` BOOLEAN NULL,
    `soilType` ENUM('SANDY', 'CLAY', 'LOAMY') NULL,
    `soilTested` BOOLEAN NULL,
    `previousUse` VARCHAR(191) NULL,
    `agriculturalSupport` VARCHAR(191) NULL,
    `climateInfo` VARCHAR(191) NULL,
    `zoningType` ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE') NULL,
    `electricityAccess` ENUM('CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE') NULL,
    `waterAccess` ENUM('CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE') NULL,
    `sanitationAccess` ENUM('CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE') NULL,
    `securityInfo` VARCHAR(191) NULL,

    PRIMARY KEY (`listingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CarDetails` (
    `listingId` VARCHAR(191) NOT NULL,
    `make` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `trimLevel` VARCHAR(191) NULL,
    `manufactureYear` INTEGER NULL,
    `registrationYear` INTEGER NULL,
    `mileage` DOUBLE NULL,
    `fuelType` ENUM('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC') NOT NULL,
    `transmission` ENUM('MANUAL', 'AUTOMATIC') NOT NULL,
    `condition` ENUM('NEW', 'EXCELLENT', 'GOOD', 'NEEDS_REPAIR') NOT NULL,
    `color` VARCHAR(191) NULL,
    `interiorType` ENUM('LEATHER', 'FABRIC') NULL,
    `vehicleOrigin` ENUM('EUROPE', 'ASIA', 'AMERICA', 'AFRICA') NULL,
    `customsStatus` ENUM('LEGALIZED', 'PENDING', 'NOT_LEGALIZED') NOT NULL,
    `serviceHistory` BOOLEAN NULL,
    `reasonForSelling` VARCHAR(191) NULL,
    `features` JSON NOT NULL,

    PRIMARY KEY (`listingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HouseDetails` (
    `listingId` VARCHAR(191) NOT NULL,
    `houseType` ENUM('DETACHED', 'TOWNHOUSE', 'VILLA', 'APARTMENT') NOT NULL,
    `plotSize` DOUBLE NULL,
    `livingArea` DOUBLE NOT NULL,
    `bedrooms` INTEGER NOT NULL,
    `bathrooms` INTEGER NOT NULL,
    `constructionQuality` ENUM('NEW_CONSTRUCTION', 'RECENTLY_RENOVATED', 'GOOD_CONDITION', 'NEEDS_RENOVATION') NOT NULL,
    `waterSource` ENUM('PUBLIC_NETWORK', 'PRIVATE_WELL', 'BOTH') NULL,
    `hasWaterTank` BOOLEAN NULL,
    `hasGenerator` BOOLEAN NULL,
    `hasInverter` BOOLEAN NULL,
    `securityFeatures` JSON NOT NULL,
    `interiorFeatures` JSON NOT NULL,
    `exteriorFeatures` JSON NOT NULL,
    `distanceToCityCenter` DOUBLE NULL,
    `distanceToSchools` DOUBLE NULL,
    `distanceToHospitals` DOUBLE NULL,
    `distanceToSupermarkets` DOUBLE NULL,

    PRIMARY KEY (`listingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MachineDetails` (
    `listingId` VARCHAR(191) NOT NULL,
    `machineType` VARCHAR(191) NOT NULL,
    `modelNumber` VARCHAR(191) NULL,
    `condition` ENUM('NEW', 'USED', 'RECONDITIONED') NOT NULL,
    `manufactureYear` INTEGER NULL,
    `hoursOfUse` DOUBLE NULL,
    `workingCapacity` VARCHAR(191) NULL,
    `specifications` VARCHAR(191) NULL,
    `serviceHistory` BOOLEAN NULL,
    `reasonForSale` VARCHAR(191) NULL,
    `sparePartsAvailability` ENUM('EASILY_AVAILABLE', 'AVAILABLE', 'DIFFICULT', 'NOT_AVAILABLE') NULL,
    `currentLocation` VARCHAR(191) NULL,

    PRIMARY KEY (`listingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LandDetails` ADD CONSTRAINT `LandDetails_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CarDetails` ADD CONSTRAINT `CarDetails_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HouseDetails` ADD CONSTRAINT `HouseDetails_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MachineDetails` ADD CONSTRAINT `MachineDetails_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
