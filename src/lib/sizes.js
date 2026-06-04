// Tamanhos de etiqueta. As Niimbot usam rolos com larguras fixas (12, 15, 25 mm…)
// e o comprimento varia conforme a etiqueta. Largura = dimensão do cabeçote térmico.

export const ROLL_WIDTHS = [12, 15, 25, 40, 50]

// Presets comuns (widthMm × heightMm). width = largura do rolo.
export const SIZE_PRESETS = [
  { id: '12x40', label: '12 × 40 mm', widthMm: 40, heightMm: 12, roll: 12, note: 'Fina e comprida' },
  { id: '12x30', label: '12 × 30 mm', widthMm: 30, heightMm: 12, roll: 12, note: 'Fina, curta' },
  { id: '15x30', label: '15 × 30 mm', widthMm: 30, heightMm: 15, roll: 15, note: 'Padrão pequena' },
  { id: '15x50', label: '15 × 50 mm', widthMm: 50, heightMm: 15, roll: 15, note: 'Endereço fino' },
  { id: '25x25', label: '25 × 25 mm', widthMm: 25, heightMm: 25, roll: 25, note: 'Quadrada' },
  { id: '25x50', label: '25 × 50 mm', widthMm: 50, heightMm: 25, roll: 25, note: 'Multiuso' },
  { id: '40x30', label: '40 × 30 mm', widthMm: 40, heightMm: 30, roll: 40, note: 'Produto' },
  { id: '50x30', label: '50 × 30 mm', widthMm: 50, heightMm: 30, roll: 50, note: 'Envio' }
]

// Largura do rolo (= dimensão do cabeçote) a partir da altura física da etiqueta.
// Na orientação do app, heightMm é o lado que passa pelo cabeçote.
export function rollWidthFor(heightMm) {
  return ROLL_WIDTHS.find((w) => heightMm <= w + 0.5) || ROLL_WIDTHS[ROLL_WIDTHS.length - 1]
}
