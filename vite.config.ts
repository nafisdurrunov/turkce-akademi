import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages butuh base path saat di-host di subfolder (mis. /turkce-akademi/).
// Set lewat env: VITE_BASE=/turkce-akademi/
// Dinormalisasi agar "/repo" dan "repo" tetap menjadi "/repo/".
function normalizeBase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}
const base = normalizeBase(process.env.VITE_BASE || '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Türkçe Akademi — Belajar Bahasa Turki',
        short_name: 'Türkçe Akademi',
        description:
          'Belajar Bahasa Turki dari nol: 19 modul interaktif, flashcards, kuis, catatan pribadi, dan progres tersinkron di semua perangkat.',
        theme_color: '#C41230',
        background_color: '#F7F5F2',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: base,
        start_url: base,
        lang: 'id',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Lanjutkan Belajar', short_name: 'Belajar', url: base + '#/modul', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Catatan Pribadi', short_name: 'Catatan', url: base + '#/catatan', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
