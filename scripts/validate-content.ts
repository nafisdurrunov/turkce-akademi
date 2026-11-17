/**
 * Pemeriksa isi materi. Jalankan:
 *   npm run validate
 *
 * Memastikan semua bab lengkap dan konsisten sebelum build/deploy:
 * - id/slug unik, jumlah bagian & kosakata wajar
 * - setiap kuis punya jawaban yang valid (indeks MCQ, isian, urutan)
 * - tidak ada id bagian ganda
 * - markup ringan (~ ** ` _) seimbang
 */
import { chapters } from '../src/content'
import type { Block } from '../src/content/types'

type Issue = { level: 'error' | 'warn'; chapter: string; message: string }

const issues: Issue[] = []
const err = (chapter: string, message: string) => issues.push({ level: 'error', chapter, message })
const warn = (chapter: string, message: string) => issues.push({ level: 'warn', chapter, message })

const ids = new Set<string>()
const slugs = new Set<string>()

const strip = (s: string) => s.replace(/~([^~]+)~/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/_([^_]+)_/g, '$1')

function checkMarkup(chapter: string, where: string, text: string) {
  const pairs: [string, RegExp][] = [
    ['~', /~/g],
    ['**', /\*\*/g],
    ['`', /`/g],
  ]
  for (const [name, re] of pairs) {
    const count = (text.match(re) ?? []).length
    if (count % 2 !== 0) err(chapter, `${where}: markup ${name} tidak seimbang`)
  }
  if (/[{}]/.test(text)) warn(chapter, `${where}: mengandung kurung kurawal`)
  if (text.includes('  ')) warn(chapter, `${where}: spasi ganda`)
}

function checkBlocks(chapter: string, section: string, blocks: Block[]) {
  for (const [i, b] of blocks.entries()) {
    const at = `${section} blok ${i + 1} (${b.type})`
    if ('text' in b && typeof b.text === 'string') checkMarkup(chapter, at, b.text)
    if (b.type === 'p') {
      if (!b.text.trim()) err(chapter, `${at}: kosong`)
    }
    if (b.type === 'formula' && !b.text.trim()) err(chapter, `${at}: rumus tanpa teks`)
    if (b.type === 'table') {
      for (const [ri, row] of b.rows.entries()) {
        if (row.length !== b.head.length) err(chapter, `${at}: baris ${ri + 1} punya ${row.length} sel, header ${b.head.length}`)
        for (const cell of row) checkMarkup(chapter, at, cell)
      }
      for (const h of b.head) checkMarkup(chapter, at, h)
    }
    if (b.type === 'examples') {
      if (!b.items.length) err(chapter, `${at}: tanpa contoh`)
      for (const ex of b.items) {
        if (!ex.tr.trim() || !ex.id.trim()) err(chapter, `${at}: contoh tanpa terjemahan`)
        checkMarkup(chapter, at, ex.tr)
        checkMarkup(chapter, at, ex.id)
      }
      if (b.caption) checkMarkup(chapter, at, b.caption)
    }
    if (b.type === 'vocab') {
      for (const v of b.items) {
        if (!v.tr.trim() || !v.id.trim()) err(chapter, `${at}: kosakata tanpa pasangan`)
      }
    }
    if (b.type === 'dialog') {
      if (b.dialog.lines.length < 2) err(chapter, `${at}: dialog terlalu pendek`)
      for (const line of b.dialog.lines) {
        if (!line.who.trim() || !line.tr.trim() || !line.id.trim()) err(chapter, `${at}: baris dialog tidak lengkap`)
        checkMarkup(chapter, at, line.tr)
        checkMarkup(chapter, at, line.id)
      }
    }
    if (b.type === 'tip' || b.type === 'callout') {
      if (!b.title.trim() || !b.text.trim()) err(chapter, `${at}: judul/teks kosong`)
    }
    if (b.type === 'list') {
      if (!b.items.length) err(chapter, `${at}: daftar kosong`)
      for (const item of b.items) checkMarkup(chapter, at, item)
    }
    if (b.type === 'colors') {
      for (const c of b.items) {
        if (!/^#[0-9a-fA-F]{6}$/.test(c.hex)) err(chapter, `${at}: hex warna tidak valid (${c.hex})`)
      }
    }
  }
}

for (const ch of chapters) {
  const label = `Bab ${ch.id}`
  if (ids.has(ch.id)) err(label, 'id bab ganda')
  if (slugs.has(ch.slug)) err(label, 'slug ganda')
  ids.add(ch.id)
  slugs.add(ch.slug)

  if (ch.id !== String(ch.number).padStart(2, '0')) err(label, 'id tidak sama dengan nomor')
  if (ch.quiz.length < 7 || ch.quiz.length > 10) err(label, `jumlah kuis ${ch.quiz.length} (harus 7–10)`)
  if (ch.flashcards.length < 8) warn(label, `flashcard hanya ${ch.flashcards.length}`)
  if (ch.vocab.length < 15) warn(label, `kosakata hanya ${ch.vocab.length}`)
  if (ch.objectives.length < 3) warn(label, 'tujuan belajar < 3')
  if (ch.takeaways.length < 3) warn(label, 'poin penting < 3')

  const kinds = new Set(ch.sections.map((s) => s.kind))
  if (!kinds.has('core')) err(label, 'tidak ada bagian Materi Inti')
  if (!kinds.has('enrich')) warn(label, 'tidak ada bagian Pengayaan')

  const sectionIds = new Set<string>()
  let dialogs = 0
  for (const s of ch.sections) {
    if (sectionIds.has(s.id)) err(label, `id bagian ganda: ${s.id}`)
    sectionIds.add(s.id)
    if (!s.title.trim()) err(label, `bagian ${s.id} tanpa judul`)
    if (s.lead) checkMarkup(label, `bagian ${s.id} lead`, s.lead)
    checkBlocks(label, s.id, s.blocks)
    for (const b of s.blocks) if (b.type === 'dialog') dialogs++
  }
  if (dialogs < 1) warn(label, 'belum ada dialog')

  const flashFront = new Set<string>()
  for (const f of ch.flashcards) {
    if (!f.front.trim() || !f.back.trim()) err(label, 'flashcard kosong')
    if (flashFront.has(f.front)) warn(label, `flashcard depan ganda: ${f.front}`)
    flashFront.add(f.front)
  }

  for (const [qi, q] of ch.quiz.entries()) {
    const at = `kuis ${qi + 1}`
    checkMarkup(label, at, q.q)
    checkMarkup(label, at, q.explain)
    if (q.type === 'mcq') {
      if (q.options.length < 3) err(label, `${at}: pilihan < 3`)
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
        err(label, `${at}: indeks jawaban ${q.answer} di luar jangkauan`)
      const seen = new Set(q.options.map((o) => strip(o).trim()))
      if (seen.size !== q.options.length) err(label, `${at}: opsi ganda`)
    } else if (q.type === 'fill') {
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer]
      if (!answers.length || answers.some((a) => !a.trim())) err(label, `${at}: jawaban isian kosong`)
    } else {
      if (q.answer.length < 2) err(label, `${at}: jawaban urutan terlalu pendek`)
      if (new Set(q.answer).size !== q.answer.length) warn(label, `${at}: ada kata berulang di jawaban urutan`)
    }
  }
}

const errors = issues.filter((i) => i.level === 'error')
const warns = issues.filter((i) => i.level === 'warn')

const totals = {
  bab: chapters.length,
  bagian: chapters.reduce((n, c) => n + c.sections.length, 0),
  dialog: chapters.reduce(
    (n, c) => n + c.sections.reduce((m, s) => m + s.blocks.filter((b) => b.type === 'dialog').length, 0),
    0,
  ),
  kosakata: chapters.reduce((n, c) => n + c.vocab.length, 0),
  flashcard: chapters.reduce((n, c) => n + c.flashcards.length, 0),
  kuis: chapters.reduce((n, c) => n + c.quiz.length, 0),
}

console.log('Ringkasan isi:', totals)
for (const i of issues) console.log(`${i.level === 'error' ? '✗' : '!'} [${i.chapter}] ${i.message}`)
console.log(`\n${errors.length} error, ${warns.length} peringatan.`)

if (errors.length) process.exit(1)
