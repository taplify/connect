import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing card" }, { status: 400 });
  }

  const card = await prisma.digitalBusinessCard.findFirst({
    where: { slug, isPublished: true },
    include: { sections: true },
  });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const profile =
    (card.sections.find((section) => section.type === "profile")?.data as
      | Record<string, string>
      | undefined) || {};
  const name = profile.fullName || card.title;
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    profile.company ? `ORG:${profile.company}` : "",
    profile.jobTitle ? `TITLE:${profile.jobTitle}` : "",
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.website ? `URL:${profile.website}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\r\n");

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name.replace(/[^a-z0-9]+/gi, "-")}.vcf"`,
    },
  });
}
