// Modelo de etiqueta + motor de renderização (canvas DOM).
// Usado pelo editor (preview), pela exportação PNG/PDF e pela impressão Niimbot.
// Térmica = monocromática: tudo preto sobre branco.
//
// Cada elemento carrega seu próprio conteúdo (texto/QR/código de barras literais),
// tornando o app um editor de etiquetas autônomo — sem depender de dados externos.

import qrcode from 'qrcode-generator'
import JsBarcode from 'jsbarcode'
import { drawLibIcon, ensureTemplateLibs } from './icons/index.js'
import { drawOrnament } from './ornaments.js'

export const DPMM = 8 // 8 pontos/mm ≈ 203 DPI (resolução das Niimbot)

// Fontes para o texto. As "web-safe" não precisam carregar; as do Google Fonts
// (com `fam` + `g`) são carregadas via <link> e aguardadas antes de desenhar no canvas.
export const FONTS = [
  { id: 'sans', name: 'Sans', css: 'Arial, Helvetica, sans-serif' },
  { id: 'serif', name: 'Serif', css: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', name: 'Monoespaçada', css: '"Courier New", monospace' },
  { id: 'rounded', name: 'Arredondada', css: '"Trebuchet MS", "Segoe UI", sans-serif' },
  { id: 'condensed', name: 'Condensada', css: '"Arial Narrow", sans-serif' },
  { id: 'impact', name: 'Impactante', css: 'Impact, "Arial Black", sans-serif' },
  { id: 'verdana', name: 'Verdana', css: 'Verdana, Geneva, sans-serif' },
  { id: 'tahoma', name: 'Tahoma', css: 'Tahoma, Geneva, sans-serif' },
  { id: 'casual', name: 'Casual', css: '"Comic Sans MS", cursive' },
  { id: 'inter', name: 'Inter', fam: 'Inter', g: 'Inter:wght@400;700', css: '"Inter", sans-serif' },
  { id: 'poppins', name: 'Poppins', fam: 'Poppins', g: 'Poppins:wght@400;700', css: '"Poppins", sans-serif' },
  { id: 'montserrat', name: 'Montserrat', fam: 'Montserrat', g: 'Montserrat:wght@400;700', css: '"Montserrat", sans-serif' },
  { id: 'oswald', name: 'Oswald', fam: 'Oswald', g: 'Oswald:wght@400;700', css: '"Oswald", sans-serif' },
  { id: 'bebas', name: 'Bebas Neue', fam: 'Bebas Neue', g: 'Bebas+Neue', css: '"Bebas Neue", sans-serif' },
  { id: 'anton', name: 'Anton', fam: 'Anton', g: 'Anton', css: '"Anton", sans-serif' },
  { id: 'archivoblack', name: 'Archivo Black', fam: 'Archivo Black', g: 'Archivo+Black', css: '"Archivo Black", sans-serif' },
  { id: 'kanit', name: 'Kanit', fam: 'Kanit', g: 'Kanit:wght@400;700', css: '"Kanit", sans-serif' },
  { id: 'fredoka', name: 'Fredoka', fam: 'Fredoka', g: 'Fredoka:wght@400;600', css: '"Fredoka", sans-serif' },
  { id: 'baloo', name: 'Baloo 2', fam: 'Baloo 2', g: 'Baloo+2:wght@400;700;800', css: '"Baloo 2", sans-serif' },
  { id: 'quicksand', name: 'Quicksand', fam: 'Quicksand', g: 'Quicksand:wght@400;700', css: '"Quicksand", sans-serif' },
  { id: 'righteous', name: 'Righteous', fam: 'Righteous', g: 'Righteous', css: '"Righteous", cursive' },
  { id: 'playfair', name: 'Playfair Display', fam: 'Playfair Display', g: 'Playfair+Display:wght@400;700', css: '"Playfair Display", serif' },
  { id: 'merriweather', name: 'Merriweather', fam: 'Merriweather', g: 'Merriweather:wght@400;700', css: '"Merriweather", serif' },
  { id: 'lora', name: 'Lora', fam: 'Lora', g: 'Lora:wght@400;700', css: '"Lora", serif' },
  { id: 'robotomono', name: 'Roboto Mono', fam: 'Roboto Mono', g: 'Roboto+Mono:wght@400;700', css: '"Roboto Mono", monospace' },
  { id: 'pacifico', name: 'Pacifico', fam: 'Pacifico', g: 'Pacifico', css: '"Pacifico", cursive' },
  { id: 'caveat', name: 'Caveat', fam: 'Caveat', g: 'Caveat:wght@400;700', css: '"Caveat", cursive' },
  { id: 'dancing', name: 'Dancing Script', fam: 'Dancing Script', g: 'Dancing+Script:wght@400;700', css: '"Dancing Script", cursive' },
  { id: 'marker', name: 'Permanent Marker', fam: 'Permanent Marker', g: 'Permanent+Marker', css: '"Permanent Marker", cursive' },
  { id: 'bangers', name: 'Bangers', fam: 'Bangers', g: 'Bangers', css: '"Bangers", cursive' },
  { id: 'lobster', name: 'Lobster', fam: 'Lobster', g: 'Lobster', css: '"Lobster", cursive' },
  { id: 'satisfy', name: 'Satisfy', fam: 'Satisfy', g: 'Satisfy', css: '"Satisfy", cursive' }
]
export const DEFAULT_FONT = FONTS[0].css

// Formatos de código de barras (jsbarcode). Cada um valida a entrada à sua maneira
// (EAN/UPC exigem dígitos numéricos no tamanho certo).
export const BARCODE_FORMATS = [
  { id: 'CODE128', name: 'CODE128 (geral)' },
  { id: 'EAN13', name: 'EAN-13 (produto)' },
  { id: 'EAN8', name: 'EAN-8' },
  { id: 'UPC', name: 'UPC-A' },
  { id: 'CODE39', name: 'CODE39' },
  { id: 'ITF', name: 'ITF (intercalado 2/5)' },
  { id: 'MSI', name: 'MSI' },
  { id: 'codabar', name: 'Codabar' }
]

// URL do Google Fonts com todas as famílias usadas.
export const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  FONTS.filter((f) => f.g).map((f) => 'family=' + f.g).join('&') + '&display=swap'

// Aguarda as fontes do Google usadas no template ficarem prontas (antes de desenhar).
export async function ensureFontsLoaded(template) {
  if (!hasDOM || !document.fonts) return
  const fams = new Set()
  for (const el of template.elements || []) {
    if (el.type === 'text' && el.font) {
      const f = FONTS.find((x) => x.css === el.font)
      if (f && f.fam) fams.add(f.fam)
    }
  }
  await Promise.all([...fams].flatMap((fam) => [
    document.fonts.load(`400 24px "${fam}"`).catch(() => {}),
    document.fonts.load(`700 24px "${fam}"`).catch(() => {})
  ]))
}

const hasDOM = typeof document !== 'undefined'

export function createCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  return canvas
}

export const DEFAULT_TEMPLATE = {
  name: 'Nova etiqueta',
  widthMm: 40,
  heightMm: 12,
  elements: [
    { id: 'border', type: 'rect', x: 0.6, y: 0.6, w: 38.8, h: 10.8, fill: false, lineMm: 0.4 },
    { id: 'title', type: 'text', text: 'Yasmin', x: 2, y: 1.4, w: 25, h: 4.4, fontMm: 3.4, bold: true, align: 'left' },
    { id: 'sub', type: 'text', text: 'Etiqueta personalizada', x: 2, y: 6, w: 25, h: 3, fontMm: 2.3, bold: false, align: 'left' },
    { id: 'qr', type: 'qr', text: 'https://tagya.app', x: 29.5, y: 1.5, w: 9, h: 9 }
  ]
}

// ---- Data dinâmica ----
const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const DATE_FORMATS = [
  { id: 'dd/MM/yyyy', label: '31/12/2026' },
  { id: 'dd/MM/yy', label: '31/12/26' },
  { id: 'dd/MM', label: '31/12' },
  { id: 'yyyy-MM-dd', label: '2026-12-31' },
  { id: 'dd MMM yyyy', label: '31 dez 2026' },
  { id: 'dd/MM/yyyy HH:mm', label: '31/12/2026 14:30' },
  { id: 'HH:mm', label: '14:30' }
]
const pad2 = (n) => String(n).padStart(2, '0')
function formatDate(d, fmt) {
  return (fmt || 'dd/MM/yyyy')
    .replace('yyyy', d.getFullYear())
    .replace('yy', pad2(d.getFullYear() % 100))
    .replace('MMM', MESES_PT[d.getMonth()])
    .replace('MM', pad2(d.getMonth() + 1))
    .replace('dd', pad2(d.getDate()))
    .replace('HH', pad2(d.getHours()))
    .replace('mm', pad2(d.getMinutes()))
}
// Calcula a data do elemento: hoje, hoje + N dias (validade) ou data fixa.
export function dateElValue(el) {
  let d = new Date()
  if (el.dateMode === 'offset') d = new Date(Date.now() + (Number(el.offsetDays) || 0) * 86400000)
  else if (el.dateMode === 'fixed' && el.fixedDate) {
    const fd = new Date(String(el.fixedDate) + 'T00:00:00')
    if (!isNaN(fd.getTime())) d = fd
  }
  return (el.prefix || '') + formatDate(d, el.fmt)
}

// Conteúdo a renderizar para um elemento.
function contentFor(el) {
  if (el.type === 'text') return el.text ?? ''
  if (el.type === 'qr' || el.type === 'barcode') return el.text ?? ''
  if (el.type === 'date') return dateElValue(el)
  return ''
}

// ---- cache de imagens (logos) para render síncrono ----
const imageCache = new Map()
const processedCache = new Map()

// Converte a imagem para P&B (1 bit) — limiar simples ou dithering Floyd-Steinberg.
// Resultado cacheado por src+limiar+dither (no tamanho natural da imagem).
function processedImage(src, img, threshold, dither) {
  const th = threshold == null ? 128 : Number(threshold)
  const key = src + '|' + th + '|' + (dither ? 1 : 0)
  if (processedCache.has(key)) return processedCache.get(key)
  const w = img.naturalWidth || img.width || 1
  const h = img.naturalHeight || img.height || 1
  const cv = createCanvas(w, h)
  const c = cv.getContext('2d')
  c.drawImage(img, 0, 0, w, h)
  const id = c.getImageData(0, 0, w, h)
  const d = id.data
  const gray = new Float32Array(w * h)
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const a = d[i + 3] / 255 // transparente vira branco
    gray[p] = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) * a + 255 * (1 - a)
  }
  if (dither) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const p = yy * w + xx
      const nv = gray[p] < th ? 0 : 255
      const err = gray[p] - nv
      gray[p] = nv
      if (xx + 1 < w) gray[p + 1] += err * 7 / 16
      if (yy + 1 < h) {
        if (xx > 0) gray[p + w - 1] += err * 3 / 16
        gray[p + w] += err * 5 / 16
        if (xx + 1 < w) gray[p + w + 1] += err * 1 / 16
      }
    }
  } else {
    for (let p = 0; p < gray.length; p++) gray[p] = gray[p] < th ? 0 : 255
  }
  for (let i = 0, p = 0; i < d.length; i += 4, p++) { const v = gray[p]; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255 }
  c.putImageData(id, 0, 0)
  processedCache.set(key, cv)
  return cv
}

export async function preloadTemplateImages(template) {
  if (!hasDOM) return
  await ensureTemplateLibs(template)
  await ensureFontsLoaded(template)
  const srcs = (template.elements || []).filter((e) => e.type === 'image' && e.src).map((e) => e.src)
  await Promise.all(srcs.map((src) => new Promise((resolve) => {
    if (imageCache.has(src)) return resolve()
    const img = new Image()
    img.onload = () => { imageCache.set(src, img); resolve() }
    img.onerror = () => resolve()
    img.src = src
  })))
}

// Renderiza o modelo num canvas novo. pxPerMm: 8 p/ impressão, maior p/ preview nítido.
export function renderTemplateToCanvas(template, pxPerMm = DPMM) {
  const W = Math.max(1, Math.round(template.widthMm * pxPerMm))
  const H = Math.max(1, Math.round(template.heightMm * pxPerMm))
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#000'
  ctx.strokeStyle = '#000'

  for (const el of template.elements || []) {
    const x = (el.x || 0) * pxPerMm
    const y = (el.y || 0) * pxPerMm
    const w = (el.w || 0) * pxPerMm
    const h = (el.h || 0) * pxPerMm
    const rot = Number(el.rot) || 0
    ctx.save()
    if (rot) { const cx = x + w / 2, cy = y + h / 2; ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180); ctx.translate(-cx, -cy) }
    try {
      if (el.type === 'rect') {
        if (el.fill) ctx.fillRect(x, y, w, h)
        else { ctx.lineWidth = Math.max(1, (el.lineMm || 0.4) * pxPerMm); ctx.strokeRect(x, y, w, h) }
      } else if (el.type === 'line') {
        ctx.lineWidth = Math.max(1, (el.lineMm || 0.4) * pxPerMm)
        ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke()
      } else if (el.type === 'text' || el.type === 'date') {
        drawText(ctx, contentFor(el), x, y, w, h, (el.fontMm || 3) * pxPerMm, el.bold, el.align || 'left', el.font)
      } else if (el.type === 'qr') {
        drawQR(ctx, contentFor(el), x, y, Math.min(w, h))
      } else if (el.type === 'barcode') {
        drawBarcode(x, y, w, h, contentFor(el), ctx, el.barFormat, el.barText)
      } else if (el.type === 'icon') {
        const sz = Math.min(w, h)
        drawLibIcon(ctx, el.iconLib || 'etiqya', el.icon || 'star', x + (w - sz) / 2, y + (h - sz) / 2, sz)
      } else if (el.type === 'ornament') {
        drawOrnament(ctx, el.ornament || 'div-diamond', x, y, w, h)
      } else if (el.type === 'table') {
        drawTable(ctx, el, x, y, w, h, pxPerMm)
      } else if (el.type === 'image' && el.src && imageCache.has(el.src)) {
        const img = imageCache.get(el.src)
        if (el.bw === false) ctx.drawImage(img, x, y, w, h)
        else ctx.drawImage(processedImage(el.src, img, el.threshold, el.dither), x, y, w, h)
      }
    } catch { /* elemento inválido — ignora */ }
    ctx.restore()
  }
  return canvas
}

function drawText(ctx, text, x, y, w, h, fontPx, bold, align, family) {
  let t = String(text ?? '')
  if (!t) return
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'middle'
  ctx.font = `${bold ? 'bold ' : ''}${Math.max(6, fontPx)}px ${family || 'Arial, Helvetica, sans-serif'}`
  if (ctx.measureText(t).width > w) {
    while (t.length > 1 && ctx.measureText(t + '…').width > w) t = t.slice(0, -1)
    t += '…'
  }
  ctx.textAlign = align
  const tx = align === 'center' ? x + w / 2 : align === 'right' ? x + w : x
  ctx.fillText(t, tx, y + h / 2)
  ctx.textAlign = 'left'
}

// Desenha uma tabela (grade + texto centralizado em cada célula). cells é row-major.
function drawTable(ctx, el, x, y, w, h, pxPerMm) {
  const rows = Math.max(1, Math.round(el.rows || 1))
  const cols = Math.max(1, Math.round(el.cols || 1))
  const lw = Math.max(1, (el.lineMm || 0.3) * pxPerMm)
  ctx.lineWidth = lw; ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'
  ctx.strokeRect(x, y, w, h)
  const cw = w / cols, ch = h / rows
  for (let c = 1; c < cols; c++) { ctx.beginPath(); ctx.moveTo(x + c * cw, y); ctx.lineTo(x + c * cw, y + h); ctx.stroke() }
  for (let r = 1; r < rows; r++) { ctx.beginPath(); ctx.moveTo(x, y + r * ch); ctx.lineTo(x + w, y + r * ch); ctx.stroke() }
  const fontPx = Math.max(6, (el.fontMm || 2.4) * pxPerMm)
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'
  const cells = el.cells || []
  const pad = Math.min(cw, ch) * 0.14
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let t = String(cells[r * cols + c] ?? '')
      if (!t) continue
      const bold = r === 0 && el.headerBold
      ctx.font = `${bold ? 'bold ' : ''}${fontPx}px Arial, Helvetica, sans-serif`
      const maxw = cw - pad * 2
      if (ctx.measureText(t).width > maxw) { while (t.length > 1 && ctx.measureText(t + '…').width > maxw) t = t.slice(0, -1); t += '…' }
      ctx.fillText(t, x + c * cw + cw / 2, y + r * ch + ch / 2)
    }
  }
  ctx.textAlign = 'left'
}

function drawQR(ctx, text, x, y, size) {
  const content = String(text ?? '')
  if (!content || size < 2) return
  const qr = qrcode(0, 'M')
  qr.addData(content)
  qr.make()
  const count = qr.getModuleCount()
  const cell = size / count
  ctx.fillStyle = '#000'
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell))
    }
  }
}

function drawBarcode(x, y, w, h, text, ctx, format, showText) {
  const content = String(text ?? '')
  if (!content || w < 4 || h < 4) return
  const off = createCanvas(Math.round(w), Math.round(h))
  try {
    JsBarcode(off, content, {
      format: format || 'CODE128', displayValue: !!showText,
      fontSize: Math.max(8, Math.round(h * 0.2)), textMargin: 1,
      margin: 0, width: 2, height: Math.round(showText ? h * 0.74 : h)
    })
    ctx.drawImage(off, x, y, w, h)
  } catch {
    // entrada inválida para o formato escolhido — desenha um aviso discreto
    ctx.save(); ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'
    ctx.font = `${Math.max(7, Math.round(h * 0.22))}px sans-serif`
    ctx.fillText('cód. inválido', x + w / 2, y + h / 2)
    ctx.restore()
  }
}
