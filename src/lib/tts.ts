/** Text-to-Speech Bahasa Turki (Web Speech API, locale tr-TR). */

let cachedVoices: SpeechSynthesisVoice[] | null = null

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function loadVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return []
  const voices = window.speechSynthesis.getVoices()
  if (voices.length) cachedVoices = voices
  return cachedVoices ?? voices
}

if (ttsSupported()) {
  // Chrome memuat voice secara asinkron.
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices()
  })
}

export function turkishVoice(): SpeechSynthesisVoice | undefined {
  const voices = loadVoices()
  return (
    voices.find((v) => v.lang?.toLowerCase() === 'tr-tr') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('tr')) ||
    undefined
  )
}

/** Apakah perangkat punya voice Turki asli? Jika tidak, kita pakai voice default + peringatan. */
export function hasTurkishVoice(): boolean {
  return Boolean(turkishVoice())
}

export function speak(text: string, opts?: { rate?: number }) {
  if (!ttsSupported()) return
  const clean = text
    .replace(/~|\*|`|_/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(clean)
  const v = turkishVoice()
  if (v) u.voice = v
  u.lang = 'tr-TR'
  u.rate = opts?.rate ?? 0.92
  u.pitch = 1
  synth.speak(u)
}

/** Bacakan beberapa kalimat berurutan (mis. seluruh dialog) tanpa saling memotong. */
export function speakSequence(texts: string[], opts?: { rate?: number }) {
  if (!ttsSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const v = turkishVoice()
  for (const raw of texts) {
    const clean = raw
      .replace(/~|\*|`|_/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!clean) continue
    const u = new SpeechSynthesisUtterance(clean)
    if (v) u.voice = v
    u.lang = 'tr-TR'
    u.rate = opts?.rate ?? 0.9
    u.pitch = 1
    synth.speak(u)
  }
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel()
}
