import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const interactionSchema = z.object({
  cardId: z.string().min(1),
  type: z.enum(["VIEW", "NFC_TAP", "QR_SCAN", "LINK_CLICK", "CONTACT_SAVE"]),
  source: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const parsed = interactionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid interaction" }, { status: 400 });
  }

  const card = await prisma.digitalBusinessCard.findUnique({
    where: { id: parsed.data.cardId },
  });
  if (!card?.isPublished) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.cardInteraction.create({
    data: {
      cardId: card.id,
      type: parsed.data.type,
      source: parsed.data.source,
      visitorId:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        null,
    },
  });

  return NextResponse.json({ ok: true });
}
