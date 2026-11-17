import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'

function Code({ children, label }: { children: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative mt-2 overflow-hidden rounded-xl border border-line bg-raised">
      {label && (
        <div className="border-b border-line px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">{label}</div>
      )}
      <pre className="overflow-x-auto p-3.5 pr-14 text-[12px] leading-6 text-ink">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(children)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
          } catch {
            setCopied(false)
          }
        }}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[10px] font-bold text-muted hover:text-ink"
      >
        <Icon name={copied ? 'check' : 'copy'} width={12} height={12} />
        {copied ? 'Tersalin' : 'Salin'}
      </button>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative border-l border-line pb-5 pl-9 last:pb-0">
      <span className="absolute -left-[15px] top-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line bg-surface text-xs font-extrabold text-brand">
        {n}
      </span>
      <h3 className="pt-1 text-sm font-bold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2 text-[13px] leading-6 text-muted">{children}</div>
    </div>
  )
}

export function Guide() {
  const [sqlMsg, setSqlMsg] = useState<string | null>(null)
  const schemaUrl = `${import.meta.env.BASE_URL}supabase-schema.sql`

  const copySchema = async () => {
    try {
      const res = await fetch(schemaUrl)
      if (!res.ok) throw new Error('fetch')
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setSqlMsg('SQL schema berhasil disalin. Tempel di SQL Editor Supabase, lalu Run.')
    } catch {
      setSqlMsg('Gagal menyalin otomatis. Buka tautan schema di bawah, lalu salin manual.')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Dokumentasi</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">Panduan setup & deploy</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          Dari menjalankan di laptop, menghubungkan Supabase gratis, sampai online di Vercel atau GitHub Pages. Ikuti
          berurutan; tidak perlu pengalaman backend.
        </p>
      </header>

      {/* Ringkasan */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon name="cloud" width={18} height={18} />
          </span>
          <p className="mt-2 text-sm font-bold text-ink">1. Supabase</p>
          <p className="mt-0.5 text-[11px] leading-5 text-muted">Auth + database progres. Gratis, cukup untuk pemakaian pribadi.</p>
        </div>
        <div className="card p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <Icon name="globe" width={18} height={18} />
          </span>
          <p className="mt-2 text-sm font-bold text-ink">2. Deploy</p>
          <p className="mt-0.5 text-[11px] leading-5 text-muted">Vercel (paling mudah) atau GitHub Pages (gratis statis).</p>
        </div>
        <div className="card p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Icon name="download" width={18} height={18} />
          </span>
          <p className="mt-2 text-sm font-bold text-ink">3. Pasang PWA</p>
          <p className="mt-0.5 text-[11px] leading-5 text-muted">Install di Android, buka offline, progres tetap tersimpan.</p>
        </div>
      </section>

      {/* Lokal */}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-extrabold text-ink">A. Menjalankan di komputer</h2>
          <p className="text-[11px] text-muted">Butuh Node.js 18 atau lebih baru. Aplikasi tetap jalan tanpa Supabase.</p>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <Step n={1} title="Masuk ke folder proyek">
            <p>Buka terminal di folder proyek, lalu jalankan:</p>
            <Code>{`npm install\nnpm run dev`}</Code>
            <p>
              Buka alamat yang muncul (biasanya <code className="rounded bg-raised px-1">http://localhost:5173</code>).
              Tanpa file <code className="rounded bg-raised px-1">.env</code>, aplikasi berjalan dalam mode lokal.
            </p>
          </Step>
          <Step n={2} title="Siapkan file .env (opsional, untuk cloud)">
            <p>
              Salin <code className="rounded bg-raised px-1">.env.example</code> menjadi{' '}
              <code className="rounded bg-raised px-1">.env</code>, lalu isi dua nilai dari Supabase:
            </p>
            <Code label=".env">{`VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...`}</Code>
            <p className="text-[11px]">
              Jangan pernah memakai <strong>service_role key</strong> di frontend. Hanya <strong>anon public key</strong>{' '}
              yang aman, karena akses data dilindungi RLS.
            </p>
          </Step>
          <Step n={3} title="Build produksi">
            <Code>{`npm run build\nnpm run preview`}</Code>
            <p>Hasil build ada di folder <code className="rounded bg-raised px-1">dist/</code>.</p>
          </Step>
        </div>
      </section>

      {/* Supabase */}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-extrabold text-ink">B. Setup Supabase (gratis)</h2>
          <p className="text-[11px] text-muted">Sekitar 10 menit. Tidak perlu kartu kredit.</p>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <Step n={1} title="Buat akun & proyek">
            <p>
              Buka{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="font-bold text-brand underline">
                supabase.com
              </a>{' '}
              → <strong>Start your project</strong> → masuk dengan GitHub → <strong>New project</strong>.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nama proyek bebas, mis. <code className="rounded bg-raised px-1">turkce-akademi</code>.</li>
              <li>Database password: simpan di tempat aman (tidak dipakai aplikasi ini).</li>
              <li>Region: pilih yang terdekat, mis. Singapore / Frankfurt.</li>
              <li>Tunggu 1–2 menit sampai proyek selesai dibuat.</li>
            </ul>
          </Step>

          <Step n={2} title="Jalankan schema.sql">
            <p>
              Di dashboard proyek, buka <strong>SQL Editor</strong> → <strong>New query</strong>. Salin seluruh isi{' '}
              <a href={schemaUrl} target="_blank" rel="noreferrer" className="font-bold text-brand underline">
                supabase/schema.sql
              </a>{' '}
              ke sana, lalu klik <strong>Run</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void copySchema()} className="btn-ghost btn-sm">
                <Icon name="copy" width={14} height={14} />
                Salin SQL schema
              </button>
              <a href={schemaUrl} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                <Icon name="download" width={14} height={14} />
                Buka file SQL
              </a>
            </div>
            {sqlMsg && <p className="rounded-lg bg-raised p-2 text-[11px] text-ink">{sqlMsg}</p>}
            <p className="text-[11px]">
              Script ini membuat tabel <code className="rounded bg-raised px-1">profiles</code>,{' '}
              <code className="rounded bg-raised px-1">chapter_progress</code>,{' '}
              <code className="rounded bg-raised px-1">quiz_attempts</code>,{' '}
              <code className="rounded bg-raised px-1">notes</code>,{' '}
              <code className="rounded bg-raised px-1">study_days</code>, beserta RLS dan trigger profil otomatis.
            </p>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[420px] text-left text-[11px]">
                <thead className="bg-raised">
                  <tr>
                    <th className="border-b border-line px-3 py-2 font-bold text-muted">Tabel</th>
                    <th className="border-b border-line px-3 py-2 font-bold text-muted">Isi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['profiles', 'satu baris per user, menyimpan bab terakhir'],
                    ['chapter_progress', 'bagian selesai & status tiap bab'],
                    ['quiz_attempts', 'riwayat skor kuis'],
                    ['notes', 'catatan pribadi per bab'],
                    ['study_days', 'tanggal aktif untuk streak'],
                  ].map(([t, d]) => (
                    <tr key={t}>
                      <td className="border-b border-line/70 px-3 py-2 font-mono font-semibold text-ink">{t}</td>
                      <td className="border-b border-line/70 px-3 py-2 text-muted">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Step>

          <Step n={3} title="Aktifkan login email">
            <p>
              Buka <strong>Authentication</strong> → <strong>Providers</strong> → <strong>Email</strong>. Pastikan
              provider Email <strong>enabled</strong>.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Untuk uji cepat: matikan <strong>Confirm email</strong> di bagian Email, agar akun langsung aktif tanpa
                klik email.
              </li>
              <li>
                Untuk produksi: biarkan <strong>Confirm email</strong> menyala. Pengguna akan menerima email konfirmasi.
              </li>
              <li>Magic link memakai fitur yang sama; tidak perlu provider tambahan.</li>
            </ul>
          </Step>

          <Step n={4} title="Atur URL redirect">
            <p>
              Buka <strong>Authentication</strong> → <strong>URL Configuration</strong>. Isi:
            </p>
            <Code label="Site URL">{`https://nafisdurrunov.github.io/turkce-akademi/`}</Code>
            <Code label="Redirect URLs (tambahkan satu per baris)">{`https://nafisdurrunov.github.io/turkce-akademi/**\nhttp://localhost:5173/**\nhttp://localhost:4173/**`}</Code>
            <p className="text-[11px]">
              Aplikasi memakai hash router (<code className="rounded bg-raised px-1">#/profil</code>), jadi cukup
              daftarkan alamat dasar beserta <code className="rounded bg-raised px-1">/**</code>. Wildcard menutup
              variasi path.
            </p>
          </Step>

          <Step n={5} title="Ambil kunci API">
            <p>
              Buka <strong>Project Settings</strong> → <strong>API Keys</strong> (tampilan lama:{' '}
              <strong>Project Settings</strong> → <strong>API</strong>). Salin:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Project URL</strong> → <code className="rounded bg-raised px-1">VITE_SUPABASE_URL</code></li>
              <li>
                <strong>Publishable key</strong> (<code className="rounded bg-raised px-1">sb_publishable_…</code>) atau{' '}
                <strong>anon public</strong> pada project lama →{' '}
                <code className="rounded bg-raised px-1">VITE_SUPABASE_ANON_KEY</code>
              </li>
            </ul>
            <p className="text-[11px]">
              Jangan pernah memakai <strong>secret key</strong> (<code className="rounded bg-raised px-1">sb_secret_…</code>)
              atau <code className="rounded bg-raised px-1">service_role</code>. Untuk situs GitHub Pages, simpan kedua
              nilai sebagai repository secret, lalu jalankan ulang workflow.
            </p>
            <p className="text-[11px]">Untuk lokal: tempel ke <code className="rounded bg-raised px-1">.env</code>, lalu restart <code className="rounded bg-raised px-1">npm run dev</code>.</p>
          </Step>

          <Step n={6} title="Uji sinkronisasi">
            <p>
              Buka <strong>Masuk</strong> → daftar akun → kembali ke <strong>Profil</strong>. Status harus berubah
              menjadi <strong>Tersinkron</strong>. Coba buka di browser lain dengan akun yang sama; progres akan
              muncul.
            </p>
            <p className="text-[11px]">
              Jika muncul “Gagal sinkron”, cek Console browser (F12). Penyebab umum: schema belum dijalankan, RLS
              salah, atau URL/key belum benar.
            </p>
          </Step>
        </div>
      </section>

      {/* Deploy */}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-extrabold text-ink">C. Deploy online (gratis)</h2>
          <p className="text-[11px] text-muted">Pilih salah satu. Vercel paling sedikit langkahnya.</p>
        </div>
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="rounded-2xl border border-line p-4">
            <div className="flex items-center gap-2">
              <span className="tag !bg-black !text-white dark:!bg-white dark:!text-black">Vercel</span>
              <h3 className="text-sm font-bold text-ink">Rekomendasi — 5 menit</h3>
            </div>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-6 text-muted">
              <li>Upload folder proyek ke GitHub (repo baru), atau gunakan Vercel CLI.</li>
              <li>
                Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="font-bold text-brand underline">vercel.com</a> → <strong>Add New → Project</strong> → import repo.
              </li>
              <li>
                Framework preset: <strong>Vite</strong>. Build command <code className="rounded bg-raised px-1">npm run build</code>, output{' '}
                <code className="rounded bg-raised px-1">dist</code>.
              </li>
              <li>
                Di <strong>Environment Variables</strong>, tambahkan{' '}
                <code className="rounded bg-raised px-1">VITE_SUPABASE_URL</code> dan{' '}
                <code className="rounded bg-raised px-1">VITE_SUPABASE_ANON_KEY</code>.
              </li>
              <li>Klik <strong>Deploy</strong>. Salin URL hasilnya (mis. turkce-akademi.vercel.app).</li>
              <li>Tambahkan URL itu ke <strong>Redirect URLs</strong> Supabase (langkah B4), lalu redeploy jika perlu.</li>
            </ol>
            <p className="mt-2 text-[11px] text-muted">
              Karena memakai hash router, refresh di halaman mana pun tetap aman tanpa konfigurasi rewrite tambahan.
            </p>
          </div>

          <div className="rounded-2xl border border-line p-4">
            <div className="flex items-center gap-2">
              <span className="tag">GitHub Pages</span>
              <h3 className="text-sm font-bold text-ink">Gratis statis</h3>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              Jika di-host di subfolder repo, set <code className="rounded bg-raised px-1">VITE_BASE</code> ke nama repo
              (harus diawali dan diakhiri garis miring).
            </p>
            <Code label="Build untuk GitHub Pages">{`# Windows PowerShell\n$env:VITE_BASE="/turkce-akademi/"\nnpm run build`}</Code>
            <p className="mt-2 text-[13px] leading-6 text-muted">Lalu unggah isi folder <code className="rounded bg-raised px-1">dist</code> ke branch <code className="rounded bg-raised px-1">gh-pages</code>:</p>
            <Code>{`npm install -D gh-pages\nnpx gh-pages -d dist`}</Code>
            <p className="mt-2 text-[11px] leading-6 text-muted">
              Di GitHub: <strong>Settings → Pages → Branch: gh-pages → /root</strong>. URL akan menjadi{' '}
              <code className="rounded bg-raised px-1">https://username.github.io/turkce-akademi/</code>. Tambahkan URL
              ini ke Redirect URLs Supabase.
            </p>
            <p className="mt-1 text-[11px] leading-6 text-muted">
              Catatan: environment variable di frontend ikut ter-bundle saat build. Isi{' '}
              <code className="rounded bg-raised px-1">.env</code> sebelum menjalankan build.
            </p>
          </div>

          <div className="rounded-2xl border border-line p-4">
            <h3 className="text-sm font-bold text-ink">Alternatif: Netlify</h3>
            <p className="mt-1 text-[13px] leading-6 text-muted">
              Import repo → build command <code className="rounded bg-raised px-1">npm run build</code> → publish
              directory <code className="rounded bg-raised px-1">dist</code> → tambahkan dua environment variable yang
              sama. Selesai.
            </p>
          </div>
        </div>
      </section>

      {/* Pemakaian */}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-extrabold text-ink">D. Cara memakai aplikasi</h2>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          {[
            ['Materi', 'Baca bagian bertanda Materi Inti. Bagian Pengayaan berisi tips, budaya, dan latihan tambahan. Tandai selesai per bagian.'],
            ['Kosakata', 'Cari kata, dengarkan pelafalan, lalu tutup arti dan uji ingatanmu.'],
            ['Flashcards', 'Balik kartu dengan ketuk atau spasi. Tandai “sudah hafal” agar progres terlihat.'],
            ['Kuis', 'Pilihan ganda, isi imbuhan, dan susun kalimat. Ada penjelasan langsung setelah menjawab.'],
            ['Catatan', 'Tulis rangkuman per bab. Autosave 0,7 detik setelah berhenti mengetik; tersinkron saat online.'],
            ['Streak & progres', 'Streak dihitung dari hari aktif. Progres keseluruhan dihitung dari bagian yang selesai.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-line bg-raised/40 p-3">
              <p className="text-xs font-bold text-ink">{t}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-line px-4 py-3 text-[11px] leading-6 text-muted sm:px-5">
          <strong className="text-ink">Audio:</strong> pelafalan memakai Web Speech API bawaan browser. Jika perangkat
          tidak punya voice Turki, buka pengaturan bahasa dan tambahkan paket suara Türkçe. Chrome di Android biasanya
          sudah menyediakannya.
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-extrabold text-ink">E. Jika ada masalah</h2>
        </div>
        <div className="divide-y divide-line">
          {[
            [
              'Login berhasil tetapi data tidak muncul',
              'Pastikan schema.sql sudah dijalankan dan RLS aktif. Buka Console browser; error “relation does not exist” berarti tabel belum dibuat.',
            ],
            [
              'Tautan magic link membuka halaman kosong',
              'Tambahkan URL aplikasi (termasuk wildcard /**) ke Redirect URLs Supabase. Pastikan Site URL tidak memakai localhost saat produksi.',
            ],
            [
              'Progres tidak tersinkron setelah offline',
              'Buka aplikasi saat online; antrean push otomatis berjalan. Kamu juga bisa menekan “Sinkron sekarang” di Profil.',
            ],
            [
              'Ingin pindah perangkat',
              'Masuk dengan akun yang sama. Jika sebelumnya tamu, gunakan Ekspor data lalu Impor di perangkat baru, atau masuk dulu agar data tamu tergabung.',
            ],
            [
              'Kuota Supabase gratis habis?',
              'Free tier memberi 500 MB database dan 50.000 monthly active users. Data aplikasi ini sangat kecil (hitungan KB per user), jadi aman untuk pemakaian pribadi.',
            ],
            [
              'Ingin menghapus akun',
              'Hapus user di Supabase Authentication → Users. Data terkait ikut terhapus jika foreign key ON DELETE CASCADE aktif (sudah diatur di schema).',
            ],
          ].map(([q, a]) => (
            <div key={q} className="px-4 py-3 sm:px-5">
              <p className="text-xs font-bold text-ink">{q}</p>
              <p className="mt-0.5 text-[11px] leading-6 text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-brand/20 bg-brand/[0.04] p-4 text-xs leading-6 text-ink/80">
        <p className="font-bold text-ink">Checklist sebelum dibagikan</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>schema.sql sudah dijalankan, RLS aktif.</li>
          <li>Redirect URLs sudah memuat domain produksi.</li>
          <li>Environment variables sudah diisi di platform deploy.</li>
          <li>Sudah dicoba daftar, login, logout, dan sinkron di dua browser.</li>
          <li>Sudah dicoba install PWA di Android dan buka dalam mode offline.</li>
        </ul>
      </div>

      <p className="text-center text-[11px] text-muted">
        Butuh materi? <Link to="/modul" className="font-bold text-brand hover:underline">Kembali ke daftar modul</Link>.
      </p>
    </div>
  )
}
