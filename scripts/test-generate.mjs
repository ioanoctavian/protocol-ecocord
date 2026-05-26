import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const tpl = await fs.readFile(path.join(ROOT, "templates/template.docx"));
const zip = new PizZip(tpl);
const doc = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
  delimiters: { start: "{", end: "}" },
  nullGetter: () => "______",
});
doc.render({
  data_examinarii: "2026-05-26",
  nume_prenume: "Ionescu Maria",
  varsta: "58",
  ta: "130/80",
  ao_inel: "3,2",
  ao_ascendenta: "3,0",
  diam_as: "3,8",
  fs: "32",
  fe_teichholtz: "55",
  concluzii: "Examinare ecografică în limite normale.",
  diagnostice: "Fără patologie semnificativă",
  recomandari: "Control la 12 luni",
  tratament: "Continuă tratamentul actual",
  medic_examinator: "Dr. Goje Iacob Daniel\nmedic specialist medicină internă și cardiologie",
});
const out = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
await fs.writeFile("/tmp/test-output.docx", out);
console.log("Wrote /tmp/test-output.docx,", out.length, "bytes");
