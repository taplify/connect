"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ContactRound,
  CreditCard,
  ExternalLink,
  Nfc,
  Plus,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";

type Analytics = {
  cards: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    views: number;
    qrScans: number;
    nfcTaps: number;
  }>;
  interactions: Array<{
    id: string;
    cardTitle: string;
    type: string;
    createdAt: string;
  }>;
  totals: {
    views: number;
    qrScans: number;
    nfcTaps: number;
    linkClicks: number;
    contacts: number;
  };
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((response) => response.json())
      .then((data) => setAnalytics(data.cards ? data : null));
  }, []);

  const stats = [
    { name: "Profile views", value: analytics?.totals.views || 0, icon: TrendingUp },
    { name: "NFC taps", value: analytics?.totals.nfcTaps || 0, icon: Nfc },
    { name: "QR scans", value: analytics?.totals.qrScans || 0, icon: QrCode },
    { name: "Connections", value: analytics?.totals.contacts || 0, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7">
          <p className="text-sm font-medium text-[#777c84]">Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17191c] md:text-3xl">
            Welcome back
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.name} className="rounded-2xl border border-[#eceef1] bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f6f8]">
                  <stat.icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#b9bdc4]" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-[#777c84]">{stat.name}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-[#eceef1] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Quick actions</h2>
                <p className="mt-1 text-sm text-[#777c84]">Manage your professional presence.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/profile" className="group rounded-xl border border-[#eceef1] p-4 transition hover:-translate-y-0.5 hover:border-[#d4d7dc]">
                <Plus className="h-5 w-5" />
                <p className="mt-8 text-sm font-semibold">Create card</p>
              </Link>
              <Link href="/integrations" className="group rounded-xl border border-[#eceef1] p-4 transition hover:-translate-y-0.5 hover:border-[#d4d7dc]">
                <Nfc className="h-5 w-5" />
                <p className="mt-8 text-sm font-semibold">Manage NFC</p>
              </Link>
              <Link href="/connections" className="group rounded-xl border border-[#eceef1] p-4 transition hover:-translate-y-0.5 hover:border-[#d4d7dc]">
                <ContactRound className="h-5 w-5" />
                <p className="mt-8 text-sm font-semibold">View contacts</p>
              </Link>
              <Link href="/analytics" className="group rounded-xl border border-[#eceef1] p-4 transition hover:-translate-y-0.5 hover:border-[#d4d7dc]">
                <TrendingUp className="h-5 w-5" />
                <p className="mt-8 text-sm font-semibold">View analytics</p>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl bg-[#17191c] p-5 text-white">
            <div className="flex items-center justify-between">
              <CreditCard className="h-5 w-5" />
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">Free</span>
            </div>
            <h2 className="mt-7 text-lg font-bold">Personal workspace</h2>
            <p className="mt-1 text-sm text-white/60">Create your professional identity and grow your network.</p>
            <Link href="/profile" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-[#17191c]">
              Open cards <ExternalLink className="h-4 w-4" />
            </Link>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-[#eceef1] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Your cards</h2>
            <Link href="/profile" className="text-sm font-semibold text-[#686d75]">Manage</Link>
          </div>
          {!analytics || analytics.cards.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[#d8dbe0] p-8 text-center">
              <p className="text-sm text-[#777c84]">Create your first digital business card.</p>
              <Link href="/profile" className="mt-3 inline-flex rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white">Create card</Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#f0f1f3]">
              {analytics.cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{card.title}</p>
                    <p className="mt-1 truncate text-xs text-[#92979f]">/c/{card.slug}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#777c84]">
                    <span>{card.views} views</span>
                    <span className={`rounded-full px-2.5 py-1 ${card.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-[#f0f1f3]"}`}>{card.isPublished ? "Live" : "Draft"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
