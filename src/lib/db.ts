import { supabase } from './supabase'
import { dayKey } from './date'

export interface ChapterState {
  id: string
  completed: boolean
  sections: string[]
  lastOpenedAt: string
  updatedAt: string
}

export interface Attempt {
  id: string
  chapterId: string
  score: number
  total: number
  createdAt: string
}

export interface NoteState {
  chapterId: string
  content: string
  updatedAt: string
}

export interface UserData {
  chapters: Record<string, ChapterState>
  attempts: Attempt[]
  notes: Record<string, NoteState>
  days: string[]
  lastChapter?: string
  updatedAt: string
}

export const emptyData = (): UserData => ({
  chapters: {},
  attempts: [],
  notes: {},
  days: [],
  updatedAt: new Date().toISOString(),
})

const STORAGE_PREFIX = 'ta:data:v1:'
const storageKey = (uid: string) => `${STORAGE_PREFIX}${uid}`

export function uidOf(userId: string | null | undefined): string {
  return userId || 'guest'
}

export function loadLocal(uid: string): UserData {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<UserData>
    return {
      chapters: parsed.chapters ?? {},
      attempts: parsed.attempts ?? [],
      notes: parsed.notes ?? {},
      days: Array.isArray(parsed.days) ? parsed.days : [],
      lastChapter: parsed.lastChapter,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return emptyData()
  }
}

export function saveLocal(uid: string, data: UserData) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(data))
  } catch {
    /* storage penuh / private mode — abaikan, data tetap ada di memori */
  }
}

/** union & last-write-wins, dipakai saat login (gabungkan progres tamu) dan saat pull dari cloud. */
export function mergeData(a: UserData, b: UserData): UserData {
  const chapters: Record<string, ChapterState> = { ...a.chapters }
  for (const [id, cb] of Object.entries(b.chapters)) {
    const ca = chapters[id]
    if (!ca) {
      chapters[id] = cb
      continue
    }
    const newer = new Date(cb.updatedAt).getTime() >= new Date(ca.updatedAt).getTime() ? cb : ca
    chapters[id] = {
      ...newer,
      sections: Array.from(new Set([...ca.sections, ...cb.sections])),
      completed: ca.completed || cb.completed,
      lastOpenedAt:
        new Date(ca.lastOpenedAt).getTime() > new Date(cb.lastOpenedAt).getTime() ? ca.lastOpenedAt : cb.lastOpenedAt,
    }
  }

  const attemptsById = new Map<string, Attempt>()
  for (const at of [...a.attempts, ...b.attempts]) attemptsById.set(at.id, at)

  const notes: Record<string, NoteState> = { ...a.notes }
  for (const [id, nb] of Object.entries(b.notes)) {
    const na = notes[id]
    notes[id] =
      !na || new Date(nb.updatedAt).getTime() >= new Date(na.updatedAt).getTime() ? nb : na
  }

  const lastA = a.lastChapter ? new Date(a.chapters[a.lastChapter]?.lastOpenedAt ?? 0).getTime() : 0
  const lastB = b.lastChapter ? new Date(b.chapters[b.lastChapter]?.lastOpenedAt ?? 0).getTime() : 0

  return {
    chapters,
    attempts: Array.from(attemptsById.values()).sort((x, y) => y.createdAt.localeCompare(x.createdAt)),
    notes,
    days: Array.from(new Set([...a.days, ...b.days])).sort(),
    lastChapter: lastA >= lastB ? a.lastChapter : b.lastChapter,
    updatedAt: new Date().toISOString(),
  }
}

/* ------------------------------- SUPABASE SYNC ------------------------------ */

export async function pullRemote(userId: string): Promise<UserData | null> {
  if (!supabase) return null
  const client = supabase
  const [progress, attempts, notes, days, profile] = await Promise.all([
    client.from('chapter_progress').select('*').eq('user_id', userId),
    client.from('quiz_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(300),
    client.from('notes').select('*').eq('user_id', userId),
    client.from('study_days').select('day').eq('user_id', userId),
    client.from('profiles').select('last_chapter').eq('id', userId).maybeSingle(),
  ])

  const err = progress.error || attempts.error || notes.error || days.error
  if (err) throw new Error(err.message)

  const data = emptyData()
  for (const row of progress.data ?? []) {
    data.chapters[row.chapter_id] = {
      id: row.chapter_id,
      completed: Boolean(row.completed),
      sections: Array.isArray(row.sections) ? row.sections : [],
      lastOpenedAt: row.last_opened_at ?? row.updated_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? new Date().toISOString(),
    }
  }
  for (const row of attempts.data ?? []) {
    data.attempts.push({
      id: row.id,
      chapterId: row.chapter_id,
      score: row.score,
      total: row.total,
      createdAt: row.created_at,
    })
  }
  for (const row of notes.data ?? []) {
    data.notes[row.chapter_id] = {
      chapterId: row.chapter_id,
      content: row.content ?? '',
      updatedAt: row.updated_at ?? new Date().toISOString(),
    }
  }
  data.days = (days.data ?? []).map((r: { day: string }) => r.day)
  if (profile.data?.last_chapter) data.lastChapter = profile.data.last_chapter
  return data
}

export async function pushRemote(userId: string, data: UserData): Promise<void> {
  if (!supabase) return
  const client = supabase
  const now = new Date().toISOString()

  const chapterRows = Object.values(data.chapters).map((c) => ({
    user_id: userId,
    chapter_id: c.id,
    completed: c.completed,
    sections: c.sections,
    last_opened_at: c.lastOpenedAt,
    updated_at: c.updatedAt,
  }))

  const noteRows = Object.values(data.notes).map((n) => ({
    user_id: userId,
    chapter_id: n.chapterId,
    content: n.content,
    updated_at: n.updatedAt,
  }))

  const attemptRows = data.attempts.slice(0, 300).map((a) => ({
    id: a.id,
    user_id: userId,
    chapter_id: a.chapterId,
    score: a.score,
    total: a.total,
    created_at: a.createdAt,
  }))

  const dayRows = data.days.map((d) => ({ user_id: userId, day: d }))

  const results = await Promise.all([
    chapterRows.length
      ? client.from('chapter_progress').upsert(chapterRows, { onConflict: 'user_id,chapter_id' })
      : Promise.resolve({ error: null }),
    noteRows.length
      ? client.from('notes').upsert(noteRows, { onConflict: 'user_id,chapter_id' })
      : Promise.resolve({ error: null }),
    attemptRows.length
      ? client.from('quiz_attempts').upsert(attemptRows, { onConflict: 'id', ignoreDuplicates: true })
      : Promise.resolve({ error: null }),
    dayRows.length
      ? client.from('study_days').upsert(dayRows, { onConflict: 'user_id,day', ignoreDuplicates: true })
      : Promise.resolve({ error: null }),
    client.from('profiles').upsert(
      { id: userId, last_chapter: data.lastChapter ?? null, updated_at: now },
      { onConflict: 'id' },
    ),
  ])

  const error = results.map((r) => (r as { error: { message: string } | null }).error).find(Boolean)
  if (error) throw new Error(error.message)
}

export function today(): string {
  return dayKey()
}
