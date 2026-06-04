// Biblioteca de ORNAMENTOS desenhados por código (canvas, P&B térmico).
// Diferente dos ícones (quadrado centralizado), o ornamento PREENCHE a caixa do
// elemento (x, y, w, h): divisórias esticam na largura, molduras ocupam o retângulo,
// cantos ancoram no canto. Tudo em preto, traço limpo — ideal pra impressão térmica.

function setup(c, w, h, factor = 0.05) {
  c.save()
  c.strokeStyle = '#000'
  c.fillStyle = '#000'
  c.lineWidth = Math.max(1, Math.min(Math.min(w, h) * factor, 6))
  c.lineCap = 'round'
  c.lineJoin = 'round'
}
const line = (c, x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke() }
const dot = (c, cx, cy, r) => { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill() }
const ring = (c, cx, cy, r) => { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke() }
function diamond(c, cx, cy, r, fill) {
  c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.closePath()
  fill ? c.fill() : c.stroke()
}
// desenha algo e espelha em torno do centro da caixa (fx/fy = -1 para espelhar)
function mirror(c, x, y, w, h, fx, fy, draw) {
  const cx = x + w / 2, cy = y + h / 2
  c.save(); c.translate(cx, cy); c.scale(fx, fy); c.translate(-cx, -cy); draw(); c.restore()
}

// ---------- DIVISÓRIAS (esticam na largura, centradas em y) ----------
function dividerSides(c, x, y, w, h, gapU) {
  const cy = y + h / 2
  line(c, x + w * 0.04, cy, x + w * gapU, cy)
  line(c, x + w * (1 - gapU), cy, x + w * 0.96, cy)
}
// curl decorativo perto do centro (lado esquerdo), apontando pra dentro
function innerCurl(c, x, y, w, h, atU) {
  const cy = y + h / 2, ex = x + w * atU, r = h * 0.34
  c.beginPath()
  c.moveTo(ex, cy)
  c.bezierCurveTo(ex - w * 0.06, cy, ex - w * 0.085, cy - r, ex - w * 0.03, cy - r)
  c.bezierCurveTo(ex + w * 0.01, cy - r, ex + w * 0.005, cy - r * 0.45, ex - w * 0.02, cy - r * 0.5)
  c.stroke()
}

export const ORNAMENTS = {
  'div-line': (c, x, y, w, h) => { setup(c, w, h); line(c, x + w * 0.03, y + h / 2, x + w * 0.97, y + h / 2); c.restore() },
  'div-diamond': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.42); diamond(c, x + w / 2, y + h / 2, h * 0.22, true); c.restore() },
  'div-diamond-open': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.42); diamond(c, x + w / 2, y + h / 2, h * 0.26, false); c.restore() },
  'div-dots': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.42); const cy = y + h / 2, cx = x + w / 2; dot(c, cx, cy, h * 0.1); dot(c, cx - h * 0.42, cy, h * 0.07); dot(c, cx + h * 0.42, cy, h * 0.07); c.restore() },
  'div-double': (c, x, y, w, h) => { setup(c, w, h, 0.035); const cy = y + h / 2; line(c, x + w * 0.03, cy - h * 0.16, x + w * 0.97, cy - h * 0.16); line(c, x + w * 0.03, cy + h * 0.16, x + w * 0.97, cy + h * 0.16); diamond(c, x + w / 2, cy, h * 0.3, true); c.restore() },
  'div-leaf': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.4); const cx = x + w / 2, cy = y + h / 2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx + s * w * 0.05, cy - h * 0.32, cx + s * w * 0.09, cy); c.quadraticCurveTo(cx + s * w * 0.05, cy + h * 0.05, cx, cy); c.stroke() } dot(c, cx, cy, h * 0.08); c.restore() },
  'div-curls': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.38); innerCurl(c, x, y, w, h, 0.38); mirror(c, x, y, w, h, -1, 1, () => innerCurl(c, x, y, w, h, 0.38)); diamond(c, x + w / 2, y + h / 2, h * 0.16, true); c.restore() },
  'div-wave': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cy = y + h / 2, n = Math.max(4, Math.round(w / (h * 1.2))); c.beginPath(); c.moveTo(x + w * 0.03, cy); for (let i = 0; i < n; i++) { const x1 = x + w * 0.03 + (w * 0.94) * (i / n), x2 = x + w * 0.03 + (w * 0.94) * ((i + 1) / n); c.quadraticCurveTo((x1 + x2) / 2, cy + (i % 2 ? h * 0.3 : -h * 0.3), x2, cy) } c.stroke(); c.restore() },
  'div-arrowtips': (c, x, y, w, h) => { setup(c, w, h); const cy = y + h / 2; line(c, x + w * 0.08, cy, x + w * 0.92, cy); for (const s of [0.08, 0.92]) { const ex = x + w * s, d = s < 0.5 ? 1 : -1; line(c, ex, cy, ex + d * w * 0.04, cy - h * 0.28); line(c, ex, cy, ex + d * w * 0.04, cy + h * 0.28) } diamond(c, x + w / 2, cy, h * 0.18, true); c.restore() },

  // ---------- CANTOS (ancorados; 4 orientações via espelho) ----------
  'corner-tl': (c, x, y, w, h) => drawCornerSet(c, x, y, w, h, 1, 1),
  'corner-tr': (c, x, y, w, h) => drawCornerSet(c, x, y, w, h, -1, 1),
  'corner-bl': (c, x, y, w, h) => drawCornerSet(c, x, y, w, h, 1, -1),
  'corner-br': (c, x, y, w, h) => drawCornerSet(c, x, y, w, h, -1, -1),
  'bracket-tl': (c, x, y, w, h) => drawBracketSet(c, x, y, w, h, 1, 1),
  'bracket-tr': (c, x, y, w, h) => drawBracketSet(c, x, y, w, h, -1, 1),
  'bracket-bl': (c, x, y, w, h) => drawBracketSet(c, x, y, w, h, 1, -1),
  'bracket-br': (c, x, y, w, h) => drawBracketSet(c, x, y, w, h, -1, -1),

  // ---------- MOLDURAS (preenchem o retângulo) ----------
  'frame-line': (c, x, y, w, h) => { setup(c, w, h, 0.03); c.strokeRect(x + 1, y + 1, w - 2, h - 2); c.restore() },
  'frame-double': (c, x, y, w, h) => { setup(c, w, h, 0.025); const g = Math.min(w, h) * 0.06; c.strokeRect(x + 1, y + 1, w - 2, h - 2); c.strokeRect(x + g, y + g, w - 2 * g, h - 2 * g); c.restore() },
  'frame-round': (c, x, y, w, h) => { setup(c, w, h, 0.03); rrect(c, x + 1, y + 1, w - 2, h - 2, Math.min(w, h) * 0.16); c.stroke(); c.restore() },
  'frame-dashed': (c, x, y, w, h) => { setup(c, w, h, 0.03); c.setLineDash([Math.min(w, h) * 0.08, Math.min(w, h) * 0.06]); c.strokeRect(x + 1, y + 1, w - 2, h - 2); c.setLineDash([]); c.restore() },
  'frame-corners': (c, x, y, w, h) => { setup(c, w, h, 0.03); c.strokeRect(x + 1, y + 1, w - 2, h - 2); const m = Math.min(w, h) * 0.18; for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) mirror(c, x, y, w, h, fx, fy, () => { line(c, x + m * 0.6, y + m * 1.4, x + m * 0.6, y + m * 0.6); line(c, x + m * 0.6, y + m * 0.6, x + m * 1.4, y + m * 0.6) }); c.restore() },
  'frame-deco': (c, x, y, w, h) => { setup(c, w, h, 0.03); const s = Math.min(w, h) * 0.16; for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) mirror(c, x, y, w, h, fx, fy, () => { c.beginPath(); c.moveTo(x + s, y + 2); c.lineTo(x + 2, y + 2); c.lineTo(x + 2, y + s); c.stroke() }); line(c, x + Math.min(w, h) * 0.16, y + 2, x + w - Math.min(w, h) * 0.16, y + 2); line(c, x + Math.min(w, h) * 0.16, y + h - 2, x + w - Math.min(w, h) * 0.16, y + h - 2); line(c, x + 2, y + Math.min(w, h) * 0.16, x + 2, y + h - Math.min(w, h) * 0.16); line(c, x + w - 2, y + Math.min(w, h) * 0.16, x + w - 2, y + h - Math.min(w, h) * 0.16); c.restore() },

  // ---------- FLORÕES / MOTIVOS (centralizados) ----------
  'flourish': (c, x, y, w, h) => { setup(c, w, h); const cy = y + h / 2; innerCurl(c, x, y, w, h, 0.46); mirror(c, x, y, w, h, -1, 1, () => innerCurl(c, x, y, w, h, 0.46)); diamond(c, x + w / 2, cy, h * 0.18, true); line(c, x + w * 0.1, cy, x + w * 0.34, cy); line(c, x + w * 0.66, cy, x + w * 0.9, cy); c.restore() },
  'fleuron': (c, x, y, w, h) => { setup(c, w, h); const cx = x + w / 2, by = y + h * 0.9, s = Math.min(w, h); for (const a of [-1, 0, 1]) { c.beginPath(); c.moveTo(cx, by); c.quadraticCurveTo(cx + a * s * 0.28, y + h * 0.4, cx + a * s * 0.12, y + h * 0.12); c.quadraticCurveTo(cx + a * s * 0.02, y + h * 0.34, cx, by); c.stroke() } dot(c, cx, by, s * 0.05); c.restore() },
  'laurel': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cx = x + w / 2, cy = y + h / 2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx, y + h * 0.92); c.quadraticCurveTo(cx + s * w * 0.34, cy, cx + s * w * 0.06, y + h * 0.1); c.stroke(); for (let i = 1; i <= 4; i++) { const t = i / 5, lx = cx + s * (w * 0.34) * (1 - Math.abs(2 * t - 1)) * 0.9 * (1 - t * 0.2), ly = y + h * 0.92 - (h * 0.82) * t; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx + s * w * 0.07, ly - h * 0.02, lx + s * w * 0.02, ly - h * 0.1); c.stroke() } } c.restore() },
  'sunburst': (c, x, y, w, h) => { setup(c, w, h, 0.035); const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.46; for (let i = 0; i < 16; i++) { const a = (Math.PI * 2 * i) / 16, r0 = R * (i % 2 ? 0.55 : 0.78); line(c, cx + R * 0.28 * Math.cos(a), cy + R * 0.28 * Math.sin(a), cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)) } ring(c, cx, cy, R * 0.2); c.restore() },
  'scroll': (c, x, y, w, h) => { setup(c, w, h); const cy = y + h / 2; line(c, x + w * 0.16, cy, x + w * 0.84, cy); for (const s of [0.16, 0.84]) { const ex = x + w * s, d = s < 0.5 ? 1 : -1; c.beginPath(); c.arc(ex - d * h * 0.22, cy, h * 0.22, 0, Math.PI * 2); c.stroke(); dot(c, ex - d * h * 0.22, cy, h * 0.05) } c.restore() },

  // ---------- FAIXAS / RIBBONS ----------
  'banner': (c, x, y, w, h) => { setup(c, w, h, 0.04); const t = y + h * 0.28, b = y + h * 0.72, n = h * 0.22; c.beginPath(); c.moveTo(x + w * 0.06, t); c.lineTo(x + w * 0.94, t); c.lineTo(x + w * 0.94 - n, y + h / 2); c.lineTo(x + w * 0.94, b); c.lineTo(x + w * 0.06, b); c.lineTo(x + w * 0.06 + n, y + h / 2); c.closePath(); c.stroke(); c.restore() },
  'pennant': (c, x, y, w, h) => { setup(c, w, h, 0.04); c.beginPath(); c.moveTo(x + w * 0.04, y + h * 0.2); c.lineTo(x + w * 0.96, y + h * 0.2); c.lineTo(x + w * 0.5, y + h * 0.82); c.closePath(); c.stroke(); c.restore() },

  // ===== EXTRAS (estilos pesquisados: grego, corda, art déco, floral, escalope…) =====
  // Divisórias
  'div-greek': (c, x, y, w, h) => { setup(c, w, h, 0.045); greekKey(c, x, y, w, h); c.restore() },
  'div-rope': (c, x, y, w, h) => { setup(c, w, h, 0.04); rope(c, x + w * 0.03, y + h / 2, x + w * 0.97, h * 0.3); c.restore() },
  'div-chain': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cy = y + h / 2, r = h * 0.3, step = r * 1.5, n = Math.max(3, Math.floor((w * 0.94) / step)), sx = x + (w - (n - 1) * step) / 2; for (let i = 0; i < n; i++) { c.beginPath(); c.ellipse(sx + i * step, cy, r * 0.62, r, 0, 0, Math.PI * 2); c.stroke() } c.restore() },
  'div-stars': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.4); const cx = x + w / 2, cy = y + h / 2; star(c, cx, cy, h * 0.32, h * 0.14, 5, true); star(c, cx - h * 0.55, cy, h * 0.16, h * 0.07, 5, true); star(c, cx + h * 0.55, cy, h * 0.16, h * 0.07, 5, true); c.restore() },
  'div-heart': (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.42); heart(c, x + w / 2, y + h * 0.36, h * 0.55); c.restore() },
  'div-vine': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cy = y + h / 2, n = Math.max(4, Math.round(w / (h * 1.5))); c.beginPath(); c.moveTo(x + w * 0.03, cy); for (let i = 0; i < n; i++) { const x1 = x + w * 0.03 + (w * 0.94) * (i / n), x2 = x + w * 0.03 + (w * 0.94) * ((i + 1) / n); c.quadraticCurveTo((x1 + x2) / 2, cy + (i % 2 ? h * 0.22 : -h * 0.22), x2, cy) } c.stroke(); for (let i = 0; i < n; i++) { const lx = x + w * 0.03 + (w * 0.94) * ((i + 0.5) / n), up = i % 2 ? 1 : -1; c.beginPath(); c.moveTo(lx, cy); c.quadraticCurveTo(lx + h * 0.1, cy + up * h * 0.26, lx, cy + up * h * 0.42); c.quadraticCurveTo(lx - h * 0.1, cy + up * h * 0.26, lx, cy); c.stroke() } c.restore() },
  'div-deco': (c, x, y, w, h) => { setup(c, w, h, 0.045); const cy = y + h / 2, cx = x + w / 2; line(c, x + w * 0.03, cy, cx - h * 0.5, cy); line(c, cx + h * 0.5, cy, x + w * 0.97, cy); c.beginPath(); c.moveTo(cx, cy - h * 0.4); c.lineTo(cx + h * 0.42, cy); c.lineTo(cx, cy + h * 0.4); c.lineTo(cx - h * 0.42, cy); c.closePath(); c.stroke(); line(c, cx - h * 0.42, cy, cx + h * 0.42, cy); diamond(c, cx, cy, h * 0.13, true); c.restore() },
  'div-chevron': (c, x, y, w, h) => { setup(c, w, h, 0.05); const cy = y + h / 2, u = h * 0.7, n = Math.max(3, Math.floor((w * 0.9) / u)), sx = x + (w - n * u) / 2; for (let i = 0; i < n; i++) { const ux = sx + i * u; c.beginPath(); c.moveTo(ux, cy + h * 0.24); c.lineTo(ux + u / 2, cy - h * 0.24); c.lineTo(ux + u, cy + h * 0.24); c.stroke() } c.restore() },
  'div-beads': (c, x, y, w, h) => { setup(c, w, h); const cy = y + h / 2, cx = x + w / 2; line(c, x + w * 0.03, cy, x + w * 0.97, cy); dot(c, cx, cy, h * 0.24); let off = h * 0.5; for (const r of [0.15, 0.1]) { dot(c, cx - off, cy, h * r); dot(c, cx + off, cy, h * r); off += h * 0.42 } c.restore() },

  // Cantos
  'floral-tl': (c, x, y, w, h) => drawFloralCornerSet(c, x, y, w, h, 1, 1),
  'floral-tr': (c, x, y, w, h) => drawFloralCornerSet(c, x, y, w, h, -1, 1),
  'floral-bl': (c, x, y, w, h) => drawFloralCornerSet(c, x, y, w, h, 1, -1),
  'floral-br': (c, x, y, w, h) => drawFloralCornerSet(c, x, y, w, h, -1, -1),
  'deco-tl': (c, x, y, w, h) => drawDecoCornerSet(c, x, y, w, h, 1, 1),
  'deco-tr': (c, x, y, w, h) => drawDecoCornerSet(c, x, y, w, h, -1, 1),
  'deco-bl': (c, x, y, w, h) => drawDecoCornerSet(c, x, y, w, h, 1, -1),
  'deco-br': (c, x, y, w, h) => drawDecoCornerSet(c, x, y, w, h, -1, -1),

  // Molduras
  'frame-beads': (c, x, y, w, h) => { setup(c, w, h); const r = Math.min(w, h) * 0.045, step = r * 3.4; for (let px = x + r * 2.5; px < x + w - r * 1.5; px += step) { dot(c, px, y + r * 1.8, r); dot(c, px, y + h - r * 1.8, r) } for (let py = y + r * 2.5; py < y + h - r * 1.5; py += step) { dot(c, x + r * 1.8, py, r); dot(c, x + w - r * 1.8, py, r) } c.restore() },
  'frame-scallop': (c, x, y, w, h) => { setup(c, w, h, 0.03); scallopRect(c, x, y, w, h); c.restore() },
  'frame-ticket': (c, x, y, w, h) => { setup(c, w, h, 0.03); c.strokeRect(x + 1, y + 1, w - 2, h - 2); const m = Math.min(w, h) * 0.18, r = Math.min(w, h) * 0.06; for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const cx = fx > 0 ? x + m : x + w - m, cy = fy > 0 ? y + m : y + h - m; ring(c, cx, cy, r) } c.restore() },
  'frame-twist': (c, x, y, w, h) => { setup(c, w, h, 0.03); const g = Math.min(w, h) * 0.09; c.strokeRect(x + 1, y + 1, w - 2, h - 2); c.strokeRect(x + g, y + g, w - 2 * g, h - 2 * g); const step = g * 1.3; for (let px = x + g; px < x + w - g; px += step) { line(c, px, y + 1, Math.min(px + g, x + w - 1), y + g); line(c, px, y + h - 1, Math.min(px + g, x + w - 1), y + h - g) } for (let py = y + g; py < y + h - g; py += step) { line(c, x + 1, py, x + g, Math.min(py + g, y + h - 1)); line(c, x + w - 1, py, x + w - g, Math.min(py + g, y + h - 1)) } c.restore() },

  // Florões & motivos
  'rosette': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.46; for (let i = 0; i < 8; i++) { const a = Math.PI * 2 * i / 8; c.beginPath(); c.ellipse(cx + R * 0.6 * Math.cos(a), cy + R * 0.6 * Math.sin(a), R * 0.2, R * 0.34, a, 0, Math.PI * 2); c.stroke() } ring(c, cx, cy, R * 0.3); dot(c, cx, cy, R * 0.1); c.restore() },
  'compass': (c, x, y, w, h) => { setup(c, w, h, 0.035); const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.46; c.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI * 2 * i / 8 - Math.PI / 2, r = i % 2 ? R * 0.34 : R, px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py) } c.closePath(); c.stroke(); ring(c, cx, cy, R * 0.18); c.restore() },
  'bow': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cx = x + w / 2, cy = y + h * 0.42, s = Math.min(w, h) * 0.5; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx + d * s * 0.9, cy - s * 0.6, cx + d * s * 0.95, cy); c.quadraticCurveTo(cx + d * s * 0.9, cy + s * 0.6, cx, cy); c.stroke(); line(c, cx, cy, cx + d * s * 0.5, y + h * 0.92) } ring(c, cx, cy, s * 0.14); c.restore() },
  'wreath': (c, x, y, w, h) => { setup(c, w, h, 0.04); const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.4, n = 18; for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n; c.save(); c.translate(cx + R * Math.cos(a), cy + R * Math.sin(a)); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, 0, R * 0.07, R * 0.17, 0, 0, Math.PI * 2); c.stroke(); c.restore() } c.restore() },
  'badge': (c, x, y, w, h) => { setup(c, w, h, 0.035); const cx = x + w / 2; const shield = (ox, oy, sw, top) => { c.beginPath(); c.moveTo(cx - sw, top); c.lineTo(cx + sw, top); c.lineTo(cx + sw, oy); c.quadraticCurveTo(cx + sw, oy + (y + h * 0.9 - oy) * 0.9, cx, y + h * 0.9); c.quadraticCurveTo(cx - sw, oy + (y + h * 0.9 - oy) * 0.9, cx - sw, oy); c.closePath(); c.stroke() }; shield(0, y + h * 0.55, w * 0.3, y + h * 0.12); shield(0, y + h * 0.5, w * 0.22, y + h * 0.2); c.restore() },
  'mandala': (c, x, y, w, h) => { setup(c, w, h, 0.03); const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.46; ring(c, cx, cy, R); ring(c, cx, cy, R * 0.7); for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; dot(c, cx + R * 0.85 * Math.cos(a), cy + R * 0.85 * Math.sin(a), R * 0.05) } ring(c, cx, cy, R * 0.34); dot(c, cx, cy, R * 0.1); c.restore() },

  // Faixas
  'ribbon-folds': (c, x, y, w, h) => { setup(c, w, h, 0.04); const t = y + h * 0.3, b = y + h * 0.7; c.strokeRect(x + w * 0.14, t, w * 0.72, b - t); for (const s of [0.14, 0.86]) { const ex = x + w * s, d = s < 0.5 ? -1 : 1; c.beginPath(); c.moveTo(ex, t); c.lineTo(ex + d * w * 0.1, y + h * 0.16); c.lineTo(ex + d * w * 0.1, y + h * 0.84); c.lineTo(ex, b); c.lineTo(ex + d * w * 0.04, y + h / 2); c.closePath(); c.stroke() } c.restore() },
  'flag-wave': (c, x, y, w, h) => { setup(c, w, h, 0.04); const t = y + h * 0.3, b = y + h * 0.7; c.beginPath(); c.moveTo(x + w * 0.05, t); c.bezierCurveTo(x + w * 0.35, t - h * 0.18, x + w * 0.65, t + h * 0.18, x + w * 0.95, t); c.lineTo(x + w * 0.95, b); c.bezierCurveTo(x + w * 0.65, b + h * 0.18, x + w * 0.35, b - h * 0.18, x + w * 0.05, b); c.closePath(); c.stroke(); c.restore() }
}

function rrect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  c.beginPath(); c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath()
}

// canto ornamentado (swirl) — desenhado no canto superior-esquerdo, espelhado p/ os 4
function drawCornerSet(c, x, y, w, h, fx, fy) {
  setup(c, w, h, 0.05)
  mirror(c, x, y, w, h, fx, fy, () => {
    const s = Math.min(w, h)
    // L
    line(c, x + 2, y + s * 0.7, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.7, y + 2)
    // swirl interno
    c.beginPath(); c.moveTo(x + s * 0.7, y + 2)
    c.bezierCurveTo(x + s * 0.42, y + 2, x + s * 0.34, y + s * 0.34, x + s * 0.6, y + s * 0.46)
    c.bezierCurveTo(x + s * 0.74, y + s * 0.52, x + s * 0.68, y + s * 0.28, x + s * 0.5, y + s * 0.3)
    c.stroke()
    dot(c, x + 2, y + s * 0.7, s * 0.05); dot(c, x + s * 0.7, y + 2, s * 0.05)
  })
  c.restore()
}
// canto simples (colchete duplo)
function drawBracketSet(c, x, y, w, h, fx, fy) {
  setup(c, w, h, 0.05)
  mirror(c, x, y, w, h, fx, fy, () => {
    const s = Math.min(w, h)
    line(c, x + 2, y + s * 0.85, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.85, y + 2)
    line(c, x + s * 0.14, y + s * 0.55, x + s * 0.14, y + s * 0.14); line(c, x + s * 0.14, y + s * 0.14, x + s * 0.55, y + s * 0.14)
  })
  c.restore()
}

function star(c, cx, cy, ro, ri, n, fill) {
  c.beginPath()
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = (Math.PI * i) / n - Math.PI / 2, px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py) }
  c.closePath(); fill ? c.fill() : c.stroke()
}
function heart(c, cx, cy, s) {
  c.beginPath(); c.moveTo(cx, cy + s * 0.5)
  c.bezierCurveTo(cx - s * 0.5, cy + s * 0.05, cx - s * 0.45, cy - s * 0.12, cx, cy + s * 0.12)
  c.bezierCurveTo(cx + s * 0.45, cy - s * 0.12, cx + s * 0.5, cy + s * 0.05, cx, cy + s * 0.5)
  c.stroke()
}
function greekKey(c, x, y, w, h) {
  const cy = y + h / 2, u = h * 0.9, n = Math.max(2, Math.floor((w * 0.92) / u)), sx = x + (w - n * u) / 2, s = u * 0.74, t = s * 0.34
  for (let i = 0; i < n; i++) {
    const ux = sx + i * u, b = cy + s / 2, tp = cy - s / 2
    c.beginPath(); c.moveTo(ux, b); c.lineTo(ux, tp); c.lineTo(ux + s, tp); c.lineTo(ux + s, b - t); c.lineTo(ux + t, b - t); c.lineTo(ux + t, tp + 2 * t); c.stroke()
  }
  line(c, sx, cy + s / 2, sx + n * u, cy + s / 2)
}
function rope(c, x1, cy, x2, amp) {
  const len = x2 - x1, n = Math.max(3, Math.round(len / (amp * 1.8)))
  for (const ph of [0, Math.PI]) {
    c.beginPath()
    for (let i = 0; i <= n * 10; i++) { const t = i / (n * 10), px = x1 + len * t, py = cy + amp * Math.sin(t * n * Math.PI * 2 + ph); i ? c.lineTo(px, py) : c.moveTo(px, py) }
    c.stroke()
  }
}
function scallopRect(c, x, y, w, h) {
  c.strokeRect(x + 1, y + 1, w - 2, h - 2)
  const arc = (y0, up) => { const n = Math.max(2, Math.floor((w - 4) / (Math.min(w, h) * 0.2))), step = (w - 4) / n; for (let i = 0; i < n; i++) { const sx = x + 2 + i * step; c.beginPath(); c.arc(sx + step / 2, y0, step / 2, up ? Math.PI : 0, up ? 0 : Math.PI, false); c.stroke() } }
  const rr = Math.min(w, h) * 0.12
  arc(y + rr, true); arc(y + h - rr, false)
}
function drawFloralCornerSet(c, x, y, w, h, fx, fy) {
  setup(c, w, h, 0.045)
  mirror(c, x, y, w, h, fx, fy, () => {
    const s = Math.min(w, h)
    line(c, x + 2, y + s * 0.62, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.62, y + 2)
    c.beginPath(); c.moveTo(x + s * 0.22, y + s * 0.22); c.bezierCurveTo(x + s * 0.52, y + s * 0.1, x + s * 0.56, y + s * 0.46, x + s * 0.3, y + s * 0.5); c.stroke()
    c.beginPath(); c.moveTo(x + s * 0.22, y + s * 0.22); c.bezierCurveTo(x + s * 0.1, y + s * 0.52, x + s * 0.46, y + s * 0.56, x + s * 0.5, y + s * 0.3); c.stroke()
    dot(c, x + s * 0.4, y + s * 0.4, s * 0.05)
  })
  c.restore()
}
function drawDecoCornerSet(c, x, y, w, h, fx, fy) {
  setup(c, w, h, 0.045)
  mirror(c, x, y, w, h, fx, fy, () => {
    const s = Math.min(w, h)
    for (let i = 0; i < 3; i++) { const o = 2 + i * s * 0.17, e = s * (0.58 - i * 0.12); line(c, x + o, y + e, x + o, y + o); line(c, x + o, y + o, x + e, y + o) }
  })
  c.restore()
}

// ====== GERAÇÃO PARAMÉTRICA — famílias de ornamentos (mutam ORNAMENTS) ======
const GEN = { divisorias: [], cantos: [], molduras: [], floroes: [], faixas: [] }

// motivos centrais (divisória = linhas laterais + motivo no centro)
const M = {
  diamond: (c, cx, cy, r) => diamond(c, cx, cy, r, true),
  'diamond-o': (c, cx, cy, r) => diamond(c, cx, cy, r * 1.1, false),
  circle: (c, cx, cy, r) => dot(c, cx, cy, r * 0.85),
  'circle-o': (c, cx, cy, r) => ring(c, cx, cy, r * 0.9),
  star5: (c, cx, cy, r) => star(c, cx, cy, r * 1.05, r * 0.45, 5, true),
  'star5-o': (c, cx, cy, r) => star(c, cx, cy, r * 1.05, r * 0.45, 5, false),
  star6: (c, cx, cy, r) => star(c, cx, cy, r, r * 0.5, 6, true),
  star8: (c, cx, cy, r) => star(c, cx, cy, r, r * 0.5, 8, true),
  square: (c, cx, cy, r) => c.fillRect(cx - r * 0.78, cy - r * 0.78, r * 1.56, r * 1.56),
  'square-o': (c, cx, cy, r) => c.strokeRect(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6),
  triangle: (c, cx, cy, r) => { c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r * 0.9, cy + r * 0.7); c.lineTo(cx - r * 0.9, cy + r * 0.7); c.closePath(); c.stroke() },
  plus: (c, cx, cy, r) => { line(c, cx, cy - r, cx, cy + r); line(c, cx - r, cy, cx + r, cy) },
  cross: (c, cx, cy, r) => { line(c, cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7); line(c, cx + r * 0.7, cy - r * 0.7, cx - r * 0.7, cy + r * 0.7) },
  flower: (c, cx, cy, r) => { for (let i = 0; i < 6; i++) { const a = Math.PI * 2 * i / 6; ring(c, cx + r * 0.5 * Math.cos(a), cy + r * 0.5 * Math.sin(a), r * 0.42) } dot(c, cx, cy, r * 0.3) },
  heart: (c, cx, cy, r) => heart(c, cx, cy, r * 1.7),
  sun: (c, cx, cy, r) => { ring(c, cx, cy, r * 0.5); for (let i = 0; i < 8; i++) { const a = Math.PI * 2 * i / 8; line(c, cx + r * 0.62 * Math.cos(a), cy + r * 0.62 * Math.sin(a), cx + r * Math.cos(a), cy + r * Math.sin(a)) } },
  'three-dots': (c, cx, cy, r) => { dot(c, cx, cy, r * 0.35); dot(c, cx - r * 0.85, cy, r * 0.25); dot(c, cx + r * 0.85, cy, r * 0.25) }
}
for (const [m, draw] of Object.entries(M)) { const key = 'dm-' + m; ORNAMENTS[key] = (c, x, y, w, h) => { setup(c, w, h); dividerSides(c, x, y, w, h, 0.42); draw(c, x + w / 2, y + h / 2, h * 0.3); c.restore() }; GEN.divisorias.push(key) }

// divisórias de padrão repetido
const REP = {
  dots: (c, ux, cy, u) => dot(c, ux + u / 2, cy, u * 0.16),
  rings: (c, ux, cy, u) => ring(c, ux + u / 2, cy, u * 0.26),
  diamonds: (c, ux, cy, u) => diamond(c, ux + u / 2, cy, u * 0.3, true),
  'diamonds-o': (c, ux, cy, u) => diamond(c, ux + u / 2, cy, u * 0.34, false),
  squares: (c, ux, cy, u) => c.strokeRect(ux + u * 0.22, cy - u * 0.28, u * 0.56, u * 0.56),
  stars: (c, ux, cy, u) => star(c, ux + u / 2, cy, u * 0.34, u * 0.16, 5, true),
  tri: (c, ux, cy, u) => { c.beginPath(); c.moveTo(ux + u * 0.22, cy + u * 0.26); c.lineTo(ux + u * 0.5, cy - u * 0.26); c.lineTo(ux + u * 0.78, cy + u * 0.26); c.closePath(); c.stroke() },
  plus: (c, ux, cy, u) => { line(c, ux + u / 2, cy - u * 0.28, ux + u / 2, cy + u * 0.28); line(c, ux + u * 0.22, cy, ux + u * 0.78, cy) },
  x: (c, ux, cy, u) => { line(c, ux + u * 0.24, cy - u * 0.26, ux + u * 0.76, cy + u * 0.26); line(c, ux + u * 0.76, cy - u * 0.26, ux + u * 0.24, cy + u * 0.26) },
  vees: (c, ux, cy, u) => { c.beginPath(); c.moveTo(ux + u * 0.22, cy - u * 0.22); c.lineTo(ux + u * 0.5, cy + u * 0.24); c.lineTo(ux + u * 0.78, cy - u * 0.22); c.stroke() },
  hearts: (c, ux, cy, u) => heart(c, ux + u / 2, cy - u * 0.04, u * 0.46),
  scallop: (c, ux, cy, u) => { c.beginPath(); c.arc(ux + u / 2, cy, u * 0.4, Math.PI, 0, false); c.stroke() },
  bars: (c, ux, cy, u) => line(c, ux + u / 2, cy - u * 0.3, ux + u / 2, cy + u * 0.3),
  arcs: (c, ux, cy, u) => { c.beginPath(); c.arc(ux + u / 2, cy + u * 0.2, u * 0.35, Math.PI, 0, true); c.stroke() }
}
for (const [m, draw] of Object.entries(REP)) { const key = 'rep-' + m; ORNAMENTS[key] = (c, x, y, w, h) => { setup(c, w, h, 0.04); const cy = y + h / 2, u = h * 0.95, n = Math.max(3, Math.floor(w * 0.94 / u)), sx = x + (w - n * u) / 2; for (let i = 0; i < n; i++) draw(c, sx + i * u, cy, u); c.restore() }; GEN.divisorias.push(key) }

// molduras
const EDGE = {
  plain: (c, x, y, w, h) => c.strokeRect(x + 1, y + 1, w - 2, h - 2),
  double: (c, x, y, w, h) => { c.strokeRect(x + 1, y + 1, w - 2, h - 2); const g = Math.min(w, h) * 0.07; c.strokeRect(x + g, y + g, w - 2 * g, h - 2 * g) },
  triple: (c, x, y, w, h) => { c.strokeRect(x + 1, y + 1, w - 2, h - 2); const g = Math.min(w, h) * 0.06; c.strokeRect(x + g, y + g, w - 2 * g, h - 2 * g); c.strokeRect(x + 2 * g, y + 2 * g, w - 4 * g, h - 4 * g) },
  dotted: (c, x, y, w, h) => { c.save(); c.setLineDash([1, Math.min(w, h) * 0.13]); c.lineCap = 'round'; c.strokeRect(x + 2, y + 2, w - 4, h - 4); c.restore() },
  dashed: (c, x, y, w, h) => { c.save(); c.setLineDash([Math.min(w, h) * 0.1, Math.min(w, h) * 0.07]); c.strokeRect(x + 2, y + 2, w - 4, h - 4); c.restore() },
  'corner-dots': (c, x, y, w, h) => { c.strokeRect(x + 1, y + 1, w - 2, h - 2); const mm = Math.min(w, h) * 0.14, r = Math.min(w, h) * 0.05; for (const [fx, fy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) dot(c, fx > 0 ? x + mm : x + w - mm, fy > 0 ? y + mm : y + h - mm, r) },
  inset: (c, x, y, w, h) => { c.strokeRect(x + 1, y + 1, w - 2, h - 2); const g = Math.min(w, h) * 0.1; c.save(); c.setLineDash([Math.min(w, h) * 0.08, Math.min(w, h) * 0.06]); c.strokeRect(x + g, y + g, w - 2 * g, h - 2 * g); c.restore() },
  rounded: (c, x, y, w, h) => { rrect(c, x + 1, y + 1, w - 2, h - 2, Math.min(w, h) * 0.18); c.stroke() },
  'rounded-double': (c, x, y, w, h) => { rrect(c, x + 1, y + 1, w - 2, h - 2, Math.min(w, h) * 0.18); c.stroke(); const g = Math.min(w, h) * 0.07; rrect(c, x + g, y + g, w - 2 * g, h - 2 * g, Math.min(w, h) * 0.12); c.stroke() }
}
for (const [m, dec] of Object.entries(EDGE)) { const key = 'fr-' + m; ORNAMENTS[key] = (c, x, y, w, h) => { setup(c, w, h, 0.03); dec(c, x, y, w, h); c.restore() }; GEN.molduras.push(key) }

// cantos (estilo × 4 orientações)
const CSTYLE = {
  swirl: (c, x, y, s) => { line(c, x + 2, y + s * 0.7, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.7, y + 2); c.beginPath(); c.moveTo(x + s * 0.7, y + 2); c.bezierCurveTo(x + s * 0.4, y + 2, x + s * 0.34, y + s * 0.36, x + s * 0.6, y + s * 0.46); c.bezierCurveTo(x + s * 0.74, y + s * 0.52, x + s * 0.66, y + s * 0.26, x + s * 0.48, y + s * 0.3); c.stroke() },
  leaf: (c, x, y, s) => { line(c, x + 2, y + s * 0.6, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.6, y + 2); c.beginPath(); c.moveTo(x + s * 0.2, y + s * 0.2); c.quadraticCurveTo(x + s * 0.55, y + s * 0.1, x + s * 0.5, y + s * 0.45); c.quadraticCurveTo(x + s * 0.2, y + s * 0.5, x + s * 0.2, y + s * 0.2); c.stroke() },
  step: (c, x, y, s) => { for (let i = 0; i < 3; i++) { const o = 2 + i * s * 0.16, e = s * (0.55 - i * 0.12); line(c, x + o, y + e, x + o, y + o); line(c, x + o, y + o, x + e, y + o) } },
  arc: (c, x, y, s) => { line(c, x + 2, y + s * 0.6, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.6, y + 2); c.beginPath(); c.arc(x + s * 0.55, y + s * 0.55, s * 0.4, Math.PI, Math.PI * 1.5); c.stroke() },
  dots: (c, x, y, s) => { line(c, x + 2, y + s * 0.6, x + 2, y + 2); line(c, x + 2, y + 2, x + s * 0.6, y + 2); dot(c, x + s * 0.26, y + s * 0.26, s * 0.07) }
}
const CORN = [['tl', 1, 1], ['tr', -1, 1], ['bl', 1, -1], ['br', -1, -1]]
for (const [st, draw] of Object.entries(CSTYLE)) for (const [cn, fx, fy] of CORN) { const key = 'cn-' + st + '-' + cn; ORNAMENTS[key] = (c, x, y, w, h) => { setup(c, w, h, 0.05); mirror(c, x, y, w, h, fx, fy, () => draw(c, x, y, Math.min(w, h))); c.restore() }; GEN.cantos.push(key) }

// florões (geométricos paramétricos)
const center = (w, h, x, y) => [x + w / 2, y + h / 2, Math.min(w, h) * 0.46]
for (const n of [4, 5, 6, 8, 10, 12, 16]) {
  const k1 = 'fl-star' + n; ORNAMENTS[k1] = (c, x, y, w, h) => { setup(c, w, h); const [cx, cy, R] = center(w, h, x, y); star(c, cx, cy, R, R * 0.45, n, true); c.restore() }; GEN.floroes.push(k1)
  const k2 = 'fl-star' + n + '-o'; ORNAMENTS[k2] = (c, x, y, w, h) => { setup(c, w, h, 0.04); const [cx, cy, R] = center(w, h, x, y); star(c, cx, cy, R, R * 0.45, n, false); c.restore() }; GEN.floroes.push(k2)
}
for (const n of [6, 8, 10, 12]) { const k = 'fl-rosette' + n; ORNAMENTS[k] = (c, x, y, w, h) => { setup(c, w, h, 0.04); const [cx, cy, R] = center(w, h, x, y); for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n; c.beginPath(); c.ellipse(cx + R * 0.62 * Math.cos(a), cy + R * 0.62 * Math.sin(a), R * 0.16, R * 0.32, a, 0, Math.PI * 2); c.stroke() } ring(c, cx, cy, R * 0.26); c.restore() }; GEN.floroes.push(k) }
for (const n of [12, 16, 20, 24]) { const k = 'fl-sun' + n; ORNAMENTS[k] = (c, x, y, w, h) => { setup(c, w, h, 0.03); const [cx, cy, R] = center(w, h, x, y); for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n; line(c, cx + R * 0.4 * Math.cos(a), cy + R * 0.4 * Math.sin(a), cx + R * (i % 2 ? 0.7 : 1) * Math.cos(a), cy + R * (i % 2 ? 0.7 : 1) * Math.sin(a)) } ring(c, cx, cy, R * 0.3); c.restore() }; GEN.floroes.push(k) }
for (const n of [3, 5, 6, 8]) { const k = 'fl-poly' + n; ORNAMENTS[k] = (c, x, y, w, h) => { setup(c, w, h, 0.04); const [cx, cy, R] = center(w, h, x, y); c.beginPath(); for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n - Math.PI / 2, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py) } c.closePath(); c.stroke(); c.restore() }; GEN.floroes.push(k) }
for (const n of [3, 4, 5]) { const k = 'fl-rings' + n; ORNAMENTS[k] = (c, x, y, w, h) => { setup(c, w, h, 0.03); const [cx, cy, R] = center(w, h, x, y); for (let i = 0; i < n; i++) ring(c, cx, cy, R * (1 - i / n)); dot(c, cx, cy, R * 0.08); c.restore() }; GEN.floroes.push(k) }

// faixas
const BAN = {
  straight: (c, x, y, w, h) => { const t = y + h * 0.3, b = y + h * 0.7; c.strokeRect(x + w * 0.06, t, w * 0.88, b - t) },
  'fork-l': (c, x, y, w, h) => { const t = y + h * 0.3, b = y + h * 0.7; c.beginPath(); c.moveTo(x + w * 0.06, t); c.lineTo(x + w * 0.94, t); c.lineTo(x + w * 0.94, b); c.lineTo(x + w * 0.06, b); c.lineTo(x + w * 0.16, y + h / 2); c.closePath(); c.stroke() },
  'fork-r': (c, x, y, w, h) => { const t = y + h * 0.3, b = y + h * 0.7; c.beginPath(); c.moveTo(x + w * 0.06, t); c.lineTo(x + w * 0.94, t); c.lineTo(x + w * 0.84, y + h / 2); c.lineTo(x + w * 0.94, b); c.lineTo(x + w * 0.06, b); c.closePath(); c.stroke() },
  double: (c, x, y, w, h) => { const t = y + h * 0.32, b = y + h * 0.68; c.strokeRect(x + w * 0.06, t, w * 0.88, b - t); line(c, x + w * 0.06, t + h * 0.08, x + w * 0.94, t + h * 0.08) },
  tab: (c, x, y, w, h) => { c.beginPath(); c.moveTo(x + w * 0.1, y + h * 0.28); c.lineTo(x + w * 0.9, y + h * 0.28); c.lineTo(x + w * 0.9, y + h * 0.6); c.lineTo(x + w / 2, y + h * 0.8); c.lineTo(x + w * 0.1, y + h * 0.6); c.closePath(); c.stroke() }
}
for (const [m, draw] of Object.entries(BAN)) { const key = 'ban-' + m; ORNAMENTS[key] = (c, x, y, w, h) => { setup(c, w, h, 0.04); draw(c, x, y, w, h); c.restore() }; GEN.faixas.push(key) }

const BASE = {
  divisorias: ['div-line', 'div-diamond', 'div-diamond-open', 'div-dots', 'div-double', 'div-leaf', 'div-curls', 'div-wave', 'div-arrowtips', 'div-greek', 'div-rope', 'div-chain', 'div-stars', 'div-heart', 'div-vine', 'div-deco', 'div-chevron', 'div-beads'],
  cantos: ['corner-tl', 'corner-tr', 'corner-bl', 'corner-br', 'bracket-tl', 'bracket-tr', 'bracket-bl', 'bracket-br', 'floral-tl', 'floral-tr', 'floral-bl', 'floral-br', 'deco-tl', 'deco-tr', 'deco-bl', 'deco-br'],
  molduras: ['frame-line', 'frame-double', 'frame-round', 'frame-dashed', 'frame-corners', 'frame-deco', 'frame-beads', 'frame-scallop', 'frame-ticket', 'frame-twist'],
  floroes: ['flourish', 'fleuron', 'laurel', 'sunburst', 'scroll', 'rosette', 'compass', 'bow', 'wreath', 'badge', 'mandala'],
  faixas: ['banner', 'pennant', 'ribbon-folds', 'flag-wave']
}
const CAT_NAMES = { divisorias: 'Divisórias', cantos: 'Cantos', molduras: 'Molduras', floroes: 'Florões & motivos', faixas: 'Faixas' }
export const ORNAMENT_CATEGORIES = ['divisorias', 'cantos', 'molduras', 'floroes', 'faixas']
  .map((id) => ({ id, name: CAT_NAMES[id], keys: [...BASE[id], ...GEN[id]] }))

export const ORNAMENT_COUNT = ORNAMENT_CATEGORIES.reduce((n, c) => n + c.keys.length, 0)

export function drawOrnament(ctx, key, x, y, w, h) {
  const f = ORNAMENTS[key]
  if (f) f(ctx, x, y, w, h)
}
