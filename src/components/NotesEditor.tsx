import { useEffect, useRef, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { formatDate } from '../lib/date'
import { TrKeyboard } from './TrKeyboard'
import { Icon } from './Icons'

export function NotesEditor({ chapterId, chapterTitle }: { chapterId: string; chapterTitle: string }) {
  const { data, saveNote, sync, cloudEnabled } = useStore()
  const stored = data.notes[chapterId]?.content ?? ''
  const [value, setValue] = useState(stored)
  const [savedAt, setSavedAt] = useState<string | null>(data.notes[chapterId]?.updatedAt ?? null)
  const [kbd, setKbd] = useState(false)
  const [saving, setSaving] = useState(false)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const first = useRef(true)

  useEffect(() => {
    setValue(stored)
    setSavedAt(data.notes[chapterId]?.updatedAt ?? null)
    first.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (value === (data.notes[chapterId]?.content ?? '')) return
    setSaving(true)
    const t = window.setTimeout(() => {
      saveNote(chapterId, value)
      setSavedAt(new Date().toISOString())
      setSaving(false)
    }, 700)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, chapterId])

  const insert = (ch: string) => {
    const el = areaRef.current
    if (!el) {
      setValue((v) => v + ch)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const nextVal = value.slice(0, start) + ch + value.slice(end)
    setValue(nextVal)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + ch.length, start + ch.length)
    })
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon name="note" width={16} height={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Catatan pribadi</p>
            <p className="text-[11px] text-muted">{chapterTitle}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            saving
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${saving ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {saving ? 'Menyimpan…' : 'Tersimpan otomatis'}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (value !== (data.notes[chapterId]?.content ?? '')) {
              saveNote(chapterId, value)
              setSavedAt(new Date().toISOString())
            }
          }}
          rows={12}
          placeholder={'Tulis catatanmu di sini…\n\nContoh:\n- imbuhan -DAn: dari / karena\n- kesalahan yang sering aku buat:\n- kosakata baru hari ini:'}
          className="input min-h-[240px] resize-y leading-7"
          spellCheck={false}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <TrKeyboard onKey={insert} open={kbd} onToggle={() => setKbd((k) => !k)} />
          <p className="text-[11px] text-muted">
            {words} kata · {value.length} karakter
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-[11px] leading-5 text-muted">
            {cloudEnabled
              ? sync === 'synced'
                ? 'Tersimpan di perangkat dan cloud.'
                : sync === 'offline'
                  ? 'Offline — catatan akan disinkronkan saat internet kembali.'
                  : 'Tersimpan di perangkat, menunggu sinkronisasi cloud.'
              : 'Mode lokal: catatan tersimpan di perangkat ini. Masuk untuk sinkron ke cloud.'}
            {savedAt ? ` Terakhir: ${formatDate(savedAt, true)}.` : ''}
          </p>
          <button
            type="button"
            onClick={() => {
              saveNote(chapterId, value)
              setSavedAt(new Date().toISOString())
            }}
            className="btn-subtle btn-sm"
          >
            Simpan sekarang
          </button>
        </div>
      </div>
    </div>
  )
}
