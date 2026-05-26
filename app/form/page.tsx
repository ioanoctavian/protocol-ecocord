import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EcoForm from "./EcoForm";
import AppShell from "@/components/AppShell";
import type { FormValues } from "@/lib/fields";

export default async function FormPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let initial: { id: string; values: FormValues } | null = null;
  let patientName: string | null = null;
  if (searchParams.edit) {
    const { data } = await supabase
      .from("examinations")
      .select("id, patient_name, data")
      .eq("id", searchParams.edit)
      .single();
    if (data) {
      initial = { id: data.id, values: data.data as FormValues };
      patientName = data.patient_name;
    }
  }

  return (
    <AppShell userEmail={user.email ?? ""} active="form">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-32">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {initial ? `Editare: ${patientName || "examinare"}` : "Ecocardiografie transtoracică"}
          </h1>
          <p className="text-slate-500 mt-1">
            {initial
              ? "Modifică valorile și salvează — actualizăm înregistrarea și regenerăm documentul."
              : "Completează măsurătorile — generăm documentul Word identic cu protocolul."}
          </p>
        </header>
        <EcoForm initial={initial} />
      </div>
    </AppShell>
  );
}
