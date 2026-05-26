import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDocx } from "@/lib/document";
import { ALL_FIELDS, type FormValues } from "@/lib/fields";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Neautentificat", { status: 401 });

  const url = new URL(req.url);
  const editId = url.searchParams.get("id");

  let payload: FormValues;
  try {
    payload = (await req.json()) as FormValues;
  } catch {
    return new NextResponse("Body invalid", { status: 400 });
  }

  const clean: FormValues = {};
  const known = new Set(ALL_FIELDS.map((f) => f.name));
  for (const k of Object.keys(payload)) {
    if (known.has(k)) clean[k] = payload[k];
  }

  const row = {
    patient_name: (clean.nume_prenume as string) || null,
    examined_at: (clean.data_examinarii as string) || null,
    data: clean,
  };

  if (editId) {
    const { error } = await supabase
      .from("examinations")
      .update(row)
      .eq("id", editId);
    if (error) {
      return new NextResponse(`Eroare la actualizare: ${error.message}`, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("examinations")
      .insert({ user_id: user.id, ...row });
    if (error) {
      return new NextResponse(`Eroare la salvare: ${error.message}`, { status: 500 });
    }
  }

  const buf = await buildDocx(clean);
  const safe = ((clean.nume_prenume as string) || "pacient")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "_") || "pacient";

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="EcoCord_${safe}.docx"`,
    },
  });
}
