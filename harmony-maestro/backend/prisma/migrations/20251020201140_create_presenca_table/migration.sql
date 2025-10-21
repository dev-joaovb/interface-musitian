-- CreateTable
CREATE TABLE "Presenca" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serieId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aguardando Resposta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
