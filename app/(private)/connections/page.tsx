"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Search, UserRound } from "lucide-react";

type Submission = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  createdAt: string;
};

export default function Connections() {
  const [contacts, setContacts] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contacts")
      .then((response) => response.json())
      .then((data) => setContacts(Array.isArray(data) ? data : []))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.phone, contact.company]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [contacts, search]);

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Phone", "Company", "Message", "Date"],
      ...filtered.map((contact) => [
        contact.name,
        contact.email || "",
        contact.phone || "",
        contact.company || "",
        contact.message || "",
        new Date(contact.createdAt).toISOString(),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "taplify-connections.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#777c84]">Network</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Connections</h1>
          </div>
          <button type="button" disabled={filtered.length === 0} onClick={exportCsv} className="flex items-center justify-center gap-2 rounded-xl border border-[#dde0e5] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-40">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="mb-4 flex items-center rounded-xl border border-[#dde0e5] bg-white px-3">
          <Search className="h-4 w-4 text-[#92979f]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search connections" className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#eceef1] bg-white">
          {isLoading ? (
            <div className="grid h-64 place-items-center text-sm text-[#777c84]">Loading connections...</div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f5f6f8]"><UserRound className="h-5 w-5" /></div>
                <h2 className="mt-4 font-bold">No connections yet</h2>
                <p className="mt-1 text-sm text-[#777c84]">People who share their contact will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[#eceef1] text-xs text-[#92979f]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f1f3]">
                  {filtered.map((contact) => (
                    <tr key={contact.id} className="text-sm">
                      <td className="whitespace-nowrap px-5 py-4 font-semibold">{contact.name}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#686d75]">{contact.email || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#686d75]">{contact.phone || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#686d75]">{contact.company || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#92979f]">{new Date(contact.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
