/*
  Warnings:

  - Added the required column `type` to the `OtpCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PortfolioItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PortfolioItem" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "afterPhoto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "isRevoked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "OtpCode_type_idx" ON "OtpCode"("type");

-- CreateIndex
CREATE INDEX "OtpCode_isUsed_idx" ON "OtpCode"("isUsed");

-- CreateIndex
CREATE INDEX "PortfolioItem_isPublished_idx" ON "PortfolioItem"("isPublished");

-- CreateIndex
CREATE INDEX "RefreshToken_isRevoked_idx" ON "RefreshToken"("isRevoked");

-- CreateIndex
CREATE INDEX "Skill_isActive_idx" ON "Skill"("isActive");
