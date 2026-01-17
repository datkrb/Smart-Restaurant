/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Table` table. All the data in the column will be lost.
  - You are about to drop the column `qrToken` on the `Table` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ModifierGroup" DROP CONSTRAINT "ModifierGroup_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "ModifierOption" DROP CONSTRAINT "ModifierOption_modifierGroupId_fkey";

-- DropIndex
DROP INDEX "Table_qrToken_key";

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "isDeleted",
DROP COLUMN "qrToken";

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierOption" ADD CONSTRAINT "ModifierOption_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
