// Modelos prontos — o usuário parte de um destes e edita o conteúdo.
// Todas as medidas em mm. Conteúdo é literal (igual ao resto do app).

let n = 0
const id = (p) => `${p}_${n++}`

export const STARTER_TEMPLATES = [
  {
    name: 'Produto com preço',
    widthMm: 40, heightMm: 30,
    elements: [
      { id: id('e'), type: 'rect', x: 0.8, y: 0.8, w: 38.4, h: 28.4, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'text', text: 'Nome do produto', x: 2.5, y: 2.5, w: 35, h: 5, fontMm: 3.6, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: 'R$ 19,90', x: 2.5, y: 8.5, w: 22, h: 7, fontMm: 6, bold: true, align: 'left' },
      { id: id('e'), type: 'barcode', text: '7891234567890', x: 2.5, y: 17, w: 35, h: 9 },
      { id: id('e'), type: 'text', text: '7891234567890', x: 2.5, y: 26, w: 35, h: 3, fontMm: 2.2, bold: false, align: 'center' }
    ]
  },
  {
    name: 'Envio / endereço',
    widthMm: 50, heightMm: 30,
    elements: [
      { id: id('e'), type: 'rect', x: 0.8, y: 0.8, w: 48.4, h: 28.4, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'text', text: 'PARA:', x: 2.5, y: 2.5, w: 20, h: 4, fontMm: 3, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: 'Yasmin Silva', x: 2.5, y: 7, w: 34, h: 4.5, fontMm: 3.4, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: 'Rua das Flores, 123 — Centro', x: 2.5, y: 12, w: 34, h: 4, fontMm: 2.6, bold: false, align: 'left' },
      { id: id('e'), type: 'text', text: 'São Paulo — SP · 01000-000', x: 2.5, y: 16, w: 34, h: 4, fontMm: 2.6, bold: false, align: 'left' },
      { id: id('e'), type: 'qr', text: 'https://rastreio.exemplo/AB123', x: 38, y: 8, w: 10, h: 10 }
    ]
  },
  {
    name: 'Caixa / organização',
    widthMm: 40, heightMm: 30,
    elements: [
      { id: id('e'), type: 'rect', x: 0.8, y: 0.8, w: 38.4, h: 28.4, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'icon', icon: 'box', x: 2.5, y: 3, w: 9, h: 9 },
      { id: id('e'), type: 'text', text: 'PARAFUSOS', x: 13, y: 4, w: 25, h: 6, fontMm: 4.2, bold: true, align: 'left' },
      { id: id('e'), type: 'line', x: 2.5, y: 14, w: 35, h: 1, lineMm: 0.4 },
      { id: id('e'), type: 'text', text: 'Sortidos · 3 a 6 mm', x: 2.5, y: 16, w: 35, h: 4, fontMm: 2.8, bold: false, align: 'left' },
      { id: id('e'), type: 'text', text: 'Prateleira A2', x: 2.5, y: 21, w: 35, h: 4, fontMm: 2.8, bold: false, align: 'left' }
    ]
  },
  {
    name: 'Preço grande',
    widthMm: 40, heightMm: 30,
    elements: [
      { id: id('e'), type: 'rect', x: 0.8, y: 0.8, w: 38.4, h: 28.4, fill: true, lineMm: 0 },
      { id: id('e'), type: 'rect', x: 2, y: 2, w: 36, h: 26, fill: false, lineMm: 0.5 },
      { id: id('e'), type: 'text', text: 'OFERTA', x: 3, y: 3.5, w: 34, h: 4, fontMm: 3, bold: true, align: 'center' },
      { id: id('e'), type: 'text', text: 'R$ 9,99', x: 3, y: 9, w: 34, h: 11, fontMm: 9, bold: true, align: 'center' },
      { id: id('e'), type: 'text', text: 'cada unidade', x: 3, y: 22, w: 34, h: 4, fontMm: 2.6, bold: false, align: 'center' }
    ]
  },
  {
    name: 'Identificação',
    widthMm: 25, heightMm: 25,
    elements: [
      { id: id('e'), type: 'rect', x: 0.6, y: 0.6, w: 23.8, h: 23.8, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'icon', icon: 'star', x: 8.5, y: 2.5, w: 8, h: 8 },
      { id: id('e'), type: 'text', text: 'YASMIN', x: 2, y: 12, w: 21, h: 5, fontMm: 4, bold: true, align: 'center' },
      { id: id('e'), type: 'text', text: '3º ano B', x: 2, y: 17.5, w: 21, h: 4, fontMm: 2.8, bold: false, align: 'center' }
    ]
  },
  {
    name: 'Validade / alimento',
    widthMm: 40, heightMm: 30,
    elements: [
      { id: id('e'), type: 'rect', x: 0.8, y: 0.8, w: 38.4, h: 28.4, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'icon', icon: 'jar', x: 2.5, y: 3, w: 8, h: 9 },
      { id: id('e'), type: 'text', text: 'Geleia de morango', x: 12, y: 3.5, w: 26, h: 5, fontMm: 3.2, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: 'Feito em: 01/06/2026', x: 12, y: 8.5, w: 26, h: 3.5, fontMm: 2.4, bold: false, align: 'left' },
      { id: id('e'), type: 'line', x: 2.5, y: 14, w: 35, h: 1, lineMm: 0.3 },
      { id: id('e'), type: 'text', text: 'VALIDADE', x: 2.5, y: 16, w: 20, h: 4, fontMm: 2.6, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: '01/12/2026', x: 2.5, y: 20, w: 24, h: 6, fontMm: 5, bold: true, align: 'left' },
      { id: id('e'), type: 'qr', text: 'lote-2026-06', x: 28, y: 17, w: 9, h: 9 }
    ]
  },
  {
    name: 'Wi-Fi da casa',
    widthMm: 50, heightMm: 30,
    elements: [
      { id: id('e'), type: 'rect', x: 0.8, y: 0.8, w: 48.4, h: 28.4, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'icon', icon: 'wifi', x: 3, y: 4, w: 11, h: 11 },
      { id: id('e'), type: 'text', text: 'Wi-Fi', x: 3, y: 16, w: 14, h: 5, fontMm: 3.4, bold: true, align: 'center' },
      { id: id('e'), type: 'text', text: 'Rede: CasaYasmin', x: 17, y: 4.5, w: 30, h: 5, fontMm: 3.2, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: 'Senha: ******', x: 17, y: 10.5, w: 30, h: 4.5, fontMm: 2.8, bold: false, align: 'left' },
      { id: id('e'), type: 'qr', text: 'WIFI:S:CasaYasmin;T:WPA;P:suasenha;;', x: 30, y: 16, w: 12, h: 12 }
    ]
  },
  {
    name: 'Etiqueta simples',
    widthMm: 40, heightMm: 12,
    elements: [
      { id: id('e'), type: 'rect', x: 0.6, y: 0.6, w: 38.8, h: 10.8, fill: false, lineMm: 0.4 },
      { id: id('e'), type: 'text', text: 'Título', x: 2, y: 1.4, w: 25, h: 4.4, fontMm: 3.4, bold: true, align: 'left' },
      { id: id('e'), type: 'text', text: 'Descrição curta', x: 2, y: 6, w: 25, h: 3, fontMm: 2.3, bold: false, align: 'left' },
      { id: id('e'), type: 'qr', text: 'https://tagya.app', x: 29.5, y: 1.5, w: 9, h: 9 }
    ]
  }
]
