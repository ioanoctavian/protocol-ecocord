import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintClient from "./PrintClient";
import "./print.css";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
    notFound();
  }

  // We only verify the row exists here. The actual docx is fetched client-side
  // via /api/download/[id] and rendered by docx-preview, so the PDF preserves
  // the original Word layout (images, fonts, tables) one-to-one.
  const { data } = await supabase
    .from("examinations")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) notFound();

  return <PrintClient id={params.id} />;
}
