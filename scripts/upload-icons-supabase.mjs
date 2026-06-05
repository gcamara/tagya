// Sobe dist-icons/*.json + manifest.json para um bucket do Supabase Storage.
// Usa a REST API de Storage via `fetch` (SEM SDK, SEM dependências novas).
//
// Variáveis de ambiente (NÃO hardcode segredos):
//   SUPABASE_URL            ex.: https://abcdefgh.supabase.co
//   SUPABASE_SERVICE_KEY    service_role key (Project Settings > API)
//   SUPABASE_ICONS_BUCKET   nome do bucket (padrão: "icons")
//
// O bucket deve ser PÚBLICO para que o app leia sem credencial. A leitura
// pública fica em:
//   <SUPABASE_URL>/storage/v1/object/public/<bucket>/<arquivo>
// que é exatamente o valor de SUPABASE_ICONS_BASE_URL em remoteConfig.js
// (apontando para .../public/<bucket>).
//
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/upload-icons-supabase.mjs
//   (no Windows PowerShell:  $env:SUPABASE_URL="..."; node scripts/upload-icons-supabase.mjs)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'dist-icons')

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET = process.env.SUPABASE_ICONS_BUCKET || 'icons'

function die(msg) { console.error(`ERRO: ${msg}`); process.exit(1) }

if (!SUPABASE_URL) die('defina SUPABASE_URL')
if (!SERVICE_KEY) die('defina SUPABASE_SERVICE_KEY (service_role key)')
if (!fs.existsSync(OUT_DIR)) die(`${OUT_DIR} não existe — rode antes: node scripts/convert-icons-to-json.mjs`)

const base = SUPABASE_URL.replace(/\/+$/, '')

// Sobe um arquivo (upsert) para o bucket. Resolve true/false.
async function uploadFile(name) {
  const body = fs.readFileSync(path.join(OUT_DIR, name))
  const url = `${base}/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodeURIComponent(name)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'x-upsert': 'true'
    },
    body
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    console.error(`  FALHOU ${name}: HTTP ${res.status} ${txt}`)
    return false
  }
  console.log(`  OK ${name} (${(body.length / 1024).toFixed(1)} KB)`)
  return true
}

async function main() {
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.json'))
  if (!files.length) die('nenhum .json em dist-icons — rode o convert antes')

  // Sobe os JSONs das libs primeiro e o manifest POR ÚLTIMO, para evitar que um
  // cliente baixe um manifest com versão nova antes do JSON correspondente existir.
  const libFiles = files.filter((f) => f !== 'manifest.json')
  const ordered = [...libFiles, ...(files.includes('manifest.json') ? ['manifest.json'] : [])]

  console.log(`Subindo ${ordered.length} arquivos para bucket "${BUCKET}" em ${base} ...`)
  let okCount = 0
  for (const f of ordered) { if (await uploadFile(f)) okCount++ }

  console.log(`\n${okCount}/${ordered.length} enviados.`)
  console.log('SUPABASE_ICONS_BASE_URL para remoteConfig.js:')
  console.log(`  ${base}/storage/v1/object/public/${BUCKET}`)
  if (okCount !== ordered.length) process.exit(1)
}

main().catch((e) => { console.error(e); process.exit(1) })
