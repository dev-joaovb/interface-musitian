/*
  Warnings:

  - You are about to drop the column `endDate` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Series" DROP COLUMN "endDate",
ADD COLUMN     "hour" TEXT;
