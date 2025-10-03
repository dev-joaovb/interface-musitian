/*
  Warnings:

  - You are about to drop the column `artist` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "artist",
DROP COLUMN "fileUrl",
ADD COLUMN     "arquivo" TEXT,
ADD COLUMN     "compositor" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'MP3';
