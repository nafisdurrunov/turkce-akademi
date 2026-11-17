import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../context/StoreContext'
import { Icon } from '../components/Icons'

type Mode = 'password' | 'magic'

export function Login() {
  const { user, cloudEnabled } = useStore()
  const [mode, setMode] = useState<Mode>('password')
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const redirectTo = `${window.location.origin}${window.location.pathname}#/profil`

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!supabase) {
      setError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY lalu build ulang.')
      return
    }
    if (!email.trim()) {
      setError('Email wajib diisi.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'magic') {
        const { error: err } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: redirectTo },
        })
        if (err) throw err
        setMessage('Tautan masuk sudah dikirim. Buka emailmu, lalu klik tautan tersebut. Kamu bisa menutup halaman ini.')
      } else if (register) {
        if (password.length < 6) throw new Error('Password minimal 6 karakter.')
        const { error: err, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectTo },
        })
        if (err) throw err
        if (data.session) {
          setMessage('Akun dibuat dan kamu sudah masuk. Progres tamu otomatis digabungkan.')
        } else {
          setMessage('Akun dibuat. Cek email untuk konfirmasi, lalu masuk kembali.')
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (err) throw err
        setMessage('Berhasil masuk. Progres tamu sedang digabungkan dengan akunmu.')
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err)
      setError(
        m.toLowerCase().includes('invalid login')
          ? 'Email atau password salah. Coba lagi atau gunakan tautan ajaib.'
          : m,
      )
    } finally {
      setBusy(false)
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <Icon name="checkCircle" width={28} height={28} />
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-ink">Kamu sudah masuk</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
          <p className="mt-2 text-xs leading-6 text-muted">
            Progres dan catatanmu tersinkron ke cloud. Kamu bisa membuka profil untuk melihat status sinkronisasi.
          </p>
          <div className="mt-5 flex gap-2">
            <Link to="/profil" className="btn-primary flex-1">
              Buka profil
            </Link>
            <Link to="/modul" className="btn-ghost flex-1">
              Belajar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <header className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-800 text-white shadow-sm">
          <Icon name="user" width={24} height={24} />
        </span>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Masuk ke Türkçe Akademi</h1>
        <p className="mt-1 text-sm leading-6 text-muted">
          Sinkronkan progres, skor kuis, dan catatan ke semua perangkat. Tanpa akun pun aplikasi tetap berjalan.
        </p>
      </header>

      {!cloudEnabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs leading-6 text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-100">
          <p className="flex items-center gap-1.5 font-bold">
            <Icon name="warn" width={15} height={15} />
            Supabase belum aktif
          </p>
          <p className="mt-1">
            Aplikasi sedang berjalan dalam mode lokal. Untuk mengaktifkan login dan sinkron cloud, isi file{' '}
            <code className="rounded bg-black/10 px-1">.env</code> lalu build ulang. Langkah lengkapnya ada di{' '}
            <Link to="/panduan" className="font-bold underline">
              Panduan
            </Link>
            .
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="grid grid-cols-2 border-b border-line">
          <button
            type="button"
            onClick={() => {
              setMode('password')
              setError(null)
              setMessage(null)
            }}
            className={`px-3 py-3 text-xs font-bold transition ${
              mode === 'password' ? 'bg-brand/[0.06] text-brand' : 'text-muted hover:bg-raised'
            }`}
          >
            Email & password
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('magic')
              setError(null)
              setMessage(null)
            }}
            className={`px-3 py-3 text-xs font-bold transition ${
              mode === 'magic' ? 'bg-brand/[0.06] text-brand' : 'text-muted hover:bg-raised'
            }`}
          >
            Tautan ajaib
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 p-4 sm:p-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted">Email</span>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input pl-9"
                autoComplete="email"
                required
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <Icon name="mail" width={15} height={15} />
              </span>
            </div>
          </label>

          {mode === 'password' && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted">Password</span>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={register ? 'Minimal 6 karakter' : 'Password kamu'}
                  className="input pl-9 pr-10"
                  autoComplete={register ? 'new-password' : 'current-password'}
                  required
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Icon name="lock" width={15} height={15} />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <Icon name={showPass ? 'eyeOff' : 'eye'} width={15} height={15} />
                </button>
              </div>
            </label>
          )}

          {mode === 'magic' && (
            <p className="rounded-xl bg-raised p-3 text-[11px] leading-5 text-muted">
              Kami akan mengirim tautan masuk ke emailmu. Tidak perlu mengingat password. Tautan berlaku sekali dan
              biasanya kedaluwarsa dalam 1 jam.
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-brand/30 bg-brand/5 p-2.5 text-[11px] leading-5 text-brand">{error}</p>
          )}
          {message && (
            <p className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-2.5 text-[11px] leading-5 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-200">
              {message}
            </p>
          )}

          <button type="submit" disabled={busy || !cloudEnabled} className="btn-primary w-full">
            {busy ? (
              <>
                <Icon name="refresh" width={16} height={16} className="animate-spin" />
                Memproses…
              </>
            ) : mode === 'magic' ? (
              <>
                <Icon name="mail" width={16} height={16} />
                Kirim tautan masuk
              </>
            ) : register ? (
              <>
                <Icon name="user" width={16} height={16} />
                Buat akun
              </>
            ) : (
              <>
                <Icon name="logout" width={16} height={16} />
                Masuk
              </>
            )}
          </button>

          {mode === 'password' && (
            <p className="text-center text-[11px] text-muted">
              {register ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button type="button" onClick={() => setRegister((r) => !r)} className="font-bold text-brand hover:underline">
                {register ? 'Masuk di sini' : 'Daftar gratis'}
              </button>
            </p>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-line bg-raised/50 p-4 text-[11px] leading-6 text-muted">
        <p className="font-bold text-ink">Progres tamu tetap aman</p>
        <p className="mt-1">
          Saat kamu masuk pertama kali, progres yang sudah dibuat dalam mode tamu otomatis digabungkan ke akun. Tidak
          ada yang hilang. Data tetap tersimpan di perangkat sebagai cache, jadi aplikasi bisa dipakai offline.
        </p>
      </div>

      <p className="text-center text-[11px] text-muted">
        Tidak ingin membuat akun?{' '}
        <Link to="/modul" className="font-bold text-brand hover:underline">
          Lanjut sebagai tamu
        </Link>
      </p>
    </div>
  )
}
