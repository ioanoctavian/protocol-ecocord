import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Istoric examinări</h1>
        <Link href="/form" className="text-sm text-slate-700 hover:underline">
          ← Examinare nouă
        </Link>
      </header>

      {error && <p className="text-red-600 text-sm">{error.message}</p>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Pacient</th>
              <th className="px-4 py-2">Data examinării</th>
              <th className="px-4 py-2">Creată</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.patient_name || "—"}</td>
                <td className="px-4 py-2">{r.examined_at || "—"}</td>
                <td className="px-4 py-2">
                  {new Date(r.created_at).toLocaleString("ro-RO")}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={`/api/download/${r.id}`}
                    className="text-slate-700 hover:underline"
                  >
                    Descarcă Word
                  </a>
                </td>
              </tr>
            ))}
            {(rows ?? []).length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                  Nicio examinare salvată încă.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
