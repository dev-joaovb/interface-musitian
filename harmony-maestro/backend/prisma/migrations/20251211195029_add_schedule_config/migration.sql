/*
  Warnings:

  - You are about to drop the column `requiredInstruments` on the `ScheduleConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduleConfig" DROP COLUMN "requiredInstruments",
ADD COLUMN     "repeatCount" INTEGER NOT NULL DEFAULT 1;
