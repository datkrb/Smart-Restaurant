-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountType" TEXT,
ADD COLUMN     "finalAmount" DOUBLE PRECISION;
