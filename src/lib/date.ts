/** Util tanggal & streak harian. */

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return dayKey(date)
}

/** Jumlah hari berturut-turut yang punya aktivitas, dihitung sampai hari ini/kemarin. */
export function calcStreak(days: string[]): number {
  const set = new Set(days)
  if (!set.size) return 0
  const today = dayKey()
  let cursor = set.has(today) ? today : addDays(today, -1)
  if (!set.has(cursor)) return 0
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** 7 hari terakhir (termasuk hari ini) dengan status aktif/tidak. */
export function lastWeek(days: string[]): { key: string; label: string; active: boolean; isToday: boolean }[] {
  const set = new Set(days)
  const today = dayKey()
  const labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const out: { key: string; label: string; active: boolean; isToday: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const key = addDays(today, -i)
    const [y, m, d] = key.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    out.push({ key, label: labels[dow], active: set.has(key), isToday: key === today })
  }
  return out
}

export function formatDate(iso: string, withTime = false): string {
  try {
    const d = new Date(iso)
    const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    if (!withTime) return date
    return `${date} · ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return iso
  }
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 11) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}
