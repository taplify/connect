import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const activationSchema = z.object({
  activationCode: z.string().trim().min(8).max(40),
  cardId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = activationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter the activation code included with your Taplify NFC card." },
      { status: 400 },
    );
  }

  const card = await prisma.digitalBusinessCard.findFirst({
    where: {
      id: parsed.data.cardId,
      ownerId: session.user.id,
      isPublished: true,
    },
    select: { id: true },
  });
  if (!card) {
    return NextResponse.json(
      { error: "Publish this card before activating an NFC card." },
      { status: 400 },
    );
  }

  const normalizedCode = parsed.data.activationCode
    .replace(/[\s-]/g, "")
    .toUpperCase();
  const activationCodeHash = createHash("sha256")
    .update(normalizedCode)
    .digest("hex");

  const availableCard = await prisma.nFCCard.findFirst({
    where: {
      activationCodeHash,
      ownerId: null,
      activatedAt: null,
    },
    select: { id: true },
  });
  if (!availableCard) {
    return NextResponse.json(
      { error: "This activation code is invalid or has already been used." },
      { status: 404 },
    );
  }

  const claimed = await prisma.nFCCard.updateMany({
    where: {
      id: availableCard.id,
      activationCodeHash,
      ownerId: null,
      activatedAt: null,
    },
    data: {
      ownerId: session.user.id,
      cardId: card.id,
      isActive: true,
      activatedAt: new Date(),
      activationCodeHash: null,
    },
  });

  if (claimed.count !== 1) {
    return NextResponse.json(
      { error: "This activation code has already been used." },
      { status: 409 },
    );
  }

  const nfcCard = await prisma.nFCCard.findUnique({
    where: { id: availableCard.id },
    include: { card: { select: { id: true, title: true, slug: true } } },
  });

  return NextResponse.json(nfcCard, { status: 201 });
}
