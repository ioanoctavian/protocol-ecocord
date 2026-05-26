import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EcoForm from "./EcoForm";
import Link from "next/link";

export default async function FormPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ecocardiografie transtoracică</h1>
          <p className="text-sm text-slate-600">Conectat ca {user.email}</p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/history" className="text-slate-700 hover:underline">
            Istoric
          </Link>
          <form action="/auth/signout" method="post">
            <button className="text-slate-700 hover:underline">Deconectare</button>
          </form>
        </nav>
      </header>
      <EcoForm />
    </main>
  );
}
