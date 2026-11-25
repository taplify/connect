import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.digitalBusinessCard.findMany({
    where: { ownerId: session.user.id },
    include: {
      interactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const interactions = cards.flatMap((card) =>
    card.interactions.map((interaction) => ({
      id: interaction.id,
      cardId: card.id,
      cardTitle: card.title,
      type: interaction.type,
      source: interaction.source,
      createdAt: interaction.createdAt,
    })),
  );

  const [contacts, nfcCards] = await Promise.all([
    prisma.contactSubmission.count({ where: { ownerId: session.user.id } }),
    prisma.nFCCard.findMany({
      where: { ownerId: session.user.id },
      select: { tapCount: true },
    }),
  ]);

  const counts = interactions.reduce(
    (totals, interaction) => {
      if (interaction.type === "VIEW") totals.views += 1;
      if (interaction.type === "QR_SCAN") totals.qrScans += 1;
      if (interaction.type === "NFC_TAP") totals.nfcTaps += 1;
      if (interaction.type === "LINK_CLICK") totals.linkClicks += 1;
      return totals;
    },
    { views: 0, qrScans: 0, nfcTaps: 0, linkClicks: 0 },
  );
  counts.nfcTaps = nfcCards.reduce(
    (total, nfcCard) => total + nfcCard.tapCount,
    counts.nfcTaps,
  );

  return NextResponse.json({
    cards: cards.map((card) => ({
      id: card.id,
      title: card.title,
      slug: card.slug,
      isPublished: card.isPublished,
      views: card.interactions.filter((item) => item.type === "VIEW").length,
      qrScans: card.interactions.filter((item) => item.type === "QR_SCAN").length,
      nfcTaps: card.interactions.filter((item) => item.type === "NFC_TAP").length,
    })),
    interactions,
    totals: { ...counts, contacts },
  });
}
