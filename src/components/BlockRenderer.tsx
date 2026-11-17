import { useState } from 'react'
import type { Block, Dialog } from '../content/types'
import { RichText } from './RichText'
import { TTSButton } from './TTSButton'
import { VocabTable } from './VocabTable'
import { Icon, type IconName } from './Icons'
import { speakSequence, stopSpeaking } from '../lib/tts'

const tipStyle: Record<string, { wrap: string; icon: string; iconName: IconName; label: string }> = {
  info: {
    wrap: 'border-teal-200 bg-teal-50/70 dark:border-teal-800/60 dark:bg-teal-900/20',
    icon: 'text-teal-700 dark:text-teal-300',
    iconName: 'info',
    label: 'Info',
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-900/20',
    icon: 'text-amber-700 dark:text-amber-300',
    iconName: 'warn',
    label: 'Hati-hati',
  },
  culture: {
    wrap: 'border-violet-200 bg-violet-50/70 dark:border-violet-800/60 dark:bg-violet-900/20',
    icon: 'text-violet-700 dark:text-violet-300',
    iconName: 'globe',
    label: 'Budaya',
  },
  memory: {
    wrap: 'border-brand/25 bg-brand/[0.04]',
    icon: 'text-brand',
    iconName: 'sparkles',
    label: 'Tips ingat',
  },
}

const calloutStyle: Record<string, { wrap: string; icon: string; iconName: IconName }> = {
  info: { wrap: 'border-line bg-raised', icon: 'text-teal-700 dark:text-teal-300', iconName: 'info' },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-900/20',
    icon: 'text-emerald-700 dark:text-emerald-300',
    iconName: 'checkCircle',
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-900/20',
    icon: 'text-amber-700 dark:text-amber-300',
    iconName: 'warn',
  },
}

function DialogBlock({ dialog }: { dialog: Dialog }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-raised/60 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-ink">{dialog.title}</p>
          {dialog.context && <p className="mt-0.5 text-xs text-muted">{dialog.context}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            if (playing) {
              stopSpeaking()
              setPlaying(false)
              return
            }
            speakSequence(dialog.lines.map((l) => l.tr))
            setPlaying(true)
            const chars = dialog.lines.reduce((n, l) => n + l.tr.length, 0)
            window.setTimeout(() => setPlaying(false), Math.min(120000, 1400 + chars * 85))
          }}
          className="btn-ghost btn-sm"
        >
          <Icon name={playing ? 'pause' : 'play'} width={14} height={14} />
          {playing ? 'Hentikan' : 'Putar dialog'}
        </button>
      </div>
      <ol className="divide-y divide-line">
        {dialog.lines.map((line, i) => (
          <li key={i} className="flex gap-3 px-4 py-3.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
              {line.who.slice(0, 1).toLocaleUpperCase('tr')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{line.who}</p>
                <TTSButton text={line.tr} label={line.tr} />
              </div>
              <p className="mt-1 text-[15px] font-medium leading-7 text-ink">
                <RichText text={line.tr} />
              </p>
              <p className="mt-0.5 text-sm leading-6 text-muted">
                <RichText text={line.id} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-[15px] leading-7 text-ink/90">
          <RichText text={block.text} />
        </p>
      )

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={`space-y-2 pl-5 ${
            block.ordered ? 'list-decimal marker:font-semibold marker:text-brand' : 'list-disc marker:text-brand'
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] leading-7 text-ink/90">
              <RichText text={item} />
            </li>
          ))}
        </Tag>
      )
    }

    case 'formula':
      return (
        <div className="overflow-hidden rounded-2xl border border-brand/25 bg-brand/[0.04]">
          <div className="flex flex-wrap items-center gap-2 border-b border-brand/15 px-4 py-2.5">
            <span className="chip !border-brand/25 !bg-brand/10 !text-brand">{block.label ?? 'Rumus'}</span>
            <span className="text-[11px] font-medium text-muted">hafalkan pola ini</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-base font-semibold leading-8 text-ink sm:text-lg">
              <RichText text={block.text} />
            </p>
            {block.pattern && (
              <p className="mt-3 overflow-x-auto rounded-xl bg-surface/80 px-3 py-2.5 font-mono text-[13px] leading-6 text-ink ring-1 ring-brand/15">
                {block.pattern}
              </p>
            )}
            {block.note && (
              <p className="mt-2.5 text-sm leading-6 text-muted">
                <RichText text={block.note} />
              </p>
            )}
          </div>
        </div>
      )

    case 'table':
      return (
        <div>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[440px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-raised">
                  {block.head.map((h, i) => (
                    <th key={i} className="whitespace-nowrap border-b border-line px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">
                      <RichText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className="odd:bg-surface even:bg-raised/40">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`border-b border-line/70 px-3.5 py-2.5 align-top leading-6 ${ci === 0 ? 'font-medium text-ink' : 'text-ink/85'}`}>
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <p className="mt-2 px-1 text-xs leading-5 text-muted">
              <RichText text={block.caption} />
            </p>
          )}
        </div>
      )

    case 'examples':
      return (
        <div className="overflow-hidden rounded-2xl border border-line">
          {block.title && (
            <p className="border-b border-line bg-raised/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">
              {block.title}
            </p>
          )}
          <ul className="divide-y divide-line">
            {block.items.map((ex, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-medium leading-7 text-ink">
                      <RichText text={ex.tr} />
                    </p>
                    <TTSButton text={ex.tr} label={ex.tr} />
                  </div>
                  <p className="mt-0.5 text-sm leading-6 text-muted">
                    <RichText text={ex.id} />
                  </p>
                  {ex.note && (
                    <p className="mt-1 text-xs leading-5 text-muted/90">
                      <RichText text={ex.note} />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {block.caption && (
            <p className="border-t border-line px-4 py-2.5 text-xs leading-5 text-muted">
              <RichText text={block.caption} />
            </p>
          )}
        </div>
      )

    case 'vocab':
      return <VocabTable items={block.items} title={block.title} />

    case 'colors':
      return (
        <div>
          {block.title && <p className="mb-2 text-sm font-bold text-ink">{block.title}</p>}
          <div className="flex flex-wrap gap-2.5">
            {block.items.map((c) => (
              <div key={c.tr} className="card-flat flex items-center gap-2.5 px-3 py-2">
                <span className="h-7 w-7 rounded-lg ring-1 ring-black/10" style={{ background: c.hex }} />
                <span>
                  <span className="block text-sm font-semibold text-ink">{c.tr}</span>
                  <span className="block text-xs text-muted">{c.id}</span>
                </span>
                <TTSButton text={c.tr} label={c.tr} />
              </div>
            ))}
          </div>
        </div>
      )

    case 'dialog':
      return <DialogBlock dialog={block.dialog} />

    case 'tip': {
      const s = tipStyle[block.tone ?? 'info'] ?? tipStyle.info
      return (
        <div className={`rounded-2xl border p-4 ${s.wrap}`}>
          <div className="flex items-center gap-2">
            <Icon name={s.iconName} width={16} height={16} className={s.icon} />
            <p className={`text-sm font-bold ${s.icon}`}>{block.title}</p>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-ink/85">
            <RichText text={block.text} />
          </p>
        </div>
      )
    }

    case 'callout': {
      const s = calloutStyle[block.tone ?? 'info'] ?? calloutStyle.info
      return (
        <div className={`rounded-2xl border p-4 ${s.wrap}`}>
          <div className="flex items-center gap-2">
            <Icon name={s.iconName} width={16} height={16} className={s.icon} />
            <p className="text-sm font-bold text-ink">{block.title}</p>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-ink/85">
            <RichText text={block.text} />
          </p>
        </div>
      )
    }

    default:
      return null
  }
}
