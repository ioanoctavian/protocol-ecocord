#!/usr/bin/env node
/**
 * Builds templates/template.docx from `Protocol eco cord.docx`.
 *
 * Walks every <w:t> run in word/document.xml and replaces the long dot
 * sequences (the manual fill-in placeholders in the original form) with
 * docxtemplater placeholders like {nume_prenume}.
 *
 * Each rule below matches one labelled segment from the form. The matcher
 * looks for the label text followed by a sequence of dots and (for runs
 * that contain more than one field) substitutes them in order.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const SRC = path.join(ROOT, "Protocol eco cord.docx");
const OUT_DIR = path.join(ROOT, "templates");
const OUT = path.join(OUT_DIR, "template.docx");

const DOTS = /\.{3,}/g;

// Each rule: { match: RegExp matching the run text, fields: [placeholder, ...] }
// The N-th dot sequence in the matched run becomes {fields[N]}.
const RULES = [
  { match: /^Data examinarii: \.+/, fields: ["data_examinarii"] },
  { match: /^Nume si Prenume: \.+\s+Varsta: \.+ ani\s+TA= \.+mmHg/, fields: ["nume_prenume", "varsta", "ta"] },
  { match: /^Ao la inel:/, fields: ["ao_inel"] },
  { match: /^Ao ascendenta:/, fields: ["ao_ascendenta"] },
  { match: /^Deschidere v ao:/, fields: ["deschidere_v_ao"] },
  { match: /^  \.+\s*$/, fields: ["aspect_v_ao_detalii"], onceOnly: "aspect_v_ao_detalii" },
  { match: /^  \.+\s*$/, fields: ["aspect_v_mitrala_detalii"], onceOnly: "aspect_v_mitrala_detalii" },
  { match: /^Diam AS:/, fields: ["diam_as"] },
  { match: /^Diam VD:/, fields: ["diam_vd"] },
  { match: /^SIV:/, fields: ["siv"] },
  { match: /^DTDVS:/, fields: ["dtdvs"] },
  { match: /^DTSVS:/, fields: ["dtsvs"] },
  { match: /^PPVS:/, fields: ["ppvs"] },
  { match: /^FS:/, fields: ["fs"] },
  { match: /^FE Teichholtz:/, fields: ["fe_teichholtz"] },
  { match: /^VTD: \.+ ml \(95,5.+VTD: \.+ ml/, fields: ["apical_4c_vtd", "apical_2c_vtd"] },
  { match: /^VTS: \.+ ml \(38,6.+VTS: \.+ ml/, fields: ["apical_4c_vts", "apical_2c_vts"] },
  { match: /^FE planimetric: \.+%\s+FE planimetric: \.+%/, fields: ["apical_4c_fe", "apical_2c_fe"] },
  { match: /^Volum AS: \.+\s+ml.+Supraf AS :\.+ cm/, fields: ["volum_as", "supraf_as"] },
  { match: /^E=\.+m\/s \(0,72.+A=\.+m ?\/s \(0,40/, fields: ["fm_e", "fm_a"] },
  { match: /^TDE=\.+ms/, fields: ["fm_tde"] },
  { match: /E.=\.+m\/s,.+E\/E.=\.+\s*,\s*S.=\.+ms/, fields: ["fm_e_prim", "fm_e_per_e_prim", "fm_s_prim"] },
  // Stenoza mitrala
  { match: /^\s+Severitate: \.+\s+PHT=\.+ ms,$/, fields: ["sm_severitate", "sm_pht"] },
  { match: /^Pmed=\.+ mmHg,\s+$/, fields: ["sm_pmed"], onceOnly: "sm_pmed" },
  // Insuficienta mitrala
  { match: /^\s+Severitate: \.+\s+Vena contracta=\.+ cm$/, fields: ["im_severitate", "im_vena_contracta"], onceOnly: "im_severitate" },
  { match: /^dP\/dt= \.+ mmHg\/ms/, fields: ["im_dp_dt"] },
  // Flux aortic
  { match: /^V max=\.+ m\/s,$/, fields: ["fa_vmax"] },
  { match: /^Pmax=\.+ mmHg,$/, fields: ["fa_pmax"], onceOnly: "fa_pmax" },
  { match: /^IVT=\.+ cm,/, fields: ["fa_ivt"] },
  { match: /^TEVS=\.+ cm,\s+IVT TEVS=\.+ cm,/, fields: ["fa_tevs", "fa_ivt_tevs"] },
  { match: /^\s+Severitate: \.+,\s+$/, fields: ["sa_severitate"], onceOnly: "sa_severitate" },
  { match: /^AVA cont=\.+ cm.,\s+Splan=\.+ cm., Pmed=\.+ mmHg,/, fields: ["sa_ava_cont", "sa_splan", "sa_pmed"] },
  { match: /^\s+Severitate: \.+,\s+Vena contracta=\.+ cm$/, fields: ["ia_severitate", "ia_vena_contracta"], onceOnly: "ia_severitate" },
  { match: /^PHT=\.+ ms,\s+v td aorta desc=\.+ cm\/s,/, fields: ["ia_pht", "ia_v_td_aorta_desc"] },
  // Flux tricuspidian
  { match: /^Vmax=\.+ m\/s,\s+P max=\.+ mmHg/, fields: ["ft_vmax", "ft_pmax"] },
  { match: /^E= \.+ m\/s \(0,51.+A=\.+ m\/s \(0,27/, fields: ["ft_e", "ft_a"] },
  // Stenoza tricusp
  { match: /^\s+Severitate: \.+,\s+PHT= \.+ms,/, fields: ["st_severitate", "st_pht"] },
  { match: /^Pmed=\.+ mmHg\s+$/, fields: ["st_pmed"], onceOnly: "st_pmed" },
  // Insuficienta tricusp
  { match: /^\s+Severitate: \.+,\s+Vena contracta=\.+ cm$/, fields: ["it_severitate", "it_vena_contracta"], onceOnly: "it_severitate" },
  { match: /^TAPSE= \.+cm/, fields: ["it_tapse"] },
  // Flux pulmonar
  { match: /^Vmax=\.+ m\/s,$/, fields: ["fp_vmax"], onceOnly: "fp_vmax" },
  { match: /^Pmax=\.+ mmHg,$/, fields: ["fp_pmax"], onceOnly: "fp_pmax" },
  { match: /^TaccP=\.+ ms,/, fields: ["fp_taccp"] },
  // Stenoza pulm
  { match: /^\s+Severitate: \.+,\s+$/, fields: ["sp_severitate"], onceOnly: "sp_severitate" },
  { match: /^Pmed=\.+ mmHg$/, fields: ["sp_pmed"], onceOnly: "sp_pmed" },
  // Insuficienta pulm
  { match: /^\s+Severitate: \.+ ?,\s+PSAP=\.+ mmHg/, fields: ["ip_severitate", "psap"] },
  // Cinetica detalii — original has TWO consecutive dot-only lines, each ~177
  // dots, where the doctor wrote about parietal kinetics anomalies. We map the
  // first to {cinetica_detalii} and clear the second so multi-line content
  // (rendered with linebreaks: true) doesn't get tangled with leftover dots.
  { match: /^\.{100,300}$/, fields: ["cinetica_detalii"], onceOnly: "cinetica_detalii" },
  { match: /^\.{100,300}$/, clear: true, onceOnly: "cinetica_detalii_2" },
  // GLS
  { match: /GLS = \.+%/, fields: ["gls"] },
  // Lichid pericardic detalii
  { match: /^  \.+\s*$/, fields: ["lichid_pericardic_detalii"], onceOnly: "lichid_pericardic_detalii" },
  // Concluzii — single very long dot run (~874 dots) after "Concluzii:" label.
  { match: /^\.{500,}$/, fields: ["concluzii"], onceOnly: "concluzii" },
];

// Labels that have no dot placeholder — append a {placeholder} immediately after the colon.
const APPENDS = [
  { match: /^Diagnostice:$/, name: "diagnostice" },
  { match: /^Recomandari:$/, name: "recomandari" },
  { match: /^Tratament:$/, name: "tratament" },
  { match: /^Medic examinator:/, name: "medic_examinator" },
];

function decodeXml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function encodeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function applyRule(text, fields) {
  let i = 0;
  return text.replace(DOTS, () => {
    const name = fields[i++] ?? null;
    return name ? `{${name}}` : "...";
  });
}

async function main() {
  const used = new Set();
  const buf = await fs.readFile(SRC);
  const zip = new PizZip(buf);
  const docXmlPath = "word/document.xml";
  const docXml = zip.file(docXmlPath).asText();

  let report = [];
  let replaced = 0;

  const newXml = docXml.replace(/<w:t([^>]*)>([^<]*)<\/w:t>/g, (whole, attrs, body) => {
    const text = decodeXml(body);
    for (const rule of RULES) {
      if (rule.onceOnly && used.has(rule.onceOnly)) continue;
      if (rule.match.test(text)) {
        if (rule.clear) {
          if (rule.onceOnly) used.add(rule.onceOnly);
          report.push(`✓ (cleared ${rule.onceOnly})`);
          return `<w:t${attrs}>${encodeXml(text.replace(DOTS, ""))}</w:t>`;
        }
        const out = applyRule(text, rule.fields);
        if (out !== text) {
          if (rule.onceOnly) used.add(rule.onceOnly);
          replaced += rule.fields.length;
          report.push(`✓ ${rule.fields.join(", ")}`);
          return `<w:t${attrs}>${encodeXml(out)}</w:t>`;
        }
      }
    }
    for (const a of APPENDS) {
      if (a.match.test(text)) {
        replaced++;
        report.push(`✓ ${a.name} (append)`);
        // Preserve trailing whitespace by inserting placeholder right after the colon.
        const out = text.replace(/^(.*?:)(.*)$/, `$1 {${a.name}}$2`);
        return `<w:t${attrs}>${encodeXml(out)}</w:t>`;
      }
    }
    return whole;
  });

  // Inject a new centered, bold paragraph below the "Medic examinator:" line
  // for the doctor's title. Going through a fresh <w:p> (rather than a linebreak
  // inside the existing run) sidesteps the trailing-whitespace alignment quirks
  // of the original run.
  const titluParagraph =
    "<w:p>" +
      "<w:pPr>" +
        '<w:pStyle w:val="Normal"/>' +
        '<w:jc w:val="center"/>' +
        "<w:rPr></w:rPr>" +
      "</w:pPr>" +
      "<w:r>" +
        "<w:rPr>" +
          '<w:rFonts w:cs="Calibri" w:ascii="Calibri" w:hAnsi="Calibri"/>' +
          "<w:b/>" +
          '<w:lang w:val="ro-RO"/>' +
        "</w:rPr>" +
        "<w:t>{medic_titlu}</w:t>" +
      "</w:r>" +
    "</w:p>";
  const finalXml = newXml.replace("<w:sectPr>", titluParagraph + "<w:sectPr>");
  report.push("✓ medic_titlu (new centered paragraph)");

  zip.file(docXmlPath, finalXml);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT, zip.generate({ type: "nodebuffer" }));

  console.log(report.join("\n"));
  console.log(`\nReplaced ${replaced} placeholders. Output: ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
