import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useTheme } from '../context/ThemeContext'
import { Icon, type IconName } from './Icons'
import type { SyncStatus } from '../context/StoreContext'

const nav: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Beranda', icon: 'home', end: true },
  { to: '/modul', label: 'Modul', icon: 'book' },
  { to: '/catatan', label: 'Catatan', icon: 'note' },
  { to: '/panduan', label: 'Panduan', icon: 'info' },
]

const bottomNav = nav.filter((n) => n.to !== '/panduan')

const syncMeta: Record<SyncStatus, { label: string; icon: IconName; cls: string }> = {
  local: { label: 'Lokal', icon: 'cloudOff', cls: 'text-muted' },
  syncing: { label: 'Menyinkron…', icon: 'refresh', cls: 'text-amber-600 dark:text-amber-400' },
  synced: { label: 'Tersinkron', icon: 'cloud', cls: 'text-emerald-600 dark:text-emerald-400' },
  error: { label: 'Gagal sinkron', icon: 'warn', cls: 'text-brand' },
  offline: { label: 'Offline', icon: 'cloudOff', cls: 'text-muted' },
}

export function SyncBadge({ compact = false }: { compact?: boolean }) {
  const { sync, cloudEnabled } = useStore()
  const meta = syncMeta[cloudEnabled ? sync : 'local']
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}
      title={cloudEnabled ? 'Status sinkronisasi Supabase' : 'Belum ada Supabase — data disimpan di perangkat'}
    >
      <Icon name={meta.icon} width={13} height={13} className={sync === 'syncing' ? 'animate-spin' : ''} />
      {compact ? null : meta.label}
    </span>
  )
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-800 text-white shadow-sm">
        <span className="font-serif text-lg font-semibold">T</span>
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/20" />
      </span>
      {!small && (
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold tracking-tight text-ink">Türkçe Akademi</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Belajar bahasa Turki</span>
        </span>
      )}
    </Link>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink"
      aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} width={17} height={17} />
    </button>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, data } = useStore()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  const noteCount = Object.values(data.notes).filter((n) => n.content.trim()).length

  return (
    <div className="min-h-dvh bg-bg">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/80 px-4 py-5 backdrop-blur lg:flex">
        <Brand />
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-raised hover:text-ink'
                }`
              }
            >
              <Icon name={item.icon} width={18} height={18} />
              {item.label}
              {item.to === '/catatan' && noteCount > 0 && (
                <span className="ml-auto rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">{noteCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-line bg-raised/60 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Status data</p>
            <div className="mt-1.5">
              <SyncBadge />
            </div>
            <p className="mt-1.5 text-[10px] leading-4 text-muted">
              Semua progres tetap tersimpan di perangkat, bahkan tanpa akun.
            </p>
          </div>

          <Link
            to={user ? '/profil' : '/masuk'}
            className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5 transition hover:border-brand/30"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold uppercase text-brand">
              {user ? (user.email ?? 'U').slice(0, 1) : <Icon name="user" width={17} height={17} />}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-xs font-bold text-ink">
                {user ? user.email?.split('@')[0] : 'Mode tamu'}
              </span>
              <span className="block truncate text-[10px] text-muted">
                {user ? 'Kelola akun & sinkron' : 'Masuk untuk sinkron cloud'}
              </span>
            </span>
            <Icon name="arrowRight" width={14} height={14} className="text-muted" />
          </Link>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <Brand />
          <div className="flex items-center gap-1.5">
            <SyncBadge compact />
            <ThemeToggle />
            <Link
              to={user ? '/profil' : '/masuk'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-xs font-bold uppercase text-brand"
              aria-label={user ? 'Profil' : 'Masuk'}
            >
              {user ? (user.email ?? 'U').slice(0, 1) : <Icon name="user" width={16} height={16} />}
            </Link>
          </div>
        </div>
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:pb-12 lg:pt-9">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4">
          {bottomNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition ${
                  isActive ? 'text-brand' : 'text-muted'
                }`
              }
            >
              <Icon name={item.icon} width={20} height={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
