import type { Chapter } from './types'
import { chapter01 } from './ch01'
import { chapter02 } from './ch02'
import { chapter03 } from './ch03'
import { chapter04 } from './ch04'
import { chapter05 } from './ch05'
import { chapter06 } from './ch06'
import { chapter07 } from './ch07'
import { chapter08 } from './ch08'
import { chapter09 } from './ch09'
import { chapter10 } from './ch10'
import { chapter11 } from './ch11'
import { chapter12 } from './ch12'
import { chapter13 } from './ch13'
import { chapter14 } from './ch14'
import { chapter15 } from './ch15'
import { chapter16 } from './ch16'
import { chapter17 } from './ch17'
import { chapter18 } from './ch18'
import { chapter19 } from './ch19'
import { chapter20 } from './ch20'

/** Semua bab inti (PDF 1–19) + bab bonus 20, dalam urutan silabus. */
export const chapters: Chapter[] = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10,
  chapter11,
  chapter12,
  chapter13,
  chapter14,
  chapter15,
  chapter16,
  chapter17,
  chapter18,
  chapter19,
  chapter20,
]

export const coreChapters = chapters.filter((c) => !c.bonus)
export const bonusChapters = chapters.filter((c) => c.bonus)

export function chapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug)
}

export function chapterById(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id)
}

export function nextChapter(chapter: Chapter): Chapter | undefined {
  const i = chapters.findIndex((c) => c.id === chapter.id)
  return i >= 0 ? chapters[i + 1] : undefined
}

export function prevChapter(chapter: Chapter): Chapter | undefined {
  const i = chapters.findIndex((c) => c.id === chapter.id)
  return i > 0 ? chapters[i - 1] : undefined
}

export const stats = {
  chapters: chapters.length,
  core: coreChapters.length,
  bonus: bonusChapters.length,
  sections: chapters.reduce((n, c) => n + c.sections.length, 0),
  vocab: chapters.reduce((n, c) => n + c.vocab.length, 0),
  flashcards: chapters.reduce((n, c) => n + c.flashcards.length, 0),
  quiz: chapters.reduce((n, c) => n + c.quiz.length, 0),
  minutes: chapters.reduce((n, c) => n + c.minutes, 0),
}
