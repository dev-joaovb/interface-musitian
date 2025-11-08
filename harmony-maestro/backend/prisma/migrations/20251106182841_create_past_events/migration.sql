-- CreateTable
CREATE TABLE "Past_events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Past_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Past_events" ADD CONSTRAINT "Past_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
