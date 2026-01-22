/*
  Warnings:

  - Made the column `make` on table `CarDetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model` on table `CarDetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalArea` on table `LandDetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `areaUnit` on table `LandDetails` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CarDetails" ALTER COLUMN "make" SET NOT NULL,
ALTER COLUMN "model" SET NOT NULL;

-- AlterTable
ALTER TABLE "LandDetails" ALTER COLUMN "totalArea" SET NOT NULL,
ALTER COLUMN "areaUnit" SET NOT NULL;
