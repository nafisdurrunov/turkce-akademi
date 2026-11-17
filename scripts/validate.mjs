/**
 * Wrapper kecil agar `npm run validate` tidak bergantung pada resolusi TS.
 * Membundel validator dengan esbuild (sudah terpasang lewat Vite), lalu menjalankannya.
 */
import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { mkdirSync } from 'node:fs'

mkdirSync('.tmp', { recursive: true })

await build({
  entryPoints: ['scripts/validate-content.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: '.tmp/validate-content.mjs',
  logLevel: 'silent',
})

await import(pathToFileURL('.tmp/validate-content.mjs').href)
