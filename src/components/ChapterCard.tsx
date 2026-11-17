import { Link } from 'react-router-dom'
import type { Chapter } from '../content/types'
import type { UserData } from '../lib/db'
import { bestQuiz, chapterPct, sectionsDone } from '../lib/progress'
import { ProgressBar } from './Progress'
import { Icon } from './Icons'

export function ChapterCard({
  chapter,
  state,
  attempts,
  compact = false,
}: {
  chapter: Chapter
  state?: UserData['chapters'][string]
  attempts?: UserData['attempts']
  compact?: boolean
}) {
  const pct = chapterPct(chapter, state)
  const done = sectionsDone(chapter, state)
  const quiz = attempts ? bestQuiz(attempts, chapter.id) : null
  const finished = pct >= 100

  return (
    <Link
      to={`/modul/${chapter.slug}`}
      className="group card relative flex flex-col overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-raised text-xl ring-1 ring-line">
          {chapter.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Bab {chapter.id}</span>
            {chapter.bonus && (
              <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">Bonus</span>
            )}
            {finished && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Icon name="checkCircle" width={12} height={12} />
                Selesai
              </span>
            )}
          </div>
          <h3 className="mt-0.5 truncate text-[15px] font-bold leading-tight text-ink group-hover:text-brand">
            {chapter.title}
          </h3>
          <p className="truncate text-[11px] font-medium italic text-muted">{chapter.titleTr}</p>
        </div>
      </div>

      {!compact && <p className="mt-2.5 line-clamp-2 text-xs leading-5 text-muted">{chapter.summary}</p>}

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-muted">
          <span>
            {done}/{chapter.sections.length} bagian
          </span>
          <span>{pct}%</span>
        </div>
        <ProgressBar value={pct} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-muted">
        <span className="inline-flex items-center gap-1">
          <Icon name="clock" width={11} height={11} />
          {chapter.minutes} mnt
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="layers" width={11} height={11} />
          {chapter.vocab.length} kata
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="quiz" width={11} height={11} />
          {chapter.quiz.length} soal
        </span>
        {quiz !== null && (
          <span className="ml-auto inline-flex items-center gap-1 font-bold text-brand">
            <Icon name="trophy" width={11} height={11} />
            {quiz}%
          </span>
        )}
      </div>
    </Link>
  )
}
