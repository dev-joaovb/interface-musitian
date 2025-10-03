/*
  Warnings:

  - You are about to drop the column `arquivo` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `compositor` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "arquivo",
DROP COLUMN "compositor",
DROP COLUMN "tipo",
ADD COLUMN     "artist" TEXT,
ADD COLUMN     "fileUrl" TEXT;
