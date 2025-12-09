/*
  Warnings:

  - The `rehearsalDays` column on the `ScheduleConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ScheduleConfig" DROP COLUMN "rehearsalDays",
ADD COLUMN     "rehearsalDays" JSONB;
