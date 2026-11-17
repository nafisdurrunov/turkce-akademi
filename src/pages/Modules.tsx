import { useMemo, useState } from 'react'
import { chapters } from '../content'
import { useStore } from '../context/StoreContext'
import { chapterPct, completedCount, overallPct } from '../lib/progress'
import { ChapterCard } from '../components/ChapterCard'
import { Icon } from '../components/Icons'

type Filter = 'all' | 'progress' | 'done' | 'core' | 'bonus'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'progress', label: 'Sedang berjalan' },
  { id: 'done', label: 'Selesai' },
  { id: 'core', label: 'Materi inti' },
  { id: 'bonus', label: 'Bonus' },
]

export function Modules() {
  const { data } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const overall = overallPct(chapters, data)
  const done = completedCount(chapters, data)

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('tr')
    return chapters.filter((c) => {
      if (needle) {
        const hay = `${c.title} ${c.titleTr} ${c.summary} ${c.id}`.toLocaleLowerCase('tr')
        if (!hay.includes(needle)) return false
      }
      const pct = chapterPct(c, data.chapters[c.id])
      if (filter === 'progress') return pct > 0 && pct < 100
      if (filter === 'done') return pct >= 100
      if (filter === 'core') return !c.bonus
      if (filter === 'bonus') return Boolean(c.bonus)
      return true
    })
  }, [q, filter, data.chapters])

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Silabus lengkap</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">Modul belajar</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          {chapters.length} bab disusun dari 19 modul PDF, ditambah 1 bab bonus percakapan. Setiap bab berisi materi,
          kosakata, flashcard, kuis, dan catatan pribadi.
        </p>
      </header>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari bab, pola, atau kata kunci…"
            className="input pl-9"
            aria-label="Cari modul"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="search" width={16} height={16} />
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">{overall}% total</span>
          <span>{done}/{chapters.length} selesai</span>
        </div>
      </div>

      <div className="scroll-hide -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`tab ${filter === f.id ? 'tab-active' : 'border border-line bg-surface hover:bg-raised'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-bold text-ink">Tidak ada modul yang cocok.</p>
          <p className="mt-1 text-xs text-muted">Coba kata kunci lain atau ubah filter.</p>
          <button
            type="button"
            onClick={() => {
              setQ('')
              setFilter('all')
            }}
            className="btn-ghost btn-sm mt-4"
          >
            Reset pencarian
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ChapterCard key={c.id} chapter={c} state={data.chapters[c.id]} attempts={data.attempts} />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-raised/50 p-4 text-xs leading-6 text-muted">
        <p className="font-bold text-ink">Tentang bab bonus</p>
        <p className="mt-1">
          Bab 20 “Percakapan Sehari-hari 2” berasal dari PDF tambahan di luar 19 modul inti. Isinya hanya mengulang pola
          dari bab 1–19 dalam dialog restoran dan arah, jadi aman dipelajari kapan saja setelah bab 18.
        </p>
      </div>
    </div>
  )
}
