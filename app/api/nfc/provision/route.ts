import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isNfcProvisioningAuthorized } from "@/lib/nfc-provisioning";
import { prisma } from "@/lib/prisma";

const provisioningSchema = z.object({
  quantity: z.number().int().min(1).max(100).default(1),
  tagType: z.enum(["NTAG213", "NTAG215", "NTAG216"]),
});

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
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_APP_URL
  ) {
    return NextResponse.json(
      {
        error:
          "Set NEXT_PUBLIC_APP_URL before provisioning production NFC cards.",
      },
      { status: 503 },
    );
  }

  const parsed = provisioningSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a quantity from 1 to 100 and a supported tag type." },
      { status: 400 },
    );
  }

  const cards = Array.from({ length: parsed.data.quantity }, () => {
    const activationCode = randomBytes(8).toString("hex").toUpperCase();
    return {
      identifier: randomUUID(),
      activationCode,
      activationCodeHash: createHash("sha256")
        .update(activationCode)
        .digest("hex"),
      tagType: parsed.data.tagType,
    };
  });

  await prisma.nFCCard.createMany({
    data: cards.map((card) => ({
      identifier: card.identifier,
      activationCodeHash: card.activationCodeHash,
      name: "Taplify NFC Card",
      tagType: card.tagType,
      ownerId: null,
      cardId: null,
      isActive: false,
    })),
  });

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  ).replace(/\/+$/, "");

  return NextResponse.json(
    {
      cards: cards.map((card) => ({
        identifier: card.identifier,
        tapUrl: `${baseUrl}/t?identifier=${encodeURIComponent(card.identifier)}`,
        activationCode: card.activationCode,
        tagType: card.tagType,
      })),
      warning:
        "Encode and verify each tag before marking its identifier ready for sale. Keep activationCode secure for manual or gift activation; paid checkout links tags automatically.",
    },
    { status: 201 },
  );
}
