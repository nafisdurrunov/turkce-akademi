import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  type Attempt,
  type UserData,
  emptyData,
  loadLocal,
  mergeData,
  pullRemote,
  pushRemote,
  saveLocal,
  uidOf,
  today,
} from '../lib/db'

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error' | 'offline'

interface StoreValue {
  ready: boolean
  user: User | null
  session: Session | null
  data: UserData
  sync: SyncStatus
  cloudEnabled: boolean
  lastSyncedAt: string | null
  markSection: (chapterId: string, sectionId: string, done: boolean) => void
  completeChapter: (chapterId: string) => void
  resetChapter: (chapterId: string) => void
  openChapter: (chapterId: string) => void
  submitQuiz: (chapterId: string, score: number, total: number) => void
  saveNote: (chapterId: string, content: string) => void
  logStudyDay: () => void
  signOut: () => Promise<void>
  syncNow: () => Promise<void>
  exportData: () => string
  importData: (json: string) => void
  wipeLocal: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [data, setData] = useState<UserData>(emptyData())
  const [sync, setSync] = useState<SyncStatus>(isSupabaseConfigured ? 'syncing' : 'local')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  const uidRef = useRef<string>('guest')
  const dataRef = useRef<UserData>(data)
  const timerRef = useRef<number | null>(null)
  const bootRef = useRef(false)

  const setDataSafe = useCallback((next: UserData) => {
    dataRef.current = next
    setData(next)
    saveLocal(uidRef.current, next)
  }, [])

  const flush = useCallback(async (uid: string) => {
    if (!supabase || uid === 'guest') {
      setSync(isSupabaseConfigured ? 'local' : 'local')
      return
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSync('offline')
      return
    }
    setSync('syncing')
    try {
      await pushRemote(uid, dataRef.current)
      setSync('synced')
      setLastSyncedAt(new Date().toISOString())
    } catch (e) {
      console.warn('[sync] gagal mengirim:', e)
      setSync('error')
    }
  }, [])

  const schedulePush = useCallback(
    (uid: string) => {
      if (!supabase || uid === 'guest') return
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        void flush(uid)
      }, 900)
    },
    [flush],
  )

  const hydrate = useCallback(
    async (nextUser: User | null) => {
      const uid = uidOf(nextUser?.id)
      uidRef.current = uid
      let local = loadLocal(uid)

      // Gabungkan progres tamu (localStorage "guest") saat pertama kali login.
      if (nextUser) {
        const guest = loadLocal('guest')
        const hasGuest = Object.keys(guest.chapters).length > 0 || Object.keys(guest.notes).length > 0
        if (hasGuest) local = mergeData(guest, local)
        try {
          const remote = await pullRemote(nextUser.id)
          if (remote) local = mergeData(local, remote)
        } catch (e) {
          console.warn('[sync] gagal memuat data cloud:', e)
          setSync('error')
        }
      }

      dataRef.current = local
      setData(local)
      saveLocal(uid, local)
      if (nextUser && supabase) {
        setSync('syncing')
        try {
          await pushRemote(nextUser.id, local)
          setSync('synced')
          setLastSyncedAt(new Date().toISOString())
        } catch (e) {
          console.warn('[sync] push awal gagal:', e)
          setSync('error')
        }
      } else {
        setSync('local')
      }
    },
    [],
  )

  useEffect(() => {
    let active = true
    const boot = async () => {
      if (supabase) {
        try {
          const { data: s } = await supabase.auth.getSession()
          if (!active) return
          setSession(s.session)
          setUser(s.session?.user ?? null)
          await hydrate(s.session?.user ?? null)
        } catch {
          await hydrate(null)
        }
      } else {
        await hydrate(null)
      }
      if (active) {
        setReady(true)
        bootRef.current = true
      }
    }
    void boot()

    const sub = supabase?.auth.onAuthStateChange((event, s) => {
      if (!active) return
      setSession(s)
      setUser(s?.user ?? null)
      if (event === 'SIGNED_OUT') {
        uidRef.current = 'guest'
        const local = loadLocal('guest')
        dataRef.current = local
        setData(local)
        setSync('local')
        return
      }
      if (!bootRef.current) return
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        const previousUid = uidRef.current
        if (previousUid !== uidOf(s?.user?.id)) void hydrate(s?.user ?? null)
      }
    })

    const onOnline = () => {
      if (uidRef.current !== 'guest') void flush(uidRef.current)
    }
    window.addEventListener('online', onOnline)

    return () => {
      active = false
      window.removeEventListener('online', onOnline)
      sub?.data.subscription.unsubscribe()
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [hydrate, flush])

  const mutate = useCallback(
    (fn: (draft: UserData) => UserData, opts?: { study?: boolean; push?: boolean }) => {
      const now = new Date().toISOString()
      let next = fn({ ...dataRef.current })
      next = { ...next, updatedAt: now }
      if (opts?.study !== false) {
        const t = today()
        if (!next.days.includes(t)) next = { ...next, days: [...next.days, t].sort() }
      }
      setDataSafe(next)
      if (opts?.push !== false) schedulePush(uidRef.current)
    },
    [schedulePush, setDataSafe],
  )

  const ensureChapter = (draft: UserData, chapterId: string) => {
    const now = new Date().toISOString()
    return (
      draft.chapters[chapterId] ?? {
        id: chapterId,
        completed: false,
        sections: [],
        lastOpenedAt: now,
        updatedAt: now,
      }
    )
  }

  const markSection = useCallback(
    (chapterId: string, sectionId: string, done: boolean) => {
      mutate((draft) => {
        const c = ensureChapter(draft, chapterId)
        const sections = done
          ? Array.from(new Set([...c.sections, sectionId]))
          : c.sections.filter((s) => s !== sectionId)
        return {
          ...draft,
          chapters: {
            ...draft.chapters,
            [chapterId]: { ...c, sections, updatedAt: new Date().toISOString() },
          },
        }
      })
    },
    [mutate],
  )

  const completeChapter = useCallback(
    (chapterId: string) => {
      mutate((draft) => {
        const c = ensureChapter(draft, chapterId)
        const now = new Date().toISOString()
        return {
          ...draft,
          lastChapter: chapterId,
          chapters: { ...draft.chapters, [chapterId]: { ...c, completed: true, updatedAt: now } },
        }
      })
    },
    [mutate],
  )

  const resetChapter = useCallback(
    (chapterId: string) => {
      mutate((draft) => {
        const c = ensureChapter(draft, chapterId)
        return {
          ...draft,
          chapters: {
            ...draft.chapters,
            [chapterId]: { ...c, completed: false, sections: [], updatedAt: new Date().toISOString() },
          },
        }
      }, { study: false })
    },
    [mutate],
  )

  const openChapter = useCallback(
    (chapterId: string) => {
      mutate((draft) => {
        const c = ensureChapter(draft, chapterId)
        return {
          ...draft,
          lastChapter: chapterId,
          chapters: {
            ...draft.chapters,
            [chapterId]: { ...c, lastOpenedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          },
        }
      })
    },
    [mutate],
  )

  const submitQuiz = useCallback(
    (chapterId: string, score: number, total: number) => {
      mutate((draft) => {
        const attempt: Attempt = {
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          chapterId,
          score,
          total,
          createdAt: new Date().toISOString(),
        }
        return { ...draft, attempts: [attempt, ...draft.attempts].slice(0, 300), lastChapter: chapterId }
      })
    },
    [mutate],
  )

  const saveNote = useCallback(
    (chapterId: string, content: string) => {
      mutate((draft) => ({
        ...draft,
        notes: {
          ...draft.notes,
          [chapterId]: { chapterId, content, updatedAt: new Date().toISOString() },
        },
      }))
    },
    [mutate],
  )

  const logStudyDay = useCallback(() => {
    mutate((draft) => draft)
  }, [mutate])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    uidRef.current = 'guest'
    const local = loadLocal('guest')
    dataRef.current = local
    setData(local)
    setSession(null)
    setUser(null)
    setSync('local')
  }, [])

  const syncNow = useCallback(async () => {
    await flush(uidRef.current)
  }, [flush])

  const exportData = useCallback(() => JSON.stringify(dataRef.current, null, 2), [])

  const importData = useCallback(
    (json: string) => {
      const parsed = JSON.parse(json) as UserData
      const merged = mergeData(dataRef.current, parsed)
      setDataSafe(merged)
      schedulePush(uidRef.current)
    },
    [schedulePush, setDataSafe],
  )

  const wipeLocal = useCallback(() => {
    const empty = emptyData()
    setDataSafe(empty)
    schedulePush(uidRef.current)
  }, [schedulePush, setDataSafe])

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      user,
      session,
      data,
      sync,
      cloudEnabled: isSupabaseConfigured,
      lastSyncedAt,
      markSection,
      completeChapter,
      resetChapter,
      openChapter,
      submitQuiz,
      saveNote,
      logStudyDay,
      signOut,
      syncNow,
      exportData,
      importData,
      wipeLocal,
    }),
    [
      ready,
      user,
      session,
      data,
      sync,
      lastSyncedAt,
      markSection,
      completeChapter,
      resetChapter,
      openChapter,
      submitQuiz,
      saveNote,
      logStudyDay,
      signOut,
      syncNow,
      exportData,
      importData,
      wipeLocal,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore harus dipakai di dalam <StoreProvider>')
  return ctx
}
