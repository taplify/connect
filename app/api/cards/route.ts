import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const cardSchema = z.object({
  title: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{2,49}$/)
    .optional(),
  fullName: z.string().trim().max(100).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
  biography: z.string().trim().max(500).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  website: z.string().url().optional().or(z.literal("")),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  layout: z.enum(["classic", "portrait", "banner"]).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.digitalBusinessCard.findMany({
    where: { ownerId: session.user.id },
    include: {
      sections: { orderBy: { position: "asc" } },
      nfcCards: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = cardSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the card information." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });
  const baseSlug =
    data.slug ||
    `${user?.username || "card"}-${crypto.randomUUID().slice(0, 8)}`;

  const existing = await prisma.digitalBusinessCard.findUnique({
    where: { slug: baseSlug },
  });
  if (existing) {
    return NextResponse.json(
      { error: "That public URL is already in use." },
      { status: 409 },
    );
  }

  const card = await prisma.digitalBusinessCard.create({
    data: {
      ownerId: session.user.id,
      title: data.title,
      slug: baseSlug,
      accentColor: data.accentColor || "#1E85FF",
      layout: data.layout || "classic",
      isPublished: data.isPublished ?? false,
      sections: {
        create: [
          {
            type: "profile",
            position: 0,
            data: {
              fullName: data.fullName || "",
              jobTitle: data.jobTitle || "",
              company: data.company || "",
              biography: data.biography || "",
              email: data.email || "",
              phone: data.phone || "",
              website: data.website || "",
            },
          },
          { type: "links", position: 1, data: { links: [] } },
          { type: "social", position: 2, data: { links: [] } },
        ],
      },
    },
  });

  return NextResponse.json(card, { status: 201 });
}
