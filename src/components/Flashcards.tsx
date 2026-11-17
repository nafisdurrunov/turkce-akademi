import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Flashcard } from '../content/types'
import { Icon } from './Icons'
import { TTSButton } from './TTSButton'

function shuffled(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: cards.length }, (_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<number>>(new Set())

  const total = order.length
  const cardIndex = order[pos]
  const card = cards[cardIndex]
  const pct = total ? Math.round((known.size / total) * 100) : 0

  const go = useCallback(
    (delta: number) => {
      setFlipped(false)
      setPos((p) => (p + delta + total) % total)
    },
    [total],
  )

  const flip = useCallback(() => setFlipped((f) => !f), [])

  const markKnown = () => {
    if (cardIndex === undefined) return
    setKnown((prev) => {
      const next = new Set(prev)
      next.add(cardIndex)
      return next
    })
    if (known.size + 1 >= total) return
    go(1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        flip()
      } else if (e.key === 'ArrowRight') {
        go(1)
      } else if (e.key === 'ArrowLeft') {
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flip, go])

  const reset = useMemo(
    () => () => {
      setOrder(Array.from({ length: cards.length }, (_, i) => i))
      setPos(0)
      setFlipped(false)
      setKnown(new Set())
    },
    [cards.length],
  )

  if (!card) return null
  const done = known.size >= total

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted">
          Kartu {pos + 1} / {total} · {known.size} sudah ditandai hafal
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setOrder(shuffled(cards.length))
              setPos(0)
              setFlipped(false)
            }}
            className="btn-ghost btn-sm"
          >
            <Icon name="shuffle" width={14} height={14} />
            Acak
          </button>
          <button type="button" onClick={reset} className="btn-ghost btn-sm">
            <Icon name="refresh" width={14} height={14} />
            Ulangi
          </button>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <button
        type="button"
        onClick={flip}
        className="flip-card mt-4 block w-full text-left"
        aria-label="Balik kartu"
      >
        <div className={`flip-inner relative h-64 w-full sm:h-72 ${flipped ? 'is-flipped' : ''}`}>
          <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-line bg-gradient-to-br from-surface to-raised p-6 shadow-card">
            <span className="chip mb-3">Turki</span>
            <p className="text-center font-serif text-2xl font-semibold leading-snug text-ink sm:text-3xl">{card.front}</p>
            {card.hint && <p className="mt-3 text-center text-xs text-muted">Petunjuk: {card.hint}</p>}
            <span className="absolute bottom-4 text-[11px] font-medium text-muted">ketuk untuk melihat arti</span>
          </div>
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-brand/30 bg-brand/[0.06] p-6 shadow-card">
            <span className="chip !border-brand/25 !bg-brand/10 !text-brand mb-3">Indonesia</span>
            <p className="text-center text-2xl font-semibold leading-snug text-ink sm:text-3xl">{card.back}</p>
            <span className="absolute bottom-4 text-[11px] font-medium text-muted">ketuk untuk kembali</span>
          </div>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => go(-1)} className="btn-ghost btn-sm" aria-label="Kartu sebelumnya">
            <Icon name="arrowLeft" width={15} height={15} />
            Sebelumnya
          </button>
          <TTSButton text={card.front} label={card.front} size="md" />
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={flip} className="btn-subtle btn-sm">
            Balik kartu
          </button>
          <button type="button" onClick={markKnown} className="btn-primary btn-sm" disabled={done}>
            <Icon name="check" width={14} height={14} />
            Sudah hafal
          </button>
        </div>
      </div>

      {done && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center dark:border-emerald-800/60 dark:bg-emerald-900/20">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Semua kartu sudah ditandai hafal! 🎉</p>
          <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Ulangi besok agar benar-benar menempel. Kamu bisa tekan Ulangi untuk mengulang sekarang.
          </p>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-muted">
        Tips: tekan <kbd className="rounded border border-line bg-raised px-1">spasi</kbd> untuk membalik dan{' '}
        <kbd className="rounded border border-line bg-raised px-1">←</kbd>{' '}
        <kbd className="rounded border border-line bg-raised px-1">→</kbd> untuk berpindah kartu.
      </p>
    </div>
  )
}
