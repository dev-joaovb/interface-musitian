-- CreateTable
CREATE TABLE "Partitura" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "arquivoUrl" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Partitura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Partitura" ADD CONSTRAINT "Partitura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
