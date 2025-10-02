/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Series` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_EventToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SeriesToSong` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventToUser" DROP CONSTRAINT "_EventToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventToUser" DROP CONSTRAINT "_EventToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SeriesToSong" DROP CONSTRAINT "_SeriesToSong_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SeriesToSong" DROP CONSTRAINT "_SeriesToSong_B_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "createdAt",
ADD COLUMN     "seriesId" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "eventId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Series" DROP COLUMN "description",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."_EventToUser";

-- DropTable
DROP TABLE "public"."_SeriesToSong";

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
