// Ícones em SVG inline no estilo lucide (mesmo path data, mesmos atributos padrão),
// estilo do health-tracker. Inline para evitar o barrel do lucide-react (5879 ícones,
// sem tree-shaking no Metro em dev) e problemas de resolução de deep import (.mjs).
import { createElement as h } from 'react'

const DEF = {
  xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'
}

const make = (nodes) => function Icon({ size = 24, strokeWidth, ...rest }) {
  return h('svg', { ...DEF, width: size, height: size, ...(strokeWidth ? { strokeWidth } : {}), ...rest },
    ...nodes.map(([tag, attrs], i) => h(tag, { key: i, ...attrs })))
}

export const Plus = make([['path', { d: 'M5 12h14' }], ['path', { d: 'M12 5v14' }]])
export const Minus = make([['path', { d: 'M5 12h14' }]])
export const Shapes = make([
  ['path', { d: 'M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z' }],
  ['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }],
  ['circle', { cx: '17.5', cy: '17.5', r: '3.5' }]
])
export const SlidersHorizontal = make([
  ['path', { d: 'M10 5H3' }], ['path', { d: 'M12 19H3' }], ['path', { d: 'M14 3v4' }],
  ['path', { d: 'M16 17v4' }], ['path', { d: 'M21 12h-9' }], ['path', { d: 'M21 19h-5' }],
  ['path', { d: 'M21 5h-7' }], ['path', { d: 'M8 10v4' }], ['path', { d: 'M8 12H3' }]
])
export const Save = make([
  ['path', { d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }],
  ['path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }],
  ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7' }]
])
export const Printer = make([
  ['path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' }],
  ['path', { d: 'M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6' }],
  ['rect', { x: '6', y: '14', width: '12', height: '8', rx: '1' }]
])
export const MoreHorizontal = make([
  ['circle', { cx: '12', cy: '12', r: '1' }], ['circle', { cx: '19', cy: '12', r: '1' }], ['circle', { cx: '5', cy: '12', r: '1' }]
])
export const Type = make([
  ['path', { d: 'M12 4v16' }], ['path', { d: 'M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2' }], ['path', { d: 'M9 20h6' }]
])
export const QrCode = make([
  ['rect', { width: '5', height: '5', x: '3', y: '3', rx: '1' }],
  ['rect', { width: '5', height: '5', x: '16', y: '3', rx: '1' }],
  ['rect', { width: '5', height: '5', x: '3', y: '16', rx: '1' }],
  ['path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3' }], ['path', { d: 'M21 21v.01' }],
  ['path', { d: 'M12 7v3a2 2 0 0 1-2 2H7' }], ['path', { d: 'M3 12h.01' }],
  ['path', { d: 'M12 3h.01' }], ['path', { d: 'M12 16v.01' }], ['path', { d: 'M16 12h1' }],
  ['path', { d: 'M21 12v.01' }], ['path', { d: 'M12 21v-1' }]
])
export const Barcode = make([
  ['path', { d: 'M3 5v14' }], ['path', { d: 'M8 5v14' }], ['path', { d: 'M12 5v14' }], ['path', { d: 'M17 5v14' }], ['path', { d: 'M21 5v14' }]
])
export const Star = make([
  ['path', { d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' }]
])
export const Square = make([['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }]])
export const ImageIcon = make([
  ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }],
  ['circle', { cx: '9', cy: '9', r: '2' }],
  ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }]
])
export const FilePlus2 = make([
  ['path', { d: 'M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35' }],
  ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5' }], ['path', { d: 'M14 19h6' }], ['path', { d: 'M17 16v6' }]
])
export const Sparkles = make([
  ['path', { d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z' }],
  ['path', { d: 'M20 2v4' }], ['path', { d: 'M22 4h-4' }], ['circle', { cx: '4', cy: '20', r: '2' }]
])
export const FolderOpen = make([
  ['path', { d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2' }]
])
export const Download = make([
  ['path', { d: 'M12 15V3' }], ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }], ['path', { d: 'm7 10 5 5 5-5' }]
])
export const Moon = make([
  ['path', { d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' }]
])
export const Sun = make([
  ['circle', { cx: '12', cy: '12', r: '4' }], ['path', { d: 'M12 2v2' }], ['path', { d: 'M12 20v2' }],
  ['path', { d: 'm4.93 4.93 1.41 1.41' }], ['path', { d: 'm17.66 17.66 1.41 1.41' }], ['path', { d: 'M2 12h2' }],
  ['path', { d: 'M20 12h2' }], ['path', { d: 'm6.34 17.66-1.41 1.41' }], ['path', { d: 'm19.07 4.93-1.41 1.41' }]
])
export const Trash2 = make([
  ['path', { d: 'M10 11v6' }], ['path', { d: 'M14 11v6' }],
  ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }], ['path', { d: 'M3 6h18' }],
  ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }]
])
export const Undo2 = make([
  ['path', { d: 'M9 14 4 9l5-5' }],
  ['path', { d: 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11' }]
])
export const Redo2 = make([
  ['path', { d: 'm15 14 5-5-5-5' }],
  ['path', { d: 'M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13' }]
])
export const Copy = make([
  ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
  ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }]
])
export const BringToFront = make([
  ['rect', { x: '8', y: '8', width: '8', height: '8', rx: '2' }],
  ['path', { d: 'M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2' }],
  ['path', { d: 'M14 22a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2' }]
])
export const SendToBack = make([
  ['rect', { x: '14', y: '14', width: '8', height: '8', rx: '2' }],
  ['rect', { x: '2', y: '2', width: '8', height: '8', rx: '2' }],
  ['path', { d: 'M7 14v1a2 2 0 0 0 2 2h1' }],
  ['path', { d: 'M14 7h1a2 2 0 0 1 2 2v1' }]
])
export const ChevronUp = make([['path', { d: 'm18 15-6-6-6 6' }]])
export const ChevronDown = make([['path', { d: 'm6 9 6 6 6-6' }]])
