import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EcoForm from "./EcoForm";
import AppShell from "@/components/AppShell";

export default async function FormPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppShell userEmail={user.email ?? ""} active="form">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-32">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Ecocardiografie transtoracică</h1>
          <p className="text-slate-500 mt-1">Completează măsurătorile — generăm documentul Word identic cu protocolul.</p>
        </header>
        <EcoForm />
      </div>
    </AppShell>
  );
}
