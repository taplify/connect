import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function findOwnedCard(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.nFCCard.findFirst({
    where: {
      id,
      ownerId: session.user.id,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const nfcCard = await findOwnedCard(id);
  if (!nfcCard) {
    return NextResponse.json({ error: "NFC card not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const allowed: Record<string, unknown> = {};
  if (typeof body.name === "string") allowed.name = body.name;
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (typeof body.cardId === "string" || body.cardId === null) {
    allowed.cardId = body.cardId;
  }

  const session = await auth();
  if (allowed.cardId && typeof allowed.cardId === "string") {
    const owned = await prisma.digitalBusinessCard.findFirst({
      where: { id: allowed.cardId, ownerId: session?.user?.id },
    });
    if (!owned) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
  }

  const updated = await prisma.nFCCard.update({
    where: { id: nfcCard.id },
    data: allowed,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const nfcCard = await findOwnedCard(id);
  if (!nfcCard) {
    return NextResponse.json({ error: "NFC card not found" }, { status: 404 });
  }
  await prisma.nFCCard.delete({ where: { id: nfcCard.id } });
  return new NextResponse(null, { status: 204 });
}
