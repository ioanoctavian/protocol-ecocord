import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows, error } = await supabase
    .from("examinations")
    .select("id, patient_name, examined_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AppShell userEmail={user.email ?? ""} active="history">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-16">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Istoric examinări</h1>
            <p className="text-slate-500 mt-1">Ultimele 100 examinări salvate.</p>
          </div>
          <Link href="/form" className="btn-accent">
            + Examinare nouă
          </Link>
        </header>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error.message}
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 text-left">
              <tr className="text-slate-500">
                <th className="px-5 py-3 font-medium">Pacient</th>
                <th className="px-5 py-3 font-medium">Data examinării</th>
                <th className="px-5 py-3 font-medium">Salvată</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">{r.patient_name || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{r.examined_at || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(r.created_at).toLocaleString("ro-RO")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={`/api/download/${r.id}`}
                      className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-800 font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Word
                    </a>
                  </td>
                </tr>
              ))}
              {(rows ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-slate-400">
                    Nicio examinare salvată încă.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
