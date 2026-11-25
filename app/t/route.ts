import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const identifier = new URL(request.url).searchParams.get("identifier");
  if (!identifier) {
    return NextResponse.json({ error: "Missing NFC identifier" }, { status: 400 });
  }

  const nfcCard = await prisma.nFCCard.findUnique({
    where: { identifier },
    include: { card: true },
  });

  if (!nfcCard?.isActive || !nfcCard.card?.isPublished) {
    return NextResponse.json({ error: "This NFC card is unavailable." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.nFCCard.update({
      where: { id: nfcCard.id },
      data: { tapCount: { increment: 1 }, lastTappedAt: new Date() },
    }),
    prisma.cardInteraction.create({
      data: {
        cardId: nfcCard.cardId!,
        type: "NFC_TAP",
        source: "NFC",
        visitorId:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      },
    }),
  ]);

  return NextResponse.redirect(
    new URL(`/c?slug=${encodeURIComponent(nfcCard.card.slug)}&source=nfc`, request.url),
  );
}
