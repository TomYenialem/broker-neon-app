-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "priceText" TEXT,
ALTER COLUMN "price" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_listing_cat_priceText" ON "Listing"("category", "priceText");

-- CreateIndex
CREATE INDEX "idx_listing_priceText" ON "Listing"("priceText");
