"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Globe,
  Mail,
  Phone,
  Share2,
  UserRound,
} from "lucide-react";

type Section = {
  type: string;
  data: unknown;
};

type Card = {
  id: string;
  slug: string;
  title: string;
  accentColor: string;
  layout: string;
  sections: Section[];
};

export default function PublicCard({
  card,
  source = "LINK",
}: {
  card: Card;
  source?: "LINK" | "QR" | "NFC";
}) {
  const [showExchange, setShowExchange] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const profileSection = card.sections.find((section) => section.type === "profile");
  const linkSection = card.sections.find((section) => section.type === "links");
  const socialSection = card.sections.find((section) => section.type === "social");
  const profile = (profileSection?.data as Record<string, string>) || {};
  const links = ((linkSection?.data as { links?: Array<{ name: string; href: string }> })?.links || []);
  const socials = ((socialSection?.data as { links?: Array<{ name: string; href: string }> })?.links || []);

  useEffect(() => {
    if (source === "NFC") return;

    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        type: source === "QR" ? "QR_SCAN" : "VIEW",
        source,
      }),
    }).catch(() => undefined);
  }, [card.id, source]);

  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: profile.fullName || card.title,
        text: `View ${profile.fullName || card.title}'s digital business card`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const submitExchange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        name: form.get("name"),
        email: form.get("email") || undefined,
        phone: form.get("phone") || undefined,
        company: form.get("company") || undefined,
        message: form.get("message") || undefined,
      }),
    });
    if (response.ok) {
      setSubmitted(true);
      setShowExchange(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#f4f5f7] px-4 py-8 text-[#17191c] sm:py-12"
      style={{ "--accent": card.accentColor } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-md">
        <article className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_24px_80px_-28px_rgba(20,24,32,0.28)]">
          <div
            className="h-28"
            style={{
              background: `linear-gradient(135deg, ${card.accentColor} 0%, #17191c 100%)`,
            }}
          />
          <div className="-mt-12 px-6 text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-white shadow-lg">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.fullName || card.title}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div
                  className="grid h-full w-full place-items-center rounded-full text-3xl font-semibold text-white"
                  style={{ backgroundColor: card.accentColor }}
                >
                  {(profile.fullName || card.title).slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              {profile.fullName || card.title}
            </h1>
            {(profile.jobTitle || profile.company) && (
              <p className="mt-1 text-sm text-[#686d75]">
                {[profile.jobTitle, profile.company].filter(Boolean).join(" · ")}
              </p>
            )}
            {profile.biography && (
              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#686d75]">
                {profile.biography}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={`/api/vcard?slug=${encodeURIComponent(card.slug)}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Save contact
              </a>
              <button
                type="button"
                onClick={share}
                className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-black/[0.03]"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 pt-7">
            {(profile.email || profile.phone || profile.website) && (
              <div className="grid gap-2">
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="public-contact-row">
                    <Phone className="h-5 w-5" />
                    <span>{profile.phone}</span>
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="public-contact-row">
                    <Mail className="h-5 w-5" />
                    <span>{profile.email}</span>
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="public-contact-row">
                    <Globe className="h-5 w-5" />
                    <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>
            )}

            {socials.length > 0 && (
              <div className="mt-5 flex justify-center gap-2">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-11 w-11 place-items-center rounded-full border border-black/10 text-sm font-bold transition hover:border-black/20 hover:bg-black/[0.03]"
                    aria-label={social.name}
                  >
                    {social.name.slice(0, 1)}
                  </a>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div className="mt-5 grid gap-2">
                {links.map((link) => (
                  <a
                    key={`${link.name}-${link.href}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-black/[0.08] px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-black/20"
                  >
                    {link.name}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowExchange(true)}
              className="mt-5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-black/[0.03]"
            >
              Share my contact
            </button>

            {submitted && (
              <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
                Your contact was shared successfully.
              </p>
            )}
          </div>
        </article>
        <p className="mt-5 text-center text-xs text-[#92979f]">Powered by Taplify</p>
      </div>

      {showExchange && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4 sm:place-items-center" role="dialog" aria-modal="true">
          <form onSubmit={submitExchange} className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Share your contact</h2>
                <p className="mt-1 text-sm text-[#686d75]">No account required.</p>
              </div>
              <button type="button" onClick={() => setShowExchange(false)} className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.05]">×</button>
            </div>
            <div className="grid gap-3">
              <input name="name" required placeholder="Full name" className="public-input" />
              <input name="email" type="email" placeholder="Email" className="public-input" />
              <input name="phone" placeholder="Phone number" className="public-input" />
              <input name="company" placeholder="Company" className="public-input" />
              <textarea name="message" placeholder="Message" rows={3} className="public-input" />
            </div>
            <button type="submit" className="mt-4 w-full rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white">
              Send contact
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
