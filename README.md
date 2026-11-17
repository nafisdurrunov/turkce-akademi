# Türkçe Akademi

Aplikasi belajar **Bahasa Turki** untuk penutur Indonesia: 19 modul inti dari PDF silabus, ditambah 1 bab bonus percakapan. Materi, kosakata, flashcard, kuis, catatan pribadi, dan progres belajar — semuanya bisa dipakai offline dan disinkronkan ke cloud.

- **Mobile-first PWA** — bisa di-install di Android/iPhone, tetap jalan tanpa internet setelah dibuka sekali.
- **20 bab** · 106 bagian · 500+ kosakata · 295 flashcard · 198 soal kuis · 24 dialog.
- **Teks Turki bisa didengarkan** (Web Speech API, `tr-TR`) pada kata, kalimat, dan dialog.
- **Progres tersimpan lokal** di `localStorage`; login Supabase mengaktifkan sinkronisasi lintas perangkat.
- **Gratis** untuk di-deploy: Vercel (disarankan) atau GitHub Pages.

> Bab 1–19 mengikuti urutan modul PDF sumber. Bab 20 (*Günlük Konuşma 2*) adalah **bonus** di luar 19 modul.

## Versi online

- **Aplikasi:** https://nafisdurrunov.github.io/turkce-akademi/
- **Repositori:** https://github.com/nafisdurrunov/turkce-akademi

Situs ini di-deploy otomatis oleh GitHub Actions setiap kali `main` di-push. Saat ini berjalan dalam **mode lokal** (tanpa cloud); login baru aktif setelah `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` diisi sebagai repository secret.

> **Belum pernah memakai Supabase?** Ikuti panduan langkah demi langkah: [`PANDUAN-SUPABASE.md`](PANDUAN-SUPABASE.md).

---

## Daftar isi

1. [Teknologi](#teknologi)
2. [Menjalankan di komputer](#menjalankan-di-komputer)
3. [Setup Supabase (cloud sync)](#setup-supabase-cloud-sync)
4. [Deploy gratis](#deploy-gratis)
5. [Install sebagai aplikasi (PWA)](#install-sebagai-aplikasi-pwa)
6. [Struktur proyek](#struktur-proyek)
7. [Menambah / mengubah materi](#menambah--mengubah-materi)
8. [Perintah npm](#perintah-npm)
9. [Troubleshooting](#troubleshooting)
10. [Privasi & keamanan](#privasi--keamanan)

---

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| UI | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS 3.4 (light/dark via CSS variables) |
| Routing | `react-router-dom` dengan `HashRouter` (aman untuk GitHub Pages) |
| Auth & database | `@supabase/supabase-js` (email/password + magic link) |
| Offline | `vite-plugin-pwa` (Workbox, auto-update) |
| TTS | Web Speech API bawaan browser |
| Ikon | SVG inline, tanpa library ikon eksternal |

Tidak ada server aplikasi sendiri: hasil build berupa file statis di `dist/`.

---

## Menjalankan di komputer

**Prasyarat:** Node.js 18 atau lebih baru (disarankan 20/22).

```bash
cd turkce-akademi
npm install
npm run dev
```

Buka `http://localhost:5173`.

Tanpa file `.env`, aplikasi berjalan dalam **mode lokal**: semua progres, kuis, dan catatan disimpan di browser. Login Supabase opsional.

### Build produksi lokal

```bash
npm run build
npm run preview
```

`npm run build` menjalankan pemeriksaan TypeScript lalu menghasilkan `dist/`.

---

## Setup Supabase (cloud sync)

> Panduan khusus pemula (dengan checklist dan solusi error): [`PANDUAN-SUPABASE.md`](PANDUAN-SUPABASE.md).

Cloud sync memakai **Supabase Free Tier**. Diperlukan hanya jika kamu ingin progres yang sama di beberapa perangkat.

### 1. Buat project

1. Daftar/masuk di <https://supabase.com/dashboard>.
2. **New project** → pilih organisasi → isi nama (mis. `turkce-akademi`), password database, region terdekat (mis. `Southeast Asia (Singapore)`).
3. Tunggu ±1–2 menit sampai project siap.

### 2. Jalankan skema database

1. Buka **SQL Editor** → **New query**.
2. Buka file [`supabase/schema.sql`](supabase/schema.sql) (salinan yang bisa diunduh juga tersedia di aplikasi: menu **Panduan** → **Download schema**).
3. Salin **seluruh isi file** ke editor, lalu klik **Run**.

Script bersifat **idempotent** — aman dijalankan ulang. Yang dibuat:

| Tabel | Isi |
| --- | --- |
| `profiles` | satu baris per pengguna, menyimpan bab terakhir |
| `chapter_progress` | bagian yang selesai per bab |
| `quiz_attempts` | riwayat skor kuis |
| `notes` | catatan pribadi per bab |
| `study_days` | tanggal aktif untuk menghitung streak |

Juga dibuat: index, trigger `updated_at`, trigger pembuatan profil otomatis saat sign-up, serta **Row Level Security** — setiap pengguna hanya bisa membaca dan mengubah barisnya sendiri.

### 3. Atur autentikasi

Buka **Authentication → Providers**:

- **Email** sudah aktif secara default.
- Untuk mencoba cepat, matikan **Confirm email** (Authentication → Providers → Email → *Confirm email*). Dengan begitu pengguna langsung bisa masuk setelah daftar.
- Jika *Confirm email* dibiarkan aktif, pengguna harus mengklik tautan konfirmasi di email sebelum bisa login.

Buka **Authentication → URL Configuration**:

- **Site URL**: alamat aplikasi produksi, mis. `https://turkce-akademi.vercel.app`
- **Redirect URLs** — tambahkan semua alamat yang akan dipakai, termasuk lokal:

```
http://localhost:5173/**
http://localhost:4173/**
https://turkce-akademi.vercel.app/**
https://USERNAME.github.io/NAMA-REPO/**
```

Magic link menggunakan redirect ke `#/profil`, jadi alamat dengan `/**` di atas sudah mencakupnya.

### 4. Salin kunci API

Buka **Project Settings → API**, salin:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

Buat file `.env` di root proyek (bukan `.env.example`):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

Lalu **restart** `npm run dev` (Vite hanya membaca `.env` saat start) dan build ulang untuk produksi.

> Gunakan **anon key**, jangan pernah `service_role`. Anon key memang dirancang untuk browser; keamanan data dijaga oleh RLS di database.

### 5. Uji sinkronisasi

1. Buka **Masuk** → daftar dengan email + password (atau minta magic link).
2. Setelah masuk, badge status di navbar berubah menjadi **Tersinkron**.
3. Selesaikan satu bagian materi, lalu buka aplikasi di perangkat/browser lain dengan akun yang sama — progres akan diambil dari cloud.
4. Progres yang dibuat sebelum login (mode tamu) otomatis digabung ke akun saat login pertama.

### Mode lokal vs cloud

| | Mode lokal | Login Supabase |
| --- | --- | --- |
| Materi & kuis | ✅ | ✅ |
| Progres tersimpan | ✅ di perangkat | ✅ perangkat + cloud |
| Pindah perangkat | ❌ | ✅ |
| Catatan | ✅ | ✅ + cloud |
| Perlu internet | tidak | saat sinkron saja |

---

## Deploy gratis

### Opsi A — Vercel (paling mudah, disarankan)

1. Push proyek ke GitHub (lihat catatan di bawah).
2. Buka <https://vercel.com> → **Add New → Project** → import repo.
3. Vercel mendeteksi Vite otomatis. Pastikan:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Buka **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (nilai anon/public)
5. **Deploy**. URL publik akan berbentuk `https://nama-project.vercel.app`.
6. Salin URL tersebut ke **Supabase → Authentication → URL Configuration** (Site URL + Redirect URLs), lalu redeploy jika perlu.

Karena aplikasi memakai `HashRouter`, tidak perlu konfigurasi rewrite/redirect tambahan.

### Opsi B — GitHub Pages

**B1. Otomatis dengan GitHub Actions (disarankan)**

Repo sudah berisi workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

1. Push ke branch `main`.
2. Di repo GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Tambahkan **Settings → Secrets and variables → Actions → New repository secret**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Setiap push ke `main`, situs dibangun dan diterbitkan di `https://USERNAME.github.io/NAMA-REPO/`.

Workflow otomatis mengeset `VITE_BASE=/NAMA-REPO/` agar aset tidak 404 di subfolder.

**B2. Manual dengan `gh-pages`**

```bash
npm install -D gh-pages
```

Build dengan base path, lalu terbitkan folder `dist`:

```powershell
# PowerShell (Windows)
$env:VITE_BASE="/NAMA-REPO/"; npm run build
npx gh-pages -d dist
```

```bash
# bash / macOS / Linux
VITE_BASE=/NAMA-REPO/ npm run build
npx gh-pages -d dist
```

Lalu **Settings → Pages → Source: Deploy from a branch → Branch: `gh-pages` / root**.

`package.json` juga bisa diberi script (membutuhkan `cross-env` agar jalan di semua OS):

```bash
npm install -D cross-env gh-pages
```

```json
"deploy": "cross-env VITE_BASE=/NAMA-REPO/ npm run build && gh-pages -d dist"
```

> Ganti `NAMA-REPO` dengan nama repo GitHub. Jika memakai custom domain atau user site (`USERNAME.github.io`), base boleh `/`.

### Catatan push ke GitHub

Belum ada repo git di folder ini. Dari dalam `turkce-akademi`:

```bash
git init
git add .
git commit -m "Türkçe Akademi: PWA belajar bahasa Turki"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

`.gitignore` sudah mengecualikan `node_modules`, `dist`, dan `.env` sehingga kunci rahasia tidak ikut ter-commit.

---

## Install sebagai aplikasi (PWA)

**Android (Chrome):** buka URL aplikasi → menu ⋮ → **Install app / Tambahkan ke layar utama**. Atau gunakan tombol **Install aplikasi** di halaman **Profil**.

**iPhone (Safari):** tombol **Share** → **Add to Home Screen**.

**Desktop (Chrome/Edge):** ikon install di address bar.

Aplikasi punya service worker yang menyimpan halaman dan aset untuk pemakaian offline. Versi baru otomatis diambil saat online; jika masih terlihat versi lama, tutup lalu buka lagi aplikasinya.

> TTS membutuhkan voice Turki di perangkat. Android/Chrome biasanya sudah punya; jika belum, install *Google Text-to-Speech* → Bahasa Turki. Di iOS: Settings → Accessibility → Spoken Content → Voices → Turkish.

---

## Struktur proyek

```
turkce-akademi/
├─ public/
│  ├─ favicon.svg, favicon-32.png
│  ├─ icons/                  # ikon PWA 192/512/maskable/apple
│  └─ supabase-schema.sql     # unduhan schema dari halaman Panduan
├─ scripts/
│  ├─ generate-icons.py       # membuat ulang ikon PNG (butuh Python + Pillow)
│  ├─ validate.mjs            # runner validator
│  └─ validate-content.ts     # cek kelengkapan & konsistensi materi
├─ src/
│  ├─ components/             # Layout, Quiz, Flashcards, NotesEditor, dll.
│  ├─ content/                # ch01.ts … ch20.ts + types.ts + index.ts
│  ├─ context/                # StoreContext (data & sync), ThemeContext
│  ├─ lib/                    # supabase, db, progress, date, tts
│  ├─ pages/                  # Home, Modules, ChapterPage, Notes, Guide, Login, Profile
│  ├─ App.tsx, main.tsx, index.css
├─ supabase/schema.sql        # skema + RLS (jalankan di Supabase)
├─ .env.example
├─ vite.config.ts             # PWA manifest, base path
└─ index.html
```

Data pengguna:

```
localStorage["ta:data:v1:guest"]      → sebelum login
localStorage["ta:data:v1:<user-id>"]  → setelah login (cache)
```

Saat online dan login, aplikasi mendorong perubahan (debounce ±900 ms) lalu menarik data cloud saat dibuka/login. Jika konflik, data digabung (union bagian selesai, skor terbaik tetap tersimpan, catatan memakai versi terbaru).

---

## Menambah / mengubah materi

1. Buat `src/content/chXX.ts` dengan tipe `Chapter` (lihat [`src/content/types.ts`](src/content/types.ts)).
2. Daftarkan di [`src/content/index.ts`](src/content/index.ts).
3. Jalankan `npm run validate` untuk memeriksa:
   - id/slug unik, jumlah bagian dan kuis (7–10 soal),
   - indeks jawaban MCQ valid dan tidak ada opsi ganda,
   - isian/urutan punya jawaban benar,
   - jumlah sel tabel sesuai header,
   - markup seimbang.

Markup ringan yang didukung di teks:

| Markup | Hasil |
| --- | --- |
| `~-lar/-ler~` | highlight imbuhan (warna brand) |
| `**tebal**` | teks tebal |
| `` `kitap` `` | chip kata Turki monospace |
| `_miring_` | teks miring |

Setiap bab berisi: `objectives`, `sections` (dengan `kind: 'core' | 'enrich'`), `vocab`, `flashcards`, `quiz`, dan `takeaways`. Dialog ditulis sebagai blok `{ type: 'dialog', dialog: { … } }` di dalam bagian materi.

---

## Perintah npm

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | server pengembangan (`http://localhost:5173`) |
| `npm run build` | cek TypeScript + build produksi ke `dist/` |
| `npm run preview` | menyajikan hasil build (`http://localhost:4173`) |
| `npm run typecheck` | cek tipe saja |
| `npm run validate` | validasi isi 20 bab |

Build dengan base path khusus:

```powershell
$env:VITE_BASE="/NAMA-REPO/"; npm run build
```

---

## Troubleshooting

**Halaman putih setelah deploy ke GitHub Pages**
`VITE_BASE` belum diset. Build ulang dengan `VITE_BASE=/NAMA-REPO/` (workflow Actions sudah melakukannya).

**Login gagal / magic link membuka halaman salah**
Tambahkan URL aplikasi ke **Supabase → Authentication → URL Configuration → Redirect URLs** (termasuk `http://localhost:5173/**`). Untuk email konfirmasi, cek juga folder spam.

**Data tidak tersinkron**
Pastikan badge di navbar menunjukkan **Tersinkron**, akun sama di kedua perangkat, dan `.env` terisi lalu aplikasi di-build ulang. Coba tombol **Sinkronkan sekarang** di halaman Profil. Cek **Supabase → Table Editor** untuk melihat baris baru.

**`Supabase belum dikonfigurasi`**
File `.env` belum ada atau server belum di-restart. Di Vercel, tambahkan environment variables lalu redeploy.

**Tidak ada suara TTS**
Browser/perangkat belum punya voice Turki. Chrome desktop/Android: install paket suara Turki di pengaturan sistem. Aplikasi tetap bisa dipakai tanpa TTS.

**Progres hilang setelah clear browser**
Data lokal memang terhapus. Login Supabase sebelum mengganti perangkat agar progres ada di cloud. Halaman Profil juga menyediakan **Ekspor/Impor data** (JSON) untuk backup manual.

**Project Supabase tidak merespons**
Free Tier di-pause setelah ±7 hari tanpa aktivitas. Buka dashboard Supabase dan klik **Restore project**.

**PWA masih menampilkan versi lama**
Service worker memakai `autoUpdate`. Tutup semua tab aplikasi lalu buka lagi; jika perlu, hapus lalu install ulang PWA.

---

## Privasi & keamanan

- Tanpa login: seluruh data hanya ada di `localStorage` browser.
- Dengan login: data disimpan di project Supabase milikmu, dilindungi **RLS** (`auth.uid() = user_id`).
- `VITE_SUPABASE_ANON_KEY` aman dipublikasikan; **jangan** memakai `service_role` di aplikasi frontend.
- Tidak ada analytics, iklan, atau pelacakan pihak ketiga.
- Font diambil dari Google Fonts; materi dan progres tetap berfungsi offline.

---

Materi disusun ulang dari modul PDF **Teuku Reski Nuari** (19 modul), dengan penambahan bab bonus percakapan. Aplikasi dan kode dibangun ulang sebagai PWA interaktif.
