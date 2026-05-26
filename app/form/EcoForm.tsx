"use client";

import { useState } from "react";
import { SECTIONS, emptyFormValues, type Field, type FormValues } from "@/lib/fields";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | number | boolean | null;
  onChange: (v: string | number | boolean) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        rows={field.rows ?? 3}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="input resize-y"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">— alege —</option>
        {field.options!.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "checkbox") {
    const checked = Boolean(value);
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-sky-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    );
  }
  return (
    <input
      type={field.type}
      step={field.type === "number" ? "any" : undefined}
      value={(value as string | number) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`input ${field.type === "number" ? "input-num" : ""}`}
    />
  );
}

function FieldLabel({ field }: { field: Field }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-sm font-medium text-slate-700">{field.label}</label>
      <div className="flex items-center gap-1.5">
        {field.unit && <span className="chip">{field.unit}</span>}
        {field.reference && <span className="chip-accent">{field.reference}</span>}
      </div>
    </div>
  );
}

export default function EcoForm() {
  const [values, setValues] = useState<FormValues>(emptyFormValues());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function update(name: string, v: string | number | boolean) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.text()) || "Eroare la generare");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safe =
        ((values.nume_prenume as string) || "pacient")
          .trim()
          .replace(/[^a-zA-Z0-9-_ ]/g, "")
          .replace(/\s+/g, "_") || "pacient";
      a.download = `EcoCord_${safe}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDone("Document generat și salvat.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {SECTIONS.map((section, i) => (
        <section key={section.id} className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-xs font-semibold flex items-center justify-center shadow-sm">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              {section.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <FieldLabel field={field} />
                <FieldInput
                  field={field}
                  value={values[field.name]}
                  onChange={(v) => update(field.name, v)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur bg-white/80 border-t border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="text-sm">
            {error && <span className="text-red-600">{error}</span>}
            {done && <span className="text-emerald-700">{done}</span>}
            {!error && !done && (
              <span className="text-slate-500 hidden md:inline">
                Toate câmpurile sunt opționale — completează ce ai măsurat.
              </span>
            )}
          </div>
          <button type="submit" disabled={submitting} className="btn-accent">
            {submitting ? (
              <>
                <Spinner /> Se generează...
              </>
            ) : (
              <>
                <DownloadIcon /> Salvează și descarcă Word
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
