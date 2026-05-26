import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormValues } from "@/lib/fields";
import PrintTrigger from "./PrintTrigger";
import "./print.css";

type V = string | number | boolean | null | undefined;

function v(value: V): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Da" : "Nu";
  return String(value);
}

function vIf(value: V): string | null {
  const out = v(value);
  return out === "—" ? null : out;
}

function bullets(value: V): string[] {
  if (!value || typeof value !== "string") return [];
  return value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export default async function PrintPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
    notFound();
  }

  const { data, error } = await supabase
    .from("examinations")
    .select("data, patient_name, examined_at")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data || !data.data) notFound();

  const f = (data.data || {}) as FormValues;

  return (
    <>
      <PrintTrigger />

      <main className="page">
        <h1 className="title">ECOCARDIOGRAFIE TRANSTORACICĂ</h1>

        <section className="patient">
          <div><strong>Data examinării:</strong> {v(f.data_examinarii)}</div>
          <div><strong>Nume și Prenume:</strong> {v(f.nume_prenume)}</div>
          <div><strong>Vârsta:</strong> {v(f.varsta)} ani</div>
          <div><strong>TA:</strong> {v(f.ta)} mmHg</div>
        </section>

        <section className="meta-row">
          <div><strong>Calitatea imaginii:</strong> {v(f.calitate_imagine)}</div>
          <div><strong>Ritm:</strong> {v(f.ritm)}</div>
        </section>

        <Section title="Incidență parasternală">
          <Grid>
            <Item label="Ao la inel" value={f.ao_inel} unit="cm" ref="2,2-3,7" />
            <Item label="Ao ascendentă" value={f.ao_ascendenta} unit="cm" ref="2,1-3,4" />
            <Item label="Deschidere v. Ao" value={f.deschidere_v_ao} unit="cm" ref=">1,6" />
            <Item label="Aspect v. aortică" value={f.aspect_v_ao} />
            <Item label="Diam AS" value={f.diam_as} unit="cm" ref="2,7-4,5" />
            <Item label="Diam VD" value={f.diam_vd} unit="cm" ref="0,9-2,6" />
            <Item label="SIV" value={f.siv} unit="cm" ref="0,6-1,2" />
            <Item label="Mișcare paradoxală SIV" value={f.miscare_paradoxala_siv} />
            <Item label="DTDVS" value={f.dtdvs} unit="cm" ref="3,7-5,6" />
            <Item label="DTSVS" value={f.dtsvs} unit="cm" ref="2,7-3,7" />
            <Item label="PPVS" value={f.ppvs} unit="cm" ref="0,6-1,2" />
            <Item label="FS" value={f.fs} unit="%" ref="25-45" />
            <Item label="FE Teichholtz" value={f.fe_teichholtz} unit="%" />
            <Item label="Aspect v. mitrală" value={f.aspect_v_mitrala} />
          </Grid>
          <Detail label="Detalii v. aortică" value={f.aspect_v_ao_detalii} />
          <Detail label="Detalii v. mitrală" value={f.aspect_v_mitrala_detalii} />
        </Section>

        <Section title="Incidență apicală">
          <Grid>
            <Item label="Apical 4C — VTD" value={f.apical_4c_vtd} unit="ml" />
            <Item label="Apical 4C — VTS" value={f.apical_4c_vts} unit="ml" />
            <Item label="Apical 4C — FE" value={f.apical_4c_fe} unit="%" />
            <Item label="Apical 2C — VTD" value={f.apical_2c_vtd} unit="ml" />
            <Item label="Apical 2C — VTS" value={f.apical_2c_vts} unit="ml" />
            <Item label="Apical 2C — FE" value={f.apical_2c_fe} unit="%" />
            <Item label="Volum AS" value={f.volum_as} unit="ml" ref="20-55" />
            <Item label="Suprafață AS" value={f.supraf_as} unit="cm²" ref="<20" />
            <Item label="Funcție diastolică" value={f.functie_diastolica} />
          </Grid>
        </Section>

        <Section title="Flux mitral">
          <Grid>
            <Item label="E" value={f.fm_e} unit="m/s" />
            <Item label="A" value={f.fm_a} unit="m/s" />
            <Item label="TDE" value={f.fm_tde} unit="ms" />
            <Item label="E'" value={f.fm_e_prim} unit="m/s" />
            <Item label="E/E'" value={f.fm_e_per_e_prim} />
            <Item label="S'" value={f.fm_s_prim} unit="ms" />
          </Grid>
          <SeverityRow
            label="Stenoză mitrală"
            present={f.sm_prezenta}
            severitate={f.sm_severitate}
            extras={[
              { label: "PHT", value: f.sm_pht, unit: "ms" },
              { label: "Pmed", value: f.sm_pmed, unit: "mmHg" },
            ]}
          />
          <SeverityRow
            label="Insuficiență mitrală"
            present={f.im_prezenta}
            severitate={f.im_severitate}
            extras={[
              { label: "Vena contracta", value: f.im_vena_contracta, unit: "cm" },
              { label: "dP/dt", value: f.im_dp_dt, unit: "mmHg/ms" },
            ]}
          />
        </Section>

        <Section title="Flux aortic">
          <Grid>
            <Item label="V max" value={f.fa_vmax} unit="m/s" />
            <Item label="P max" value={f.fa_pmax} unit="mmHg" />
            <Item label="IVT" value={f.fa_ivt} unit="cm" />
            <Item label="TEVS" value={f.fa_tevs} unit="cm" />
            <Item label="IVT TEVS" value={f.fa_ivt_tevs} unit="cm" />
          </Grid>
          <SeverityRow
            label="Stenoză aortică"
            present={f.sa_prezenta}
            severitate={f.sa_severitate}
            extras={[
              { label: "AVA cont", value: f.sa_ava_cont, unit: "cm²" },
              { label: "Splan", value: f.sa_splan, unit: "cm²" },
              { label: "Pmed", value: f.sa_pmed, unit: "mmHg" },
            ]}
          />
          <SeverityRow
            label="Insuficiență aortică"
            present={f.ia_prezenta}
            severitate={f.ia_severitate}
            extras={[
              { label: "Vena contracta", value: f.ia_vena_contracta, unit: "cm" },
              { label: "PHT", value: f.ia_pht, unit: "ms" },
              { label: "v td aorta desc", value: f.ia_v_td_aorta_desc, unit: "cm/s" },
            ]}
          />
        </Section>

        <Section title="Flux tricuspidian">
          <Grid>
            <Item label="V max" value={f.ft_vmax} unit="m/s" />
            <Item label="P max" value={f.ft_pmax} unit="mmHg" />
            <Item label="E" value={f.ft_e} unit="m/s" />
            <Item label="A" value={f.ft_a} unit="m/s" />
          </Grid>
          <SeverityRow
            label="Stenoză tricuspidiană"
            present={f.st_prezenta}
            severitate={f.st_severitate}
            extras={[
              { label: "PHT", value: f.st_pht, unit: "ms" },
              { label: "Pmed", value: f.st_pmed, unit: "mmHg" },
            ]}
          />
          <SeverityRow
            label="Insuficiență tricuspidiană"
            present={f.it_prezenta}
            severitate={f.it_severitate}
            extras={[
              { label: "Vena contracta", value: f.it_vena_contracta, unit: "cm" },
              { label: "TAPSE", value: f.it_tapse, unit: "cm" },
            ]}
          />
        </Section>

        <Section title="Flux pulmonar">
          <Grid>
            <Item label="V max" value={f.fp_vmax} unit="m/s" />
            <Item label="P max" value={f.fp_pmax} unit="mmHg" />
            <Item label="TaccP" value={f.fp_taccp} unit="ms" />
          </Grid>
          <SeverityRow
            label="Stenoză pulmonară"
            present={f.sp_prezenta}
            severitate={f.sp_severitate}
            extras={[{ label: "Pmed", value: f.sp_pmed, unit: "mmHg" }]}
          />
          <SeverityRow
            label="Insuficiență pulmonară"
            present={f.ip_prezenta}
            severitate={f.ip_severitate}
            extras={[{ label: "PSAP", value: f.psap, unit: "mmHg" }]}
          />
        </Section>

        <Section title="Cinetică parietală și lichid pericardic">
          <Grid>
            <Item label="Cinetică" value={f.cinetica} />
            <Item label="GLS" value={f.gls} unit="%" />
            <Item label="Lichid pericardic" value={f.lichid_pericardic} />
          </Grid>
          <Detail label="Detalii cinetică" value={f.cinetica_detalii} />
          <Detail label="Detalii lichid pericardic" value={f.lichid_pericardic_detalii} />
        </Section>

        {vIf(f.concluzii) && (
          <section className="block">
            <h2 className="block-title">Concluzii</h2>
            <p className="block-body">{v(f.concluzii)}</p>
          </section>
        )}

        {bullets(f.diagnostice).length > 0 && (
          <section className="block">
            <h2 className="block-title">Diagnostice</h2>
            <ul className="bullet-list">
              {bullets(f.diagnostice).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {bullets(f.recomandari).length > 0 && (
          <section className="block">
            <h2 className="block-title">Recomandări</h2>
            <ul className="bullet-list">
              {bullets(f.recomandari).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {bullets(f.tratament).length > 0 && (
          <section className="block">
            <h2 className="block-title">Tratament</h2>
            <ul className="bullet-list">
              {bullets(f.tratament).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="medic">
          <div className="medic-name">Medic examinator: {v(f.medic_examinator)}</div>
          {vIf(f.medic_titlu) && <div className="medic-titlu">{v(f.medic_titlu)}</div>}
        </footer>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid">{children}</div>;
}

function Item({
  label,
  value,
  unit,
  ref,
}: {
  label: string;
  value: V;
  unit?: string;
  ref?: string;
}) {
  return (
    <div className="item">
      <span className="item-label">{label}:</span>
      <span className="item-value">
        {v(value)}
        {unit && <span className="item-unit"> {unit}</span>}
        {ref && <span className="item-ref"> ({ref})</span>}
      </span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: V }) {
  const out = vIf(value);
  if (!out) return null;
  return (
    <div className="detail">
      <span className="detail-label">{label}:</span> {out}
    </div>
  );
}

function SeverityRow({
  label,
  present,
  severitate,
  extras,
}: {
  label: string;
  present: V;
  severitate: V;
  extras: Array<{ label: string; value: V; unit?: string }>;
}) {
  const isPresent = Boolean(present);
  return (
    <div className="severity-row">
      <span className="severity-label">{label}:</span>{" "}
      <span className={`severity-marker ${isPresent ? "yes" : "no"}`}>
        {isPresent ? "☒ Da" : "☒ Nu"}
      </span>
      {vIf(severitate) && (
        <>
          {" — "}
          <span className="severity-text">Severitate: {v(severitate)}</span>
        </>
      )}
      {extras.some((e) => vIf(e.value)) && (
        <div className="severity-extras">
          {extras
            .filter((e) => vIf(e.value))
            .map((e, i) => (
              <span key={i} className="severity-extra">
                {e.label}: {v(e.value)} {e.unit}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
