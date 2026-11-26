"use client";

import { useEffect, useState } from "react";
import { KeyRound, Nfc, Power, Trash2 } from "lucide-react";

type Card = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
};

type NfcCard = {
  id: string;
  identifier: string;
  name: string;
  tagType: string;
  isActive: boolean;
  tapCount: number;
  lastTappedAt: string | null;
  card: Card | null;
};

type NfcOrder = {
  id: string;
  cardTitle: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  amountTotal: number;
  currency: string;
  createdAt: string;
};

type StoreInfo = {
  priceCents: number;
  currency: string;
  shippingIncluded: boolean;
  shippingCountries: string[];
  inStock: boolean;
};

export default function Integrations() {
  const [cards, setCards] = useState<Card[]>([]);
  const [nfcCards, setNfcCards] = useState<NfcCard[]>([]);
  const [orders, setOrders] = useState<NfcOrder[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [showActivate, setShowActivate] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [cardId, setCardId] = useState("");
  const [orderCardId, setOrderCardId] = useState("");
  const [error, setError] = useState("");
  const [purchaseNotice, setPurchaseNotice] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const load = async () => {
    try {
      const [cardsResponse, nfcResponse, ordersResponse, storeResponse] =
        await Promise.all([
          fetch("/api/cards"),
          fetch("/api/nfc"),
          fetch("/api/nfc/orders"),
          fetch("/api/nfc/checkout"),
        ]);
      if (
        !cardsResponse.ok ||
        !nfcResponse.ok ||
        !ordersResponse.ok ||
        !storeResponse.ok
      ) {
        throw new Error("Unable to load NFC cards and orders.");
      }

      const [cardData, nfcData, orderData, storeData] = await Promise.all([
        cardsResponse.json(),
        nfcResponse.json(),
        ordersResponse.json(),
        storeResponse.json(),
      ]);
      setCards(Array.isArray(cardData) ? cardData : []);
      setNfcCards(Array.isArray(nfcData) ? nfcData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setStoreInfo(storeData);
    } catch (loadError) {
      console.error("Failed to load NFC store data.", loadError);
      setError("Unable to load NFC cards and orders. Please refresh the page.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const purchase = params.get("purchase");
    const checkoutSessionId = params.get("session_id");
    if (purchase === "cancelled") {
      setPurchaseNotice("Checkout was cancelled. No payment was taken.");
      window.history.replaceState({}, "", "/integrations");
      return;
    }
    if (purchase !== "success" || !checkoutSessionId) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const checkOrder = async () => {
      try {
        const response = await fetch(
          `/api/nfc/orders?session_id=${encodeURIComponent(checkoutSessionId)}`,
          { cache: "no-store" },
        );
        if (response.ok) {
          const order: NfcOrder = await response.json();
          if (order.status === "PAID") {
            setPurchaseNotice(
              "Payment confirmed. Your NFC card is linked and ready for fulfillment.",
            );
            window.history.replaceState({}, "", "/integrations");
            await load();
            return;
          }
          if (order.status === "CANCELLED") {
            setPurchaseNotice(
              "This checkout expired before payment was completed.",
            );
            window.history.replaceState({}, "", "/integrations");
            await load();
            return;
          }
        }
      } catch (pollError) {
        console.error("Failed to check NFC order status.", pollError);
      }

      attempts += 1;
      if (attempts >= 15) {
        setPurchaseNotice(
          "Payment is processing. Refresh this page shortly to see your NFC order.",
        );
        return;
      }
      timeout = setTimeout(() => {
        if (!cancelled) void checkOrder();
      }, 2000);
    };

    void checkOrder();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const activateCard = async () => {
    setError("");
    setIsActivating(true);
    const response = await fetch("/api/nfc/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activationCode, cardId }),
    });
    const data = await response.json();
    setIsActivating(false);
    if (!response.ok) {
      setError(data.error || "Unable to activate this NFC card.");
      return;
    }

    setActivationCode("");
    setCardId("");
    setShowActivate(false);
    await load();
  };

  const updateCard = async (
    id: string,
    patch: { cardId?: string | null; isActive?: boolean },
  ) => {
    const response = await fetch(`/api/nfc/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to update this NFC card.");
      return;
    }
    await load();
  };

  const deleteCard = async (id: string) => {
    if (!window.confirm("Remove this NFC card from your account?")) return;
    const response = await fetch(`/api/nfc/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Unable to remove this NFC card.");
      return;
    }
    await load();
  };

  const openActivation = () => {
    setError("");
    setCardId(cards.find((card) => card.isPublished)?.id || "");
    setShowActivate(true);
  };

  const openOrder = () => {
    setError("");
    setOrderCardId(cards.find((card) => card.isPublished)?.id || "");
    setShowOrder(true);
  };

  const orderNfcCard = async () => {
    setError("");
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/nfc/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: orderCardId }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.url !== "string") {
        setError(data.error || "Unable to start checkout.");
        setIsCheckingOut(false);
        return;
      }
      window.location.assign(data.url);
    } catch (checkoutError) {
      console.error("Failed to start NFC Checkout.", checkoutError);
      setError("Unable to start checkout. Please try again.");
      setIsCheckingOut(false);
    }
  };

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#777c84]">
              Physical connections
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              NFC cards
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openOrder}
              disabled={
                !storeInfo?.inStock || !cards.some((card) => card.isPublished)
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Nfc className="h-4 w-4" />
              {storeInfo
                ? `Order NFC card · ${formatPrice(storeInfo.priceCents, storeInfo.currency)}`
                : "Order NFC card"}
            </button>
            <button
              type="button"
              onClick={openActivation}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#dde0e5] bg-white px-4 py-3 text-sm font-semibold"
            >
              <KeyRound className="h-4 w-4" /> I have a card
            </button>
          </div>
        </div>

        {purchaseNotice && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {purchaseNotice}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {nfcCards.length === 0 ? (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-[#d8dbe0] bg-white p-8 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f5f6f8]">
                <Nfc className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold">
                Your physical card goes here
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#777c84]">
                Order a physical NFC card and link it to a published digital
                profile at checkout. Your digital card, link, and QR are ready
                to use online in the meantime.
              </p>
              {!storeInfo?.inStock && (
                <p className="mt-3 text-sm font-medium text-amber-700">
                  Physical cards are currently out of stock.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nfcCards.map((nfcCard) => (
              <article
                key={nfcCard.id}
                className="rounded-2xl border border-[#eceef1] bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#17191c] text-white">
                    <Nfc className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${nfcCard.isActive ? "bg-emerald-50 text-emerald-700" : "bg-[#f0f1f3] text-[#777c84]"}`}
                  >
                    {nfcCard.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h2 className="mt-4 font-bold">{nfcCard.name}</h2>
                <p className="mt-1 text-xs text-[#92979f]">{nfcCard.tagType}</p>
                <label className="mt-5 grid gap-2 text-xs font-semibold text-[#686d75]">
                  Linked digital card
                  <select
                    value={nfcCard.card?.id || ""}
                    onChange={(event) =>
                      updateCard(nfcCard.id, {
                        cardId: event.target.value || null,
                      })
                    }
                    className="card-input"
                  >
                    <option value="">Unassigned</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.title}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-5 flex items-center justify-between border-t border-[#eceef1] pt-4">
                  <div>
                    <p className="text-lg font-bold">{nfcCard.tapCount}</p>
                    <p className="text-xs text-[#92979f]">total taps</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateCard(nfcCard.id, { isActive: !nfcCard.isActive })
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg text-[#686d75] hover:bg-[#f5f6f8]"
                      aria-label={
                        nfcCard.isActive
                          ? "Deactivate NFC card"
                          : "Activate NFC card"
                      }
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCard(nfcCard.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-[#686d75] hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove NFC card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <section className="mt-6 rounded-2xl border border-[#eceef1] bg-white p-5">
            <h2 className="text-lg font-bold">Recent NFC orders</h2>
            <div className="mt-4 divide-y divide-[#eceef1]">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold">{order.cardTitle}</p>
                    <p className="mt-1 text-xs text-[#92979f]">
                      {new Date(order.createdAt).toLocaleDateString()} · Order{" "}
                      {order.id.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.amountTotal, order.currency)}
                    </p>
                    <p className="mt-1 text-xs text-[#777c84]">
                      {order.status === "PAID"
                        ? "Paid · preparing for shipment"
                        : order.status === "CANCELLED"
                          ? "Cancelled"
                          : "Payment pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void orderNfcCard();
            }}
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold">Order a Taplify NFC card</h2>
            <p className="mt-1 text-sm text-[#777c84]">
              The card will be linked to your selected profile automatically
              after your test-mode Stripe payment is confirmed.
            </p>
            <label className="mt-5 grid gap-2 text-sm font-semibold">
              Link to published profile
              <select
                required
                value={orderCardId}
                onChange={(event) => setOrderCardId(event.target.value)}
                className="card-input"
              >
                <option value="" disabled>
                  Select a published card
                </option>
                {cards
                  .filter((card) => card.isPublished)
                  .map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.title}
                    </option>
                  ))}
              </select>
            </label>
            <div className="mt-4 rounded-xl bg-[#f5f6f8] p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span>Taplify NFC card</span>
                <span className="font-semibold">
                  {storeInfo
                    ? formatPrice(storeInfo.priceCents, storeInfo.currency)
                    : "—"}
                </span>
              </div>
              <div className="mt-2 flex justify-between gap-3 text-[#777c84]">
                <span>Shipping</span>
                <span>
                  {storeInfo?.shippingIncluded
                    ? "Included"
                    : "Calculated at checkout"}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#92979f]">
                Ships to{" "}
                {storeInfo?.shippingCountries.join(", ") ||
                  "configured countries"}
                .
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowOrder(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f6f8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCheckingOut || !orderCardId || !storeInfo?.inStock}
                className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isCheckingOut ? "Opening checkout..." : "Continue to payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showActivate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              activateCard();
            }}
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold">Activate your NFC card</h2>
            <p className="mt-1 text-sm text-[#777c84]">
              Enter the one-time code included with your physical card.
            </p>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <div className="mt-5 grid gap-3">
              <input
                autoFocus
                required
                value={activationCode}
                onChange={(event) =>
                  setActivationCode(event.target.value.toUpperCase())
                }
                placeholder="Activation code"
                autoComplete="one-time-code"
                className="card-input font-mono uppercase tracking-wider"
              />
              <label className="grid gap-2 text-sm font-semibold">
                Connect it to
                <select
                  required
                  value={cardId}
                  onChange={(event) => setCardId(event.target.value)}
                  className="card-input"
                >
                  <option value="" disabled>
                    Select a published card
                  </option>
                  {cards
                    .filter((card) => card.isPublished)
                    .map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.title}
                      </option>
                    ))}
                </select>
              </label>
              {!cards.some((card) => card.isPublished) && (
                <p className="text-xs text-amber-700">
                  Publish a digital card before activating your NFC card.
                </p>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowActivate(false);
                  setError("");
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f6f8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isActivating || !cards.some((card) => card.isPublished)
                }
                className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isActivating ? "Activating..." : "Activate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
