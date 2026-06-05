// Converte os dados embarcados das libs de ícones (src/lib/icons/*Data.js)
// em um JSON por lib + manifest.json, no formato EXATO que o loader remoto
// (src/lib/icons/index.js -> resolveLib/buildDrawFn) sabe baixar e reconstruir.
//
// Saída:
//   dist-icons/<id>.json   -> { id, version, kind, vb?, data }
//   dist-icons/manifest.json -> { "<id>": <version>, ... }
//
// Versionamento: por padrão version = 1 para todas as libs. Para subir uma
// versão nova de uma lib específica, edite ICON_VERSIONS abaixo (ou passe
// --bump=<id> para incrementar só ela em relação ao manifest já existente).
//
// Uso:
//   node scripts/convert-icons-to-json.mjs
//   node scripts/convert-icons-to-json.mjs --bump=lucide
//
// NÃO sobe nada — apenas gera arquivos locais. O upload é feito por
// scripts/upload-icons-supabase.mjs.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ICONS_DIR = path.join(ROOT, 'src', 'lib', 'icons')
const OUT_DIR = path.join(ROOT, 'dist-icons')

// id da lib -> como ler o módulo *Data.js correspondente.
// kind/vb DEVEM espelhar BUNDLED em src/lib/icons/index.js.
const LIBS = [
  { id: 'lucide', file: 'lucideData.js', kind: 'strokeNodes', data: 'LUCIDE_NODES' },
  { id: 'tabler', file: 'tablerData.js', kind: 'strokeNodes', data: 'TABLER_NODES' },
  { id: 'mdi', file: 'mdiData.js', kind: 'singlePaths', data: 'MDI_PATHS' },
  { id: 'fa', file: 'faData.js', kind: 'faPaths', data: 'FA_ICONS' },
  { id: 'bootstrap', file: 'bootstrapData.js', kind: 'fillPaths', data: 'BS_ICONS', vb: 'BS_VB' },
  { id: 'phosphor', file: 'phosphorData.js', kind: 'fillPaths', data: 'PH_ICONS', vb: 'PH_VB' },
  { id: 'remix', file: 'remixData.js', kind: 'fillPaths', data: 'REMIX_ICONS', vb: 'REMIX_VB' },
  { id: 'hero', file: 'heroData.js', kind: 'fillPaths', data: 'HERO_ICONS', vb: 'HERO_VB' },
  { id: 'brands', file: 'brandsData.js', kind: 'fillPaths', data: 'BRANDS_ICONS', vb: 'BRANDS_VB' },
  { id: 'game', file: 'gameData.js', kind: 'fillPaths', data: 'GAME_ICONS', vb: 'GAME_VB' },
  { id: 'animals', file: 'animalsData.js', kind: 'fillPaths', data: 'ANIMALS_ICONS', vb: 'ANIMALS_VB' },
  { id: 'home', file: 'homeData.js', kind: 'fillPaths', data: 'HOME_ICONS', vb: 'HOME_VB' }
]

const DEFAULT_VERSION = 1

// Override manual de versões. Ex.: { lucide: 3, tabler: 2 }
const ICON_VERSIONS = {}

function parseArgs() {
  const bump = []
  for (const a of process.argv.slice(2)) {
    const m = /^--bump=(.+)$/.exec(a)
    if (m) bump.push(m[1])
  }
  return { bump }
}

function readExistingManifest() {
  const p = path.join(OUT_DIR, 'manifest.json')
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch (_) { return {} }
}

async function main() {
  const { bump } = parseArgs()
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const existing = readExistingManifest()
  const manifest = {}

  for (const lib of LIBS) {
    const modPath = path.join(ICONS_DIR, lib.file)
    if (!fs.existsSync(modPath)) {
      console.warn(`SKIP ${lib.id}: ${lib.file} não encontrado`)
      continue
    }
    const mod = await import(pathToFileURL(modPath).href)
    const data = mod[lib.data]
    if (data == null) {
      console.warn(`SKIP ${lib.id}: export ${lib.data} ausente em ${lib.file}`)
      continue
    }

    // resolve versão: bump > override > manifest existente > default
    let version
    if (bump.includes(lib.id)) version = (Number(existing[lib.id]) || DEFAULT_VERSION) + 1
    else if (ICON_VERSIONS[lib.id] != null) version = ICON_VERSIONS[lib.id]
    else if (existing[lib.id] != null) version = existing[lib.id]
    else version = DEFAULT_VERSION

    const payload = { id: lib.id, version, kind: lib.kind, data }
    if (lib.vb) {
      const vb = mod[lib.vb]
      if (vb == null) { console.warn(`SKIP ${lib.id}: export ${lib.vb} ausente`); continue }
      payload.vb = vb
    }

    const outFile = path.join(OUT_DIR, `${lib.id}.json`)
    fs.writeFileSync(outFile, JSON.stringify(payload))
    manifest[lib.id] = version

    const n = Object.keys(data).length
    const kb = (fs.statSync(outFile).size / 1024).toFixed(1)
    console.log(`OK   ${lib.id}.json  v${version}  ${n} ícones  ${kb} KB`)
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\nmanifest.json -> ${JSON.stringify(manifest)}`)
  console.log(`Saída em ${OUT_DIR}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
