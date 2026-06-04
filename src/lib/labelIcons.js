// Biblioteca de ícones P&B desenhados por código (canvas), agrupados por categoria.
// Cada função desenha o ícone dentro de um quadrado (x, y, size) em preto — nítido em
// qualquer resolução, ideal para impressão térmica. Estilo simples, traço único.

function prep(ctx, s) {
  ctx.save()
  ctx.fillStyle = '#000'
  ctx.strokeStyle = '#000'
  ctx.lineWidth = Math.max(1, s * 0.09)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
}

function poly(ctx, x, y, s, pts, close, fill) {
  ctx.beginPath()
  pts.forEach((p, i) => {
    const px = x + p[0] * s, py = y + p[1] * s
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  })
  if (close) ctx.closePath()
  if (fill) ctx.fill(); else ctx.stroke()
}

function line(ctx, x, y, s, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x + x1 * s, y + y1 * s)
  ctx.lineTo(x + x2 * s, y + y2 * s)
  ctx.stroke()
}

function circle(ctx, x, y, s, cx, cy, r, fill) {
  ctx.beginPath()
  ctx.arc(x + cx * s, y + cy * s, r * s, 0, Math.PI * 2)
  if (fill) ctx.fill(); else ctx.stroke()
}

function arc(ctx, x, y, s, cx, cy, r, a0, a1, fill) {
  ctx.beginPath()
  ctx.arc(x + cx * s, y + cy * s, r * s, a0, a1)
  if (fill) ctx.fill(); else ctx.stroke()
}

function rrect(ctx, x, y, s, rx, ry, rw, rh, rad, fill) {
  const X = x + rx * s, Y = y + ry * s, W = rw * s, H = rh * s, R = rad * s
  ctx.beginPath()
  ctx.moveTo(X + R, Y)
  ctx.arcTo(X + W, Y, X + W, Y + H, R)
  ctx.arcTo(X + W, Y + H, X, Y + H, R)
  ctx.arcTo(X, Y + H, X, Y, R)
  ctx.arcTo(X, Y, X + W, Y, R)
  ctx.closePath()
  if (fill) ctx.fill(); else ctx.stroke()
}

function starPts(n, ro, ri, cx, cy) {
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri
    const a = (Math.PI * i) / n - Math.PI / 2
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pts
}

function regPts(n, r, cx, cy, rot) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2 + (rot || 0)
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pts
}

// arrowhead em (tx,ty) apontando na direção (dir: 'r','l','u','d')
function head(ctx, x, y, s, tx, ty, k, dir) {
  const m = { r: [[-1, -1], [0, 0], [-1, 1]], l: [[1, -1], [0, 0], [1, 1]], u: [[-1, 1], [0, 0], [1, 1]], d: [[-1, -1], [0, 0], [1, -1]] }[dir]
  poly(ctx, x, y, s, m.map(([dx, dy]) => [tx + dx * k, ty + dy * k]), false, false)
}

export const ICONS = {
  // ---- Geral & status ----
  check: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.16, 0.55], [0.42, 0.8], [0.84, 0.2]], false, false); c.restore() },
  x: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.24, 0.24, 0.76, 0.76); line(c, x, y, s, 0.76, 0.24, 0.24, 0.76); c.restore() },
  plus: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.5, 0.18, 0.5, 0.82); line(c, x, y, s, 0.18, 0.5, 0.82, 0.5); c.restore() },
  minus: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.18, 0.5, 0.82, 0.5); c.restore() },
  star: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, starPts(5, 0.46, 0.19, 0.5, 0.52), true, true); c.restore() },
  heart: (c, x, y, s) => { prep(c, s); c.beginPath(); c.moveTo(x + 0.5 * s, y + 0.84 * s); c.bezierCurveTo(x + 0.04 * s, y + 0.5 * s, x + 0.2 * s, y + 0.12 * s, x + 0.5 * s, y + 0.34 * s); c.bezierCurveTo(x + 0.8 * s, y + 0.12 * s, x + 0.96 * s, y + 0.5 * s, x + 0.5 * s, y + 0.84 * s); c.fill(); c.restore() },
  info: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.42, false); circle(c, x, y, s, 0.5, 0.3, 0.045, true); line(c, x, y, s, 0.5, 0.44, 0.5, 0.7); c.restore() },
  warning: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.1], [0.92, 0.86], [0.08, 0.86]], true, false); line(c, x, y, s, 0.5, 0.38, 0.5, 0.62); circle(c, x, y, s, 0.5, 0.74, 0.035, true); c.restore() },
  question: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.36, 0.18, Math.PI * 1.1, Math.PI * 0.4, false); line(c, x, y, s, 0.5, 0.54, 0.5, 0.64); circle(c, x, y, s, 0.5, 0.78, 0.04, true); c.restore() },
  circle: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.4, false); c.restore() },
  disc: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.4, true); c.restore() },
  dot: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.16, true); c.restore() },

  // ---- Setas ----
  'arrow-right': (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.14, 0.5, 0.82, 0.5); head(c, x, y, s, 0.82, 0.5, 0.2, 'r'); c.restore() },
  'arrow-left': (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.18, 0.5, 0.86, 0.5); head(c, x, y, s, 0.18, 0.5, 0.2, 'l'); c.restore() },
  'arrow-up': (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.5, 0.86, 0.5, 0.18); head(c, x, y, s, 0.5, 0.18, 0.2, 'u'); c.restore() },
  'arrow-down': (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.5, 0.14, 0.5, 0.82); head(c, x, y, s, 0.5, 0.82, 0.2, 'd'); c.restore() },
  refresh: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.5, 0.32, Math.PI * 0.6, Math.PI * 2.2, false); head(c, x, y, s, 0.5 + 0.32 * Math.cos(Math.PI * 0.6), 0.5 + 0.32 * Math.sin(Math.PI * 0.6), 0.16, 'u'); c.restore() },
  sort: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.34, 0.18, 0.34, 0.82); head(c, x, y, s, 0.34, 0.18, 0.13, 'u'); line(c, x, y, s, 0.66, 0.18, 0.66, 0.82); head(c, x, y, s, 0.66, 0.82, 0.13, 'd'); c.restore() },

  // ---- Formas ----
  square: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.14 * s, y + 0.14 * s, 0.72 * s, 0.72 * s); c.restore() },
  triangle: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.12], [0.9, 0.86], [0.1, 0.86]], true, false); c.restore() },
  hexagon: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, regPts(6, 0.42, 0.5, 0.5, Math.PI / 6), true, false); c.restore() },
  diamond: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.12], [0.88, 0.5], [0.5, 0.88], [0.12, 0.5]], true, false); c.restore() },

  // ---- Oficina / marcenaria ----
  ruler: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.1 * s, y + 0.32 * s, 0.8 * s, 0.36 * s); for (let i = 1; i < 6; i++) { const u = 0.1 + (0.8 * i) / 6; line(c, x, y, s, u, 0.32, u, i % 2 ? 0.46 : 0.54) } c.restore() },
  saw: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.12 * s, y + 0.28 * s, 0.76 * s, 0.2 * s); c.beginPath(); for (let i = 0; i < 6; i++) { const u = 0.12 + (0.76 * i) / 6; c.moveTo(x + u * s, y + 0.48 * s); c.lineTo(x + (u + 0.063) * s, y + 0.48 * s); c.lineTo(x + (u + 0.0315) * s, y + 0.62 * s) } c.stroke(); line(c, x, y, s, 0.5, 0.62, 0.5, 0.78); c.restore() },
  hammer: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.18, 0.2], [0.62, 0.2], [0.62, 0.36], [0.18, 0.36]], true, true); line(c, x, y, s, 0.42, 0.36, 0.72, 0.86); c.restore() },
  screw: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.2, 0.13, false); line(c, x, y, s, 0.5, 0.33, 0.5, 0.85); for (let i = 0; i < 4; i++) { const v = 0.42 + i * 0.13; line(c, x, y, s, 0.4, v, 0.6, v + 0.06) } c.restore() },
  nut: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, regPts(6, 0.4, 0.5, 0.5, 0), true, false); circle(c, x, y, s, 0.5, 0.5, 0.17, false); c.restore() },
  wrench: (c, x, y, s) => { prep(c, s); c.lineWidth = Math.max(1, s * 0.13); arc(c, x, y, s, 0.3, 0.3, 0.16, Math.PI * 0.2, Math.PI * 1.7, false); line(c, x, y, s, 0.38, 0.42, 0.78, 0.82); c.restore() },
  drill: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.16 * s, y + 0.26 * s, 0.34 * s, 0.28 * s); line(c, x, y, s, 0.5, 0.4, 0.86, 0.4); line(c, x, y, s, 0.24, 0.54, 0.24, 0.8); c.restore() },
  board: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.1 * s, y + 0.26 * s, 0.8 * s, 0.48 * s); line(c, x, y, s, 0.16, 0.42, 0.84, 0.42); line(c, x, y, s, 0.16, 0.58, 0.84, 0.58); c.restore() },
  brush: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.36 * s, y + 0.12 * s, 0.28 * s, 0.26 * s); poly(c, x, y, s, [[0.36, 0.38], [0.64, 0.38], [0.58, 0.64], [0.42, 0.64]], true, false); line(c, x, y, s, 0.5, 0.64, 0.5, 0.86); c.restore() },
  pencil: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.2, 0.8], [0.7, 0.3], [0.82, 0.42], [0.32, 0.92]], true, false); line(c, x, y, s, 0.2, 0.8, 0.32, 0.92); c.restore() },

  // ---- Casa & objetos ----
  home: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.12], [0.9, 0.46], [0.78, 0.46], [0.78, 0.86], [0.22, 0.86], [0.22, 0.46], [0.1, 0.46]], true, false); c.restore() },
  bed: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.1, 0.4, 0.1, 0.74); c.strokeRect(x + 0.1 * s, y + 0.5 * s, 0.8 * s, 0.24 * s); circle(c, x, y, s, 0.28, 0.46, 0.07, false); line(c, x, y, s, 0.36, 0.5, 0.9, 0.5); c.restore() },
  key: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.3, 0.3, 0.15, false); line(c, x, y, s, 0.4, 0.4, 0.82, 0.82); line(c, x, y, s, 0.7, 0.7, 0.82, 0.6); line(c, x, y, s, 0.82, 0.82, 0.7, 0.82); c.restore() },
  lamp: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.42, 0.22, Math.PI, 0, false); line(c, x, y, s, 0.28, 0.42, 0.72, 0.42); c.strokeRect(x + 0.42 * s, y + 0.6 * s, 0.16 * s, 0.12 * s); line(c, x, y, s, 0.44, 0.78, 0.56, 0.78); c.restore() },
  plug: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.46, 0.22, 0, Math.PI, false); line(c, x, y, s, 0.28, 0.46, 0.28, 0.28); line(c, x, y, s, 0.72, 0.46, 0.72, 0.28); line(c, x, y, s, 0.5, 0.68, 0.5, 0.86); c.restore() },
  door: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.26 * s, y + 0.16 * s, 0.48 * s, 0.7 * s); circle(c, x, y, s, 0.64, 0.52, 0.035, true); c.restore() },
  clock: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.4, false); line(c, x, y, s, 0.5, 0.5, 0.5, 0.26); line(c, x, y, s, 0.5, 0.5, 0.68, 0.58); c.restore() },
  calendar: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.14 * s, y + 0.2 * s, 0.72 * s, 0.66 * s); line(c, x, y, s, 0.14, 0.38, 0.86, 0.38); line(c, x, y, s, 0.32, 0.14, 0.32, 0.26); line(c, x, y, s, 0.68, 0.14, 0.68, 0.26); c.restore() },

  // ---- Cozinha & comida ----
  cup: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.26, 0.28], [0.7, 0.28], [0.64, 0.82], [0.32, 0.82]], true, false); arc(c, x, y, s, 0.7, 0.42, 0.1, -Math.PI / 2, Math.PI / 2, false); c.restore() },
  coffee: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.24, 0.4], [0.66, 0.4], [0.6, 0.82], [0.3, 0.82]], true, false); arc(c, x, y, s, 0.66, 0.52, 0.1, -Math.PI / 2, Math.PI / 2, false); line(c, x, y, s, 0.36, 0.2, 0.36, 0.32); line(c, x, y, s, 0.5, 0.2, 0.5, 0.32); c.restore() },
  bottle: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.42, 0.12], [0.58, 0.12], [0.58, 0.3], [0.66, 0.42], [0.66, 0.86], [0.34, 0.86], [0.34, 0.42], [0.42, 0.3]], true, false); line(c, x, y, s, 0.34, 0.56, 0.66, 0.56); c.restore() },
  jar: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.3 * s, y + 0.14 * s, 0.4 * s, 0.1 * s); rrect(c, x, y, s, 0.26, 0.24, 0.48, 0.62, 0.08, false); c.restore() },
  'fork-knife': (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.34, 0.14, 0.34, 0.86); line(c, x, y, s, 0.28, 0.14, 0.28, 0.34); line(c, x, y, s, 0.4, 0.14, 0.4, 0.34); line(c, x, y, s, 0.28, 0.34, 0.4, 0.34); line(c, x, y, s, 0.66, 0.14, 0.66, 0.86); arc(c, x, y, s, 0.66, 0.26, 0.1, Math.PI * 0.5, Math.PI * 1.5, false); c.restore() },
  apple: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.36, 0.56, 0.26, -Math.PI * 0.5, Math.PI * 0.9, false); arc(c, x, y, s, 0.64, 0.56, 0.26, Math.PI * 0.1, Math.PI * 1.5, false); line(c, x, y, s, 0.5, 0.3, 0.5, 0.16); arc(c, x, y, s, 0.62, 0.18, 0.1, Math.PI * 0.6, Math.PI * 1.3, false); c.restore() },
  bread: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.6, 0.34, Math.PI, 0, false); line(c, x, y, s, 0.16, 0.6, 0.84, 0.6); line(c, x, y, s, 0.36, 0.4, 0.36, 0.6); line(c, x, y, s, 0.5, 0.36, 0.5, 0.6); line(c, x, y, s, 0.64, 0.4, 0.64, 0.6); c.restore() },
  cake: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.18 * s, y + 0.46 * s, 0.64 * s, 0.34 * s); line(c, x, y, s, 0.18, 0.6, 0.82, 0.6); line(c, x, y, s, 0.5, 0.24, 0.5, 0.46); circle(c, x, y, s, 0.5, 0.2, 0.04, true); c.restore() },
  ice: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.5, 0.12, 0.5, 0.88); line(c, x, y, s, 0.16, 0.32, 0.84, 0.68); line(c, x, y, s, 0.84, 0.32, 0.16, 0.68); c.restore() },

  // ---- Envio & escritório ----
  tag: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.12, 0.5], [0.5, 0.12], [0.88, 0.12], [0.88, 0.5], [0.5, 0.88]], true, false); circle(c, x, y, s, 0.72, 0.28, 0.05, true); c.restore() },
  box: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.12], [0.88, 0.32], [0.88, 0.7], [0.5, 0.9], [0.12, 0.7], [0.12, 0.32]], true, false); line(c, x, y, s, 0.12, 0.32, 0.5, 0.5); line(c, x, y, s, 0.88, 0.32, 0.5, 0.5); line(c, x, y, s, 0.5, 0.5, 0.5, 0.9); c.restore() },
  mail: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.12 * s, y + 0.24 * s, 0.76 * s, 0.52 * s); poly(c, x, y, s, [[0.12, 0.24], [0.5, 0.55], [0.88, 0.24]], false, false); c.restore() },
  phone: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.3, 0.1, 0.4, 0.8, 0.06, false); line(c, x, y, s, 0.42, 0.78, 0.58, 0.78); c.restore() },
  pin: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.9], [0.22, 0.42], [0.78, 0.42]], true, false); circle(c, x, y, s, 0.5, 0.32, 0.22, false); c.restore() },
  clip: (c, x, y, s) => { prep(c, s); c.lineWidth = Math.max(1, s * 0.1); poly(c, x, y, s, [[0.34, 0.78], [0.34, 0.32], [0.62, 0.32], [0.62, 0.74]], false, false); arc(c, x, y, s, 0.48, 0.32, 0.14, Math.PI, 0, false); line(c, x, y, s, 0.48, 0.74, 0.48, 0.42); c.restore() },
  folder: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.12, 0.74], [0.12, 0.3], [0.4, 0.3], [0.48, 0.4], [0.88, 0.4], [0.88, 0.74]], true, false); c.restore() },
  printer: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.16 * s, y + 0.38 * s, 0.68 * s, 0.3 * s); c.strokeRect(x + 0.28 * s, y + 0.16 * s, 0.44 * s, 0.22 * s); c.strokeRect(x + 0.28 * s, y + 0.62 * s, 0.44 * s, 0.22 * s); circle(c, x, y, s, 0.72, 0.48, 0.03, true); c.restore() },
  barcode: (c, x, y, s) => { prep(c, s); const bars = [0.04, 0.02, 0.05, 0.02, 0.03, 0.06, 0.02, 0.04]; let u = 0.16; bars.forEach((w, i) => { if (i % 2 === 0) c.fillRect(x + u * s, y + 0.2 * s, w * s, 0.6 * s); u += w + 0.02 }); c.restore() },

  // ---- Natureza ----
  leaf: (c, x, y, s) => { prep(c, s); c.beginPath(); c.moveTo(x + 0.2 * s, y + 0.8 * s); c.quadraticCurveTo(x + 0.2 * s, y + 0.2 * s, x + 0.8 * s, y + 0.2 * s); c.quadraticCurveTo(x + 0.8 * s, y + 0.8 * s, x + 0.2 * s, y + 0.8 * s); c.stroke(); line(c, x, y, s, 0.32, 0.68, 0.68, 0.32); c.restore() },
  flower: (c, x, y, s) => { prep(c, s); for (let i = 0; i < 6; i++) { const a = (Math.PI * 2 * i) / 6; circle(c, x, y, s, 0.5 + 0.22 * Math.cos(a), 0.5 + 0.22 * Math.sin(a), 0.13, false) } circle(c, x, y, s, 0.5, 0.5, 0.1, true); c.restore() },
  sun: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.22, false); for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 * i) / 8; line(c, x, y, s, 0.5 + 0.32 * Math.cos(a), 0.5 + 0.32 * Math.sin(a), 0.5 + 0.42 * Math.cos(a), 0.5 + 0.42 * Math.sin(a)) } c.restore() },
  moon: (c, x, y, s) => { prep(c, s); c.beginPath(); c.arc(x + 0.5 * s, y + 0.5 * s, 0.36 * s, Math.PI * 0.35, Math.PI * 1.65, false); c.arc(x + 0.66 * s, y + 0.5 * s, 0.34 * s, Math.PI * 1.4, Math.PI * 0.6, true); c.closePath(); c.stroke(); c.restore() },
  drop: (c, x, y, s) => { prep(c, s); c.beginPath(); c.moveTo(x + 0.5 * s, y + 0.14 * s); c.bezierCurveTo(x + 0.86 * s, y + 0.56 * s, x + 0.74 * s, y + 0.86 * s, x + 0.5 * s, y + 0.86 * s); c.bezierCurveTo(x + 0.26 * s, y + 0.86 * s, x + 0.14 * s, y + 0.56 * s, x + 0.5 * s, y + 0.14 * s); c.stroke(); c.restore() },
  snowflake: (c, x, y, s) => { prep(c, s); for (let i = 0; i < 3; i++) { const a = (Math.PI * i) / 3; line(c, x, y, s, 0.5 - 0.4 * Math.cos(a), 0.5 - 0.4 * Math.sin(a), 0.5 + 0.4 * Math.cos(a), 0.5 + 0.4 * Math.sin(a)) } c.restore() },
  tree: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.12], [0.74, 0.46], [0.6, 0.46], [0.8, 0.72], [0.2, 0.72], [0.4, 0.46], [0.26, 0.46]], true, false); line(c, x, y, s, 0.5, 0.72, 0.5, 0.88); c.restore() },

  // ---- Cuidados & símbolos ----
  recycle: (c, x, y, s) => { prep(c, s); for (let i = 0; i < 3; i++) { const a = (Math.PI * 2 * i) / 3 - Math.PI / 2; const cx = 0.5 + 0.24 * Math.cos(a), cy = 0.5 + 0.24 * Math.sin(a); const a2 = a + Math.PI * 0.66; head(c, x, y, s, cx, cy, 0.1, 'r'); line(c, x, y, s, cx, cy, 0.5 + 0.24 * Math.cos(a2), 0.5 + 0.24 * Math.sin(a2)) } c.restore() },
  fragile: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.36, 0.16, 0, Math.PI, false); line(c, x, y, s, 0.5, 0.36, 0.5, 0.56); poly(c, x, y, s, [[0.34, 0.84], [0.42, 0.56], [0.58, 0.56], [0.66, 0.84]], false, false); line(c, x, y, s, 0.34, 0.84, 0.66, 0.84); c.restore() },
  'keep-dry': (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.5, 0.32, Math.PI, 0, false); line(c, x, y, s, 0.18, 0.5, 0.82, 0.5); for (let i = 0; i < 3; i++) { const u = 0.34 + i * 0.16; line(c, x, y, s, u, 0.62, u - 0.05, 0.78) } c.restore() },
  'this-up': (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.34, 0.8, 0.34, 0.34); head(c, x, y, s, 0.34, 0.3, 0.13, 'u'); line(c, x, y, s, 0.66, 0.8, 0.66, 0.34); head(c, x, y, s, 0.66, 0.3, 0.13, 'u'); c.restore() },
  no: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.38, false); line(c, x, y, s, 0.24, 0.24, 0.76, 0.76); c.restore() },
  wifi: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.74, 0.38, Math.PI * 1.2, Math.PI * 1.8, false); arc(c, x, y, s, 0.5, 0.74, 0.24, Math.PI * 1.2, Math.PI * 1.8, false); circle(c, x, y, s, 0.5, 0.74, 0.04, true); c.restore() },
  battery: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.12 * s, y + 0.34 * s, 0.68 * s, 0.32 * s); c.fillRect(x + 0.8 * s, y + 0.42 * s, 0.06 * s, 0.16 * s); c.fillRect(x + 0.18 * s, y + 0.4 * s, 0.34 * s, 0.2 * s); c.restore() },
  bolt: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.58, 0.08], [0.28, 0.54], [0.48, 0.54], [0.42, 0.92], [0.74, 0.42], [0.52, 0.42]], true, true); c.restore() },
  flag: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.26, 0.12, 0.26, 0.88); poly(c, x, y, s, [[0.26, 0.16], [0.78, 0.27], [0.26, 0.46]], true, false); c.restore() },
  bookmark: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.28, 0.12], [0.72, 0.12], [0.72, 0.88], [0.5, 0.7], [0.28, 0.88]], true, false); c.restore() },
  lock: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.24, 0.46, 0.52, 0.42, 0.05, false); arc(c, x, y, s, 0.5, 0.46, 0.16, Math.PI, 0, false); c.restore() },
  gear: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.18, false); for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 * i) / 8; line(c, x, y, s, 0.5 + 0.26 * Math.cos(a), 0.5 + 0.26 * Math.sin(a), 0.5 + 0.4 * Math.cos(a), 0.5 + 0.4 * Math.sin(a)) } c.restore() },
  search: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.42, 0.42, 0.24, false); line(c, x, y, s, 0.6, 0.6, 0.84, 0.84); c.restore() },
  eye: (c, x, y, s) => { prep(c, s); c.beginPath(); c.moveTo(x + 0.12 * s, y + 0.5 * s); c.quadraticCurveTo(x + 0.5 * s, y + 0.16 * s, x + 0.88 * s, y + 0.5 * s); c.quadraticCurveTo(x + 0.5 * s, y + 0.84 * s, x + 0.12 * s, y + 0.5 * s); c.stroke(); circle(c, x, y, s, 0.5, 0.5, 0.12, false); c.restore() },

  cash: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.1, 0.28, 0.8, 0.44, 0.05, false); circle(c, x, y, s, 0.5, 0.5, 0.1, false); c.restore() },
  coin: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.4, false); circle(c, x, y, s, 0.5, 0.5, 0.26, false); line(c, x, y, s, 0.5, 0.34, 0.5, 0.66); c.restore() },
  card: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.1, 0.3, 0.8, 0.4, 0.05, false); c.fillRect(x + 0.1 * s, y + 0.4 * s, 0.8 * s, 0.07 * s); line(c, x, y, s, 0.2, 0.6, 0.42, 0.6); c.restore() },
  percent: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.28, 0.72, 0.72, 0.28); circle(c, x, y, s, 0.33, 0.34, 0.08, false); circle(c, x, y, s, 0.67, 0.66, 0.08, false); c.restore() },
  cart: (c, x, y, s) => { prep(c, s); line(c, x, y, s, 0.08, 0.16, 0.22, 0.16); line(c, x, y, s, 0.22, 0.16, 0.34, 0.6); poly(c, x, y, s, [[0.3, 0.3], [0.88, 0.3], [0.78, 0.6], [0.34, 0.6]], true, false); circle(c, x, y, s, 0.42, 0.78, 0.07, false); circle(c, x, y, s, 0.72, 0.78, 0.07, false); c.restore() },
  bag: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.24, 0.36], [0.76, 0.36], [0.82, 0.86], [0.18, 0.86]], true, false); arc(c, x, y, s, 0.5, 0.36, 0.14, Math.PI, 0, false); c.restore() },
  gift: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.16, 0.42, 0.68, 0.44, 0.04, false); line(c, x, y, s, 0.5, 0.42, 0.5, 0.86); line(c, x, y, s, 0.16, 0.54, 0.84, 0.54); circle(c, x, y, s, 0.38, 0.32, 0.1, false); circle(c, x, y, s, 0.62, 0.32, 0.1, false); c.restore() },

  car: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.1, 0.62], [0.2, 0.44], [0.38, 0.44], [0.46, 0.32], [0.72, 0.32], [0.82, 0.46], [0.9, 0.5], [0.9, 0.62]], false, false); line(c, x, y, s, 0.1, 0.62, 0.9, 0.62); circle(c, x, y, s, 0.3, 0.66, 0.09, false); circle(c, x, y, s, 0.7, 0.66, 0.09, false); c.restore() },
  truck: (c, x, y, s) => { prep(c, s); c.strokeRect(x + 0.08 * s, y + 0.4 * s, 0.5 * s, 0.28 * s); poly(c, x, y, s, [[0.58, 0.46], [0.74, 0.46], [0.88, 0.58], [0.88, 0.68], [0.58, 0.68]], true, false); circle(c, x, y, s, 0.24, 0.74, 0.08, false); circle(c, x, y, s, 0.72, 0.74, 0.08, false); c.restore() },
  plane: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.5, 0.08], [0.57, 0.44], [0.9, 0.64], [0.57, 0.58], [0.55, 0.82], [0.66, 0.9], [0.5, 0.86], [0.34, 0.9], [0.45, 0.82], [0.43, 0.58], [0.1, 0.64], [0.43, 0.44]], true, false); c.restore() },
  bike: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.26, 0.66, 0.18, false); circle(c, x, y, s, 0.74, 0.66, 0.18, false); line(c, x, y, s, 0.26, 0.66, 0.5, 0.66); line(c, x, y, s, 0.5, 0.66, 0.42, 0.4); line(c, x, y, s, 0.42, 0.4, 0.66, 0.4); line(c, x, y, s, 0.66, 0.4, 0.74, 0.66); line(c, x, y, s, 0.5, 0.66, 0.42, 0.4); c.restore() },

  camera: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.1, 0.32, 0.8, 0.52, 0.06, false); poly(c, x, y, s, [[0.34, 0.32], [0.4, 0.24], [0.6, 0.24], [0.66, 0.32]], false, false); circle(c, x, y, s, 0.5, 0.58, 0.15, false); c.restore() },
  monitor: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.12, 0.2, 0.76, 0.5, 0.04, false); line(c, x, y, s, 0.5, 0.7, 0.5, 0.82); line(c, x, y, s, 0.36, 0.82, 0.64, 0.82); c.restore() },
  music: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.34, 0.74, 0.12, false); line(c, x, y, s, 0.46, 0.74, 0.46, 0.2); poly(c, x, y, s, [[0.46, 0.2], [0.74, 0.3], [0.74, 0.44]], false, false); c.restore() },
  play: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.32, 0.2], [0.32, 0.8], [0.82, 0.5]], true, true); c.restore() },
  volume: (c, x, y, s) => { prep(c, s); poly(c, x, y, s, [[0.14, 0.4], [0.3, 0.4], [0.48, 0.24], [0.48, 0.76], [0.3, 0.6], [0.14, 0.6]], true, false); arc(c, x, y, s, 0.5, 0.5, 0.16, -Math.PI * 0.4, Math.PI * 0.4, false); arc(c, x, y, s, 0.5, 0.5, 0.28, -Math.PI * 0.4, Math.PI * 0.4, false); c.restore() },

  user: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.34, 0.18, false); arc(c, x, y, s, 0.5, 0.92, 0.32, Math.PI, 0, false); c.restore() },
  users: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.38, 0.34, 0.15, false); arc(c, x, y, s, 0.38, 0.86, 0.26, Math.PI, 0, false); circle(c, x, y, s, 0.7, 0.36, 0.12, false); arc(c, x, y, s, 0.74, 0.84, 0.2, Math.PI * 1.1, Math.PI * 1.9, false); c.restore() },
  smile: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.5, 0.5, 0.4, false); circle(c, x, y, s, 0.38, 0.42, 0.04, true); circle(c, x, y, s, 0.62, 0.42, 0.04, true); arc(c, x, y, s, 0.5, 0.52, 0.2, Math.PI * 0.15, Math.PI * 0.85, false); c.restore() },

  cloud: (c, x, y, s) => { prep(c, s); circle(c, x, y, s, 0.36, 0.58, 0.14, false); circle(c, x, y, s, 0.56, 0.5, 0.18, false); circle(c, x, y, s, 0.72, 0.6, 0.12, false); line(c, x, y, s, 0.32, 0.72, 0.78, 0.72); c.restore() },
  umbrella: (c, x, y, s) => { prep(c, s); arc(c, x, y, s, 0.5, 0.5, 0.34, Math.PI, 0, false); line(c, x, y, s, 0.16, 0.5, 0.84, 0.5); line(c, x, y, s, 0.5, 0.5, 0.5, 0.82); arc(c, x, y, s, 0.42, 0.82, 0.08, 0, Math.PI, false); c.restore() },
  thermometer: (c, x, y, s) => { prep(c, s); rrect(c, x, y, s, 0.42, 0.12, 0.16, 0.52, 0.08, false); circle(c, x, y, s, 0.5, 0.76, 0.13, false); circle(c, x, y, s, 0.5, 0.76, 0.06, true); c.restore() }
}

export const ICON_CATEGORIES = [
  { id: 'geral', name: 'Geral & status', keys: ['check', 'x', 'plus', 'minus', 'star', 'heart', 'info', 'warning', 'question', 'circle', 'disc', 'dot', 'flag', 'bookmark', 'search', 'eye', 'lock', 'gear'] },
  { id: 'setas', name: 'Setas', keys: ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'refresh', 'sort'] },
  { id: 'formas', name: 'Formas', keys: ['square', 'triangle', 'hexagon', 'diamond'] },
  { id: 'oficina', name: 'Oficina & marcenaria', keys: ['ruler', 'saw', 'hammer', 'screw', 'nut', 'wrench', 'drill', 'board', 'brush', 'pencil'] },
  { id: 'casa', name: 'Casa & objetos', keys: ['home', 'bed', 'key', 'lamp', 'plug', 'door', 'clock', 'calendar'] },
  { id: 'cozinha', name: 'Cozinha & comida', keys: ['cup', 'coffee', 'bottle', 'jar', 'fork-knife', 'apple', 'bread', 'cake', 'ice'] },
  { id: 'comercio', name: 'Comércio & dinheiro', keys: ['cash', 'coin', 'card', 'percent', 'cart', 'bag', 'gift'] },
  { id: 'transporte', name: 'Transporte', keys: ['car', 'truck', 'plane', 'bike'] },
  { id: 'tecnologia', name: 'Tecnologia & mídia', keys: ['camera', 'monitor', 'music', 'play', 'volume', 'phone'] },
  { id: 'pessoas', name: 'Pessoas & rostos', keys: ['user', 'users', 'smile'] },
  { id: 'envio', name: 'Envio & escritório', keys: ['tag', 'box', 'mail', 'pin', 'clip', 'folder', 'printer', 'barcode'] },
  { id: 'natureza', name: 'Natureza & clima', keys: ['leaf', 'flower', 'sun', 'moon', 'drop', 'snowflake', 'tree', 'cloud', 'umbrella', 'thermometer'] },
  { id: 'cuidados', name: 'Cuidados & símbolos', keys: ['recycle', 'fragile', 'keep-dry', 'this-up', 'no', 'wifi', 'battery', 'bolt'] }
]

export const ICON_COUNT = ICON_CATEGORIES.reduce((n, c) => n + c.keys.length, 0)

export const ICON_KEYS = Object.keys(ICONS)

export function drawIcon(ctx, key, x, y, size) {
  const f = ICONS[key]
  if (f) f(ctx, x, y, size)
}
