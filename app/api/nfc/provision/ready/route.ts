import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isNfcProvisioningAuthorized } from "@/lib/nfc-provisioning";
import { prisma } from "@/lib/prisma";

const readySchema = z.object({
  identifiers: z
    .array(z.string().uuid())
    .min(1)
    .max(100)
    .refine((identifiers) => new Set(identifiers).size === identifiers.length),
});

class InventoryChangedError extends Error {}

export async function POST(request: Request) {
  if (!process.env.NFC_PROVISIONING_SECRET) {
    return NextResponse.json(
      { error: "NFC provisioning is not configured." },
      { status: 503 },
    );
  }
  if (!isNfcProvisioningAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = readySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide 1 to 100 unique NFC tag identifiers." },
      { status: 400 },
    );
  }

  try {
    const count = await prisma.$transaction(
      async (tx) => {
        const eligible = await tx.nFCCard.findMany({
          where: {
            identifier: { in: parsed.data.identifiers },
            ownerId: null,
            activatedAt: null,
            isActive: false,
            isReadyForSale: false,
            activationCodeHash: { not: null },
            order: { is: null },
          },
          select: { id: true },
        });
        if (eligible.length !== parsed.data.identifiers.length) {
          throw new InventoryChangedError();
        }

        const updated = await tx.nFCCard.updateMany({
          where: {
            id: { in: eligible.map((tag) => tag.id) },
            ownerId: null,
            activatedAt: null,
            isActive: false,
            isReadyForSale: false,
            activationCodeHash: { not: null },
          },
          data: { isReadyForSale: true },
        });
        if (updated.count !== eligible.length) {
          throw new InventoryChangedError();
        }
        return updated.count;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({ ready: count });
  } catch (error) {
    if (
      error instanceof InventoryChangedError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034")
    ) {
      return NextResponse.json(
        { error: "One or more NFC tags are no longer available to publish." },
        { status: 409 },
      );
    }
    throw error;
  }
}
