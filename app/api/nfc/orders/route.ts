import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const orderSelect = {
  id: true,
  cardTitle: true,
  status: true,
  amountTotal: true,
  currency: true,
  createdAt: true,
} as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkoutSessionId = new URL(request.url).searchParams.get("session_id");
  if (checkoutSessionId) {
    const order = await prisma.nFCOrder.findFirst({
      where: {
        userId: session.user.id,
        stripeCheckoutSessionId: checkoutSessionId,
      },
      select: orderSelect,
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  const orders = await prisma.nFCOrder.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: orderSelect,
  });

  return NextResponse.json(orders);
}
