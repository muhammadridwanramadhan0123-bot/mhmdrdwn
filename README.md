# JMT Frontend

Frontend website PT Jasa Medika Transmedic menggunakan React, Vite, dan Tailwind CSS.

## Menjalankan di Visual Studio Code

```bash
npm install
npm run dev
```

Buka URL lokal yang muncul di terminal (umumnya `http://localhost:5173`).

## Build production

```bash
npm run build
npm run preview
```

## Persiapan Supabase

1. Salin `.env.example` menjadi `.env`.
2. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
3. Install client Supabase: `npm install @supabase/supabase-js`.
4. Ganti pembacaan data pada `src/data/siteData.js` dengan query Supabase.
5. Sambungkan fungsi submit di `src/pages/ContactPage.jsx` ke tabel `contact_messages`.

Struktur tabel yang disarankan: `services`, `service_categories`, `portfolios`,
`insights`, `company_milestones`, `partners`, dan `contact_messages`.
