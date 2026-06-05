// Gera App.editorHtml.js: um HTML auto-contido com TODO o editor inlinado,
// para o app nativo carregar o editor OFFLINE (WebView source={{ html }}) sem
// depender de GitHub Pages / Netlify. Atualizações chegam via EAS Update (OTA),
// pois o módulo gerado faz parte do bundle JS do app.
//
// Pré-requisito: `npm run build:web` (gera dist/). Os ícones são importados
// estaticamente (ver src/lib/icons/index.js), então o build não tem chunks
// async além do niimbluelib (web-BT, nunca usado no app nativo) — por isso o
// index.html referencia só scripts síncronos, todos inlináveis.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const indexPath = join(dist, 'index.html')

if (!existsSync(indexPath)) {
  console.error('dist/index.html não encontrado. Rode `npm run build:web` primeiro.')
  process.exit(1)
}

let html = readFileSync(indexPath, 'utf8')
let inlined = 0

// Inlina cada <script src="/_expo/...">…</script> síncrono, lendo o arquivo do dist.
html = html.replace(/<script\s+src="([^"]+)"[^>]*><\/script>/g, (m, src) => {
  const rel = src.replace(/^\//, '')
  const file = join(dist, rel)
  if (!existsSync(file)) {
    console.warn(`  aviso: script não encontrado, mantido como referência: ${src}`)
    return m
  }
  // Escapa </script para o JS inlinado não fechar a tag prematuramente.
  const code = readFileSync(file, 'utf8').replace(/<\/script/gi, '<\\/script')
  inlined++
  return `<script>\n${code}\n</script>`
})

// Remove o <link rel=icon href="/favicon.ico"> — não resolve em html-source e só geraria um request falho.
html = html.replace(/<link\s+rel="icon"[^>]*>/gi, '')

const out =
  '// ARQUIVO GERADO por scripts/embed-editor.mjs — NÃO editar à mão.\n' +
  '// Editor TagYa inlinado (offline). Regenerar: `npm run embed:editor`.\n' +
  `export default ${JSON.stringify(html)}\n`

writeFileSync(join(root, 'App.editorHtml.js'), out)
console.log(`Editor embarcado: ${inlined} script(s) inlinado(s), HTML ${(html.length / 1048576).toFixed(2)} MB → App.editorHtml.js`)
