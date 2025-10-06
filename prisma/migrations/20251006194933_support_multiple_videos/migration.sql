/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "videoUrl",
ADD COLUMN     "videos" JSONB NOT NULL DEFAULT '[]';
