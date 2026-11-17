import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { chapters, chapterBySlug, nextChapter, prevChapter } from '../content'
import { useStore } from '../context/StoreContext'
import { bestQuiz, chapterPct, sectionsDone } from '../lib/progress'
import { BlockRenderer } from '../components/BlockRenderer'
import { VocabTable } from '../components/VocabTable'
import { Flashcards } from '../components/Flashcards'
import { Quiz } from '../components/Quiz'
import { NotesEditor } from '../components/NotesEditor'
import { ProgressBar } from '../components/Progress'
import { Icon } from '../components/Icons'

type Tab = 'materi' | 'kosakata' | 'flashcards' | 'kuis' | 'catatan'

const tabs: { id: Tab; label: string; icon: 'book' | 'layers' | 'cards' | 'quiz' | 'note' }[] = [
  { id: 'materi', label: 'Materi', icon: 'book' },
  { id: 'kosakata', label: 'Kosakata', icon: 'layers' },
  { id: 'flashcards', label: 'Flashcards', icon: 'cards' },
  { id: 'kuis', label: 'Kuis', icon: 'quiz' },
  { id: 'catatan', label: 'Catatan', icon: 'note' },
]

export function ChapterPage() {
  const { slug } = useParams<{ slug: string }>()
  const chapter = slug ? chapterBySlug(slug) : undefined
  const { data, markSection, completeChapter, openChapter, resetChapter } = useStore()
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') as Tab | null
  const tab: Tab = raw && tabs.some((t) => t.id === raw) ? raw : 'materi'

  useEffect(() => {
    if (chapter) openChapter(chapter.id)
  }, [chapter, openChapter])

  const state = chapter ? data.chapters[chapter.id] : undefined
  const done = chapter ? sectionsDone(chapter, state) : 0
  const pct = chapter ? chapterPct(chapter, state) : 0
  const quizBest = chapter ? bestQuiz(data.attempts, chapter.id) : null
  const next = chapter ? nextChapter(chapter) : undefined
  const prev = chapter ? prevChapter(chapter) : undefined

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const noteContent = useMemo(() => (chapter ? data.notes[chapter.id]?.content ?? '' : ''), [chapter, data.notes])

  if (!chapter) {
    return (
      <div className="card p-10 text-center">
        <p className="text-4xl">🧭</p>
        <h1 className="mt-3 text-lg font-bold text-ink">Bab tidak ditemukan</h1>
        <p className="mt-1 text-sm text-muted">Mungkin tautannya salah atau bab sudah dipindahkan.</p>
        <Link to="/modul" className="btn-primary mt-5">
          Kembali ke daftar modul
        </Link>
      </div>
    )
  }

  const allDone = chapter.sections.every((s) => state?.sections.includes(s.id)) || Boolean(state?.completed)

  return (
    <div className="space-y-5">
      <Link to="/modul" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
        <Icon name="arrowLeft" width={14} height={14} />
        Semua modul
      </Link>

      <header className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand/[0.07] via-transparent to-teal-500/[0.05] p-4 sm:p-6">
          <div className="flex items-start gap-3.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl shadow-sm ring-1 ring-line sm:h-16 sm:w-16 sm:text-3xl">
              {chapter.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="chip">Bab {chapter.id}</span>
                {chapter.bonus && <span className="tag !bg-brand/10 !text-brand !ring-brand/20">Bonus</span>}
                <span className="tag">{chapter.level}</span>
                <span className="tag">
                  <Icon name="clock" width={11} height={11} className="mr-1" />
                  {chapter.minutes} menit
                </span>
              </div>
              <h1 className="mt-1.5 font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                {chapter.title}
              </h1>
              <p className="mt-0.5 text-sm italic text-muted">{chapter.titleTr}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/80">{chapter.summary}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[180px] flex-1">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted">
                <span>
                  {done}/{chapter.sections.length} bagian selesai
                </span>
                <span>{pct}%</span>
              </div>
              <ProgressBar value={pct} />
            </div>
            {quizBest !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand">
                <Icon name="trophy" width={12} height={12} />
                Skor terbaik {quizBest}%
              </span>
            )}
            {state?.completed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Icon name="checkCircle" width={12} height={12} />
                Bab selesai
              </span>
            ) : (
              <button
                type="button"
                onClick={() => completeChapter(chapter.id)}
                disabled={!allDone}
                className="btn-primary btn-sm"
                title={allDone ? 'Tandai bab selesai' : 'Tandai semua bagian selesai terlebih dahulu'}
              >
                <Icon name="check" width={14} height={14} />
                Tandai bab selesai
              </button>
            )}
          </div>
        </div>

        <div className="scroll-hide sticky top-14 z-20 flex gap-1 overflow-x-auto border-t border-line bg-surface/95 px-3 py-2 backdrop-blur lg:top-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setParams(t.id === 'materi' ? {} : { tab: t.id }, { replace: true })}
              className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            >
              <Icon name={t.icon} width={15} height={15} />
              {t.label}
              {t.id === 'kuis' && <span className="text-[10px] opacity-70">{chapter.quiz.length}</span>}
              {t.id === 'catatan' && noteContent.trim() && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
            </button>
          ))}
        </div>
      </header>

      {tab === 'materi' && (
        <div className="space-y-4">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon name="target" width={16} height={16} />
              </span>
              <h2 className="text-sm font-bold text-ink">Setelah bab ini kamu bisa…</h2>
            </div>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {chapter.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] leading-6 text-ink/85">
                  <Icon name="check" width={14} height={14} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {chapter.sections.length > 3 && (
            <div className="scroll-hide -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {chapter.sections.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(`sec-${s.id}`)}
                  className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-brand/30 hover:text-brand"
                >
                  {i + 1}. {s.title.replace(/\*\*|~|`/g, '')}
                </button>
              ))}
            </div>
          )}

          {chapter.sections.map((section, idx) => {
            const isDone = Boolean(state?.completed) || Boolean(state?.sections.includes(section.id))
            return (
              <section key={section.id} id={`sec-${section.id}`} className="card scroll-mt-28 overflow-hidden lg:scroll-mt-20">
                <div className="border-b border-line px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-raised text-[11px] font-bold text-muted ring-1 ring-line">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`tag ${
                        section.kind === 'core'
                          ? '!bg-brand/10 !text-brand !ring-brand/20'
                          : '!bg-teal-500/10 !text-teal-700 !ring-teal-500/20 dark:!text-teal-300'
                      }`}
                    >
                      {section.kind === 'core' ? 'Materi Inti' : 'Pengayaan'}
                    </span>
                    {isDone && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Icon name="checkCircle" width={12} height={12} />
                        selesai
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 font-serif text-xl font-semibold text-ink">
                    {section.title}
                  </h2>
                  {section.lead && (
                    <p className="mt-1.5 text-sm leading-6 text-muted">{section.lead}</p>
                  )}
                </div>

                <div className="space-y-4 px-4 py-4 sm:px-5">
                  {section.blocks.map((block, i) => (
                    <BlockRenderer key={i} block={block} />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-line bg-raised/30 px-4 py-2.5">
                  <p className="text-[11px] text-muted">
                    {isDone ? 'Bagian ini sudah kamu tandai selesai.' : 'Sudah paham bagian ini?'}
                  </p>
                  <button
                    type="button"
                    onClick={() => markSection(chapter.id, section.id, !isDone)}
                    className={isDone ? 'btn-ghost btn-sm' : 'btn-subtle btn-sm'}
                    disabled={Boolean(state?.completed)}
                  >
                    <Icon name={isDone ? 'checkCircle' : 'circle'} width={14} height={14} />
                    {isDone ? 'Batalkan tanda' : 'Tandai selesai'}
                  </button>
                </div>
              </section>
            )
          })}

          <div className="card overflow-hidden">
            <div className="border-b border-line bg-raised/50 px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Icon name="star" width={16} height={16} className="text-brand" />
                Poin penting bab {chapter.id}
              </h2>
            </div>
            <ul className="divide-y divide-line">
              {chapter.takeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 px-4 py-2.5 text-[13px] leading-6 text-ink/85">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted">Sumber: {chapter.source}</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset progres bab ini? Tanda selesai dan status bab akan dihapus.')) {
                  resetChapter(chapter.id)
                }
              }}
              className="text-[11px] font-semibold text-muted underline-offset-2 hover:text-brand hover:underline"
            >
              Reset progres bab
            </button>
          </div>
        </div>
      )}

      {tab === 'kosakata' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Kosakata bab {chapter.id}</h2>
            <p className="text-xs text-muted">Ketuk ikon speaker untuk mendengar pelafalan. Gunakan kolom cari untuk menyaring.</p>
          </div>
          <VocabTable items={chapter.vocab} title={`Kosakata ${chapter.title}`} />
          <div className="rounded-2xl border border-line bg-raised/50 p-4 text-xs leading-6 text-muted">
            <p className="font-bold text-ink">Cara memakai tabel ini</p>
            <p className="mt-1">
              Baca kata Turki, tutup artinya, lalu ucapkan dari ingatan. Setelah yakin, baru lihat kolom Indonesia.
              Ulangi 5 kata tersulit sebelum membuka flashcards.
            </p>
          </div>
        </div>
      )}

      {tab === 'flashcards' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Flashcards {chapter.title}</h2>
            <p className="text-xs text-muted">
              {chapter.flashcards.length} kartu dua arah Turki ↔ Indonesia. Tandai hafal untuk melihat progres.
            </p>
          </div>
          <Flashcards cards={chapter.flashcards} />
        </div>
      )}

      {tab === 'kuis' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-ink">Kuis bab {chapter.id}</h2>
              <p className="text-xs text-muted">
                {chapter.quiz.length} soal campuran: pilihan ganda, isi imbuhan, dan susun kalimat.
              </p>
            </div>
            {quizBest !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-[11px] font-bold text-brand">
                <Icon name="trophy" width={13} height={13} />
                Terbaik {quizBest}%
              </span>
            )}
          </div>
          <Quiz key={chapter.id} chapterId={chapter.id} questions={chapter.quiz} />
          <p className="text-center text-[11px] text-muted">
            Setiap percobaan disimpan di riwayat. Skor terbaik dipakai untuk badge bab.
          </p>
        </div>
      )}

      {tab === 'catatan' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Catatan bab {chapter.id}</h2>
            <p className="text-xs text-muted">Tulis rangkuman, kesalahan yang sering muncul, atau kosakata baru.</p>
          </div>
          <NotesEditor key={chapter.id} chapterId={chapter.id} chapterTitle={chapter.title} />
        </div>
      )}

      <nav className="grid gap-2 sm:grid-cols-2">
        {prev ? (
          <Link to={`/modul/${prev.slug}`} className="card flex items-center gap-3 p-3.5 transition hover:border-brand/30">
            <Icon name="arrowLeft" width={17} height={17} className="text-muted" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Sebelumnya</p>
              <p className="truncate text-xs font-bold text-ink">
                {prev.emoji} {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/modul/${next.slug}`}
            className="card flex items-center justify-end gap-3 p-3.5 text-right transition hover:border-brand/30"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                {next.bonus ? 'Bab bonus' : 'Berikutnya'}
              </p>
              <p className="truncate text-xs font-bold text-ink">
                {next.title} {next.emoji}
              </p>
            </div>
            <Icon name="arrowRight" width={17} height={17} className="text-muted" />
          </Link>
        ) : (
          <Link to="/modul" className="card flex items-center justify-center gap-2 p-3.5 text-xs font-bold text-brand">
            Selesai! Kembali ke semua modul
            <Icon name="arrowRight" width={15} height={15} />
          </Link>
        )}
      </nav>

      <p className="text-center text-[10px] text-muted">
        {chapters.length} bab · materi disusun ulang dari modul PDF Teuku Reski Nuari
      </p>
    </div>
  )
}
