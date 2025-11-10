/*
  Warnings:

  - You are about to drop the column `faltasResumo` on the `Past_events` table. All the data in the column will be lost.
  - You are about to drop the column `presencasResumo` on the `Past_events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Past_events" DROP COLUMN "faltasResumo",
DROP COLUMN "presencasResumo",
ADD COLUMN     "attendanceResumo" JSONB;
