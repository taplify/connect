import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const submissionSchema = z.object({
  cardId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(100).optional(),
  message: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request) {
  const parsed = submissionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide at least a name." },
      { status: 400 },
    );
  }

  const card = await prisma.digitalBusinessCard.findUnique({
    where: { id: parsed.data.cardId },
  });
  if (!card?.isPublished) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.contactSubmission.create({
      data: {
        cardId: card.id,
        ownerId: card.ownerId,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        message: parsed.data.message || null,
      },
    }),
    prisma.cardInteraction.create({
      data: {
        cardId: card.id,
        type: "LINK_CLICK",
        source: "CONTACT_EXCHANGE",
      },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.contactSubmission.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}
