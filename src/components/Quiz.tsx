import { useMemo, useRef, useState } from 'react'
import type { Question } from '../content/types'
import { useStore } from '../context/StoreContext'
import { RichText } from './RichText'
import { Icon } from './Icons'
import { TrKeyboard } from './TrKeyboard'
import { ProgressRing } from './Progress'
import { TTSButton } from './TTSButton'

const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr')

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const typeLabel: Record<Question['type'], string> = {
  mcq: 'Pilihan ganda',
  fill: 'Isi imbuhan',
  order: 'Susun kalimat',
}

let tokenSeq = 0
interface Token {
  id: number
  word: string
}

function tokenize(words: string[]): Token[] {
  return words.map((word) => ({ id: ++tokenSeq, word }))
}

interface Result {
  q: Question
  correct: boolean
}

export function Quiz({ chapterId, questions }: { chapterId: string; questions: Question[] }) {
  const { submitQuiz } = useStore()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [fill, setFill] = useState('')
  const [picked, setPicked] = useState<Token[]>([])
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [finished, setFinished] = useState(false)
  const [round, setRound] = useState(0)
  const [kbdOpen, setKbdOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const q = questions[step]

  const bank = useMemo<Token[]>(() => {
    if (!q || q.type !== 'order') return []
    return shuffle(tokenize(q.answer))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, round, q?.type])

  const reset = () => {
    setStep(0)
    setSelected(null)
    setFill('')
    setPicked([])
    setAnswered(false)
    setIsCorrect(false)
    setScore(0)
    setResults([])
    setFinished(false)
    setKbdOpen(false)
    setRound((r) => r + 1)
  }

  if (!q) return null

  const check = () => {
    let ok = false
    if (q.type === 'mcq') ok = selected === q.answer
    else if (q.type === 'fill') {
      const accepts = Array.isArray(q.answer) ? q.answer : [q.answer]
      ok = accepts.some((a) => norm(a) === norm(fill))
    } else {
      ok = norm(picked.map((p) => p.word).join(' ')) === norm(q.answer.join(' '))
    }
    setAnswered(true)
    setIsCorrect(ok)
    setResults((r) => [...r, { q, correct: ok }])
    if (ok) setScore((s) => s + 1)
  }

  const next = () => {
    if (step + 1 >= questions.length) {
      const finalScore = score
      submitQuiz(chapterId, finalScore, questions.length)
      setFinished(true)
      return
    }
    setStep((s) => s + 1)
    setSelected(null)
    setFill('')
    setPicked([])
    setAnswered(false)
    setIsCorrect(false)
    setKbdOpen(false)
  }

  const insertChar = (ch: string) => {
    const el = inputRef.current
    if (!el) {
      setFill((f) => f + ch)
      return
    }
    const start = el.selectionStart ?? fill.length
    const end = el.selectionEnd ?? fill.length
    const nextVal = fill.slice(0, start) + ch + fill.slice(end)
    setFill(nextVal)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + ch.length, start + ch.length)
    })
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    const message =
      pct === 100
        ? 'Mükemmel! Sempurna! 🎉'
        : pct >= 80
          ? 'Çok iyi! Hampir sempurna.'
          : pct >= 60
            ? 'İyi! Terus ulangi bagian yang salah.'
            : 'Jangan menyerah. Baca materi sekali lagi, lalu coba lagi.'
    return (
      <div className="card p-6 text-center sm:p-8">
        <ProgressRing value={pct} size={112} stroke={9}>
          <span className="text-2xl font-extrabold text-ink">{pct}%</span>
          <span className="text-[11px] font-semibold text-muted">
            {score}/{questions.length}
          </span>
        </ProgressRing>
        <h3 className="mt-5 text-xl font-extrabold text-ink">{message}</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted">
          Skor ini otomatis tersimpan di riwayat kuis. Ulangi sampai kamu nyaman dengan polanya.
        </p>

        <div className="mx-auto mt-6 max-w-lg text-left">
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border border-line px-3 py-2.5">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    r.correct ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : 'bg-brand/15 text-brand'
                  }`}
                >
                  <Icon name={r.correct ? 'check' : 'x'} width={12} height={12} />
                </span>
                <p className="min-w-0 text-[13px] leading-6 text-ink/85">
                  <span className="font-semibold">Soal {i + 1}.</span> <RichText text={r.q.q} />
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={reset} className="btn-primary">
            <Icon name="refresh" width={16} height={16} />
            Ulangi kuis
          </button>
        </div>
      </div>
    )
  }

  const canCheck =
    q.type === 'mcq' ? selected !== null : q.type === 'fill' ? fill.trim().length > 0 : picked.length > 0

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="chip !normal-case !tracking-normal">{typeLabel[q.type]}</span>
            <span className="text-xs font-semibold text-muted">
              Soal {step + 1} dari {questions.length}
            </span>
          </div>
          <span className="text-xs font-bold text-brand">{score} benar</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[15px] font-semibold leading-7 text-ink">
            <RichText text={q.q} />
          </p>
          {q.type !== 'order' && (
            <TTSButton text={q.q.replace(/`/g, '')} label="soal" />
          )}
        </div>

        {q.type === 'mcq' && (
          <div className="mt-4 grid gap-2">
            {q.options.map((opt, i) => {
              const chosen = selected === i
              const showCorrect = answered && i === q.answer
              const showWrong = answered && chosen && i !== q.answer
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => setSelected(i)}
                  className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                    showCorrect
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-900/25 dark:text-emerald-100'
                      : showWrong
                        ? 'border-brand/60 bg-brand/10 text-ink'
                        : chosen
                          ? 'border-brand/50 bg-brand/5 text-ink'
                          : 'border-line bg-surface text-ink hover:border-brand/30 hover:bg-raised'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      showCorrect
                        ? 'bg-emerald-500 text-white'
                        : showWrong
                          ? 'bg-brand text-white'
                          : chosen
                            ? 'bg-brand/15 text-brand'
                            : 'bg-raised text-muted'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-6">
                    <RichText text={opt} />
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'fill' && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !answered && canCheck) check()
                }}
                disabled={answered}
                placeholder={q.placeholder ?? 'Tulis jawaban dalam bahasa Turki…'}
                className={`input ${answered ? (isCorrect ? '!border-emerald-400' : '!border-brand/60') : ''}`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
            {q.hint && !answered && <p className="mt-1.5 text-xs text-muted">Petunjuk: {q.hint}</p>}
            {!answered && (
              <div className="mt-2">
                <TrKeyboard onKey={insertChar} open={kbdOpen} onToggle={() => setKbdOpen((o) => !o)} />
              </div>
            )}
          </div>
        )}

        {q.type === 'order' && (
          <div className="mt-4">
            <div
              className={`min-h-[58px] rounded-xl border-2 border-dashed p-2.5 ${
                answered
                  ? isCorrect
                    ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/15'
                    : 'border-brand/50 bg-brand/5'
                  : 'border-line bg-raised/50'
              }`}
            >
              {picked.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted">Ketuk kata di bawah untuk menyusun kalimat…</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {picked.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={answered}
                      onClick={() => setPicked((p) => p.filter((x) => x.id !== t.id))}
                      className="rounded-lg border border-brand/30 bg-surface px-2.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/60"
                    >
                      {t.word}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {bank.map((t) => {
                const used = picked.some((p) => p.id === t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={answered || used}
                    onClick={() => setPicked((p) => [...p, t])}
                    className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
                      used
                        ? 'border-line bg-raised text-muted/40'
                        : 'border-line bg-surface text-ink hover:border-brand/40 hover:text-brand'
                    }`}
                  >
                    {t.word}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {answered && (
          <div
            className={`mt-4 rounded-xl border p-3.5 ${
              isCorrect
                ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-900/20'
                : 'border-amber-200 bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-900/20'
            }`}
          >
            <p className={`flex items-center gap-1.5 text-sm font-bold ${isCorrect ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'}`}>
              <Icon name={isCorrect ? 'checkCircle' : 'info'} width={16} height={16} />
              {isCorrect ? 'Benar!' : 'Belum tepat'}
            </p>
            {!isCorrect && q.type === 'fill' && (
              <p className="mt-1 text-sm text-ink/85">
                Jawaban yang diterima: <span className="font-semibold">{Array.isArray(q.answer) ? q.answer[0] : q.answer}</span>
              </p>
            )}
            {!isCorrect && q.type === 'order' && (
              <p className="mt-1 text-sm text-ink/85">
                Urutan benar: <span className="font-semibold">{q.answer.join(' ')}</span>
              </p>
            )}
            <p className="mt-1 text-sm leading-6 text-ink/85">
              <RichText text={q.explain} />
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted">
            {answered ? 'Baca penjelasan, lalu lanjut.' : 'Pilih jawaban yang paling tepat.'}
          </p>
          {!answered ? (
            <button type="button" onClick={check} disabled={!canCheck} className="btn-primary">
              Periksa jawaban
              <Icon name="check" width={16} height={16} />
            </button>
          ) : (
            <button type="button" onClick={next} className="btn-primary">
              {step + 1 >= questions.length ? 'Lihat hasil' : 'Soal berikutnya'}
              <Icon name="arrowRight" width={16} height={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
