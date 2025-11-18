-- AlterTable
ALTER TABLE "Partitura" ADD COLUMN     "folderId" INTEGER;

-- CreateTable
CREATE TABLE "FolderPartitura" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FolderPartitura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Partitura" ADD CONSTRAINT "Partitura_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "FolderPartitura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderPartitura" ADD CONSTRAINT "FolderPartitura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
