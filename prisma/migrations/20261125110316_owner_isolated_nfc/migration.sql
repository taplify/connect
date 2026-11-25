/*
  Warnings:

  - Added the required column `ownerId` to the `NFCCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NFCCard" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "NFCCard_ownerId_idx" ON "NFCCard"("ownerId");

-- AddForeignKey
ALTER TABLE "NFCCard" ADD CONSTRAINT "NFCCard_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
