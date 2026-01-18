-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED';
