import fs from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { FormValues } from "./fields";

const BLANK = "______";

let cachedTemplate: Buffer | null = null;

async function loadTemplate(): Promise<Buffer> {
  if (cachedTemplate) return cachedTemplate;
  const p = path.join(process.cwd(), "templates", "template.docx");
  cachedTemplate = await fs.readFile(p);
  return cachedTemplate;
}

function render(v: FormValues): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, raw] of Object.entries(v)) {
    if (raw === undefined || raw === null || raw === "") {
      out[k] = BLANK;
    } else if (typeof raw === "boolean") {
      out[k] = raw ? "Da" : "Nu";
    } else {
      out[k] = String(raw);
    }
  }
  // Append the radio/checkbox selections that aren't dot placeholders so the
  // doctor can see which options were chosen in the form, even though the
  // original layout keeps the option text intact.
  const choiceSummary = [
    ["Calitatea imaginii", v.calitate_imagine],
    ["Ritm", v.ritm],
    ["Aspect v. aortică", v.aspect_v_ao],
    ["Aspect v. mitrală", v.aspect_v_mitrala],
    ["Mișcare paradoxală SIV", v.miscare_paradoxala_siv ? "Da" : "Nu"],
    ["Funcție diastolică", v.functie_diastolica],
    ["Stenoză mitrală", v.sm_prezenta ? "Da" : "Nu"],
    ["Insuficiență mitrală", v.im_prezenta ? "Da" : "Nu"],
    ["Stenoză aortică", v.sa_prezenta ? "Da" : "Nu"],
    ["Insuficiență aortică", v.ia_prezenta ? "Da" : "Nu"],
    ["Stenoză tricuspidiană", v.st_prezenta ? "Da" : "Nu"],
    ["Insuficiență tricuspidiană", v.it_prezenta ? "Da" : "Nu"],
    ["Stenoză pulmonară", v.sp_prezenta ? "Da" : "Nu"],
    ["Insuficiență pulmonară", v.ip_prezenta ? "Da" : "Nu"],
    ["Cinetică", v.cinetica],
    ["Lichid pericardic", v.lichid_pericardic],
  ];
  // Not used by template currently; kept here so the renderer remains a single
  // source of truth if a summary placeholder is added later.
  void choiceSummary;

  // Diagnostice / Recomandari / Tratament render as a new line below the label
  // with each user-entered line prefixed by "- ". Empty values become "" so the
  // label doesn't get followed by underscores.
  for (const k of ["diagnostice", "recomandari", "tratament"]) {
    if (!out[k] || out[k] === BLANK) {
      out[k] = "";
    } else {
      out[k] = "\n" + bulletize(out[k]);
    }
  }

  // Medic title placeholder: render empty when unset so the centered paragraph
  // is just blank rather than a row of underscores.
  if (!out.medic_titlu || out.medic_titlu === BLANK) out.medic_titlu = "";

  return out;
}

function bulletize(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");
}

export async function buildDocx(v: FormValues): Promise<Buffer> {
  const tplBuf = await loadTemplate();
  const zip = new PizZip(tplBuf);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
    nullGetter: () => BLANK,
  });
  doc.render(render(v));
  const out = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
  return out;
}
