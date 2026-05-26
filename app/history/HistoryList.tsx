"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  patient_name: string | null;
  examined_at: string | null;
  created_at: string;
};

export default function HistoryList({ rows: initialRows }: { rows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const name = (r.patient_name || "").toLowerCase();
      const date = (r.examined_at || "").toLowerCase();
      return name.includes(q) || date.includes(q);
    });
  }, [rows, search]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/examinations/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error(await res.text());
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setConfirmingId(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la ștergere");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <SearchIcon />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume pacient sau dată..."
            className="input pl-9"
          />
        </div>
        <Link href="/form" className="btn-accent shrink-0">
          + Examinare nouă
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-left">
            <tr className="text-slate-500">
              <th className="px-5 py-3 font-medium">Pacient</th>
              <th className="px-5 py-3 font-medium">Data examinării</th>
              <th className="px-5 py-3 font-medium">Salvată</th>
              <th className="px-5 py-3 font-medium text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition group">
                <td className="px-5 py-3">
                  <Link
                    href={`/form?edit=${r.id}`}
                    className="font-medium text-slate-900 hover:text-sky-700"
                    title="Click pentru editare"
                  >
                    {r.patient_name || "—"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{r.examined_at || "—"}</td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(r.created_at).toLocaleString("ro-RO")}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/form?edit=${r.id}`}
                      className="btn-ghost"
                      title="Editează"
                    >
                      <EditIcon /> Editează
                    </Link>
                    <a
                      href={`/api/download/${r.id}`}
                      className="btn-ghost"
                      title="Descarcă Word"
                    >
                      <FileIcon /> Word
                    </a>
                    <a
                      href={`/print/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      title="Deschide pentru salvare PDF"
                    >
                      <PdfIcon /> PDF
                    </a>
                    {confirmingId === r.id ? (
                      <span className="inline-flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
                        <span className="text-xs text-slate-600 mr-1">Sigur?</span>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="inline-flex items-center justify-center rounded-md bg-red-600 text-white text-xs font-medium px-2 py-1 hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === r.id ? "..." : "Da, șterge"}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="inline-flex items-center justify-center rounded-md bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 hover:bg-slate-200"
                        >
                          Anulează
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(r.id)}
                        className="btn-ghost hover:text-red-600 hover:bg-red-50"
                        title="Șterge înregistrarea"
                      >
                        <TrashIcon /> Șterge
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-14 text-center text-slate-400">
                  {search
                    ? `Nicio examinare nu se potrivește cu „${search}".`
                    : "Nicio examinare salvată încă."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
