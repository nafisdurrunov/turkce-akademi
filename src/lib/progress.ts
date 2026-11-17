import type { Chapter } from '../content/types'
import type { Attempt, UserData } from './db'

/** Persentase penyelesaian satu bab berdasarkan bagian yang ditandai selesai. */
export function chapterPct(chapter: Chapter, state: UserData['chapters'][string] | undefined): number {
  if (!state) return 0
  if (state.completed) return 100
  const valid = new Set(chapter.sections.map((s) => s.id))
  const done = state.sections.filter((s) => valid.has(s)).length
  if (!chapter.sections.length) return 0
  return Math.round((done / chapter.sections.length) * 100)
}

export function sectionsDone(chapter: Chapter, state: UserData['chapters'][string] | undefined): number {
  if (!state) return 0
  if (state.completed) return chapter.sections.length
  const valid = new Set(chapter.sections.map((s) => s.id))
  return state.sections.filter((s) => valid.has(s)).length
}

/** Progres keseluruhan: total bagian selesai dibagi total bagian semua bab. */
export function overallPct(chapters: Chapter[], data: UserData): number {
  let total = 0
  let done = 0
  for (const c of chapters) {
    total += c.sections.length
    done += Math.min(c.sections.length, sectionsDone(c, data.chapters[c.id]))
  }
  return total ? Math.round((done / total) * 100) : 0
}

/** Skor kuis terbaik per bab (0–100), atau null jika belum pernah. */
export function bestQuiz(attempts: Attempt[], chapterId: string): number | null {
  const mine = attempts.filter((a) => a.chapterId === chapterId)
  if (!mine.length) return null
  const best = Math.max(...mine.map((a) => (a.total ? a.score / a.total : 0)))
  return Math.round(best * 100)
}

export function quizAverage(chapters: Chapter[], data: UserData): number | null {
  if (!data.attempts.length) return null
  const sum = data.attempts.reduce((n, a) => n + (a.total ? a.score / a.total : 0), 0)
  return Math.round((sum / data.attempts.length) * 100)
}

export function completedCount(chapters: Chapter[], data: UserData): number {
  return chapters.filter((c) => data.chapters[c.id]?.completed || chapterPct(c, data.chapters[c.id]) === 100).length
}

/** Bab yang terakhir dibuka, atau bab pertama yang belum selesai. */
export function continueChapter(chapters: Chapter[], data: UserData): Chapter {
  const last = data.lastChapter ? chapters.find((c) => c.id === data.lastChapter) : undefined
  if (last && chapterPct(last, data.chapters[last.id]) < 100) return last
  const next = chapters.find((c) => chapterPct(c, data.chapters[c.id]) < 100)
  return next ?? last ?? chapters[0]
}

export function startedCount(chapters: Chapter[], data: UserData): number {
  return chapters.filter((c) => {
    const s = data.chapters[c.id]
    return s && (s.completed || s.sections.length > 0)
  }).length
}
