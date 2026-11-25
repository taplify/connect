"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, Link2, Nfc, QrCode, Users } from "lucide-react";

type AnalyticsData = {
  cards: Array<{
    id: string;
    title: string;
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

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState("30");
  const chartScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((response) => response.json())
      .then((data) => setAnalytics(data.cards ? data : null));
  }, []);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const buckets = new Map<string, { date: string; views: number; taps: number }>();
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, {
        date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        views: 0,
        taps: 0,
      });
    }
    analytics.interactions.forEach((interaction) => {
      const date = new Date(interaction.createdAt);
      if (date < cutoff) return;
      const key = date.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) return;
      if (interaction.type === "VIEW" || interaction.type === "QR_SCAN") bucket.views += 1;
      if (interaction.type === "NFC_TAP") bucket.taps += 1;
    });
    return Array.from(buckets.values());
  }, [analytics, range]);

  useEffect(() => {
    const chart = chartScrollRef.current;
    if (chart) chart.scrollLeft = chart.scrollWidth;
  }, [chartData]);

  const stats = [
    { name: "Profile views", value: analytics?.totals.views || 0, icon: Eye },
    { name: "NFC taps", value: analytics?.totals.nfcTaps || 0, icon: Nfc },
    { name: "QR scans", value: analytics?.totals.qrScans || 0, icon: QrCode },
    { name: "Connections", value: analytics?.totals.contacts || 0, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#777c84]">Performance</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
          </div>
          <select value={range} onChange={(event) => setRange(event.target.value)} className="card-input w-full sm:w-40">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.name} className="rounded-2xl border border-[#eceef1] bg-white p-5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5f6f8]"><stat.icon className="h-4 w-4" /></div>
              <p className="mt-5 text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-[#777c84]">{stat.name}</p>
            </article>
          ))}
        </div>

        <section className="mt-5 rounded-2xl border border-[#eceef1] bg-white p-5">
          <div>
            <h2 className="font-bold">Profile activity</h2>
            <p className="mt-1 text-sm text-[#777c84]">Measured profile views and NFC taps.</p>
          </div>
          <div
            ref={chartScrollRef}
            className="analytics-chart-scroll mt-6 overflow-x-auto"
            aria-label="Profile activity chart; horizontally scrollable dates"
          >
            <div
              style={{
                width: `${Math.max(560, Number(range) * 56)}px`,
                height: 320,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4} margin={{ bottom: 12 }}>
                  <CartesianGrid stroke="#eceef1" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={68}
                    tickMargin={12}
                    tick={{ fill: "#92979f", fontSize: 11 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#92979f", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#f5f6f8" }} contentStyle={{ borderRadius: 12, border: "1px solid #eceef1" }} />
                  <Bar dataKey="views" name="Views" fill="#17191c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="taps" name="NFC taps" fill="#48ABFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#eceef1] bg-white p-5">
          <h2 className="font-bold">Popular cards</h2>
          <div className="mt-4 divide-y divide-[#f0f1f3]">
            {(analytics?.cards || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-[#777c84]">No card activity recorded yet.</p>
            ) : (
              analytics?.cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between gap-4 py-4">
                  <p className="text-sm font-semibold">{card.title}</p>
                  <div className="flex gap-5 text-xs text-[#777c84]">
                    <span>{card.views} views</span>
                    <span>{card.nfcTaps} taps</span>
                    <span>{card.qrScans} scans</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
