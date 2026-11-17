/**
 * Tipe data materi ajar.
 *
 * Materi ditulis dengan markup ringan agar penulisan konten tetap ringkas:
 *   ~teks~     -> imbuhan / pola yang di-highlight (warna brand)
 *   **teks**   -> tebal
 *   `teks`     -> kata Turki (chip monospace)
 *   _teks_     -> miring
 */
export type Text = string

export interface Example {
  tr: Text
  id: Text
  note?: Text
}

export interface VocabItem {
  tr: string
  id: string
  note?: string
  /** opsional: kata yang dibaca TTS, mis. "değil" untuk entri "değil (değilim)" */
  say?: string
}

export interface DialogLine {
  who: string
  tr: Text
  id: Text
}

export interface Dialog {
  title: string
  context?: string
  lines: DialogLine[]
}

export type Block =
  | { type: 'p'; text: Text }
  | { type: 'list'; items: Text[]; ordered?: boolean }
  | { type: 'formula'; label?: string; text: Text; note?: Text; pattern?: string }
  | { type: 'table'; head: string[]; rows: Text[][]; caption?: Text }
  | { type: 'examples'; title?: string; items: Example[]; caption?: Text }
  | { type: 'vocab'; title?: string; items: VocabItem[] }
  | { type: 'colors'; title?: string; items: { tr: string; id: string; hex: string }[] }
  | { type: 'dialog'; dialog: Dialog }
  | { type: 'tip'; title: string; text: Text; tone?: 'info' | 'warning' | 'culture' | 'memory' }
  | { type: 'callout'; title: string; text: Text; tone?: 'info' | 'success' | 'warning' }

export interface Section {
  id: string
  kind: 'core' | 'enrich'
  title: string
  lead?: Text
  blocks: Block[]
}

export type Question =
  | {
      type: 'mcq'
      q: Text
      options: string[]
      answer: number
      explain: Text
    }
  | {
      type: 'fill'
      q: Text
      /** jawaban diterima (case-insensitive, di-trim) */
      answer: string | string[]
      explain: Text
      hint?: string
      placeholder?: string
    }
  | {
      type: 'order'
      q: Text
      /** kata dalam urutan yang benar */
      answer: string[]
      explain: Text
    }

export interface Flashcard {
  front: string
  back: string
  hint?: string
}

export interface Chapter {
  /** dua digit, mis. "01" */
  id: string
  number: number
  slug: string
  title: string
  titleTr: string
  summary: string
  /** emoji sebagai ikon ringan (tanpa aset tambahan) */
  emoji: string
  level: 'Pemula' | 'Pemula+'
  minutes: number
  objectives: string[]
  sections: Section[]
  vocab: VocabItem[]
  flashcards: Flashcard[]
  quiz: Question[]
  takeaways: string[]
  /** nama file PDF sumber */
  source: string
  bonus?: boolean
}
