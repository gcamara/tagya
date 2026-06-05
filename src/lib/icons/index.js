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
import homeCats from './homeCats.js'

// Dados de desenho: importados ESTATICAMENTE para o build web virar um único
// arquivo auto-contido (sem chunks async carregados por URL). Isso permite
// embarcar o editor offline no app nativo (WebView source={{ html }}).
import { LUCIDE_NODES } from './lucideData.js'
import { TABLER_NODES } from './tablerData.js'
import { MDI_PATHS } from './mdiData.js'
import { FA_ICONS } from './faData.js'
import { BS_ICONS, BS_VB } from './bootstrapData.js'
import { PH_ICONS, PH_VB } from './phosphorData.js'
import { REMIX_ICONS, REMIX_VB } from './remixData.js'
import { HERO_ICONS, HERO_VB } from './heroData.js'
import { BRANDS_ICONS, BRANDS_VB } from './brandsData.js'
import { GAME_ICONS, GAME_VB } from './gameData.js'
import { ANIMALS_ICONS, ANIMALS_VB } from './animalsData.js'
import { HOME_ICONS, HOME_VB } from './homeData.js'

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

// ---- loaders (dados já no bundle → fábrica de desenho, resolvida na hora) ----
const LOADERS = {
  lucide: () => Promise.resolve(strokeNodes(LUCIDE_NODES)),
  tabler: () => Promise.resolve(strokeNodes(TABLER_NODES)),
  mdi: () => Promise.resolve(singlePaths(MDI_PATHS)),
  fa: () => Promise.resolve(faPaths(FA_ICONS)),
  bootstrap: () => Promise.resolve(fillPaths(BS_ICONS, BS_VB)),
  phosphor: () => Promise.resolve(fillPaths(PH_ICONS, PH_VB)),
  remix: () => Promise.resolve(fillPaths(REMIX_ICONS, REMIX_VB)),
  hero: () => Promise.resolve(fillPaths(HERO_ICONS, HERO_VB)),
  brands: () => Promise.resolve(fillPaths(BRANDS_ICONS, BRANDS_VB)),
  game: () => Promise.resolve(fillPaths(GAME_ICONS, GAME_VB)),
  animals: () => Promise.resolve(fillPaths(ANIMALS_ICONS, ANIMALS_VB)),
  home: () => Promise.resolve(fillPaths(HOME_ICONS, HOME_VB))
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
  { id: 'home', name: 'Casa & Oficina', categories: homeCats },
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
