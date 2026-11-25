import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function ownedCard(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.digitalBusinessCard.findFirst({
    where: { id, ownerId: session.user.id },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const card = await ownedCard(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const fullCard = await prisma.digitalBusinessCard.findUnique({
    where: { id: card.id },
    include: { sections: { orderBy: { position: "asc" } } },
  });
  return NextResponse.json(fullCard);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const card = await ownedCard(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const allowed: Record<string, unknown> = {};
  for (const key of [
    "title",
    "slug",
    "accentColor",
    "fontFamily",
    "layout",
    "isPublished",
  ]) {
    if (key in body) allowed[key] = (body as Record<string, unknown>)[key];
  }

  if (allowed.slug) {
    const slug = String(allowed.slug).toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,49}$/.test(slug)) {
      return NextResponse.json(
        { error: "Use 3–50 lowercase letters, numbers, or hyphens." },
        { status: 400 },
      );
    }
    const conflict = await prisma.digitalBusinessCard.findFirst({
      where: { slug, NOT: { id: card.id } },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "That public URL is already in use." },
        { status: 409 },
      );
    }
    allowed.slug = slug;
  }

  const sections = (body as { sections?: Array<{ type: string; data: unknown }> })
    .sections;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.digitalBusinessCard.update({
      where: { id: card.id },
      data: allowed,
    });

    if (Array.isArray(sections)) {
      await tx.businessCardSection.deleteMany({ where: { cardId: card.id } });
      await tx.businessCardSection.createMany({
        data: sections.map((section, position) => ({
          cardId: card.id,
          type: section.type,
          position,
          data: section.data as object,
        })),
      });
    }

    return tx.digitalBusinessCard.findUnique({
      where: { id: card.id },
      include: { sections: { orderBy: { position: "asc" } } },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const card = await ownedCard(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.digitalBusinessCard.delete({ where: { id: card.id } });
  return new NextResponse(null, { status: 204 });
}
