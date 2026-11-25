"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Copy,
  Camera,
  Download,
  ExternalLink,
  MoreHorizontal,
  Nfc,
  Plus,
  Save,
  Share2,
  Trash2,
} from "lucide-react";

type CardSection = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
  position: number;
  isEnabled: boolean;
};

type DigitalCard = {
  id: string;
  title: string;
  slug: string;
  accentColor: string;
  layout: string;
  isPublished: boolean;
  sections: CardSection[];
};

type NfcCard = {
  id: string;
  name: string;
  tagType: string;
  tapCount: number;
  isActive: boolean;
  cardId: string | null;
};

const emptyProfile = {
  fullName: "",
  jobTitle: "",
  company: "",
  biography: "",
  email: "",
  phone: "",
  website: "",
  profilePicture: "",
};

export default function Profile() {
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [nfcCards, setNfcCards] = useState<NfcCard[]>([]);
  const [showNfcActivation, setShowNfcActivation] = useState(false);
  const [nfcActivationCode, setNfcActivationCode] = useState("");
  const [isActivatingNfc, setIsActivatingNfc] = useState(false);

  const selected = cards.find((card) => card.id === selectedId);

  useEffect(() => {
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setProfileImage(data.image || null);
        setProfileName(data.name || "");
      });

    fetch("/api/cards")
      .then((response) => response.json())
      .then((data: DigitalCard[]) => {
        setCards(Array.isArray(data) ? data : []);
        setSelectedId((current) =>
          current || (Array.isArray(data) ? data[0]?.id : "") || "",
        );
      })
      .finally(() => setIsLoading(false));

    fetch("/api/nfc")
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setNfcCards(Array.isArray(data) ? data : []));
  }, []);

  const activateNfcCard = async () => {
    if (!selected) return;
    setError("");
    setIsActivatingNfc(true);
    const response = await fetch("/api/nfc/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activationCode: nfcActivationCode,
        cardId: selected.id,
      }),
    });
    const data = await response.json();
    setIsActivatingNfc(false);
    if (!response.ok) {
      setError(data.error || "Unable to activate this NFC card.");
      return;
    }

    setNfcCards((current) => [data, ...current]);
    setNfcActivationCode("");
    setShowNfcActivation(false);
  };

  const resizeProfilePicture = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Unable to read image."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Unable to process image."));
        image.onload = () => {
          const size = 512;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Unable to process image."));
            return;
          }

          const scale = Math.max(size / image.width, size / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          context.drawImage(
            image,
            (size - width) / 2,
            (size - height) / 2,
            width,
            height,
          );
          resolve(canvas.toDataURL("image/jpeg", 0.88));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const uploadProfilePicture = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setIsUploadingPhoto(true);
    setError("");
    try {
      const image = await resizeProfilePicture(file);
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to upload profile picture.");
      }
      setProfileImage(data.image);
      updateProfile("profilePicture", data.image);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload profile picture.",
      );
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const removeProfilePicture = async () => {
    setIsUploadingPhoto(true);
    setError("");
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: "" }),
    });
    setIsUploadingPhoto(false);
    if (response.ok) {
      setProfileImage(null);
      updateProfile("profilePicture", "");
    }
  };

  useEffect(() => {
    if (!selected) {
      setQrDataUrl("");
      return;
    }
    const url = `${window.location.origin}/c?slug=${encodeURIComponent(selected.slug)}&source=qr`;
    QRCode.toDataURL(url, {
      width: 420,
      margin: 2,
      color: { dark: "#17191c", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [selected]);

  const profileSection = selected?.sections.find(
    (section) => section.type === "profile",
  );
  const profile = {
    ...emptyProfile,
    ...((profileSection?.data as typeof emptyProfile) || {}),
  };
  const selectedNfcCards = selected
    ? nfcCards.filter((nfcCard) => nfcCard.cardId === selected.id)
    : [];

  const updateCard = (patch: Partial<DigitalCard>) => {
    setCards((current) =>
      current.map((card) =>
        card.id === selectedId ? { ...card, ...patch } : card,
      ),
    );
  };

  const updateProfile = (key: keyof typeof emptyProfile, value: string) => {
    if (!selected) return;
    setCards((current) =>
      current.map((card) =>
        card.id !== selectedId
          ? card
          : {
              ...card,
              sections: card.sections.map((section) =>
                section.type === "profile"
                  ? {
                      ...section,
                      data: {
                        ...profile,
                        [key]: value,
                      },
                    }
                  : section,
              ),
            },
      ),
    );
  };

  const createCard = async () => {
    setError("");
    if (!newTitle.trim()) return;
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), isPublished: false }),
    });
    const card = await response.json();
    if (!response.ok) {
      setError(card.error || "Unable to create the card.");
      return;
    }
    setCards((current) => [card, ...current]);
    setSelectedId(card.id);
    setNewTitle("");
    setShowCreate(false);
  };

  const saveCard = async () => {
    if (!selected) return;
    setIsSaving(true);
    setError("");
    const response = await fetch(`/api/cards/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selected.title,
        slug: selected.slug,
        accentColor: selected.accentColor,
        layout: selected.layout,
        isPublished: selected.isPublished,
        sections: selected.sections,
      }),
    });
    const updated = await response.json();
    setIsSaving(false);
    if (!response.ok) {
      setError(updated.error || "Unable to save the card.");
      return;
    }
    setCards((current) =>
      current.map((card) => (card.id === selected.id ? updated : card)),
    );
  };

  const deleteCard = async () => {
    if (!selected || !window.confirm(`Delete "${selected.title}"?`)) return;
    const response = await fetch(`/api/cards/${selected.id}`, { method: "DELETE" });
    if (!response.ok) return;
    const remaining = cards.filter((card) => card.id !== selected.id);
    setCards(remaining);
    setSelectedId(remaining[0]?.id || "");
  };

  const copyLink = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}/c?slug=${encodeURIComponent(selected.slug)}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#777c84]">Identity</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17191c] md:text-3xl">
              Business cards
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            New card
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid h-80 place-items-center rounded-2xl bg-white text-sm text-[#777c84]">
            Loading cards...
          </div>
        ) : cards.length === 0 ? (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-[#d8dbe0] bg-white p-8 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f0f2f5]">
                <Share2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Create your first digital card</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[#777c84]">
                Build a polished profile, publish it, and share it through NFC or QR.
              </p>
              <button type="button" onClick={() => setShowCreate(true)} className="mt-5 rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white">
                Create card
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_340px]">
            <aside className="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 xl:flex-col">
              {cards.map((card) => (
                <button
                  type="button"
                  key={card.id}
                  onClick={() => setSelectedId(card.id)}
                  className={`min-w-[180px] rounded-xl p-3 text-left transition xl:w-full ${
                    card.id === selectedId
                      ? "bg-[#17191c] text-white"
                      : "text-[#34383e] hover:bg-[#f5f6f8]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold">{card.title}</span>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${card.isPublished ? "bg-emerald-400" : "bg-[#b9bdc4]"}`} />
                  </div>
                  <span className={`mt-1 block truncate text-xs ${card.id === selectedId ? "text-white/60" : "text-[#92979f]"}`}>/{card.slug}</span>
                </button>
              ))}
            </aside>

            {selected && (
              <>
                <section className="rounded-2xl bg-white p-5 md:p-6">
                  <div className="flex items-start justify-between border-b border-[#eceef1] pb-5">
                    <div>
                      <h2 className="text-lg font-bold">Card details</h2>
                      <p className="mt-1 text-sm text-[#777c84]">The information visitors see.</p>
                    </div>
                    <button type="button" onClick={deleteCard} className="grid h-9 w-9 place-items-center rounded-lg text-[#777c84] hover:bg-red-50 hover:text-red-600" aria-label="Delete card">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="rounded-xl border border-[#eceef1] p-4">
                      <div className="flex items-center gap-4">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={profileName || "Profile"}
                            className="h-20 w-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#f0f2f5] text-[#777c84]">
                            <Camera className="h-7 w-7" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">Profile picture</p>
                          <p className="mt-1 text-xs text-[#92979f]">
                            Used in the account navigation. JPG or PNG recommended.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <label className="cursor-pointer rounded-lg border border-[#dde0e5] px-3 py-2 text-xs font-semibold hover:bg-[#f5f6f8]">
                              {isUploadingPhoto
                                ? "Processing..."
                                : profileImage
                                  ? "Change photo"
                                  : "Upload photo"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={uploadProfilePicture}
                                disabled={isUploadingPhoto}
                              />
                            </label>
                            {profileImage && (
                              <button
                                type="button"
                                onClick={removeProfilePicture}
                                disabled={isUploadingPhoto}
                                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <label className="grid gap-2 text-sm font-semibold">
                      Account name
                      <input
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        onBlur={async () => {
                          await fetch("/api/account", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: profileName }),
                          });
                        }}
                        className="card-input"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Card name
                      <input value={selected.title} onChange={(event) => updateCard({ title: event.target.value })} className="card-input" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Public URL
                      <div className="flex items-center rounded-xl border border-[#dde0e5] px-3 focus-within:border-[#17191c]">
                        <span className="whitespace-nowrap text-sm text-[#92979f]">taplify.io/c/</span>
                        <input value={selected.slug} onChange={(event) => updateCard({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="min-w-0 flex-1 border-0 bg-transparent px-1 py-3 text-sm outline-none" />
                      </div>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {([
                        ["fullName", "Full name"],
                        ["jobTitle", "Job title"],
                        ["company", "Company"],
                        ["email", "Email"],
                        ["phone", "Phone"],
                        ["website", "Website"],
                      ] as const).map(([key, label]) => (
                        <label key={key} className="grid gap-2 text-sm font-semibold">
                          {label}
                          <input value={profile[key]} onChange={(event) => updateProfile(key, event.target.value)} className="card-input" />
                        </label>
                      ))}
                    </div>
                    <label className="grid gap-2 text-sm font-semibold">
                      Biography
                      <textarea value={profile.biography} onChange={(event) => updateProfile("biography", event.target.value)} rows={4} className="card-input resize-none" />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                      <label className="grid gap-2 text-sm font-semibold">
                        Accent color
                        <div className="flex items-center gap-3 rounded-xl border border-[#dde0e5] px-3 py-2">
                          <input type="color" value={selected.accentColor} onChange={(event) => updateCard({ accentColor: event.target.value })} className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0" />
                          <span className="text-sm text-[#777c84]">{selected.accentColor}</span>
                        </div>
                      </label>
                      <label className="grid gap-2 text-sm font-semibold">
                        Layout
                        <select value={selected.layout} onChange={(event) => updateCard({ layout: event.target.value })} className="card-input">
                          <option value="classic">Classic</option>
                          <option value="portrait">Portrait</option>
                          <option value="banner">Banner</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#eceef1] pt-5">
                    <label className="flex items-center gap-3 text-sm font-semibold">
                      <input type="checkbox" checked={selected.isPublished} onChange={(event) => updateCard({ isPublished: event.target.checked })} className="h-4 w-4 rounded border-[#ccd0d6] text-[#17191c]" />
                      Published
                    </label>
                    <button type="button" disabled={isSaving} onClick={saveCard} className="flex items-center gap-2 rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </section>

                <aside className="flex flex-col gap-5">
                  <div className="rounded-2xl bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold">QR code</h2>
                        <p className="mt-1 text-xs text-[#92979f]">Scan to open this card</p>
                      </div>
                      <MoreHorizontal className="h-5 w-5 text-[#92979f]" />
                    </div>
                    <div className="mt-4 rounded-2xl bg-[#f5f6f8] p-4">
                      {qrDataUrl && <img src={qrDataUrl} alt="Card QR code" className="mx-auto aspect-square w-full rounded-lg" />}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button type="button" onClick={copyLink} className="flex items-center justify-center gap-2 rounded-xl border border-[#dde0e5] px-3 py-2.5 text-xs font-semibold">
                        <Copy className="h-4 w-4" /> Copy link
                      </button>
                      {qrDataUrl && (
                        <a href={qrDataUrl} download={`${selected.slug}-qr.png`} className="flex items-center justify-center gap-2 rounded-xl border border-[#dde0e5] px-3 py-2.5 text-xs font-semibold">
                          <Download className="h-4 w-4" /> PNG
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#eceef1] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5f6f8]">
                        <Nfc className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold">Physical NFC card</h2>
                        <p className="mt-1 text-xs text-[#92979f]">
                          {selectedNfcCards.length
                            ? `${selectedNfcCards.length} connected`
                            : "Optional · online link and QR already work"}
                        </p>
                      </div>
                    </div>
                    {selectedNfcCards.length > 0 && (
                      <div className="mt-4 divide-y divide-[#eceef1]">
                        {selectedNfcCards.map((nfcCard) => (
                          <div key={nfcCard.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                            <div>
                              <p className="text-sm font-semibold">{nfcCard.name}</p>
                              <p className="mt-1 text-xs text-[#92979f]">
                                {nfcCard.tagType} · {nfcCard.tapCount} taps
                              </p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${nfcCard.isActive ? "bg-emerald-50 text-emerald-700" : "bg-[#f0f1f3] text-[#777c84]"}`}>
                              {nfcCard.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!selected.isPublished}
                      onClick={() => {
                        setError("");
                        setShowNfcActivation(true);
                      }}
                      className="mt-4 w-full rounded-xl border border-[#dde0e5] px-3 py-2.5 text-xs font-semibold transition hover:bg-[#f5f6f8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selectedNfcCards.length
                        ? "Activate another NFC card"
                        : "Activate physical NFC card"}
                    </button>
                    {!selected.isPublished && (
                      <p className="mt-2 text-xs text-amber-700">
                        Publish this card before activating an NFC card.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#17191c] p-5 text-white">
                    <h2 className="text-sm font-bold">Public profile</h2>
                    <p className="mt-1 break-all text-xs text-white/60">/c?slug={selected.slug}</p>
                    <a href={`/c?slug=${encodeURIComponent(selected.slug)}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#17191c]">
                      <ExternalLink className="h-4 w-4" /> Preview profile
                    </a>
                  </div>
                </aside>
              </>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Create a digital card</h2>
            <p className="mt-1 text-sm text-[#777c84]">Start with a name. You can customize everything after.</p>
            <input autoFocus value={newTitle} onChange={(event) => setNewTitle(event.target.value)} onKeyDown={(event) => event.key === "Enter" && createCard()} placeholder="Card name" className="card-input mt-5 w-full" />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f6f8]">Cancel</button>
              <button type="button" onClick={createCard} className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white">Create card</button>
            </div>
          </div>
        </div>
      )}

      {showNfcActivation && selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              activateNfcCard();
            }}
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold">Connect a physical card</h2>
            <p className="mt-1 text-sm text-[#777c84]">
              This NFC card will automatically link to <strong>{selected.title}</strong>.
              Enter the one-time code included with the card.
            </p>
            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <input
              autoFocus
              required
              value={nfcActivationCode}
              onChange={(event) => setNfcActivationCode(event.target.value.toUpperCase())}
              placeholder="Activation code"
              autoComplete="one-time-code"
              className="card-input mt-5 font-mono uppercase tracking-wider"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNfcActivation(false);
                  setError("");
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f6f8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActivatingNfc}
                className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isActivatingNfc ? "Activating..." : "Activate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
