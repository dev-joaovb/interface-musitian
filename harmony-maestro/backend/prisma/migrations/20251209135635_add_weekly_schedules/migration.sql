/*
  Warnings:

  - The `selectedSongIds` column on the `WeeklySchedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WeeklySchedule" DROP COLUMN "selectedSongIds",
ADD COLUMN     "selectedSongIds" JSONB;
