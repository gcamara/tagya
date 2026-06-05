// Registro de bibliotecas de ícones com LAZY-LOAD.
// Catálogos (categorias + nomes) são leves e entram no bundle inicial.
// Os dados de desenho (paths/nós) de cada lib são carregados sob demanda (import()).

import { ICON_CATEGORIES as ETIQYA_CATS, drawIcon as drawEtiqya } from '../labelIcons.js'
import lucideCats from './lucideCats.js'
import tablerCats from './tablerCats.js'
import mdiCats from './mdiCats.js'
import faCats from './faCats.js'
import bootstrapCats from './bootstrapCats.js'
import phosphorCats from './phosphorCats.js'
import remixCats from './remixCats.js'
import heroCats from './heroCats.js'
import brandsCats from './brandsCats.js'
import gameCats from './gameCats.js'
import animalsCats from './animalsCats.js'

const N = (v) => parseFloat(v) || 0
const has2D = () => typeof Path2D !== 'undefined'

// ---- fábricas de desenho (recebem os dados já carregados) ----
function strokeNodes(nodes) {
  return (ctx, key, x, y, size) => {
    const ns = nodes[key]
    if (!ns || !has2D()) return
    const k = size / 24
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k)
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2.1; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    for (const [tag, a] of ns) {
      if (tag === 'path') ctx.stroke(new Path2D(a.d))
      else if (tag === 'circle') { ctx.beginPath(); ctx.arc(N(a.cx), N(a.cy), N(a.r), 0, Math.PI * 2); ctx.stroke() }
      else if (tag === 'ellipse') { ctx.beginPath(); ctx.ellipse(N(a.cx), N(a.cy), N(a.rx), N(a.ry), 0, 0, Math.PI * 2); ctx.stroke() }
      else if (tag === 'line') { ctx.beginPath(); ctx.moveTo(N(a.x1), N(a.y1)); ctx.lineTo(N(a.x2), N(a.y2)); ctx.stroke() }
      else if (tag === 'rect') strokeRoundRect(ctx, N(a.x), N(a.y), N(a.width), N(a.height), N(a.rx))
      else if (tag === 'polyline' || tag === 'polygon') {
        const p = (a.points || '').trim().split(/[\s,]+/).map(Number)
        ctx.beginPath()
        for (let i = 0; i < p.length; i += 2) i === 0 ? ctx.moveTo(p[i], p[i + 1]) : ctx.lineTo(p[i], p[i + 1])
        if (tag === 'polygon') ctx.closePath()
        ctx.stroke()
      }
    }
    ctx.restore()
  }
}
function strokeRoundRect(ctx, x, y, w, h, r) {
  r = Math.min(r || 0, w / 2, h / 2)
  ctx.beginPath(); ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath(); ctx.stroke()
}
function fillPaths(icons, vb) {
  return (ctx, key, x, y, size) => {
    const ds = icons[key]
    if (!ds || !has2D()) return
    const k = size / vb
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = '#000'
    for (const d of ds) ctx.fill(new Path2D(d))
    ctx.restore()
  }
}
function singlePaths(paths) { // mdi: key -> string
  return (ctx, key, x, y, size) => {
    const p = paths[key]
    if (!p || !has2D()) return
    const k = size / 24
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = '#000'
    ctx.fill(new Path2D(p)); ctx.restore()
  }
}
function faPaths(icons) { // key -> {w,h,p}; viewBox w×h centralizado
  return (ctx, key, x, y, size) => {
    const ic = icons[key]
    if (!ic || !has2D()) return
    const vb = Math.max(ic.w, ic.h)
    const k = (size * 0.92) / vb
    ctx.save()
    ctx.translate(x + (size - ic.w * k) / 2, y + (size - ic.h * k) / 2)
    ctx.scale(k, k); ctx.fillStyle = '#000'
    ctx.fill(new Path2D(ic.p)); ctx.restore()
  }
}

// ---- loaders (import dinâmico → fábrica de desenho) ----
const LOADERS = {
  lucide: () => import('./lucideData.js').then((m) => strokeNodes(m.LUCIDE_NODES)),
  tabler: () => import('./tablerData.js').then((m) => strokeNodes(m.TABLER_NODES)),
  mdi: () => import('./mdiData.js').then((m) => singlePaths(m.MDI_PATHS)),
  fa: () => import('./faData.js').then((m) => faPaths(m.FA_ICONS)),
  bootstrap: () => import('./bootstrapData.js').then((m) => fillPaths(m.BS_ICONS, m.BS_VB)),
  phosphor: () => import('./phosphorData.js').then((m) => fillPaths(m.PH_ICONS, m.PH_VB)),
  remix: () => import('./remixData.js').then((m) => fillPaths(m.REMIX_ICONS, m.REMIX_VB)),
  hero: () => import('./heroData.js').then((m) => fillPaths(m.HERO_ICONS, m.HERO_VB)),
  brands: () => import('./brandsData.js').then((m) => fillPaths(m.BRANDS_ICONS, m.BRANDS_VB)),
  game: () => import('./gameData.js').then((m) => fillPaths(m.GAME_ICONS, m.GAME_VB)),
  animals: () => import('./animalsData.js').then((m) => fillPaths(m.ANIMALS_ICONS, m.ANIMALS_VB))
}

const DRAW = { etiqya: (c, k, x, y, s) => drawEtiqya(c, k, x, y, s) }
const pending = {}
const listeners = new Set()

export function isLibLoaded(id) { return !!DRAW[id] }
export function ensureLib(id) {
  if (DRAW[id] || !LOADERS[id]) return Promise.resolve()
  if (!pending[id]) {
    pending[id] = LOADERS[id]()
      .then((fn) => { DRAW[id] = fn; delete pending[id]; listeners.forEach((f) => f(id)) })
      .catch(() => { delete pending[id] })
  }
  return pending[id]
}
export function onLibLoaded(cb) { listeners.add(cb); return () => listeners.delete(cb) }
export async function ensureTemplateLibs(template) {
  const ids = new Set((template.elements || [])
    .filter((e) => e.type === 'icon' && e.iconLib && e.iconLib !== 'etiqya')
    .map((e) => e.iconLib))
  await Promise.all([...ids].map(ensureLib))
}

export function drawLibIcon(ctx, libId, key, x, y, size) {
  const fn = DRAW[libId]
  if (!fn) { ensureLib(libId); return } // ainda carregando — desenha quando pronto
  fn(ctx, key, x, y, size)
}

export const LIBRARIES = [
  { id: 'etiqya', name: 'Etiqya', categories: ETIQYA_CATS },
  { id: 'animals', name: 'Animais', categories: animalsCats },
  { id: 'lucide', name: 'Lucide', categories: lucideCats },
  { id: 'tabler', name: 'Tabler', categories: tablerCats },
  { id: 'mdi', name: 'Material', categories: mdiCats },
  { id: 'fa', name: 'Font Awesome', categories: faCats },
  { id: 'bootstrap', name: 'Bootstrap', categories: bootstrapCats },
  { id: 'phosphor', name: 'Phosphor', categories: phosphorCats },
  { id: 'remix', name: 'Remix', categories: remixCats },
  { id: 'hero', name: 'Heroicons', categories: heroCats },
  { id: 'brands', name: 'Marcas', categories: brandsCats },
  { id: 'game', name: 'Silhuetas', categories: gameCats }
]

const LIB_MAP = Object.fromEntries(LIBRARIES.map((l) => [l.id, l]))
export function getLibrary(id) { return LIB_MAP[id] || LIBRARIES[0] }
export function libIconCount(id) { return getLibrary(id).categories.reduce((n, c) => n + c.keys.length, 0) }
