-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "rehearsalDays" JSONB NOT NULL,
    "eventDay" TEXT,
    "usersPerScale" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklySchedule" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "originalUserIds" JSONB NOT NULL,
    "currentUsers" JSONB NOT NULL,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleConfig_ownerId_key" ON "ScheduleConfig"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySchedule_ownerId_weekNumber_key" ON "WeeklySchedule"("ownerId", "weekNumber");

-- AddForeignKey
ALTER TABLE "ScheduleConfig" ADD CONSTRAINT "ScheduleConfig_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklySchedule" ADD CONSTRAINT "WeeklySchedule_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
