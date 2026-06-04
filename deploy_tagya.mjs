// Deploy do dist/ no Netlify via API de digest (sha1 por arquivo).
// Uso: $env:NETLIFY_TOKEN="..."; node deploy_tagya.mjs
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'

const TOKEN = process.env.NETLIFY_TOKEN
if (!TOKEN) { console.error('Falta NETLIFY_TOKEN'); process.exit(1) }
const API = 'https://api.netlify.com/api/v1'
const H = { Authorization: `Bearer ${TOKEN}` }
const DIR = join(process.cwd(), 'dist')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function walk(dir, base = '') {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = base ? posix.join(base, name) : name
    if (statSync(full).isDirectory()) out.push(...walk(full, rel))
    else out.push({ full, path: '/' + rel })
  }
  return out
}

async function main() {
  const files = walk(DIR)
  const digest = {}
  const bySha = {}
  for (const f of files) {
    const buf = readFileSync(f.full)
    const sha = createHash('sha1').update(buf).digest('hex')
    digest[f.path] = sha
    bySha[f.path] = { buf, sha }
  }
  console.log(`${files.length} arquivos prontos.`)

  // 1) Reusa o site existente (por id) ou cria um novo
  const SITE_ID = process.env.SITE_ID || '559d5ccf-5d27-41ce-bb8e-074d44f726c6' // tagya.netlify.app
  let site, res
  if (SITE_ID) {
    res = await fetch(`${API}/sites/${SITE_ID}`, { headers: H })
    if (!res.ok) throw new Error(`Buscar site falhou: ${res.status} ${await res.text()}`)
    site = await res.json()
  } else {
    res = await fetch(`${API}/sites`, { method: 'POST', headers: H })
    if (!res.ok) throw new Error(`Criar site falhou: ${res.status} ${await res.text()}`)
    site = await res.json()
  }
  console.log(`Site: ${site.name} (${site.id})`)

  // 2) Abre um deploy com o digest
  res = await fetch(`${API}/sites/${site.id}/deploys`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: digest })
  })
  if (!res.ok) throw new Error(`Abrir deploy falhou: ${res.status} ${await res.text()}`)
  let deploy = await res.json()
  const required = new Set(deploy.required || [])
  console.log(`Deploy ${deploy.id} — ${required.size} arquivo(s) a enviar.`)

  // 3) Sobe cada arquivo requerido
  for (const [path, { buf, sha }] of Object.entries(bySha)) {
    if (!required.has(sha)) continue
    const up = await fetch(`${API}/deploys/${deploy.id}/files${path}`, {
      method: 'PUT', headers: { ...H, 'Content-Type': 'application/octet-stream' }, body: buf
    })
    if (!up.ok) throw new Error(`Upload ${path} falhou: ${up.status} ${await up.text()}`)
    console.log(`  ✓ ${path}`)
  }

  // 4) Aguarda ficar "ready"
  for (let i = 0; i < 40; i++) {
    res = await fetch(`${API}/deploys/${deploy.id}`, { headers: H })
    deploy = await res.json()
    if (deploy.state === 'ready') break
    if (deploy.state === 'error') throw new Error('Deploy entrou em erro.')
    await sleep(1500)
  }

  console.log('\n=== DEPLOY CONCLUÍDO ===')
  console.log('Estado:', deploy.state)
  console.log('URL:   ', deploy.ssl_url || deploy.url || site.ssl_url)
  console.log('Admin: ', site.admin_url)
}

main().catch((e) => { console.error(e); process.exit(1) })
