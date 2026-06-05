// Bake da lib "Animais" a partir do fluent-emoji-high-contrast (P&B, viewBox 32, MIT).
// Line-art consistente com TODOS os animais (girafa, crocodilo, leão…).
// Saída: src/lib/icons/animalsData.js + animalsCats.js
import fs from 'node:fs'

const ic = JSON.parse(fs.readFileSync('node_modules/@iconify-json/fluent-emoji-high-contrast/icons.json', 'utf8'))
const VB = ic.width || 32
const have = ic.icons || {}

// categorias → lista de candidatos (mantém só os que existem no set)
const WANT = [
  { id: 'mamiferos', name: 'Mamíferos', keys: ['lion', 'tiger', 'leopard', 'giraffe', 'elephant', 'zebra', 'horse', 'unicorn', 'cow', 'ox', 'water-buffalo', 'pig', 'boar', 'pig-nose', 'ram', 'ewe', 'goat', 'sheep', 'llama', 'deer', 'camel', 'two-hump-camel', 'monkey', 'monkey-face', 'gorilla', 'orangutan', 'dog', 'dog-face', 'guide-dog', 'poodle', 'wolf', 'fox', 'raccoon', 'cat', 'cat-face', 'black-cat', 'rabbit', 'rabbit-face', 'bear', 'polar-bear', 'panda', 'koala', 'kangaroo', 'hippopotamus', 'rhinoceros', 'mouse', 'mouse-face', 'rat', 'hamster', 'chipmunk', 'hedgehog', 'bat', 'otter', 'sloth', 'skunk', 'badger', 'beaver', 'bison', 'mammoth'] },
  { id: 'aves', name: 'Aves', keys: ['bird', 'chicken', 'rooster', 'hatching-chick', 'baby-chick', 'front-facing-baby-chick', 'duck', 'swan', 'eagle', 'owl', 'dove', 'parrot', 'peacock', 'flamingo', 'turkey', 'penguin', 'dodo', 'goose', 'feather'] },
  { id: 'aquaticos', name: 'Aquáticos', keys: ['fish', 'tropical-fish', 'blowfish', 'shark', 'whale', 'spouting-whale', 'dolphin', 'octopus', 'squid', 'crab', 'lobster', 'shrimp', 'oyster', 'seal', 'jellyfish', 'coral', 'spiral-shell'] },
  { id: 'repteis', name: 'Répteis & anfíbios', keys: ['crocodile', 'turtle', 'snake', 'lizard', 'frog', 'dragon', 'dragon-face', 't-rex', 'sauropod'] },
  { id: 'insetos', name: 'Insetos & outros', keys: ['butterfly', 'honeybee', 'lady-beetle', 'beetle', 'bug', 'cockroach', 'cricket', 'ant', 'fly', 'mosquito', 'worm', 'snail', 'spider', 'spider-web', 'scorpion', 'microbe', 'paw-prints'] }
]

const stripDefs = (b) => b.replace(/<defs>[\s\S]*?<\/defs>/g, '')
const svgPaths = (b) => [...stripDefs(b).matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1])

const ICONS = {}
const cats = []
let total = 0, missing = []
for (const c of WANT) {
  const keys = []
  for (const k of c.keys) {
    if (!have[k]) { missing.push(k); continue }
    const ds = svgPaths(have[k].body || '')
    if (!ds.length) { missing.push(k + '(vazio)'); continue }
    ICONS[k] = ds; keys.push(k); total++
  }
  if (keys.length) cats.push({ id: c.id, name: c.name, keys })
}

fs.writeFileSync('src/lib/icons/animalsData.js',
  '// GERADO por bake-animals.mjs — não editar à mão.\n' +
  'export const ANIMALS_VB = ' + VB + '\n' +
  'export const ANIMALS_ICONS = ' + JSON.stringify(ICONS) + '\n')
fs.writeFileSync('src/lib/icons/animalsCats.js',
  '// GERADO por bake-animals.mjs\nexport default ' + JSON.stringify(cats) + '\n')

console.log('Animais baked:', total, 'em', cats.length, 'categorias')
console.log(cats.map((c) => `${c.name}:${c.keys.length}`).join('  '))
console.log('faltando (não existem no set):', missing.join(', '))
const kb = fs.statSync('src/lib/icons/animalsData.js').size / 1024
console.log('animalsData.js:', kb.toFixed(0) + 'KB')
