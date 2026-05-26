# Protocol EcoCord

Aplicație web pentru completarea unui buletin de **Ecocardiografie Transtoracică**. Formularul completat este salvat în Supabase și descărcat ca document **Word (.docx)** cu același conținut ca șablonul original.

## Stack

- **Next.js 14** (App Router, TypeScript) + Tailwind CSS
- **Supabase** — Auth (email/parolă) + tabel `examinations` (RLS activat)
- **docx** — generare document Word pe server
- Deploy pe **Vercel**

---

## 1. Instalare locală

```bash
npm install
cp .env.example .env.local
# completează NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

## 2. Configurare Supabase

1. Intră pe [supabase.com](https://supabase.com) și creează un proiect nou.
2. Din **Project Settings → API** copiază:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Din **SQL Editor** rulează conținutul fișierului [`supabase/schema.sql`](supabase/schema.sql).
4. Din **Authentication → Providers**, asigură-te că **Email** este activat.
   - Pentru testare rapidă: dezactivează „Confirm email" din **Authentication → Sign In / Up**.

## 3. Deploy pe Vercel

1. Urcă proiectul pe GitHub.
2. Pe [vercel.com](https://vercel.com) → **Add New Project** → selectează repo-ul.
3. La **Environment Variables** adaugă:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = URL-ul final al app-ului (ex. `https://protocol-ecocord.vercel.app`)
4. Deploy.
5. În Supabase → **Authentication → URL Configuration**, adaugă URL-ul Vercel la **Site URL** și **Redirect URLs**.

---

## Cum funcționează

- `/` redirecționează către `/form` (sau `/login` dacă nu ești autentificat).
- `/form` — formularul în secțiuni. La submit:
  1. POST `/api/generate` cu valorile.
  2. Server-ul salvează un rând în `examinations` (RLS verifică `auth.uid() = user_id`).
  3. Server-ul construiește un `.docx` cu structura originalului și îl trimite ca download.
- `/history` — listă cu examinările tale; poți descărca oricare ca Word.

## Structură fișiere cheie

- [`lib/fields.ts`](lib/fields.ts) — definițiile câmpurilor (sursă unică pentru formular + document).
- [`lib/document.ts`](lib/document.ts) — generatorul `.docx`.
- [`app/form/EcoForm.tsx`](app/form/EcoForm.tsx) — formularul.
- [`app/api/generate/route.ts`](app/api/generate/route.ts) — salvare + generare Word.
- [`middleware.ts`](middleware.ts) — protecție rute pentru utilizatori neautentificați.

## De adăugat (opțional)

- Edit pe o examinare existentă (acum doar regenerare).
- Export PDF.
- Câmp pentru semnătură.
