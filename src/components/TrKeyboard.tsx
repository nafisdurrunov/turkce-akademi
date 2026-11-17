import { Icon } from './Icons'

const KEYS = ['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü', 'â', 'î', 'û']

/** Keyboard bantu untuk karakter Turki. Menyisipkan huruf di posisi kursor input. */
export function TrKeyboard({
  onKey,
  open,
  onToggle,
}: {
  onKey: (ch: string) => void
  open: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`btn-ghost btn-sm ${open ? '!border-brand/40 !text-brand' : ''}`}
        aria-expanded={open}
      >
        <Icon name="keyboard" width={14} height={14} />
        Huruf Turki
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl border border-line bg-raised p-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onKey(k)}
              className="h-9 w-9 rounded-lg border border-line bg-surface text-sm font-semibold text-ink transition hover:border-brand/40 hover:text-brand active:scale-95"
              aria-label={`Sisipkan huruf ${k}`}
            >
              {k}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
