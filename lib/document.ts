import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import type { FormValues } from "./fields";

type V = string | number | boolean | null | undefined;

function txt(v: V): string {
  if (v === undefined || v === null || v === "") return "____";
  if (typeof v === "boolean") return v ? "Da" : "Nu";
  return String(v);
}

function p(children: TextRun[]): Paragraph {
  return new Paragraph({ children });
}

function blank(): Paragraph {
  return new Paragraph({ children: [new TextRun("")] });
}

function field(label: string, value: V, unit?: string, ref?: string): Paragraph {
  const runs: TextRun[] = [
    new TextRun({ text: `${label}: `, bold: true }),
    new TextRun({ text: txt(value) }),
  ];
  if (unit) runs.push(new TextRun({ text: ` ${unit}` }));
  if (ref) runs.push(new TextRun({ text: ` (${ref})`, color: "666666" }));
  return p(runs);
}

function inlineFields(parts: Array<{ label: string; value: V; unit?: string }>): Paragraph {
  const runs: TextRun[] = [];
  parts.forEach((part, i) => {
    if (i > 0) runs.push(new TextRun({ text: "     " }));
    runs.push(new TextRun({ text: `${part.label}: `, bold: true }));
    runs.push(new TextRun({ text: txt(part.value) }));
    if (part.unit) runs.push(new TextRun({ text: ` ${part.unit}` }));
  });
  return p(runs);
}

function choice(label: string, options: string[], selected: V): Paragraph {
  const runs: TextRun[] = [new TextRun({ text: `${label}:   `, bold: true })];
  options.forEach((opt, i) => {
    const isSel = selected === opt;
    runs.push(new TextRun({ text: `${isSel ? "☒" : "☐"} ${opt}`, bold: isSel }));
    if (i < options.length - 1) runs.push(new TextRun({ text: "    " }));
  });
  return p(runs);
}

function yesNo(label: string, present: V, severity: V, extras: Array<{ label: string; value: V; unit?: string }>): Paragraph[] {
  const sel = Boolean(present);
  const runs: TextRun[] = [
    new TextRun({ text: `${label}:   `, bold: true }),
    new TextRun({ text: `${sel ? "☐" : "☒"} Nu`, bold: !sel }),
    new TextRun({ text: "    " }),
    new TextRun({ text: `${sel ? "☒" : "☐"} Da`, bold: sel }),
  ];
  if (severity) {
    runs.push(new TextRun({ text: "     Severitate: " }));
    runs.push(new TextRun({ text: txt(severity) }));
  }
  const out = [p(runs)];
  if (extras.length) out.push(inlineFields(extras));
  return out;
}

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, underline: {} })],
  });
}

function title(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true, size: 28 })],
  });
}

export async function buildDocx(v: FormValues): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(title("ECOCARDIOGRAFIE TRANSTORACICĂ"));
  children.push(field("Data examinării", v.data_examinarii));
  children.push(
    p([
      new TextRun({ text: "Nume și Prenume: ", bold: true }),
      new TextRun({ text: txt(v.nume_prenume) + "     " }),
      new TextRun({ text: "Vârsta: ", bold: true }),
      new TextRun({ text: txt(v.varsta) + " ani     " }),
      new TextRun({ text: "TA = ", bold: true }),
      new TextRun({ text: txt(v.ta) + " mmHg" }),
    ]),
  );
  children.push(choice("Calitatea imaginii ecocardiografice", ["Bună", "Satisfăcătoare", "Slabă"], v.calitate_imagine));
  children.push(choice("Ritm", ["Sinusal", "Fibrilație atrială", "Ritm electrostimulat"], v.ritm));

  children.push(heading("Incidență parasternală"));
  children.push(field("Ao la inel", v.ao_inel, "cm", "2,2-3,7"));
  children.push(field("Ao ascendentă", v.ao_ascendenta, "cm", "2,1-3,4"));
  children.push(field("Deschidere v. Ao", v.deschidere_v_ao, "cm", ">1,6"));
  children.push(
    p([
      new TextRun({ text: "Aspectul valvei aortice: ", bold: true }),
      new TextRun({ text: txt(v.aspect_v_ao) }),
      v.aspect_v_ao_detalii ? new TextRun({ text: " — " + txt(v.aspect_v_ao_detalii) }) : new TextRun(""),
    ]),
  );
  children.push(field("Diam AS", v.diam_as, "cm", "2,7-4,5"));
  children.push(field("Diam VD", v.diam_vd, "cm", "0,9-2,6"));
  children.push(
    p([
      new TextRun({ text: "SIV: ", bold: true }),
      new TextRun({ text: txt(v.siv) + " cm (0,6-1,2)     " }),
      new TextRun({ text: "Mișcare paradoxală SIV: ", bold: true }),
      new TextRun({ text: txt(v.miscare_paradoxala_siv) }),
    ]),
  );
  children.push(field("DTDVS", v.dtdvs, "cm", "3,7-5,6"));
  children.push(field("DTSVS", v.dtsvs, "cm", "2,7-3,7"));
  children.push(field("PPVS", v.ppvs, "cm", "0,6-1,2"));
  children.push(field("FS", v.fs, "%", "25-45"));
  children.push(field("FE Teichholtz", v.fe_teichholtz, "%"));
  children.push(
    p([
      new TextRun({ text: "Aspectul valvei mitrale: ", bold: true }),
      new TextRun({ text: txt(v.aspect_v_mitrala) }),
      v.aspect_v_mitrala_detalii ? new TextRun({ text: " — " + txt(v.aspect_v_mitrala_detalii) }) : new TextRun(""),
    ]),
  );

  children.push(heading("Apical 4 camere / 2 camere"));
  children.push(inlineFields([
    { label: "Apical 4C VTD", value: v.apical_4c_vtd, unit: "ml" },
    { label: "VTS", value: v.apical_4c_vts, unit: "ml" },
    { label: "FE", value: v.apical_4c_fe, unit: "%" },
  ]));
  children.push(inlineFields([
    { label: "Apical 2C VTD", value: v.apical_2c_vtd, unit: "ml" },
    { label: "VTS", value: v.apical_2c_vts, unit: "ml" },
    { label: "FE", value: v.apical_2c_fe, unit: "%" },
  ]));
  children.push(inlineFields([
    { label: "Volum AS", value: v.volum_as, unit: "ml (20-55)" },
    { label: "Suprafață AS", value: v.supraf_as, unit: "cm² (<20)" },
  ]));
  children.push(field("Funcție diastolică", v.functie_diastolica));

  children.push(heading("Flux mitral"));
  children.push(inlineFields([
    { label: "E", value: v.fm_e, unit: "m/s" },
    { label: "A", value: v.fm_a, unit: "m/s" },
    { label: "TDE", value: v.fm_tde, unit: "ms" },
    { label: "E'", value: v.fm_e_prim, unit: "m/s" },
    { label: "E/E'", value: v.fm_e_per_e_prim },
    { label: "S'", value: v.fm_s_prim, unit: "ms" },
  ]));
  children.push(...yesNo(
    "Stenoză mitrală",
    v.sm_prezenta,
    v.sm_severitate,
    [
      { label: "PHT", value: v.sm_pht, unit: "ms" },
      { label: "Pmed", value: v.sm_pmed, unit: "mmHg" },
    ],
  ));
  children.push(...yesNo(
    "Insuficiență mitrală",
    v.im_prezenta,
    v.im_severitate,
    [
      { label: "Vena contracta", value: v.im_vena_contracta, unit: "cm" },
      { label: "dP/dt", value: v.im_dp_dt, unit: "mmHg/ms" },
    ],
  ));

  children.push(heading("Flux aortic"));
  children.push(inlineFields([
    { label: "V max", value: v.fa_vmax, unit: "m/s" },
    { label: "P max", value: v.fa_pmax, unit: "mmHg" },
    { label: "IVT", value: v.fa_ivt, unit: "cm" },
    { label: "TEVS", value: v.fa_tevs, unit: "cm" },
    { label: "IVT TEVS", value: v.fa_ivt_tevs, unit: "cm" },
  ]));
  children.push(...yesNo(
    "Stenoză aortică",
    v.sa_prezenta,
    v.sa_severitate,
    [
      { label: "AVA cont", value: v.sa_ava_cont, unit: "cm²" },
      { label: "Splan", value: v.sa_splan, unit: "cm²" },
      { label: "Pmed", value: v.sa_pmed, unit: "mmHg" },
    ],
  ));
  children.push(...yesNo(
    "Insuficiență aortică",
    v.ia_prezenta,
    v.ia_severitate,
    [
      { label: "Vena contracta", value: v.ia_vena_contracta, unit: "cm" },
      { label: "PHT", value: v.ia_pht, unit: "ms" },
      { label: "v td aorta desc", value: v.ia_v_td_aorta_desc, unit: "cm/s" },
    ],
  ));

  children.push(heading("Flux tricuspidian"));
  children.push(inlineFields([
    { label: "V max", value: v.ft_vmax, unit: "m/s" },
    { label: "P max", value: v.ft_pmax, unit: "mmHg" },
    { label: "E", value: v.ft_e, unit: "m/s" },
    { label: "A", value: v.ft_a, unit: "m/s" },
  ]));
  children.push(...yesNo(
    "Stenoză tricuspidiană",
    v.st_prezenta,
    v.st_severitate,
    [
      { label: "PHT", value: v.st_pht, unit: "ms" },
      { label: "Pmed", value: v.st_pmed, unit: "mmHg" },
    ],
  ));
  children.push(...yesNo(
    "Insuficiență tricuspidiană",
    v.it_prezenta,
    v.it_severitate,
    [
      { label: "Vena contracta", value: v.it_vena_contracta, unit: "cm" },
      { label: "TAPSE", value: v.it_tapse, unit: "cm" },
    ],
  ));

  children.push(heading("Flux pulmonar"));
  children.push(inlineFields([
    { label: "V max", value: v.fp_vmax, unit: "m/s" },
    { label: "P max", value: v.fp_pmax, unit: "mmHg" },
    { label: "TaccP", value: v.fp_taccp, unit: "ms" },
  ]));
  children.push(...yesNo(
    "Stenoză pulmonară",
    v.sp_prezenta,
    v.sp_severitate,
    [{ label: "Pmed", value: v.sp_pmed, unit: "mmHg" }],
  ));
  children.push(...yesNo(
    "Insuficiență pulmonară",
    v.ip_prezenta,
    v.ip_severitate,
    [{ label: "PSAP", value: v.psap, unit: "mmHg" }],
  ));

  children.push(heading("Cinetică parietală"));
  children.push(
    p([
      new TextRun({ text: "Cinetică: ", bold: true }),
      new TextRun({ text: txt(v.cinetica) }),
    ]),
  );
  if (v.cinetica_detalii) {
    children.push(p([new TextRun({ text: txt(v.cinetica_detalii) })]));
  }
  children.push(field("GLS", v.gls, "%"));

  children.push(
    p([
      new TextRun({ text: "Lichid pericardic: ", bold: true }),
      new TextRun({ text: txt(v.lichid_pericardic) }),
      v.lichid_pericardic_detalii ? new TextRun({ text: " — " + txt(v.lichid_pericardic_detalii) }) : new TextRun(""),
    ]),
  );

  children.push(blank());
  children.push(p([new TextRun({ text: "Concluzii:", bold: true })]));
  children.push(p([new TextRun({ text: txt(v.concluzii) })]));

  children.push(blank());
  children.push(p([new TextRun({ text: "Diagnostice:", bold: true })]));
  children.push(p([new TextRun({ text: txt(v.diagnostice) })]));

  children.push(blank());
  children.push(p([new TextRun({ text: "Recomandări:", bold: true })]));
  children.push(p([new TextRun({ text: txt(v.recomandari) })]));

  children.push(blank());
  children.push(p([new TextRun({ text: "Tratament:", bold: true })]));
  children.push(p([new TextRun({ text: txt(v.tratament) })]));

  children.push(blank());
  children.push(blank());
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "Medic examinator: ", bold: true }),
        new TextRun({ text: txt(v.medic_examinator) }),
      ],
    }),
  );

  const doc = new Document({
    creator: "Protocol EcoCord",
    title: "Ecocardiografie transtoracică",
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
}
