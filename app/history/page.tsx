import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import HistoryList from "./HistoryList";

export const dynamic = "force-dynamic";

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
    .limit(500);

  return (
    <AppShell userEmail={user.email ?? ""} active="history">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-16">
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Istoric examinări</h1>
            <p className="text-slate-500 mt-1">
              {rows?.length ?? 0} examin{rows?.length === 1 ? "are" : "ări"} salvate.
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error.message}
          </div>
        )}

        <HistoryList rows={rows ?? []} />
      </div>
    </AppShell>
  );
}
