import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Modules } from './pages/Modules'
import { ChapterPage } from './pages/ChapterPage'
import { Notes } from './pages/Notes'
import { Guide } from './pages/Guide'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'
import { useStore } from './context/StoreContext'
import { Icon } from './components/Icons'

function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <p className="text-4xl">🧭</p>
      <h1 className="mt-3 text-lg font-bold text-ink">Halaman tidak ditemukan</h1>
      <p className="mt-1 text-sm text-muted">Tautannya mungkin salah, atau halaman sudah dipindahkan.</p>
      <Link to="/" className="btn-primary mt-5">
        <Icon name="home" width={16} height={16} />
        Ke beranda
      </Link>
    </div>
  )
}

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg">
      <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-800 font-serif text-2xl text-white shadow-float">
        T
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Türkçe Akademi</p>
      <p className="text-[11px] text-muted">Menyiapkan materimu…</p>
    </div>
  )
}

export default function App() {
  const { ready } = useStore()
  if (!ready) return <Splash />

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modul" element={<Modules />} />
          <Route path="/modul/:slug" element={<ChapterPage />} />
          <Route path="/catatan" element={<Notes />} />
          <Route path="/panduan" element={<Guide />} />
          <Route path="/masuk" element={<Login />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
