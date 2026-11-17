# Panduan Supabase dari Nol

Panduan ini untuk kamu yang **belum pernah memakai Supabase**. Ikuti urutannya, jangan melompati langkah. Perkiraan waktu: **15–20 menit**.

---

## Dulu, Supabase itu apa?

Aplikasi Türkçe Akademi bisa jalan tanpa internet karena semua progres disimpan di browser (`localStorage`). Tapi data itu hanya ada di **satu perangkat**. Kalau kamu buka di HP lain, progresnya mulai dari nol.

Supabase menambahkan dua hal:

1. **Akun pengguna** — email + password, supaya aplikasi tahu "ini kamu".
2. **Database di cloud** — progres, skor kuis, dan catatan disimpan di server, jadi bisa diambil dari perangkat mana pun.

Analogi: `localStorage` itu buku catatan di meja belajarmu. Supabase itu lemari arsip di cloud — bukunya tetap bisa kamu baca offline, tapi isinya juga tersalin ke lemari, jadi bisa dibuka dari meja lain.

Yang **tidak** dilakukan Supabase: tidak menyimpan materi pelajaran (materi tetap ada di dalam aplikasi), tidak mengirim email promosi, dan tidak bisa membaca isi catatanmu karena database dilindungi aturan RLS (setiap pengguna hanya bisa mengakses barisnya sendiri).

**Gratis?** Ya, Free Tier cukup untuk pemakaian pribadi. Kira-kira batasnya: 500 MB database, 50.000 pengguna aktif/bulan, dan maksimal 2 project aktif. Project gratis yang tidak dipakai sekitar 1 minggu bisa di-*pause*; kalau itu terjadi, tinggal klik **Restore** di dashboard, data tidak hilang.

---

## Checklist

Centang satu per satu:

- [ ] 1. Punya akun Supabase
- [ ] 2. Project `turkce-akademi` sudah dibuat
- [ ] 3. `schema.sql` sudah dijalankan (5 tabel muncul)
- [ ] 4. Login email diaktifkan + URL aplikasi didaftarkan
- [ ] 5. Project URL + publishable/anon key sudah disalin
- [ ] 6. Kunci dimasukkan ke GitHub (untuk situs online) dan/atau `.env` (untuk lokal)
- [ ] 7. Build ulang, lalu uji daftar + login

---

## Langkah 1 — Buat akun

1. Buka <https://supabase.com/dashboard/sign-up>.
2. Paling cepat: klik **Continue with GitHub**, lalu setujui permintaan izin. Kamu sudah punya akun GitHub (`nafisdurrunov`), jadi tidak perlu verifikasi email lagi.
3. Kalau memilih daftar dengan email: buka inbox, klik tautan verifikasi dari Supabase (cek folder spam).

Setelah masuk, kamu akan melihat halaman **dashboard** dengan tombol **New project**.

---

## Langkah 2 — Buat project

1. Klik **New project**.
2. Isi formulir:

   | Kolom | Isi |
   | --- | --- |
   | **Organization** | pilih organisasi yang otomatis dibuat (biasanya nama akunmu) |
   | **Project name** | `turkce-akademi` |
   | **Database Password** | klik **Generate a password**, lalu **salin dan simpan** di tempat aman |
   | **Region** | `Southeast Asia (Singapore)` — paling dekat ke Indonesia |
   | **Plan** | **Free** |

3. Klik **Create new project**.
4. Tunggu **1–2 menit** sampai status provisioning selesai. Jangan tutup halaman.

> Password database **tidak dipakai** oleh aplikasi ini. Kamu hanya perlu menyimpannya untuk keperluan administrasi. Jangan pernah membagikannya, dan jangan pernah menaruhnya di aplikasi frontend.

Kalau muncul pilihan region lain seperti `ap-southeast-1`, itu sama saja — pilih yang Singapura.

---

## Langkah 3 — Jalankan skema database

Ini bagian terpenting. Tanpa langkah ini, login berhasil tetapi penyimpanan data akan gagal.

1. Di sidebar kiri, klik **SQL Editor**.
2. Klik **New query** (atau tombol `+`).
3. Buka file [`supabase/schema.sql`](supabase/schema.sql) di proyek ini dengan Notepad/VS Code.
4. **Pilih semua** isinya (`Ctrl+A`), **salin** (`Ctrl+C`), lalu **tempel** ke editor Supabase (`Ctrl+V`).
5. Klik **Run** (atau `Ctrl+Enter`).
6. Tunggu sampai muncul **Success. No rows returned**.

File itu membuat 5 tabel, index, trigger, dan aturan keamanan RLS. Skripnya **idempotent** — aman dijalankan dua kali kalau kamu ragu.

### Cek hasilnya

1. Klik **Table Editor** di sidebar.
2. Pastikan ada 5 tabel: `profiles`, `chapter_progress`, `quiz_attempts`, `notes`, `study_days`.
3. Buka **Authentication → Users** — masih kosong, itu normal. Nanti akan terisi setelah kamu mendaftar di aplikasi.

Kalau muncul error **`relation "profiles" already exists`**, berarti sebagian skrip sudah pernah jalan. Abaikan saja, atau jalankan ulang seluruh file (aman).

---

## Langkah 4 — Atur autentikasi

### 4a. Aktifkan login email

1. Buka **Authentication → Sign In / Providers** (di sebagian tampilan: **Authentication → Providers**).
2. Pastikan **Email** berstatus **Enabled**.
3. Untuk tahap belajar, **matikan** opsi **Confirm email**.

   Alasannya: dengan *Confirm email* menyala, Supabase mengirim email konfirmasi memakai server email bawaan yang **sangat dibatasi** (beberapa email per jam) dan sering masuk spam. Kalau dimatikan, akun langsung aktif setelah daftar — jauh lebih lancar untuk mencoba.

   Konsekuensinya: siapa pun bisa mendaftar dengan email orang lain tanpa verifikasi. Untuk aplikasi pribadi ini tidak masalah. Kalau nanti ingin dipakai publik, nyalakan kembali dan siapkan SMTP sendiri.

### 4b. Daftarkan URL aplikasi

1. Buka **Authentication → URL Configuration**.
2. Isi **Site URL** dengan alamat situsmu:

   ```
   https://nafisdurrunov.github.io/turkce-akademi/
   ```

3. Di **Redirect URLs**, klik **Add URL** dan tambahkan satu per satu:

   ```
   https://nafisdurrunov.github.io/turkce-akademi/**
   http://localhost:5173/**
   http://localhost:4173/**
   ```

4. Klik **Save**.

> Magic link memakai redirect ke `#/profil`. Pola `/**` di atas sudah mencakupnya. Tautan magic link **harus dibuka di browser yang sama** dengan tempat kamu memintanya (alur PKCE), jadi jangan minta di laptop lalu klik di HP.

---

## Langkah 5 — Salin kunci API

1. Buka **Project Settings** (ikon gerigi) → **API Keys**.

   Di tampilan lama: **Project Settings → API**.

2. Salin dua nilai:

   | Yang disalin | Dipakai sebagai |
   | --- | --- |
   | **Project URL** — `https://xxxx.supabase.co` | `VITE_SUPABASE_URL` |
   | **Publishable key** — `sb_publishable_...` | `VITE_SUPABASE_ANON_KEY` |

   Kalau project-mu masih memakai kunci lama, nilainya bernama **anon public** dan berbentuk `eyJhbGciOi...`. Keduanya sah — aplikasi ini menerima dua-duanya.

3. **Jangan** menyalin **secret key** (`sb_secret_...`) atau **service_role**. Kunci itu bisa melewati RLS dan tidak boleh ada di browser.

> Amankah publishable/anon key ditaruh di kode frontend? Aman. Kunci itu memang dirancang untuk publik; keamanan data dijaga oleh RLS di database, bukan oleh kerahasiaan kunci.

---

## Langkah 6 — Pasang kunci di dua tempat

Ada dua jalur. Kamu bisa pakai salah satu, atau keduanya.

### Jalur A — Situs online (GitHub Pages)

Kunci disimpan sebagai **repository secret**, lalu dibaca saat build.

**Cara 1 — lewat terminal** (bisa aku jalankan untukmu):

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" secret set VITE_SUPABASE_URL --body "https://xxxx.supabase.co"
& "C:\Program Files\GitHub CLI\gh.exe" secret set VITE_SUPABASE_ANON_KEY --body "sb_publishable_xxxx"
```

**Cara 2 — lewat browser:**

1. Buka <https://github.com/nafisdurrunov/turkce-akademi/settings/secrets/actions>.
2. Klik **New repository secret**.
3. Tambahkan `VITE_SUPABASE_URL`, lalu ulangi untuk `VITE_SUPABASE_ANON_KEY`.

Setelah secret tersimpan, jalankan ulang build:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" workflow run "Deploy ke GitHub Pages"
```

Tunggu ±1 menit, lalu buka <https://nafisdurrunov.github.io/turkce-akademi/>. Tombol **Masuk** sekarang aktif.

**Penting:** secret hanya dibaca saat build. Kalau kamu mengubah nilai secret, jalankan ulang workflow — sekadar refresh browser tidak cukup.

### Jalur B — Komputer lokal

1. Buat file `.env` di folder `turkce-akademi` (bukan `.env.example`):

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
   ```

2. Hentikan lalu jalankan ulang `npm run dev` — Vite hanya membaca `.env` saat start.

File `.env` sudah masuk `.gitignore`, jadi tidak akan ikut ter-commit.

---

## Langkah 7 — Uji

1. Buka situs (atau `http://localhost:5173`).
2. Klik **Masuk → Daftar gratis**.
3. Isi email dan password (minimal 6 karakter). **Buat akun**.
4. Kalau *Confirm email* dimatikan, kamu langsung masuk dan badge di navbar berubah menjadi **Tersinkron**.
5. Selesaikan satu bagian materi, lalu kembali ke Supabase:
   - **Table Editor → chapter_progress** → harus muncul 1 baris dengan `completed = true`.
   - **Table Editor → profiles** → harus ada 1 baris berisi ID kamu.
6. Buka aplikasi di browser/perangkat lain, masuk dengan akun yang sama — progres harus ikut.

Kalau langkah 5 kosong, lihat bagian *Kalau macet* di bawah.

---

## Kalau macet

| Gejala | Penyebab & solusi |
| --- | --- |
| Tombol **Masuk** tetap abu-abu, muncul "Supabase belum aktif" | Kunci belum terbaca saat build. Untuk GitHub Pages: pastikan kedua secret ada, lalu **jalankan ulang workflow**. Untuk lokal: cek nama variabel di `.env` dan restart `npm run dev`. |
| `Invalid API key` | Kunci tersalin terpotong, atau kamu memakai **secret key** alih-alih publishable/anon. Salin ulang dari **Project Settings → API Keys**. |
| `Email not confirmed` | *Confirm email* masih menyala tetapi emailnya belum diklik. Matikan opsi itu (Langkah 4a) atau klik tautan di inbox/spam. |
| Email konfirmasi/magic link tidak datang | Server email bawaan Supabase dibatasi dan sering masuk spam. Pakai password + matikan *Confirm email*, atau siapkan SMTP sendiri. |
| `Email rate limit exceeded` | Terlalu banyak permintaan email dalam waktu singkat. Tunggu ±1 jam, atau pakai login password. |
| Magic link: `link is invalid or has expired` | Tautan dibuka di browser/perangkat berbeda, atau sudah kedaluwarsa (1 jam). Minta tautan baru di browser yang sama. |
| `Failed to fetch` / `NetworkError` | Salah URL project (harus `https://xxxx.supabase.co`, tanpa garis miring di akhir), atau koneksi diblokir. Cek juga project tidak sedang *paused*. |
| Login sukses tapi data tidak tersimpan | `schema.sql` belum dijalankan, atau RLS menolak. Jalankan ulang file skema, lalu cek **Logs → API** di Supabase untuk pesan error. |
| Halaman putih setelah login | Biasanya URL redirect tidak terdaftar. Tambahkan alamat persis (termasuk `/**`) di **Authentication → URL Configuration**. |
| Project tidak bisa dibuka | Project gratis di-*pause* karena tidak aktif. Klik **Restore project** di dashboard, tunggu beberapa menit. |

---

## Keamanan: yang boleh dan tidak boleh

**Boleh** dimasukkan ke frontend / repository secret:

- Project URL
- Publishable key (`sb_publishable_...`)
- anon public key (`eyJ...`)

**Jangan pernah** dimasukkan ke frontend, GitHub, atau dibagikan:

- Database password
- Secret key (`sb_secret_...`)
- `service_role` key

Kalau salah satu yang terlarang sudah terlanjur tersebar, buka **Project Settings → API Keys**, revoke kunci tersebut, lalu buat yang baru.

---

## Ringkasan alamat penting

| Keperluan | Alamat |
| --- | --- |
| Dashboard | <https://supabase.com/dashboard> |
| SQL Editor | `https://supabase.com/dashboard/project/<project-ref>/sql/new` |
| API Keys | `https://supabase.com/dashboard/project/<project-ref>/settings/api-keys` |
| Auth URL | `https://supabase.com/dashboard/project/<project-ref>/auth/url-configuration` |
| Secret GitHub | <https://github.com/nafisdurrunov/turkce-akademi/settings/secrets/actions> |
| Aplikasi live | <https://nafisdurrunov.github.io/turkce-akademi/> |

`<project-ref>` adalah kode acak di URL dashboard-mu, misalnya `abcdefghijklmnop`.
