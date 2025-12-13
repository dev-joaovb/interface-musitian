/*
  Warnings:

  - You are about to drop the column `repeatCount` on the `WeeklySchedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduleConfig" ADD COLUMN     "repeatCount" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "WeeklySchedule" DROP COLUMN "repeatCount",
ADD COLUMN     "repeatCounter" INTEGER NOT NULL DEFAULT 1;
