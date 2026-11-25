import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{2,29}$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid username, email, and password." },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "That email or username is already in use." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      name: username,
      passwordHash,
      personalProfile: {
        create: {
          fullName: username,
        },
      },
      subscriptions: {
        create: {
          plan: "personal-free",
          status: "TRIALING",
        },
      },
    },
  });

  return NextResponse.json(
    { id: user.id, username: user.username },
    { status: 201 },
  );
}
