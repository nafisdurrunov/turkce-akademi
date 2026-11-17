import { Fragment, type ReactNode } from 'react'

/**
 * Renderer markup ringan:
 *  ~suffix~  -> highlight imbuhan
 *  **bold**  -> tebal
 *  `kata`    -> chip kata Turki
 *  _italic_  -> miring
 */
const TOKEN = /(\*\*[^*]+\*\*|~[^~]+~|`[^`]+`|_[^_]+_)/g

export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index ?? 0
    if (idx > last) nodes.push(<Fragment key={key++}>{text.slice(last, idx)}</Fragment>)
    const token = m[0]
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('~')) {
      nodes.push(
        <span key={key++} className="hl-suffix">
          {token.slice(1, -1)}
        </span>,
      )
    } else if (token.startsWith('`')) {
      nodes.push(
        <span
          key={key++}
          className="rounded-md bg-raised px-1.5 py-0.5 font-medium text-ink ring-1 ring-line"
          style={{ fontFeatureSettings: "'ss01'" }}
        >
          {token.slice(1, -1)}
        </span>,
      )
    } else {
      nodes.push(
        <em key={key++} className="italic text-ink/80">
          {token.slice(1, -1)}
        </em>,
      )
    }
    last = idx + token.length
  }
  if (last < text.length) nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return nodes
}

export function RichText({ text, className = '' }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text)}</span>
}
