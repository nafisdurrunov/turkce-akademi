import { Link } from 'react-router-dom'
import { chapters, stats } from '../content'
import { useStore } from '../context/StoreContext'
import { calcStreak, formatDate, greeting, lastWeek } from '../lib/date'
import { bestQuiz, chapterPct, completedCount, continueChapter, overallPct, quizAverage } from '../lib/progress'
import { ChapterCard } from '../components/ChapterCard'
import { ProgressRing } from '../components/Progress'
import { Icon } from '../components/Icons'

export function Home() {
  const { data } = useStore()
  const overall = overallPct(chapters, data)
  const streak = calcStreak(data.days)
  const week = lastWeek(data.days)
  const next = continueChapter(chapters, data)
  const completed = completedCount(chapters, data)
  const avg = quizAverage(chapters, data)
  const notes = Object.values(data.notes)
    .filter((n) => n.content.trim())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const recent = data.attempts.slice(0, 4)
  const upNext = chapters
    .filter((c) => c.id !== next.id)
    .sort((a, b) => chapterPct(a, data.chapters[a.id]) - chapterPct(b, data.chapters[b.id]))
    .slice(0, 3)

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-5 text-white shadow-float sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
        <div className="relative grid gap-5 lg:grid-cols-[1.5fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              {greeting()} · hoş geldin!
            </p>
            <h1 className="mt-2 max-w-xl font-serif text-2xl font-semibold leading-tight sm:text-[32px]">
              Merhaba! Siap belajar bahasa Turki hari ini?
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">
              {completed > 0
                ? `Kamu sudah menyelesaikan ${completed} dari ${chapters.length} bab. Sedikit demi sedikit, Türkçe jadi milikmu.`
                : 'Mulai dari sapaan pertama, lalu bangun kalimatmu sendiri. Semua materi tersusun rapi dari 19 modul PDF.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link
                to={`/modul/${next.slug}`}
                className="btn bg-white text-brand-800 shadow-sm hover:bg-white/90"
              >
                <Icon name="play" width={16} height={16} />
                Lanjutkan Belajar
              </Link>
              <Link to="/modul" className="btn border border-white/25 bg-white/10 text-white hover:bg-white/15">
                Lihat semua modul
                <Icon name="arrowRight" width={16} height={16} />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-surface p-4 text-ink shadow-card lg:w-[248px]">
            <ProgressRing value={overall} size={96} stroke={8}>
              <span className="text-xl font-extrabold">{overall}%</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">progres</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Total belajar</p>
              <p className="mt-1 text-sm font-bold text-ink">
                {completed}/{chapters.length} bab selesai
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted">
                {stats.sections} bagian · {stats.minutes} menit materi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Icon name="flame" width={22} height={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Streak harian</p>
            <p className="text-lg font-extrabold text-ink">
              {streak} hari <span className="text-xs font-semibold text-muted">berturut-turut</span>
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {week.map((d) => (
                <span
                  key={d.key}
                  title={d.key}
                  className={`h-2 w-2 rounded-full ${
                    d.active ? 'bg-brand' : d.isToday ? 'bg-brand/30 ring-1 ring-brand/40' : 'bg-line'
                  }`}
                />
              ))}
              <span className="ml-1 text-[10px] font-medium text-muted">7 hari terakhir</span>
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon name="quiz" width={22} height={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Rata-rata kuis</p>
            <p className="text-lg font-extrabold text-ink">
              {avg === null ? '—' : `${avg}%`}
              <span className="ml-1.5 text-xs font-semibold text-muted">{data.attempts.length} percobaan</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">Skor terbaik tersimpan per bab.</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4 sm:col-span-2 lg:col-span-1">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <Icon name="note" width={22} height={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Catatan pribadi</p>
            <p className="text-lg font-extrabold text-ink">
              {notes.length} catatan
              <Link to="/catatan" className="ml-2 text-xs font-bold text-brand hover:underline">
                buka
              </Link>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">Tersimpan otomatis di perangkat & cloud.</p>
          </div>
        </div>
      </section>

      {/* Lanjutkan */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Lanjutkan belajar</h2>
            <p className="text-xs text-muted">Kamu berhenti di sini. Lanjutkan satu bagian saja hari ini.</p>
          </div>
          <Link to="/modul" className="hidden text-xs font-bold text-brand hover:underline sm:block">
            Semua modul →
          </Link>
        </div>

        <Link
          to={`/modul/${next.slug}`}
          className="group card relative flex flex-col gap-4 overflow-hidden p-4 transition hover:border-brand/30 hover:shadow-float sm:flex-row sm:items-center sm:p-5"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-raised text-2xl ring-1 ring-line">
            {next.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">Bab {next.id}</span>
              {next.bonus && <span className="tag !bg-brand/10 !text-brand !ring-brand/20">Bonus</span>}
              <span className="text-[10px] font-semibold text-muted">{next.level}</span>
            </div>
            <h3 className="mt-1 text-base font-extrabold text-ink group-hover:text-brand">{next.title}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{next.summary}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${chapterPct(next, data.chapters[next.id])}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-muted">{chapterPct(next, data.chapters[next.id])}%</span>
            </div>
          </div>
          <span className="btn-primary btn-sm shrink-0 self-start sm:self-center">
            Buka bab
            <Icon name="arrowRight" width={15} height={15} />
          </span>
        </Link>
      </section>

      {/* Rekomendasi modul */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Mulai dari sini juga bisa</h2>
            <p className="text-xs text-muted">Tiga bab dengan progres paling rendah.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upNext.map((c) => (
            <ChapterCard key={c.id} chapter={c} state={data.chapters[c.id]} attempts={data.attempts} compact />
          ))}
        </div>
      </section>

      {/* Riwayat & catatan */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Riwayat skor kuis</h2>
            <span className="tag">{data.attempts.length} total</span>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-semibold text-ink">Belum ada percobaan kuis.</p>
              <p className="mt-1 text-xs text-muted">Kerjakan kuis di akhir bab untuk mengukur pemahaman.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((a) => {
                const ch = chapters.find((c) => c.id === a.chapterId)
                const pct = a.total ? Math.round((a.score / a.total) * 100) : 0
                return (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-raised text-xs ring-1 ring-line">
                      {ch?.emoji ?? '📘'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">{ch?.title ?? a.chapterId}</p>
                      <p className="text-[10px] text-muted">{formatDate(a.createdAt)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                        pct >= 80
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : pct >= 60
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            : 'bg-brand/10 text-brand'
                      }`}
                    >
                      {a.score}/{a.total}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Catatan terbaru</h2>
            <Link to="/catatan" className="text-[11px] font-bold text-brand hover:underline">
              Lihat semua
            </Link>
          </div>
          {notes.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-semibold text-ink">Belum ada catatan.</p>
              <p className="mt-1 text-xs text-muted">Buka bab mana pun, lalu tulis di tab Catatan.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {notes.slice(0, 4).map((n) => {
                const ch = chapters.find((c) => c.id === n.chapterId)
                return (
                  <li key={n.chapterId}>
                    <Link to={`/modul/${ch?.slug ?? ''}?tab=catatan`} className="block px-4 py-2.5 transition hover:bg-raised/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{ch?.emoji ?? '📝'}</span>
                        <p className="truncate text-xs font-semibold text-ink">{ch?.title ?? n.chapterId}</p>
                        <span className="ml-auto shrink-0 text-[10px] text-muted">{formatDate(n.updatedAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{n.content.replace(/\n/g, ' ')}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <p className="pb-2 text-center text-[11px] text-muted">
        {stats.chapters} bab · {stats.vocab} kosakata · {stats.flashcards} flashcard · {stats.quiz} soal kuis ·{' '}
        {stats.minutes} menit materi
      </p>
    </div>
  )
}
