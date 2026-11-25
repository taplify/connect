ALTER TABLE "NFCCard"
  ALTER COLUMN "ownerId" DROP NOT NULL,
  ADD COLUMN "activationCodeHash" TEXT,
  ADD COLUMN "activatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "NFCCard_activationCodeHash_key"
  ON "NFCCard"("activationCodeHash");
