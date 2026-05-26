export type FieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  unit?: string;
  reference?: string;
  options?: string[];
  placeholder?: string;
  rows?: number;
  defaultValue?: string | number | boolean;
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
}

export const SECTIONS: Section[] = [
  {
    id: "antet",
    title: "Date pacient",
    fields: [
      { name: "data_examinarii", label: "Data examinării", type: "date" },
      { name: "nume_prenume", label: "Nume și Prenume", type: "text" },
      { name: "varsta", label: "Vârsta", type: "number", unit: "ani" },
      { name: "ta", label: "TA", type: "text", unit: "mmHg" },
    ],
  },
  {
    id: "general",
    title: "Calitate imagine și ritm",
    fields: [
      {
        name: "calitate_imagine",
        label: "Calitatea imaginii ecocardiografice",
        type: "select",
        options: ["Bună", "Satisfăcătoare", "Slabă"],
      },
      {
        name: "ritm",
        label: "Ritm",
        type: "select",
        options: ["Sinusal", "Fibrilație atrială", "Ritm electrostimulat"],
      },
    ],
  },
  {
    id: "parasternala",
    title: "Incidență parasternală",
    fields: [
      { name: "ao_inel", label: "Ao la inel", type: "number", unit: "cm", reference: "2,2-3,7" },
      { name: "ao_ascendenta", label: "Ao ascendentă", type: "number", unit: "cm", reference: "2,1-3,4" },
      { name: "deschidere_v_ao", label: "Deschidere v. Ao", type: "number", unit: "cm", reference: ">1,6" },
      { name: "aspect_v_ao", label: "Aspectul valvei aortice", type: "select", options: ["Normal", "Patologic"] },
      { name: "aspect_v_ao_detalii", label: "Detalii v. aortică (dacă patologic)", type: "text" },
      { name: "diam_as", label: "Diam AS", type: "number", unit: "cm", reference: "2,7-4,5" },
      { name: "diam_vd", label: "Diam VD", type: "number", unit: "cm", reference: "0,9-2,6" },
      { name: "siv", label: "SIV", type: "number", unit: "cm", reference: "0,6-1,2" },
      { name: "miscare_paradoxala_siv", label: "Mișcare paradoxală SIV", type: "checkbox" },
      { name: "dtdvs", label: "DTDVS", type: "number", unit: "cm", reference: "3,7-5,6" },
      { name: "dtsvs", label: "DTSVS", type: "number", unit: "cm", reference: "2,7-3,7" },
      { name: "ppvs", label: "PPVS", type: "number", unit: "cm", reference: "0,6-1,2" },
      { name: "fs", label: "FS", type: "number", unit: "%", reference: "25-45" },
      { name: "fe_teichholtz", label: "FE Teichholtz", type: "number", unit: "%" },
      { name: "aspect_v_mitrala", label: "Aspectul valvei mitrale", type: "select", options: ["Normal", "Patologic"] },
      { name: "aspect_v_mitrala_detalii", label: "Detalii v. mitrală (dacă patologic)", type: "text" },
    ],
  },
  {
    id: "apical",
    title: "Incidență apicală",
    fields: [
      { name: "apical_4c_vtd", label: "Apical 4C — VTD", type: "number", unit: "ml", reference: "95,5 ±19,4" },
      { name: "apical_4c_vts", label: "Apical 4C — VTS", type: "number", unit: "ml", reference: "38,6 ±9,5" },
      { name: "apical_4c_fe", label: "Apical 4C — FE planimetric", type: "number", unit: "%" },
      { name: "apical_2c_vtd", label: "Apical 2C — VTD", type: "number", unit: "ml" },
      { name: "apical_2c_vts", label: "Apical 2C — VTS", type: "number", unit: "ml" },
      { name: "apical_2c_fe", label: "Apical 2C — FE planimetric", type: "number", unit: "%" },
      { name: "volum_as", label: "Volum AS", type: "number", unit: "ml", reference: "20-55" },
      { name: "supraf_as", label: "Suprafață AS", type: "number", unit: "cm²", reference: "<20" },
      {
        name: "functie_diastolica",
        label: "Funcție diastolică",
        type: "select",
        options: ["Normală", "Disfuncție diastolică tip I", "Disfuncție diastolică tip II", "Disfuncție diastolică tip III"],
      },
    ],
  },
  {
    id: "mitral",
    title: "Flux mitral",
    fields: [
      { name: "fm_e", label: "E", type: "number", unit: "m/s", reference: "0,72 ±0,14" },
      { name: "fm_a", label: "A", type: "number", unit: "m/s", reference: "0,40-1,10" },
      { name: "fm_tde", label: "TDE", type: "number", unit: "ms", reference: "160-240" },
      { name: "fm_e_prim", label: "E'", type: "number", unit: "m/s" },
      { name: "fm_e_per_e_prim", label: "E/E'", type: "number" },
      { name: "fm_s_prim", label: "S'", type: "number", unit: "ms" },
      { name: "sm_prezenta", label: "Stenoză mitrală prezentă", type: "checkbox" },
      { name: "sm_severitate", label: "Severitate stenoză mitrală", type: "text" },
      { name: "sm_pht", label: "SM — PHT", type: "number", unit: "ms" },
      { name: "sm_pmed", label: "SM — Pmed", type: "number", unit: "mmHg" },
      { name: "im_prezenta", label: "Insuficiență mitrală prezentă", type: "checkbox" },
      { name: "im_severitate", label: "Severitate insuficiență mitrală", type: "text" },
      { name: "im_vena_contracta", label: "IM — Vena contracta", type: "number", unit: "cm" },
      { name: "im_dp_dt", label: "IM — dP/dt", type: "number", unit: "mmHg/ms" },
    ],
  },
  {
    id: "aortic",
    title: "Flux aortic",
    fields: [
      { name: "fa_vmax", label: "V max", type: "number", unit: "m/s" },
      { name: "fa_pmax", label: "P max", type: "number", unit: "mmHg" },
      { name: "fa_ivt", label: "IVT", type: "number", unit: "cm" },
      { name: "fa_tevs", label: "TEVS", type: "number", unit: "cm" },
      { name: "fa_ivt_tevs", label: "IVT TEVS", type: "number", unit: "cm" },
      { name: "sa_prezenta", label: "Stenoză aortică prezentă", type: "checkbox" },
      { name: "sa_severitate", label: "Severitate stenoză aortică", type: "text" },
      { name: "sa_ava_cont", label: "SA — AVA cont", type: "number", unit: "cm²" },
      { name: "sa_splan", label: "SA — Splan", type: "number", unit: "cm²" },
      { name: "sa_pmed", label: "SA — Pmed", type: "number", unit: "mmHg" },
      { name: "ia_prezenta", label: "Insuficiență aortică prezentă", type: "checkbox" },
      { name: "ia_severitate", label: "Severitate insuficiență aortică", type: "text" },
      { name: "ia_vena_contracta", label: "IA — Vena contracta", type: "number", unit: "cm" },
      { name: "ia_pht", label: "IA — PHT", type: "number", unit: "ms" },
      { name: "ia_v_td_aorta_desc", label: "IA — v td aorta desc", type: "number", unit: "cm/s" },
    ],
  },
  {
    id: "tricuspidian",
    title: "Flux tricuspidian",
    fields: [
      { name: "ft_vmax", label: "V max", type: "number", unit: "m/s" },
      { name: "ft_pmax", label: "P max", type: "number", unit: "mmHg" },
      { name: "ft_e", label: "E", type: "number", unit: "m/s", reference: "0,51 ±0,07" },
      { name: "ft_a", label: "A", type: "number", unit: "m/s", reference: "0,27 ±0,08" },
      { name: "st_prezenta", label: "Stenoză tricuspidiană prezentă", type: "checkbox" },
      { name: "st_severitate", label: "Severitate stenoză tricuspidiană", type: "text" },
      { name: "st_pht", label: "ST — PHT", type: "number", unit: "ms" },
      { name: "st_pmed", label: "ST — Pmed", type: "number", unit: "mmHg" },
      { name: "it_prezenta", label: "Insuficiență tricuspidiană prezentă", type: "checkbox" },
      { name: "it_severitate", label: "Severitate insuficiență tricuspidiană", type: "text" },
      { name: "it_vena_contracta", label: "IT — Vena contracta", type: "number", unit: "cm" },
      { name: "it_tapse", label: "TAPSE", type: "number", unit: "cm" },
    ],
  },
  {
    id: "pulmonar",
    title: "Flux pulmonar",
    fields: [
      { name: "fp_vmax", label: "V max", type: "number", unit: "m/s" },
      { name: "fp_pmax", label: "P max", type: "number", unit: "mmHg" },
      { name: "fp_taccp", label: "TaccP", type: "number", unit: "ms" },
      { name: "sp_prezenta", label: "Stenoză pulmonară prezentă", type: "checkbox" },
      { name: "sp_severitate", label: "Severitate stenoză pulmonară", type: "text" },
      { name: "sp_pmed", label: "SP — Pmed", type: "number", unit: "mmHg" },
      { name: "ip_prezenta", label: "Insuficiență pulmonară prezentă", type: "checkbox" },
      { name: "ip_severitate", label: "Severitate insuficiență pulmonară", type: "text" },
      { name: "psap", label: "PSAP", type: "number", unit: "mmHg" },
    ],
  },
  {
    id: "final",
    title: "Cinetică, lichid pericardic, concluzii",
    fields: [
      { name: "cinetica", label: "Cinetică parietală", type: "select", options: ["Normală", "Anomalii de cinetică parietală"] },
      { name: "cinetica_detalii", label: "Detalii cinetică", type: "textarea", rows: 3 },
      { name: "gls", label: "GLS", type: "number", unit: "%" },
      { name: "lichid_pericardic", label: "Lichid pericardic", type: "select", options: ["Absent", "Prezent"] },
      { name: "lichid_pericardic_detalii", label: "Detalii lichid pericardic", type: "text" },
      { name: "concluzii", label: "Concluzii", type: "textarea", rows: 5 },
      { name: "diagnostice", label: "Diagnostice", type: "textarea", rows: 4 },
      { name: "recomandari", label: "Recomandări", type: "textarea", rows: 3 },
      { name: "tratament", label: "Tratament", type: "textarea", rows: 3 },
      {
        name: "medic_examinator",
        label: "Medic examinator",
        type: "text",
        defaultValue: "Dr. Goje Iacob Daniel",
      },
      {
        name: "medic_titlu",
        label: "Titlu medic",
        type: "text",
        defaultValue: "medic specialist medicină internă și cardiologie",
      },
    ],
  },
];

export const ALL_FIELDS: Field[] = SECTIONS.flatMap((s) => s.fields);

export type FormValues = Record<string, string | number | boolean | null>;

export function emptyFormValues(): FormValues {
  const v: FormValues = {};
  for (const f of ALL_FIELDS) {
    if (f.defaultValue !== undefined) {
      v[f.name] = f.defaultValue;
    } else {
      v[f.name] = f.type === "checkbox" ? false : "";
    }
  }
  return v;
}
