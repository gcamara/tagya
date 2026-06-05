// Bake da lib "Casa & Oficina" a partir do MDI (@iconify-json/mdi, vb 24, 1 path fill).
// Temas: marcenaria/ferramentas, veículos/moto, móveis, eletro/cozinha, banheiro/limpeza.
// Saída: src/lib/icons/homeData.js + homeCats.js
import fs from 'node:fs'

const ic = JSON.parse(fs.readFileSync('node_modules/@iconify-json/mdi/icons.json', 'utf8'))
const VB = ic.width || 24
const have = ic.icons || {}

const WANT = [
  { id: 'marcenaria', name: 'Marcenaria & ferramentas', keys: ['saw-blade', 'hand-saw', 'circular-saw', 'hammer', 'hammer-screwdriver', 'hammer-wrench', 'screwdriver', 'wrench', 'pliers', 'screw-lag', 'screw-machine-flat-top', 'nail', 'nut', 'ruler', 'ruler-square', 'tape-measure', 'angle-acute', 'axe', 'axe-battle', 'toolbox', 'tools', 'set-square', 'pencil-ruler', 'format-paint', 'brush', 'spray', 'ladder', 'wall', 'screw-flat-top', 'saw-blade-variant', 'wrench-outline', 'drill', 'hand-coin'] },
  { id: 'veiculos', name: 'Veículos & moto', keys: ['motorbike', 'moped', 'scooter', 'motorbike-electric', 'racing-helmet', 'car', 'car-hatchback', 'truck', 'van-utility', 'bicycle', 'scooter-electric', 'fuel', 'motorbike-off', 'bike', 'rickshaw'] },
  { id: 'moveis', name: 'Móveis & iluminação', keys: ['sofa', 'sofa-single', 'bed', 'bed-empty', 'bed-king', 'chair-rolling', 'table-chair', 'table-furniture', 'lamp', 'lamps', 'ceiling-light', 'floor-lamp', 'desk-lamp', 'mirror', 'curtains', 'hanger', 'wall-sconce', 'candle', 'clock-outline', 'dresser', 'wardrobe', 'bookshelf', 'cradle'] },
  { id: 'eletro', name: 'Eletro & cozinha', keys: ['fridge', 'fridge-outline', 'washing-machine', 'microwave', 'stove', 'toaster-oven', 'coffee-maker', 'kettle', 'blender-outline', 'iron', 'iron-outline', 'vacuum', 'vacuum-outline', 'television', 'television-classic', 'dishwasher', 'air-conditioner', 'radiator', 'fan', 'ceiling-fan', 'toaster', 'pot-steam', 'silverware-fork-knife'] },
  { id: 'banheiro', name: 'Banheiro & limpeza', keys: ['toilet', 'shower', 'shower-head', 'bathtub-outline', 'broom', 'bucket-outline', 'basket', 'spray-bottle', 'bottle-soda', 'trash-can-outline', 'watering-can', 'door', 'door-closed', 'window-closed', 'window-open-variant', 'stairs', 'key-variant', 'faucet', 'soap', 'paper-roll', 'water-pump'] }
]

const svgPaths = (b) => [...b.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1])
const ICONS = {}
const cats = []
let total = 0, miss = []
for (const c of WANT) {
  const keys = []
  for (const k of c.keys) {
    if (!have[k]) { miss.push(k); continue }
    const ds = svgPaths(have[k].body || '')
    if (!ds.length) { miss.push(k + '(vazio)'); continue }
    ICONS[k] = ds; keys.push(k); total++
  }
  if (keys.length) cats.push({ id: c.id, name: c.name, keys })
}

fs.writeFileSync('src/lib/icons/homeData.js',
  '// GERADO por bake-home.mjs — não editar à mão.\n' +
  'export const HOME_VB = ' + VB + '\n' +
  'export const HOME_ICONS = ' + JSON.stringify(ICONS) + '\n')
fs.writeFileSync('src/lib/icons/homeCats.js',
  '// GERADO por bake-home.mjs\nexport default ' + JSON.stringify(cats) + '\n')

console.log('Casa & Oficina baked:', total, 'em', cats.length, 'categorias')
console.log(cats.map((c) => `${c.name}:${c.keys.length}`).join('  '))
console.log('faltando:', miss.join(', '))
console.log('homeData.js:', (fs.statSync('src/lib/icons/homeData.js').size / 1024).toFixed(0) + 'KB')
