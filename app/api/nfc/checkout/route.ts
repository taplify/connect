import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getNfcStoreConfig,
  getStripeClient,
  StripeConfigurationError,
} from "@/lib/stripe";

const checkoutSchema = z.object({
  cardId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let config;
  try {
    config = getNfcStoreConfig();
  } catch (error) {
    if (error instanceof StripeConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  const available = await prisma.nFCCard.count({
    where: {
      ownerId: null,
      activatedAt: null,
      isActive: false,
      isReadyForSale: true,
      activationCodeHash: { not: null },
      order: { is: null },
    },
  });

  return NextResponse.json({
    priceCents: config.priceCents,
    currency: config.currency,
    shippingIncluded: true,
    shippingCountries: config.shippingCountries,
    inStock: available > 0,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a published digital card for your NFC order." },
      { status: 400 },
    );
  }

  const card = await prisma.digitalBusinessCard.findFirst({
    where: {
      id: parsed.data.cardId,
      ownerId: session.user.id,
      isPublished: true,
    },
    select: { id: true, title: true },
  });
  if (!card) {
    return NextResponse.json(
      { error: "Publish a digital card before ordering an NFC card." },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")) {
    return NextResponse.json(
      { error: "Configure the Stripe webhook before accepting payments." },
      { status: 503 },
    );
  }

  let config: ReturnType<typeof getNfcStoreConfig>;
  let stripe: Stripe;
  try {
    config = getNfcStoreConfig();
    stripe = getStripeClient();
  } catch (error) {
    if (error instanceof StripeConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.NEXT_PUBLIC_APP_URL
  ) {
    return NextResponse.json(
      { error: "Set NEXT_PUBLIC_APP_URL before enabling NFC checkout." },
      { status: 503 },
    );
  }

  let appUrl: string;
  try {
    appUrl = new URL(
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin,
    ).origin;
  } catch {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL must be a valid absolute URL." },
      { status: 503 },
    );
  }

  let order: { id: string } | null;
  try {
    order = await prisma.$transaction(
      async (tx) => {
        const nfcCard = await tx.nFCCard.findFirst({
          where: {
            ownerId: null,
            activatedAt: null,
            isActive: false,
            isReadyForSale: true,
            activationCodeHash: { not: null },
            order: { is: null },
          },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        if (!nfcCard) return null;

        return tx.nFCOrder.create({
          data: {
            userId: session.user.id,
            cardId: card.id,
            cardTitle: card.title,
            nfcCardId: nfcCard.id,
            amountTotal: config.priceCents,
            currency: config.currency,
          },
          select: { id: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2034" || error.code === "P2002")
    ) {
      return NextResponse.json(
        { error: "That card was just reserved. Please try checkout again." },
        { status: 409 },
      );
    }
    throw error;
  }

  if (!order) {
    return NextResponse.json(
      { error: "NFC cards are currently out of stock." },
      { status: 409 },
    );
  }

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        allowed_payment_method_types: ["card"],
        customer_email: session.user.email ?? undefined,
        client_reference_id: session.user.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: config.currency,
              unit_amount: config.priceCents,
              product_data: {
                name: "Taplify NFC Card",
                description: `Pre-linked to your digital card: ${card.title}`,
              },
            },
          },
        ],
        shipping_address_collection: {
          allowed_countries: config.shippingCountries,
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 0, currency: config.currency },
              display_name: "Shipping included",
            },
          },
        ],
        phone_number_collection: { enabled: true },
        metadata: { orderId: order.id },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: `${appUrl}/integrations?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/integrations?purchase=cancelled`,
      },
      { idempotencyKey: `nfc-checkout-${order.id}` },
    );
  } catch (error) {
    await prisma.nFCOrder.update({
      where: { id: order.id },
      data: { status: "CANCELLED", nfcCardId: null },
    });
    console.error("Stripe NFC Checkout session creation failed.", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 502 },
    );
  }

  if (!checkoutSession.url) {
    await prisma.nFCOrder.update({
      where: { id: order.id },
      data: { status: "CANCELLED", nfcCardId: null },
    });
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL. Please try again." },
      { status: 502 },
    );
  }

  await prisma.nFCOrder.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
