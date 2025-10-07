-- AlterTable
ALTER TABLE "CarDetails" ADD COLUMN     "additionalInformation" TEXT,
ADD COLUMN     "customFeatures" JSONB;

-- AlterTable
ALTER TABLE "HouseDetails" ADD COLUMN     "additionalInformation" TEXT,
ADD COLUMN     "customFeatures" JSONB;

-- AlterTable
ALTER TABLE "LandDetails" ADD COLUMN     "additionalInformation" TEXT,
ADD COLUMN     "customFeatures" JSONB;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MachineDetails" ADD COLUMN     "additionalInformation" TEXT,
ADD COLUMN     "customFeatures" JSONB;
