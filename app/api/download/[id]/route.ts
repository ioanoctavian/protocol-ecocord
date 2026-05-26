import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDocx } from "@/lib/document";
import type { FormValues } from "@/lib/fields";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Neautentificat", { status: 401 });

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
    return new NextResponse("Negăsit", { status: 404 });
  }

  const { data, error } = await supabase
    .from("examinations")
    .select("data, patient_name")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data || !data.data) return new NextResponse("Negăsit", { status: 404 });

  const buf = await buildDocx(data.data as FormValues);
  const safe = ((data.patient_name as string) || "pacient")
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
