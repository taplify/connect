import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripeClient, StripeConfigurationError } from "@/lib/stripe";

async function completeNfcOrder(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  if (session.payment_status !== "paid") return;

  const shipping = session.collected_information?.shipping_details;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await prisma.$transaction(async (tx) => {
    const order = await tx.nFCOrder.findUnique({
      where: { id: orderId },
      include: { card: true },
    });
    if (
      !order ||
      (order.stripeCheckoutSessionId &&
        order.stripeCheckoutSessionId !== session.id)
    ) {
      throw new Error("NFC order does not match the Checkout Session.");
    }
    if (order.status === "PAID") return;
    if (
      session.amount_total !== order.amountTotal ||
      session.currency?.toLowerCase() !== order.currency ||
      session.client_reference_id !== order.userId
    ) {
      throw new Error("Checkout Session totals do not match the NFC order.");
    }
    if (
      order.status !== "PENDING" ||
      !order.nfcCardId ||
      !order.card ||
      order.card.ownerId !== order.userId ||
      !order.card.isPublished
    ) {
      throw new Error("NFC order is no longer eligible for fulfillment.");
    }

    const claimed = await tx.nFCCard.updateMany({
      where: {
        id: order.nfcCardId,
        ownerId: null,
        activatedAt: null,
        isActive: false,
        isReadyForSale: true,
        activationCodeHash: { not: null },
      },
      data: {
        ownerId: order.userId,
        cardId: order.cardId,
        isActive: true,
        isReadyForSale: false,
        activatedAt: new Date(),
        activationCodeHash: null,
      },
    });
    if (claimed.count !== 1) {
      throw new Error("Reserved NFC inventory is unavailable.");
    }

    await tx.nFCOrder.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        shippingName: shipping?.name ?? session.customer_details?.name ?? null,
        shippingPhone: session.customer_details?.phone ?? null,
        shippingAddress: shipping?.address
          ? JSON.stringify(shipping.address)
          : null,
      },
    });
  });
}

async function cancelExpiredOrder(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.nFCOrder.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, stripeCheckoutSessionId: true },
    });
    if (
      !order ||
      (order.stripeCheckoutSessionId &&
        order.stripeCheckoutSessionId !== session.id) ||
      order.status !== "PENDING"
    ) {
      return;
    }

    await tx.nFCOrder.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        stripeCheckoutSessionId: session.id,
        nfcCardId: null,
      },
    });
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret?.startsWith("whsec_")) {
    return NextResponse.json(
      { error: "Stripe webhook signing is not configured." },
      { status: 503 },
    );
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    if (error instanceof StripeConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed.", error);
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      await completeNfcOrder(event.data.object);
    } else if (event.type === "checkout.session.expired") {
      await cancelExpiredOrder(event.data.object);
    }
  } catch (error) {
    console.error(`Stripe webhook ${event.type} failed.`, error);
    return NextResponse.json(
      { error: "Unable to process this Stripe event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
