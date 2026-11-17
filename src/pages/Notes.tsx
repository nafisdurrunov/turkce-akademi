import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { chapterById, chapters } from '../content'
import { useStore } from '../context/StoreContext'
import { formatDate } from '../lib/date'
import { NotesEditor } from '../components/NotesEditor'
import { Icon } from '../components/Icons'

export function Notes() {
  const { data } = useStore()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const requested = params.get('ch')
  const withNotes = useMemo(
    () =>
      chapters
        .filter((c) => (data.notes[c.id]?.content ?? '').trim())
        .sort((a, b) => (data.notes[b.id]?.updatedAt ?? '').localeCompare(data.notes[a.id]?.updatedAt ?? '')),
    [data.notes],
  )
  const selected = chapterById(requested ?? '') ?? withNotes[0] ?? chapters[0]

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('tr')
    return chapters.filter((c) => {
      if (!needle) return true
      const note = data.notes[c.id]?.content ?? ''
      return `${c.title} ${c.titleTr} ${note}`.toLocaleLowerCase('tr').includes(needle)
    })
  }, [q, data.notes])

  const total = withNotes.length

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Buku catatanmu</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">Catatan pribadi</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          {total > 0
            ? `${total} bab sudah punya catatan. Semua perubahan tersimpan otomatis dan disinkronkan saat kamu masuk.`
            : 'Belum ada catatan. Pilih bab di bawah dan mulailah menulis rangkuman pertamamu.'}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="card h-fit overflow-hidden lg:sticky lg:top-4">
          <div className="border-b border-line p-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari bab atau isi catatan…"
                className="input py-2 pl-8 text-xs"
                aria-label="Cari catatan"
              />
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                <Icon name="search" width={14} height={14} />
              </span>
            </div>
          </div>
          <ul className="max-h-[62vh] divide-y divide-line overflow-y-auto">
            {list.map((c) => {
              const note = data.notes[c.id]?.content ?? ''
              const active = c.id === selected.id
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setParams({ ch: c.id }, { replace: true })}
                    className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition ${
                      active ? 'bg-brand/[0.06]' : 'hover:bg-raised/60'
                    }`}
                  >
                    <span className="mt-0.5 text-base">{c.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`truncate text-xs font-bold ${active ? 'text-brand' : 'text-ink'}`}>
                          {c.id}. {c.title}
                        </span>
                        {note.trim() ? (
                          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-line" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[10px] text-muted">
                        {note.trim() ? note.replace(/\n/g, ' ') : 'Belum ada catatan'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {list.length === 0 && (
              <li className="px-3 py-6 text-center text-xs text-muted">Tidak ada bab yang cocok.</li>
            )}
          </ul>
          <div className="border-t border-line px-3 py-2 text-[10px] text-muted">
            {total} bab dengan catatan · {chapters.length} bab tersedia
          </div>
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                Bab {selected.id} · {selected.level}
              </p>
              <h2 className="text-sm font-bold text-ink">
                {selected.emoji} {selected.title}
              </h2>
            </div>
            {data.notes[selected.id]?.updatedAt && (
              <span className="text-[11px] text-muted">
                Diubah {formatDate(data.notes[selected.id].updatedAt, true)}
              </span>
            )}
          </div>
          <NotesEditor key={selected.id} chapterId={selected.id} chapterTitle={selected.title} />
          <div className="rounded-2xl border border-line bg-raised/50 p-3.5 text-xs leading-6 text-muted">
            <p className="font-bold text-ink">Ide isi catatan</p>
            <p className="mt-1">
              Tulis 3 hal: (1) pola/rumus yang baru dipelajari, (2) kesalahan yang kamu buat hari ini, (3) 5 kosakata
              yang ingin dihafal besok. Catatan seperti ini lebih berguna daripada menyalin seluruh materi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
