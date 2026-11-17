import { useMemo, useState } from 'react'
import type { VocabItem } from '../content/types'
import { RichText } from './RichText'
import { TTSButton } from './TTSButton'
import { Icon } from './Icons'

/** Tabel kosakata: bisa dicari, dengan tombol pelafalan per kata. */
export function VocabTable({ items, title }: { items: VocabItem[]; title?: string }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('tr')
    if (!needle) return items
    return items.filter(
      (v) =>
        v.tr.toLocaleLowerCase('tr').includes(needle) ||
        v.id.toLocaleLowerCase('id').includes(needle) ||
        (v.note ?? '').toLocaleLowerCase('id').includes(needle),
    )
  }, [items, q])

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon name="book" width={16} height={16} />
          </span>
          <h3 className="text-sm font-bold text-ink">{title ?? 'Kosakata'}</h3>
          <span className="tag">{items.length} kata</span>
        </div>
        <div className="relative w-full sm:w-56">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kata Turki / Indonesia…"
            className="input py-1.5 pl-8 text-xs"
            aria-label="Cari kosakata"
          />
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="search" width={14} height={14} />
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">Tidak ada kata yang cocok. Coba kata lain.</p>
      ) : (
        <ul className="divide-y divide-line">
          {filtered.map((v) => (
            <li key={`${v.tr}-${v.id}`} className="flex items-start gap-3 px-4 py-3 transition hover:bg-raised/60 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-[15px] font-semibold text-ink">
                  <RichText text={v.tr} />
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  <RichText text={v.id} />
                </p>
                {v.note && (
                  <p className="mt-1 text-xs leading-relaxed text-muted/90">
                    <RichText text={v.note} />
                  </p>
                )}
              </div>
              <TTSButton text={v.say ?? v.tr} label={v.say ?? v.tr} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
