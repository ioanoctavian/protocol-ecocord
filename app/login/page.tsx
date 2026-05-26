"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (mode === "signup") {
      setInfo("Cont creat. Te poți autentifica acum.");
      setMode("signin");
      return;
    }
    router.push("/form");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <HeartIcon />
            </div>
            <span className="font-semibold text-lg tracking-tight">Protocol EcoCord</span>
          </div>
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight leading-[1.15]">
            Buletinul de ecocardiografie, în câteva minute.
          </h1>
          <p className="text-white/80 text-lg">
            Completezi formularul structurat, salvăm examinarea, primești
            documentul Word identic cu șablonul de protocol.
          </p>
          <ul className="space-y-3 text-white/90 text-sm">
            <li className="flex gap-2 items-start">
              <Dot /> Formular cu validări și unități medicale
            </li>
            <li className="flex gap-2 items-start">
              <Dot /> Export .docx care păstrează layout-ul și imaginile
            </li>
            <li className="flex gap-2 items-start">
              <Dot /> Istoric per utilizator, securizat (RLS Supabase)
            </li>
          </ul>
        </div>

        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Protocol EcoCord
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white">
              <HeartIcon />
            </div>
            <span className="font-semibold text-lg">Protocol EcoCord</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Bine ai revenit" : "Cont nou"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "signin"
              ? "Autentifică-te ca să continui."
              : "Creează un cont pentru a salva examinări."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="doctor@spital.ro"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parolă</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                {info}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-accent w-full py-3">
              {loading ? "Se procesează..." : mode === "signin" ? "Intră în cont" : "Creează cont"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600 text-center">
            {mode === "signin" ? "Nu ai cont?" : "Ai deja cont?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
              className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
            >
              {mode === "signin" ? "Creează unul" : "Autentifică-te"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function Dot() {
  return (
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
  );
}
