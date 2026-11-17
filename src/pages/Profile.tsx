import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { chapters } from '../content'
import { useStore } from '../context/StoreContext'
import { calcStreak, formatDate } from '../lib/date'
import { completedCount, overallPct, quizAverage } from '../lib/progress'
import { SyncBadge } from '../components/Layout'
import { ProgressRing } from '../components/Progress'
import { Icon } from '../components/Icons'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function Profile() {
  const { user, data, signOut, syncNow, sync, cloudEnabled, lastSyncedAt, exportData, importData, wipeLocal } = useStore()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    const mq = window.matchMedia('(display-mode: standalone)')
    setInstalled(mq.matches)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const notes = Object.values(data.notes).filter((n) => n.content.trim()).length
  const overall = overallPct(chapters, data)
  const done = completedCount(chapters, data)
  const avg = quizAverage(chapters, data)
  const streak = calcStreak(data.days)

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `turkce-akademi-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Data berhasil diunduh sebagai file JSON.')
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setErr(null)
    setMsg(null)
    try {
      const text = await f.text()
      importData(text)
      setMsg('Data berhasil diimpor dan digabungkan dengan progres saat ini.')
    } catch {
      setErr('File tidak valid. Pastikan file JSON berasal dari ekspor aplikasi ini.')
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Akun & data</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">Profil</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Kelola akun, sinkronisasi cloud, dan cadangan progres belajarmu.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-lg font-extrabold uppercase text-brand">
              {user ? (user.email ?? 'U').slice(0, 1) : <Icon name="user" width={22} height={22} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">
                {user ? user.email : 'Mode tamu'}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {user
                  ? `Akun dibuat ${formatDate(user.created_at ?? new Date().toISOString())}`
                  : 'Progres tersimpan di perangkat ini saja.'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <SyncBadge />
                {cloudEnabled ? (
                  <span className="tag">Supabase aktif</span>
                ) : (
                  <span className="tag !bg-amber-500/10 !text-amber-700 dark:!text-amber-300">Supabase belum diisi</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {user ? (
              <>
                <button type="button" onClick={() => void syncNow()} className="btn-ghost btn-sm" disabled={sync === 'syncing'}>
                  <Icon name="refresh" width={14} height={14} className={sync === 'syncing' ? 'animate-spin' : ''} />
                  Sinkron sekarang
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Keluar dari akun? Progres tetap tersimpan di perangkat dan cloud.')) {
                      await signOut()
                    }
                  }}
                  className="btn-subtle btn-sm"
                >
                  <Icon name="logout" width={14} height={14} />
                  Keluar
                </button>
              </>
            ) : (
              <Link to="/masuk" className="btn-primary btn-sm">
                <Icon name="cloud" width={14} height={14} />
                Masuk untuk sinkron
              </Link>
            )}
            <Link to="/panduan" className="btn-ghost btn-sm">
              <Icon name="info" width={14} height={14} />
              Panduan setup
            </Link>
          </div>

          {lastSyncedAt && (
            <p className="mt-3 text-[11px] text-muted">Sinkron terakhir: {formatDate(lastSyncedAt, true)}</p>
          )}
        </div>

        <div className="card flex items-center gap-5 p-5">
          <ProgressRing value={overall} size={104} stroke={9}>
            <span className="text-xl font-extrabold text-ink">{overall}%</span>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">total</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Ringkasan belajar</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <dt className="text-muted">Bab selesai</dt>
              <dd className="text-right font-bold text-ink">{done}/{chapters.length}</dd>
              <dt className="text-muted">Streak</dt>
              <dd className="text-right font-bold text-ink">{streak} hari</dd>
              <dt className="text-muted">Rata-rata kuis</dt>
              <dd className="text-right font-bold text-ink">{avg === null ? '—' : `${avg}%`}</dd>
              <dt className="text-muted">Catatan</dt>
              <dd className="text-right font-bold text-ink">{notes}</dd>
            </dl>
          </div>
        </div>
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">Cadangan & pemulihan</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Ekspor file JSON untuk cadangan manual. Impor akan menggabungkan data, bukan menimpa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <button type="button" onClick={download} className="btn-ghost btn-sm">
            <Icon name="download" width={14} height={14} />
            Ekspor data
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost btn-sm">
            <Icon name="upload" width={14} height={14} />
            Impor data
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Hapus SEMUA progres di perangkat ini? Tindakan ini tidak bisa dibatalkan.')) {
                wipeLocal()
                setMsg('Data lokal dikosongkan.')
              }
            }}
            className="btn-sm ml-auto border border-brand/25 bg-brand/5 text-brand hover:bg-brand/10"
          >
            <Icon name="trash" width={14} height={14} />
            Hapus data lokal
          </button>
        </div>
        {(msg || err) && (
          <p className={`mx-4 mb-4 rounded-xl p-2.5 text-[11px] ${err ? 'bg-brand/5 text-brand' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
            {err ?? msg}
          </p>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">Pasang sebagai aplikasi (PWA)</h2>
        </div>
        <div className="p-4">
          {installed ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Icon name="checkCircle" width={15} height={15} />
              Aplikasi sudah terpasang di perangkat ini.
            </p>
          ) : (
            <>
              <p className="text-xs leading-6 text-muted">
                Di Android (Chrome): buka menu ⋮ → <strong>Install app</strong> / <strong>Tambahkan ke layar utama</strong>.
                Di iPhone (Safari): tombol Share → <strong>Add to Home Screen</strong>. Setelah terpasang, aplikasi
                bisa dibuka tanpa browser dan tetap berjalan offline.
              </p>
              {installEvent && (
                <button
                  type="button"
                  onClick={async () => {
                    await installEvent.prompt()
                    const choice = await installEvent.userChoice
                    if (choice.outcome === 'accepted') setInstalled(true)
                    setInstallEvent(null)
                  }}
                  className="btn-primary btn-sm mt-3"
                >
                  <Icon name="download" width={14} height={14} />
                  Pasang sekarang
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">Tentang aplikasi</h2>
        </div>
        <div className="space-y-2 p-4 text-[11px] leading-6 text-muted">
          <p>
            <strong className="text-ink">Türkçe Akademi v1.0.0</strong> — materi disusun ulang dari 19 modul PDF
            “Belajar Bahasa Turki” karya Teuku Reski Nuari, ditambah 1 bab bonus percakapan.
          </p>
          <p>
            Teknologi: React + Vite + Tailwind, Supabase untuk autentikasi & sinkronisasi, Web Speech API untuk
            pelafalan bahasa Turki, dan service worker untuk mode offline.
          </p>
          <p>
            Progres disimpan lokal lebih dulu (localStorage) lalu disinkronkan ke cloud saat online. Tidak ada data
            yang dikirim ke pihak ketiga selain Supabase milikmu sendiri.
          </p>
        </div>
      </section>
    </div>
  )
}
