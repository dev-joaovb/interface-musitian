-- CreateTable
CREATE TABLE "Attendance_report" (
    "id" SERIAL NOT NULL,
    "serieId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userName" TEXT,
    "userEmail" TEXT,
    "status" TEXT NOT NULL,
    "confirmacaoAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_report_serieId_userId_key" ON "Attendance_report"("serieId", "userId");

-- AddForeignKey
ALTER TABLE "Attendance_report" ADD CONSTRAINT "Attendance_report_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance_report" ADD CONSTRAINT "Attendance_report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
