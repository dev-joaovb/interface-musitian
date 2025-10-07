-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_seriesId_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
