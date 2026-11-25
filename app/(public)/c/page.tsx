import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import PublicCard from "./PublicCard";

export default async function PublicCardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; source?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  if (!resolvedSearchParams.slug) notFound();

  const card = await prisma.digitalBusinessCard.findFirst({
    where: { slug: resolvedSearchParams.slug, isPublished: true },
    include: { sections: { orderBy: { position: "asc" } } },
  });

  if (!card) notFound();

  return (
    <PublicCard
      card={card}
      source={
        resolvedSearchParams.source === "qr"
          ? "QR"
          : resolvedSearchParams.source === "nfc"
            ? "NFC"
            : "LINK"
      }
    />
  );
}
