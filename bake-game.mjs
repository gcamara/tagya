// Bake da lib game-icons (silhuetas P&B, viewBox 512, 1 path fill por ícone).
// Fonte: @iconify-json/game-icons (--no-save). Curado em categorias úteis p/ etiquetas
// (sem limite por categoria) + "Outros" pro resto. Saída: src/lib/icons/game{Data,Cats}.js
import fs from 'node:fs'
import path from 'node:path'

const ic = JSON.parse(fs.readFileSync('node_modules/@iconify-json/game-icons/icons.json', 'utf8'))
const VB = ic.width || 512
const all = ic.icons || {}
const keys = Object.keys(all).sort()

const svgPaths = (body) => [...body.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1])

// categoria = 1ª que casar (por segmento de nome). Ordem importa.
const CATS = [
  { id: 'animais', name: 'Animais', kw: ['lion', 'tiger', 'giraffe', 'crocodile', 'alligator', 'gator', 'elephant', 'fox', 'wolf', 'bear', 'cat', 'kitten', 'dog', 'puppy', 'rabbit', 'bunny', 'hare', 'monkey', 'gorilla', 'ape', 'panda', 'penguin', 'owl', 'eagle', 'turtle', 'tortoise', 'snake', 'cobra', 'rattlesnake', 'frog', 'toad', 'fish', 'shark', 'bird', 'dove', 'raven', 'parrot', 'duck', 'chicken', 'rooster', 'butterfly', 'bee', 'beetle', 'horse', 'cow', 'bull', 'pig', 'boar', 'sheep', 'goat', 'deer', 'stag', 'zebra', 'rhino', 'rhinoceros', 'hippo', 'camel', 'kangaroo', 'koala', 'sloth', 'whale', 'dolphin', 'octopus', 'crab', 'spider', 'scorpion', 'seahorse', 'jellyfish', 'bat', 'dragon', 'dinosaur', 'rex', 'raptor', 'velociraptor', 'unicorn', 'snail', 'paw', 'feather', 'clownfish', 'flatfish', 'pufferfish', 'porcupinefish', 'angler', 'hummingbird', 'kiwi', 'flamingo', 'crow', 'werewolf', 'direwolf', 'mammoth', 'pangolin'] },
  { id: 'natureza', name: 'Natureza & plantas', kw: ['tree', 'leaf', 'flower', 'plant', 'sprout', 'seedling', 'mushroom', 'cactus', 'palm', 'pine', 'oak', 'bamboo', 'clover', 'rose', 'sunflower', 'wheat', 'corn', 'acorn', 'root', 'vine', 'forest', 'mountain', 'volcano', 'island', 'desert', 'cave', 'rock', 'stone', 'crystal', 'gem', 'water-drop', 'wave', 'fire', 'flame', 'sun', 'moon', 'star', 'planet', 'earth', 'comet', 'cloud', 'rain', 'snow', 'storm', 'lightning', 'wind', 'tornado', 'rainbow', 'icicle'] },
  { id: 'comida', name: 'Comida & bebida', kw: ['apple', 'banana', 'cherry', 'grapes', 'strawberry', 'fruit', 'bread', 'meat', 'steak', 'chicken-leg', 'cheese', 'egg', 'pizza', 'cake', 'cupcake', 'cookie', 'donut', 'candy', 'honey', 'milk', 'coffee', 'tea', 'beer', 'wine', 'bottle', 'cup', 'mug', 'jug', 'soup', 'bowl', 'rice', 'noodles', 'sushi', 'hamburger', 'hotdog', 'sausage', 'bacon', 'fish-cooked', 'roast', 'salt', 'pepper', 'sugar', 'jar', 'can', 'fork', 'knife', 'spoon', 'plate', 'cauldron'] },
  { id: 'corpo', name: 'Corpo & saúde', kw: ['hand', 'fist', 'palm', 'finger', 'thumb', 'foot', 'leg', 'arm', 'eye', 'ear', 'nose', 'mouth', 'lips', 'tooth', 'teeth', 'tongue', 'heart', 'brain', 'lungs', 'liver', 'kidney', 'stomach', 'bone', 'skull', 'skeleton', 'spine', 'ribcage', 'muscle', 'blood', 'dna', 'pill', 'syringe', 'bandage', 'medicine', 'stethoscope', 'health', 'pulse'] },
  { id: 'ferramentas', name: 'Ferramentas', kw: ['axe', 'hammer', 'saw', 'wrench', 'anvil', 'pickaxe', 'shovel', 'spade', 'rake', 'hoe', 'screwdriver', 'drill', 'pliers', 'chisel', 'scissors', 'knife', 'scythe', 'sickle', 'tool', 'toolbox', 'gear', 'cog', 'screw', 'nail', 'bolt', 'nut', 'ladder', 'brush', 'paint', 'rope', 'chain', 'magnet', 'ruler', 'compass', 'pencil', 'pen', 'fishing-pole', 'fishing-rod', 'net', 'bucket', 'rolling-pin'] },
  { id: 'objetos', name: 'Objetos & roupas', kw: ['hat', 'cap', 'helm', 'helmet', 'crown', 'boot', 'shoe', 'glove', 'gloves', 'ring', 'necklace', 'glasses', 'mask', 'shirt', 'coat', 'cape', 'dress', 'backpack', 'bag', 'pouch', 'wallet', 'key', 'lock', 'chest', 'box', 'barrel', 'book', 'scroll', 'paper', 'letter', 'candle', 'lantern', 'lamp', 'torch', 'mirror', 'clock', 'hourglass', 'umbrella', 'balloon', 'kite', 'umbrella', 'gift', 'present', 'potion', 'flask', 'vial', 'ticket', 'coin', 'money', 'diamond', 'treasure', 'trophy', 'medal', 'flag', 'banner', 'bell', 'anvil'] },
  { id: 'transporte', name: 'Transporte', kw: ['car', 'truck', 'cart', 'wagon', 'boat', 'ship', 'sail', 'anchor', 'rocket', 'plane', 'airplane', 'helicopter', 'balloon', 'wheel', 'tire', 'engine', 'submarine', 'tank', 'horse-cart', 'caravel', 'drakkar', 'galleon', 'canoe', 'raft', 'rocket-flight'] },
  { id: 'musica', name: 'Música', kw: ['music', 'note', 'drum', 'guitar', 'lute', 'violin', 'horn', 'trumpet', 'flute', 'harp', 'piano', 'bell', 'bells', 'tambourine', 'maracas', 'whistle', 'saxophone', 'banjo'] },
  { id: 'esportes', name: 'Esportes & jogos', kw: ['ball', 'soccer', 'football', 'basketball', 'baseball', 'tennis', 'golf', 'bowling', 'dice', 'cards', 'card', 'chess', 'pawn', 'king', 'queen', 'bishop', 'rook', 'knight', 'domino', 'puzzle', 'joystick', 'gamepad', 'target', 'dartboard', 'trophy', 'medal', 'podium', 'skateboard', 'surf', 'ski', 'snowboard', 'kite', 'whistle', 'flag-checkered'] },
  { id: 'simbolos', name: 'Símbolos & setas', kw: ['arrow', 'arrows', 'chevron', 'star', 'heart', 'shield', 'crown', 'cross', 'check', 'plus', 'minus', 'circle', 'square', 'triangle', 'diamond', 'hexagon', 'pentagon', 'spiral', 'infinity', 'yin-yang', 'sun-symbol', 'moon-symbol', 'eye-symbol', 'crystal', 'gem', 'crosshair', 'aim', 'lightning', 'fireball', 'sparkles', 'rune', 'sigil', 'emblem', 'badge', 'crest', 'banner', 'flag'] }
]

function pickCat(name) {
  const segs = name.split('-')
  for (const c of CATS) {
    if (c.kw.some((kw) => kw.includes('-') ? name.includes(kw) : (segs.includes(kw) || name === kw))) return c.id
  }
  return 'outros'
}

const ICONS = {}
const byCat = {}
for (const key of keys) {
  const cid = pickCat(key)
  if (cid === 'outros') continue // pula fantasia/combate — irrelevante p/ etiquetas
  const ds = svgPaths(all[key].body || '')
  if (!ds.length) continue
  ICONS[key] = ds
  ;(byCat[cid] = byCat[cid] || []).push(key)
}

const cats = []
for (const c of CATS) if (byCat[c.id]) cats.push({ id: c.id, name: c.name, keys: byCat[c.id] })

fs.writeFileSync('src/lib/icons/gameData.js',
  '// GERADO por bake-game.mjs — não editar à mão.\n' +
  'export const GAME_VB = ' + VB + '\n' +
  'export const GAME_ICONS = ' + JSON.stringify(ICONS) + '\n')
fs.writeFileSync('src/lib/icons/gameCats.js',
  '// GERADO por bake-game.mjs\nexport default ' + JSON.stringify(cats) + '\n')

const total = Object.values(byCat).reduce((n, a) => n + a.length, 0)
console.log('game-icons baked:', total, 'ícones em', cats.length, 'categorias')
console.log(cats.map((c) => `${c.name}:${c.keys.length}`).join('  '))
const kb = (s) => (fs.statSync('src/lib/icons/' + s).size / 1024).toFixed(0) + 'KB'
console.log('gameData.js:', kb('gameData.js'), '| gameCats.js:', kb('gameCats.js'))
