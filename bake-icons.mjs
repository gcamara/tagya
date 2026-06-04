// Gera os dados das libs de ícones em src/lib/icons/*.js (curado por palavra-chave).
// Pacotes (--no-save, só pra bake): lucide-static, @tabler/icons, @mdi/js,
// @fortawesome/free-solid-svg-icons@6, bootstrap-icons, heroicons, remixicon,
// @phosphor-icons/core, simple-icons
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const NM = path.join(process.cwd(), 'node_modules')
const rd = (p) => JSON.parse(fs.readFileSync(path.join(NM, p), 'utf8'))

const CAP = 28

const CATS = [
  { id: 'geral', name: 'Geral & status', kw: ['check', 'x', 'close', 'plus', 'minus', 'star', 'heart', 'info', 'alert', 'warning', 'help', 'question', 'circle', 'dot', 'ban', 'eye', 'search', 'settings', 'cog', 'gear', 'bell', 'flag', 'bookmark', 'lock', 'shield', 'bolt', 'zap', 'award', 'crown', 'sparkles', 'like', 'thumb-up'] },
  { id: 'setas', name: 'Setas', kw: ['arrow', 'chevron', 'caret', 'refresh', 'rotate', 'repeat', 'move', 'maximize', 'minimize', 'expand', 'undo', 'redo', 'shuffle'] },
  { id: 'formas', name: 'Formas', kw: ['square', 'circle', 'triangle', 'hexagon', 'pentagon', 'diamond', 'octagon', 'rectangle', 'oval', 'shapes', 'heart'] },
  { id: 'casa', name: 'Casa & objetos', kw: ['home', 'house', 'bed', 'key', 'lamp', 'plug', 'door', 'lightbulb', 'bulb', 'sofa', 'bath', 'toilet', 'fridge', 'refrigerator', 'couch', 'armchair', 'chair', 'table', 'washing', 'broom', 'iron'] },
  { id: 'comida', name: 'Cozinha & comida', kw: ['coffee', 'cup', 'tea', 'mug', 'fork', 'knife', 'spoon', 'utensils', 'pizza', 'apple', 'banana', 'beer', 'wine', 'milk', 'cake', 'cookie', 'egg', 'salad', 'soup', 'bread', 'carrot', 'burger', 'hamburger', 'bottle', 'cheese', 'bowl', 'candy', 'donut', 'cocktail'] },
  { id: 'comercio', name: 'Comércio & dinheiro', kw: ['cash', 'coin', 'coins', 'currency', 'dollar', 'money', 'cart', 'shopping', 'bag', 'gift', 'credit-card', 'card', 'percent', 'tag', 'tags', 'receipt', 'wallet', 'store', 'shop', 'package', 'basket', 'discount', 'barcode', 'safe'] },
  { id: 'transporte', name: 'Transporte', kw: ['car', 'truck', 'plane', 'airplane', 'bike', 'bicycle', 'bus', 'train', 'ship', 'boat', 'rocket', 'fuel', 'gas', 'map-pin', 'pin', 'navigation', 'compass', 'anchor', 'taxi', 'scooter', 'motorbike', 'tractor', 'helicopter'] },
  { id: 'tecnologia', name: 'Tecnologia & mídia', kw: ['camera', 'video', 'image', 'photo', 'monitor', 'desktop', 'phone', 'mobile', 'smartphone', 'laptop', 'computer', 'headphones', 'music', 'play', 'pause', 'volume', 'wifi', 'bluetooth', 'battery', 'mic', 'microphone', 'printer', 'print', 'scan', 'mouse', 'keyboard', 'cable', 'usb', 'server', 'database', 'cloud', 'qrcode', 'qr-code', 'robot', 'cpu', 'chip'] },
  { id: 'pessoas', name: 'Pessoas & rostos', kw: ['user', 'users', 'person', 'people', 'account', 'smile', 'face', 'frown', 'baby', 'child', 'contact', 'group', 'emoji'] },
  { id: 'natureza', name: 'Natureza & clima', kw: ['leaf', 'flower', 'tree', 'plant', 'sun', 'moon', 'cloud', 'rain', 'snow', 'snowflake', 'droplet', 'water', 'umbrella', 'wind', 'fire', 'flame', 'mountain', 'sprout', 'seedling', 'feather', 'rainbow', 'star'] },
  { id: 'animais', name: 'Animais', kw: ['cat', 'dog', 'bird', 'fish', 'paw', 'rabbit', 'horse', 'cow', 'pig', 'bug', 'butterfly', 'snail', 'turtle', 'bee', 'spider', 'fox', 'bear', 'lion', 'elephant', 'penguin', 'duck', 'frog', 'panda', 'dove', 'owl', 'deer', 'dolphin', 'whale', 'crab', 'snake', 'bat', 'shrimp'] },
  { id: 'esportes', name: 'Esportes', kw: ['football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf', 'trophy', 'medal', 'dumbbell', 'run', 'running', 'swim', 'swimming', 'target', 'whistle', 'volleyball', 'skateboard', 'surf', 'ski', 'boxing', 'weight', 'bowling', 'racket', 'goal', 'jersey', 'cricket', 'ball'] },
  { id: 'tempo', name: 'Tempo & data', kw: ['clock', 'time', 'calendar', 'alarm', 'timer', 'hourglass', 'watch', 'date', 'schedule', 'history', 'stopwatch'] },
  { id: 'saude', name: 'Saúde', kw: ['heart-pulse', 'pulse', 'pill', 'pills', 'medicine', 'stethoscope', 'syringe', 'vaccine', 'activity', 'bandage', 'brain', 'hospital', 'medical', 'dna', 'tooth', 'first-aid', 'mask', 'wheelchair'] },
  { id: 'trabalho', name: 'Trabalho & oficina', kw: ['hammer', 'wrench', 'tool', 'tools', 'ruler', 'scissors', 'paint', 'brush', 'pencil', 'pen', 'screwdriver', 'drill', 'saw', 'briefcase', 'calculator', 'clipboard', 'folder', 'file', 'paperclip', 'clip', 'book', 'graduation', 'school', 'edit', 'note'] }
]

function matchCat(key, kws) {
  const segs = key.split('-')
  return kws.some((kw) => (kw.includes('-') ? key.includes(kw) : (segs.includes(kw) || key === kw)))
}
function curate(available) {
  const sorted = [...available].sort((a, b) => a.length - b.length || a.localeCompare(b))
  const used = new Set(); const cats = []
  for (const c of CATS) {
    const keys = []
    for (const key of sorted) {
      if (used.has(key)) continue
      if (matchCat(key, c.kw)) { keys.push(key); used.add(key); if (keys.length >= CAP) break }
    }
    if (keys.length) cats.push({ id: c.id, name: c.name, keys })
  }
  return cats
}
const camelToKebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const svgPaths = (txt) => [...txt.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1])
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.svg')) out.push(p)
  }
  return out
}

// Dados pesados (carregados sob demanda via import dinâmico).
function writeData(file, parts) {
  let out = '// GERADO por bake-icons.mjs — não editar à mão.\n'
  for (const [name, val] of Object.entries(parts)) out += `export const ${name} = ${JSON.stringify(val)}\n`
  fs.writeFileSync(path.join('src/lib/icons', file), out)
}
// Catálogo leve (categorias + nomes) — vai no bundle inicial.
function writeCats(file, cats) {
  const catsFile = file.replace('Data.js', 'Cats.js')
  fs.writeFileSync(path.join('src/lib/icons', catsFile), '// GERADO por bake-icons.mjs\nexport default ' + JSON.stringify(cats) + '\n')
}
function write(file, parts, cats) { writeData(file, parts); writeCats(file, cats) }

// ---- libs de NÓS (stroke): lucide, tabler ----
function bakeNodes(file, json, NODES, CATEGORIES) {
  const cats = curate(Object.keys(json))
  const picked = {}
  cats.forEach((c) => c.keys.forEach((k) => { picked[k] = json[k] }))
  write(file, { [NODES]: picked }, cats)
  console.log(file, Object.keys(picked).length, 'em', cats.length, 'cats')
}

// ---- lib de PATH único (mdi) ----
function bakeMdi() {
  const mod = require(path.join(NM, '@mdi/js'))
  const all = {}
  for (const [name, val] of Object.entries(mod)) if (name.startsWith('mdi') && typeof val === 'string') all[camelToKebab(name.slice(3))] = val
  const cats = curate(Object.keys(all)); const picked = {}
  cats.forEach((c) => c.keys.forEach((k) => { picked[k] = all[k] }))
  write('mdiData.js', { MDI_PATHS: picked }, cats)
  console.log('mdi', Object.keys(picked).length, 'em', cats.length)
}

// ---- FontAwesome (fill viewBox w×h) ----
function bakeFA() {
  const dir = path.join(NM, '@fortawesome/free-solid-svg-icons')
  const all = {}
  for (const f of fs.readdirSync(dir).filter((f) => /^fa[A-Z0-9].*\.js$/.test(f))) {
    try { const m = require(path.join(dir, f)); if (typeof m.svgPathData === 'string') all[camelToKebab(f.slice(2, -3))] = { w: m.width, h: m.height, p: m.svgPathData } } catch { /* */ }
  }
  const cats = curate(Object.keys(all)); const picked = {}
  cats.forEach((c) => c.keys.forEach((k) => { picked[k] = all[k] }))
  write('faData.js', { FA_ICONS: picked }, cats)
  console.log('fa', Object.keys(picked).length, 'em', cats.length)
}

// ---- libs de SVG fill (bootstrap, heroicons, remix, phosphor) ----
function bakeFill(file, dir, vb, NAME) {
  const all = {}
  for (const fp of walk(dir)) {
    const key = path.basename(fp, '.svg')
    if (all[key]) continue
    const ds = svgPaths(fs.readFileSync(fp, 'utf8'))
    if (ds.length) all[key] = ds
  }
  const cats = curate(Object.keys(all)); const picked = {}
  cats.forEach((c) => c.keys.forEach((k) => { picked[k] = all[k] }))
  write(file, { [`${NAME}_ICONS`]: picked, [`${NAME}_VB`]: vb }, cats)
  console.log(file, Object.keys(picked).length, 'em', cats.length)
}

// ---- Marcas (Simple Icons) — slugs curados por categoria ----
const SI_CATS = [
  { id: 'social', name: 'Redes sociais', slugs: ['instagram', 'facebook', 'x', 'tiktok', 'whatsapp', 'telegram', 'snapchat', 'linkedin', 'pinterest', 'reddit', 'discord', 'threads', 'messenger', 'wechat', 'line', 'bluesky', 'mastodon'] },
  { id: 'midia', name: 'Vídeo & música', slugs: ['youtube', 'spotify', 'netflix', 'twitch', 'soundcloud', 'applemusic', 'primevideo', 'hbo', 'vimeo', 'deezer', 'audible', 'crunchyroll', 'tidal', 'bandcamp'] },
  { id: 'tech', name: 'Tech & dev', slugs: ['github', 'gitlab', 'google', 'apple', 'android', 'linux', 'ubuntu', 'docker', 'react', 'nodedotjs', 'python', 'javascript', 'typescript', 'figma', 'notion', 'slack', 'zoom', 'vercel', 'cloudflare', 'openai', 'wordpress', 'firefox', 'googlechrome'] },
  { id: 'pagamento', name: 'Pagamento & lojas', slugs: ['visa', 'mastercard', 'paypal', 'pix', 'amazon', 'mercadopago', 'stripe', 'shopify', 'googlepay', 'applepay', 'picpay', 'nubank', 'ifood', 'mercadolibre', 'aliexpress', 'shopee', 'americanexpress'] },
  { id: 'marcas', name: 'Marcas', slugs: ['nike', 'adidas', 'cocacola', 'mcdonalds', 'starbucks', 'samsung', 'sony', 'lg', 'intel', 'amd', 'nvidia', 'tesla', 'bmw', 'toyota', 'volkswagen', 'ford', 'puma', 'redbull', 'heineken'] }
]
function bakeSimple() {
  const dir = path.join(NM, 'simple-icons/icons')
  const icons = {}; const cats = []
  for (const c of SI_CATS) {
    const keys = []
    for (const slug of c.slugs) {
      const fp = path.join(dir, slug + '.svg')
      if (!fs.existsSync(fp)) continue
      const ds = svgPaths(fs.readFileSync(fp, 'utf8'))
      if (ds.length) { icons[slug] = ds; keys.push(slug) }
    }
    if (keys.length) cats.push({ id: c.id, name: c.name, keys })
  }
  write('brandsData.js', { BRANDS_ICONS: icons, BRANDS_VB: 24 }, cats)
  console.log('brands', Object.keys(icons).length, 'em', cats.length)
}

fs.mkdirSync('src/lib/icons', { recursive: true })
bakeNodes('lucideData.js', rd('lucide-static/icon-nodes.json'), 'LUCIDE_NODES', 'LUCIDE_CATEGORIES')
bakeNodes('tablerData.js', rd('@tabler/icons/tabler-nodes-outline.json'), 'TABLER_NODES', 'TABLER_CATEGORIES')
bakeMdi()
bakeFA()
bakeFill('bootstrapData.js', path.join(NM, 'bootstrap-icons/icons'), 16, 'BS')
bakeFill('heroData.js', path.join(NM, 'heroicons/24/solid'), 24, 'HERO')
bakeFill('remixData.js', path.join(NM, 'remixicon/icons'), 24, 'REMIX')
bakeFill('phosphorData.js', path.join(NM, '@phosphor-icons/core/assets/regular'), 256, 'PH')
bakeSimple()
