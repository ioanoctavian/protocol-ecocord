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
  const common = "w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

  if (field.type === "textarea") {
    return (
      <textarea
        rows={field.rows ?? 3}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={common}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={common}
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
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    );
  }
  return (
    <input
      type={field.type}
      step={field.type === "number" ? "any" : undefined}
      value={(value as string | number) ?? ""}
      onChange={(e) =>
        onChange(field.type === "number" ? e.target.value : e.target.value)
      }
      className={common}
    />
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
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Eroare la generare");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = ((values.nume_prenume as string) || "pacient")
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "_") || "pacient";
      a.download = `EcoCord_${safeName}.docx`;
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
      {SECTIONS.map((section) => (
        <section key={section.id} className="bg-white shadow-sm border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.unit && <span className="text-slate-500"> ({field.unit})</span>}
                  {field.reference && (
                    <span className="text-slate-400 text-xs"> [{field.reference}]</span>
                  )}
                </label>
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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-700">{done}</p>}

      <div className="sticky bottom-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto bg-slate-900 text-white rounded-lg px-6 py-3 shadow disabled:opacity-50"
        >
          {submitting ? "Se generează..." : "Salvează și descarcă Word"}
        </button>
      </div>
    </form>
  );
}
