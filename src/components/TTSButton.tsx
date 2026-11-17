import { useEffect, useRef, useState } from 'react'
import { speak, ttsSupported } from '../lib/tts'
import { Icon } from './Icons'

interface Props {
  text: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

/** Tombol speaker untuk pelafalan Bahasa Turki. */
export function TTSButton({ text, size = 'sm', label, className = '' }: Props) {
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  if (!ttsSupported()) return null

  const dims = size === 'lg' ? 'h-11 w-11' : size === 'md' ? 'h-9 w-9' : 'h-7 w-7'
  const icon = size === 'lg' ? 20 : size === 'md' ? 17 : 15

  return (
    <button
      type="button"
      aria-label={label ? `Dengarkan: ${label}` : 'Dengarkan pelafalan'}
      title={label ? `Dengarkan: ${label}` : 'Dengarkan pelafalan (tr-TR)'}
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
        setPlaying(true)
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setPlaying(false), Math.min(6000, 900 + text.length * 90))
      }}
      className={`inline-flex ${dims} shrink-0 items-center justify-center rounded-full border transition ${
        playing
          ? 'border-brand/40 bg-brand/10 text-brand'
          : 'border-line bg-surface text-muted hover:border-brand/40 hover:text-brand'
      } ${className}`}
    >
      <Icon name="volume" width={icon} height={icon} className={playing ? 'animate-pulse' : ''} />
    </button>
  )
}

/** Teks Turki + tombol speaker inline. */
export function Speakable({
  text,
  className = '',
  size = 'sm',
  as = 'span',
}: {
  text: string
  className?: string
  size?: 'sm' | 'md'
  as?: 'span' | 'p' | 'div'
}) {
  const Cmp = as
  return (
    <Cmp className={`inline-flex items-center gap-1.5 ${className}`}>
      <span>{text}</span>
      <TTSButton text={text} size={size} label={text} />
    </Cmp>
  )
}
