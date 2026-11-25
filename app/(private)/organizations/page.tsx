"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Users } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  role: string;
  members: Array<{ id: string }>;
  cards: Array<{ id: string }>;
  departments: Array<{ id: string }>;
};

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [organizationUrl, setOrganizationUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/organizations")
      .then((response) => response.json())
      .then((data) => setOrganizations(Array.isArray(data) ? data : []));
  };

  useEffect(load, []);

  const createOrganization = async () => {
    setError("");
    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: organizationUrl, website }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create the organization.");
      return;
    }
    setShowCreate(false);
    setName("");
    setOrganizationUrl("");
    setWebsite("");
    load();
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#777c84]">Business</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Organizations</h1>
          </div>
          <button type="button" onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#17191c] px-4 py-3 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> New organization
          </button>
        </div>

        {organizations.length === 0 ? (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-[#d8dbe0] bg-white p-8 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f5f6f8]"><Building2 className="h-5 w-5" /></div>
              <h2 className="mt-4 text-lg font-bold">Create an organization</h2>
              <p className="mt-2 max-w-sm text-sm text-[#777c84]">Manage teams and employee digital cards under one brand.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => (
              <article key={organization.id} className="rounded-2xl border border-[#eceef1] bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#17191c] text-white"><Building2 className="h-5 w-5" /></div>
                  <span className="rounded-full bg-[#f5f6f8] px-2.5 py-1 text-xs font-semibold text-[#686d75]">{organization.role}</span>
                </div>
                <h2 className="mt-4 font-bold">{organization.name}</h2>
                <p className="mt-1 text-xs text-[#92979f]">/{organization.slug}</p>
                <div className="mt-5 grid grid-cols-3 divide-x divide-[#eceef1] border-t border-[#eceef1] pt-4 text-center">
                  <div><p className="font-bold">{organization.members.length}</p><p className="mt-1 text-xs text-[#92979f]">Members</p></div>
                  <div><p className="font-bold">{organization.cards.length}</p><p className="mt-1 text-xs text-[#92979f]">Cards</p></div>
                  <div><p className="font-bold">{organization.departments.length}</p><p className="mt-1 text-xs text-[#92979f]">Teams</p></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Create organization</h2>
            {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-5 grid gap-3">
              <input value={name} onChange={(event) => { setName(event.target.value); if (!organizationUrl) setOrganizationUrl(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} placeholder="Organization name" className="card-input" />
              <input value={organizationUrl} onChange={(event) => setOrganizationUrl(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="organization-slug" className="card-input" />
              <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://company.com" className="card-input" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f6f8]">Cancel</button>
              <button type="button" onClick={createOrganization} className="rounded-xl bg-[#17191c] px-4 py-2.5 text-sm font-semibold text-white">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
