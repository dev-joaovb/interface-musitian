/*
  Warnings:

  - You are about to drop the column `repeatCount` on the `ScheduleConfig` table. All the data in the column will be lost.
  - You are about to drop the column `rotationIndex` on the `ScheduleConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduleConfig" DROP COLUMN "repeatCount",
DROP COLUMN "rotationIndex";

-- AlterTable
ALTER TABLE "WeeklySchedule" ADD COLUMN     "repeatCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rotationIndex" INTEGER NOT NULL DEFAULT 0;
