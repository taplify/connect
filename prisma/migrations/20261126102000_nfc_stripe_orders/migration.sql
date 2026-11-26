CREATE TYPE "NFCOrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

ALTER TABLE "NFCCard"
  ADD COLUMN "isReadyForSale" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE "NFCCard"
SET "isReadyForSale" = TRUE
WHERE "ownerId" IS NULL
  AND "activatedAt" IS NULL
  AND "activationCodeHash" IS NOT NULL;

CREATE TABLE "NFCOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT,
    "cardTitle" TEXT NOT NULL,
    "nfcCardId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "status" "NFCOrderStatus" NOT NULL DEFAULT 'PENDING',
    "amountTotal" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "shippingName" TEXT,
    "shippingPhone" TEXT,
    "shippingAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFCOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NFCOrder_nfcCardId_key" ON "NFCOrder"("nfcCardId");
CREATE UNIQUE INDEX "NFCOrder_stripeCheckoutSessionId_key" ON "NFCOrder"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "NFCOrder_stripePaymentIntentId_key" ON "NFCOrder"("stripePaymentIntentId");
CREATE INDEX "NFCOrder_userId_createdAt_idx" ON "NFCOrder"("userId", "createdAt");
CREATE INDEX "NFCOrder_status_createdAt_idx" ON "NFCOrder"("status", "createdAt");

ALTER TABLE "NFCOrder"
  ADD CONSTRAINT "NFCOrder_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NFCOrder"
  ADD CONSTRAINT "NFCOrder_cardId_fkey"
  FOREIGN KEY ("cardId") REFERENCES "DigitalBusinessCard"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NFCOrder"
  ADD CONSTRAINT "NFCOrder_nfcCardId_fkey"
  FOREIGN KEY ("nfcCardId") REFERENCES "NFCCard"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
