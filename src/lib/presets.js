// Modelos prontos — o usuário parte de um destes e edita o conteúdo.
// Todas as medidas em mm. Conteúdo é literal (igual ao resto do app).
// Cada modelo tem `cat` (categoria de uso) para a galeria categorizada.

let n = 0
const id = () => `e_${n++}`
const border = (w, h, lw = 0.4) => ({ id: id(), type: 'rect', x: 0.6, y: 0.6, w: w - 1.2, h: h - 1.2, fill: false, lineMm: lw })
const T = (text, x, y, w, h, fontMm, bold = false, align = 'left', extra = {}) => ({ id: id(), type: 'text', text, x, y, w, h, fontMm, bold, align, ...extra })
const D = (x, y, w, h, fontMm, extra = {}) => ({ id: id(), type: 'date', x, y, w, h, fontMm, bold: false, align: 'left', dateMode: 'today', fmt: 'dd/MM/yyyy', prefix: '', ...extra })

export const STARTER_CATEGORIES = [
  { id: 'precos', name: 'Preços' },
  { id: 'alimentos', name: 'Alimentos & validade' },
  { id: 'organizacao', name: 'Organização' },
  { id: 'envio', name: 'Envio & endereço' },
  { id: 'identificacao', name: 'Nome & identificação' },
  { id: 'cosmeticos', name: 'Cosméticos' },
  { id: 'cabos', name: 'Cabos & eletrônicos' },
  { id: 'escritorio', name: 'Escritório' },
  { id: 'casa', name: 'Casa & utilidades' },
  { id: 'joias', name: 'Joias & presentes' }
]

export const STARTER_TEMPLATES = [
  // ---------------- Preços ----------------
  {
    name: 'Produto com preço', cat: 'precos', widthMm: 40, heightMm: 30,
    elements: [
      border(40, 30),
      T('Nome do produto', 2.5, 2.5, 35, 5, 3.6, true),
      T('R$ 19,90', 2.5, 8.5, 22, 7, 6, true),
      { id: id(), type: 'barcode', text: '7891234567890', x: 2.5, y: 17, w: 35, h: 9 },
      T('7891234567890', 2.5, 26, 35, 3, 2.2, false, 'center')
    ]
  },
  {
    name: 'Preço grande (oferta)', cat: 'precos', widthMm: 40, heightMm: 30,
    elements: [
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 38.4, h: 28.4, fill: true, lineMm: 0 },
      { id: id(), type: 'rect', x: 2, y: 2, w: 36, h: 26, fill: false, lineMm: 0.5 },
      T('OFERTA', 3, 3.5, 34, 4, 3, true, 'center'),
      T('R$ 9,99', 3, 9, 34, 11, 9, true, 'center'),
      T('cada unidade', 3, 22, 34, 4, 2.6, false, 'center')
    ]
  },
  {
    name: 'Preço por kg', cat: 'precos', widthMm: 40, heightMm: 25,
    elements: [
      border(40, 25),
      T('Tomate italiano', 2.5, 2.5, 35, 4.5, 3.2, true),
      T('R$', 2.5, 8, 6, 6, 4, true),
      T('8,90', 9, 8, 20, 8, 7, true),
      T('/kg', 29, 11, 9, 5, 3.4, false),
      T('Validade no dia', 2.5, 19, 35, 3.5, 2.2, false)
    ]
  },
  {
    name: 'Etiqueta de prateleira', cat: 'precos', widthMm: 50, heightMm: 30,
    elements: [
      border(50, 30),
      T('Categoria · Marca', 2.5, 2.5, 45, 3.5, 2.4, false),
      T('Produto exemplo 500ml', 2.5, 6, 45, 5, 3.4, true),
      T('R$ 14,90', 2.5, 13, 30, 9, 7, true),
      { id: id(), type: 'barcode', text: '7890000000123', x: 31, y: 13, w: 17, h: 8 },
      T('Cód. 00123 · un', 2.5, 24, 45, 3.5, 2.4, false)
    ]
  },

  // ---------------- Alimentos & validade ----------------
  {
    name: 'Validade (feito/vence)', cat: 'alimentos', widthMm: 40, heightMm: 30,
    elements: [
      border(40, 30),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'jar', x: 2.5, y: 3, w: 8, h: 9 },
      T('Geleia de morango', 12, 3.5, 26, 5, 3.2, true),
      D(12, 9, 26, 3.5, 2.4, { prefix: 'Feito em: ' }),
      { id: id(), type: 'line', x: 2.5, y: 14, w: 35, h: 1, lineMm: 0.3 },
      T('VALIDADE', 2.5, 16, 20, 4, 2.6, true),
      D(2.5, 20, 24, 6, 5, { dateMode: 'offset', offsetDays: 180, bold: true }),
      { id: id(), type: 'qr', text: 'lote-2026-06', x: 28, y: 17, w: 9, h: 9 }
    ]
  },
  {
    name: 'Aberto em / consumir', cat: 'alimentos', widthMm: 40, heightMm: 25,
    elements: [
      border(40, 25),
      T('ABERTO EM', 2.5, 2.5, 35, 4, 2.8, true, 'center'),
      D(2.5, 7, 35, 7, 6, { align: 'center', bold: true }),
      { id: id(), type: 'line', x: 4, y: 15, w: 32, h: 1, lineMm: 0.3 },
      T('Consumir em até 5 dias', 2.5, 17, 35, 4, 2.6, false, 'center')
    ]
  },
  {
    name: 'Congelados', cat: 'alimentos', widthMm: 50, heightMm: 30,
    elements: [
      border(50, 30),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'snowflake', x: 2.5, y: 2.5, w: 8, h: 8 },
      T('Molho bolonhesa', 12, 3, 36, 5, 3.4, true),
      D(12, 8.5, 36, 3.5, 2.4, { prefix: 'Congelado: ' }),
      D(2.5, 14, 30, 5, 3.8, { dateMode: 'offset', offsetDays: 90, prefix: 'Val: ', bold: true }),
      T('Porção: 2 pessoas', 2.5, 20.5, 45, 3.5, 2.4, false)
    ]
  },
  {
    name: 'Tabela nutricional', cat: 'alimentos', widthMm: 50, heightMm: 40,
    elements: [
      T('Informação nutricional', 2, 1.5, 46, 4, 2.8, true),
      T('Porção de 30g', 2, 5.5, 46, 3, 2.2, false),
      { id: id(), type: 'table', x: 2, y: 9, w: 46, h: 29, rows: 5, cols: 2, headerBold: true, fontMm: 2.4, lineMm: 0.3,
        cells: ['Item', 'Qtd', 'Calorias', '120 kcal', 'Carboidratos', '15 g', 'Proteínas', '3 g', 'Gorduras', '5 g'] }
    ]
  },

  // ---------------- Organização ----------------
  {
    name: 'Caixa / organização', cat: 'organizacao', widthMm: 40, heightMm: 30,
    elements: [
      border(40, 30),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'box', x: 2.5, y: 3, w: 9, h: 9 },
      T('PARAFUSOS', 13, 4, 25, 6, 4.2, true),
      { id: id(), type: 'line', x: 2.5, y: 14, w: 35, h: 1, lineMm: 0.4 },
      T('Sortidos · 3 a 6 mm', 2.5, 16, 35, 4, 2.8, false),
      T('Prateleira A2', 2.5, 21, 35, 4, 2.8, false)
    ]
  },
  {
    name: 'Pote / mantimento', cat: 'organizacao', widthMm: 40, heightMm: 25,
    elements: [
      border(40, 25, 0.5),
      T('AÇÚCAR', 2.5, 4, 35, 8, 6.5, true, 'center'),
      { id: id(), type: 'line', x: 6, y: 14, w: 28, h: 1, lineMm: 0.3 },
      T('Refinado · 1 kg', 2.5, 16, 35, 4, 2.8, false, 'center')
    ]
  },
  {
    name: 'Conteúdo da caixa', cat: 'organizacao', widthMm: 50, heightMm: 30,
    elements: [
      border(50, 30),
      T('CAIXA 03 — Cozinha', 2.5, 2.5, 45, 4.5, 3.2, true),
      { id: id(), type: 'line', x: 2.5, y: 8, w: 45, h: 1, lineMm: 0.3 },
      T('• Panelas e tampas', 2.5, 10, 45, 3.5, 2.5, false),
      T('• Utensílios diversos', 2.5, 14, 45, 3.5, 2.5, false),
      T('• Potes de vidro', 2.5, 18, 45, 3.5, 2.5, false),
      { id: id(), type: 'qr', text: 'caixa-03-cozinha', x: 38, y: 1.5, w: 9, h: 9 }
    ]
  },
  {
    name: 'Setor / localização', cat: 'organizacao', widthMm: 40, heightMm: 20,
    elements: [
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 12, h: 18.4, fill: true, lineMm: 0 },
      T('A2', 1, 4, 11, 11, 8, true, 'center', { font: '"Arial Black", sans-serif' }),
      T('Estoque seco', 14, 4, 24, 4, 3, true),
      T('Corredor 2 · Nível A', 14, 10, 24, 4, 2.4, false)
    ]
  },

  // ---------------- Envio & endereço ----------------
  {
    name: 'Envio / endereço', cat: 'envio', widthMm: 50, heightMm: 30,
    elements: [
      border(50, 30),
      T('PARA:', 2.5, 2.5, 20, 4, 3, true),
      T('Yasmin Silva', 2.5, 7, 34, 4.5, 3.4, true),
      T('Rua das Flores, 123 — Centro', 2.5, 12, 34, 4, 2.6, false),
      T('São Paulo — SP · 01000-000', 2.5, 16, 34, 4, 2.6, false),
      { id: id(), type: 'qr', text: 'https://rastreio.exemplo/AB123', x: 38, y: 8, w: 10, h: 10 }
    ]
  },
  {
    name: 'Remetente / destinatário', cat: 'envio', widthMm: 60, heightMm: 40,
    elements: [
      border(60, 40),
      T('DE:', 2.5, 2.5, 55, 3.5, 2.6, true),
      T('Loja TagYa · (11) 90000-0000', 8, 2.5, 50, 3.5, 2.6, false),
      { id: id(), type: 'line', x: 2.5, y: 7.5, w: 55, h: 1, lineMm: 0.3 },
      T('PARA:', 2.5, 9.5, 20, 4, 3.2, true),
      T('João Pereira', 2.5, 14, 44, 4.5, 3.6, true),
      T('Av. Brasil, 4500 — Apto 21', 2.5, 19, 44, 4, 2.8, false),
      T('Rio de Janeiro — RJ', 2.5, 23, 44, 4, 2.8, false),
      T('CEP 20000-000', 2.5, 27, 44, 4, 2.8, false),
      { id: id(), type: 'barcode', text: 'BR123456789BR', x: 2.5, y: 32, w: 55, h: 6 }
    ]
  },
  {
    name: 'Frágil', cat: 'envio', widthMm: 50, heightMm: 30,
    elements: [
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 48.4, h: 28.4, fill: false, lineMm: 0.8 },
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'warning', x: 3, y: 7, w: 14, h: 14 },
      T('FRÁGIL', 18, 6, 30, 9, 7.5, true, 'center'),
      T('Manuseie com cuidado', 18, 17, 30, 4, 2.8, false, 'center')
    ]
  },

  // ---------------- Nome & identificação ----------------
  {
    name: 'Identificação', cat: 'identificacao', widthMm: 25, heightMm: 25,
    elements: [
      border(25, 25),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'star', x: 8.5, y: 2.5, w: 8, h: 8 },
      T('YASMIN', 2, 12, 21, 5, 4, true, 'center'),
      T('3º ano B', 2, 17.5, 21, 4, 2.8, false, 'center')
    ]
  },
  {
    name: 'Crachá / nome', cat: 'identificacao', widthMm: 50, heightMm: 25,
    elements: [
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 48.4, h: 5.5, fill: true, lineMm: 0 },
      T('EVENTO TAGYA 2026', 2.5, 1.5, 45, 3.5, 2.8, true, 'center', { font: '"Arial", sans-serif' }),
      T('Yasmin Camará', 2.5, 9, 45, 6, 5, true, 'center'),
      T('Organização', 2.5, 16.5, 45, 4, 3, false, 'center')
    ]
  },
  {
    name: 'Volta às aulas', cat: 'identificacao', widthMm: 40, heightMm: 15,
    elements: [
      border(40, 15),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'pencil', x: 2, y: 3, w: 9, h: 9 },
      T('Caderno de Matemática', 12.5, 3, 26, 4.5, 3, true),
      T('Yasmin — 5ª série', 12.5, 8, 26, 4, 2.5, false)
    ]
  },
  {
    name: 'Pet / coleira', cat: 'identificacao', widthMm: 40, heightMm: 15,
    elements: [
      border(40, 15, 0.5),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'heart', x: 2, y: 3, w: 9, h: 9 },
      T('THOR', 12.5, 2.5, 26, 5, 4, true),
      T('(11) 99999-0000', 12.5, 8, 26, 4, 2.6, false)
    ]
  },

  // ---------------- Cosméticos ----------------
  {
    name: 'Cosmético artesanal', cat: 'cosmeticos', widthMm: 40, heightMm: 30,
    elements: [
      { id: id(), type: 'rect', x: 1, y: 1, w: 38, h: 28, fill: false, lineMm: 0.5 },
      { id: id(), type: 'ornament', ornament: 'div-leaf', x: 5, y: 3.5, w: 30, h: 3.5 },
      T('Sabonete de Lavanda', 3, 8, 34, 5, 3.4, true, 'center', { font: '"Georgia", serif' }),
      T('Natural · 90g', 3, 14, 34, 3.5, 2.4, false, 'center'),
      { id: id(), type: 'ornament', ornament: 'div-leaf', x: 5, y: 18.5, w: 30, h: 3.5 },
      D(3, 23, 34, 3.5, 2.2, { align: 'center', dateMode: 'offset', offsetDays: 365, prefix: 'Val: ' })
    ]
  },
  {
    name: 'Frasco / batch', cat: 'cosmeticos', widthMm: 30, heightMm: 20,
    elements: [
      border(30, 20),
      T('Hidratante', 2, 2.5, 26, 4, 3, true, 'center'),
      T('Lote ABC-12', 2, 7.5, 26, 3.5, 2.2, false, 'center'),
      D(2, 11.5, 26, 4.5, 2.8, { align: 'center', dateMode: 'offset', offsetDays: 540, prefix: 'Val ' })
    ]
  },
  {
    name: 'Ingredientes', cat: 'cosmeticos', widthMm: 50, heightMm: 30,
    elements: [
      border(50, 30),
      T('Óleo corporal', 2.5, 2.5, 45, 4.5, 3.4, true),
      T('Ingredientes:', 2.5, 8, 45, 3, 2.2, true),
      T('Óleo de coco, vitamina E,', 2.5, 11.5, 45, 3.5, 2.3, false),
      T('óleo essencial de lavanda.', 2.5, 15, 45, 3.5, 2.3, false),
      T('Uso externo · 100ml', 2.5, 20, 45, 3.5, 2.3, false),
      { id: id(), type: 'qr', text: 'https://tagya.app/produto', x: 39, y: 19, w: 9, h: 9 }
    ]
  },

  // ---------------- Cabos & eletrônicos ----------------
  {
    name: 'Cabo (bandeira)', cat: 'cabos', widthMm: 50, heightMm: 15,
    elements: [
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 22, h: 13.4, fill: false, lineMm: 0.4 },
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'plug', x: 2, y: 3.5, w: 7, h: 7 },
      T('HDMI · TV', 10, 4.5, 12, 5, 3.2, true),
      T('HDMI · TV', 28, 4.5, 20, 5, 3.2, true)
    ]
  },
  {
    name: 'Identificação de cabo', cat: 'cabos', widthMm: 40, heightMm: 12,
    elements: [
      border(40, 12),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'plug', x: 1.5, y: 2.5, w: 7, h: 7 },
      T('Carregador notebook', 10, 2, 28, 4, 2.8, true),
      T('Mesa do escritório', 10, 6.5, 28, 3.5, 2.2, false)
    ]
  },
  {
    name: 'Equipamento / patrimônio', cat: 'cabos', widthMm: 40, heightMm: 20,
    elements: [
      border(40, 20),
      T('PATRIMÔNIO', 2.5, 2, 25, 3.5, 2.4, true),
      T('Notebook Dell', 2.5, 6, 25, 4.5, 3, true),
      T('Nº 004821', 2.5, 11.5, 25, 4, 2.6, false),
      { id: id(), type: 'qr', text: 'patrimonio-004821', x: 28.5, y: 4, w: 10, h: 10 }
    ]
  },

  // ---------------- Escritório ----------------
  {
    name: 'Pasta / arquivo', cat: 'escritorio', widthMm: 50, heightMm: 20,
    elements: [
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 48.4, h: 18.4, fill: false, lineMm: 0.4 },
      { id: id(), type: 'rect', x: 0.8, y: 0.8, w: 7, h: 18.4, fill: true, lineMm: 0 },
      T('2026', 1, 6.5, 6.4, 6, 2.4, true, 'center', { font: '"Arial", sans-serif' }),
      T('Notas fiscais', 9.5, 3, 38, 5, 3.6, true),
      T('Jan — Jun · Financeiro', 9.5, 9.5, 38, 4, 2.6, false)
    ]
  },
  {
    name: 'Inventário (tabela)', cat: 'escritorio', widthMm: 50, heightMm: 35,
    elements: [
      T('Inventário — Sala 2', 2, 1.5, 46, 4, 2.8, true),
      { id: id(), type: 'table', x: 2, y: 6.5, w: 46, h: 27, rows: 4, cols: 3, headerBold: true, fontMm: 2.3, lineMm: 0.3,
        cells: ['Item', 'Qtd', 'Estado', 'Cadeira', '8', 'OK', 'Mesa', '4', 'OK', 'Monitor', '4', 'Rev'] }
    ]
  },
  {
    name: 'Reunião / agenda', cat: 'escritorio', widthMm: 50, heightMm: 25,
    elements: [
      border(50, 25),
      T('REUNIÃO', 2.5, 2.5, 45, 4, 2.8, true),
      T('Planejamento Q3', 2.5, 7, 45, 5, 3.6, true),
      D(2.5, 13.5, 30, 4, 2.8, { prefix: 'Data: ', dateMode: 'fixed', fixedDate: '' }),
      T('Sala 3 · 14h', 2.5, 18, 45, 4, 2.6, false)
    ]
  },

  // ---------------- Casa & utilidades ----------------
  {
    name: 'Wi-Fi da casa', cat: 'casa', widthMm: 50, heightMm: 30,
    elements: [
      border(50, 30),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'wifi', x: 3, y: 4, w: 11, h: 11 },
      T('Wi-Fi', 3, 16, 14, 5, 3.4, true, 'center'),
      T('Rede: CasaYasmin', 17, 4.5, 30, 5, 3.2, true),
      T('Senha: ******', 17, 10.5, 30, 4.5, 2.8, false),
      { id: id(), type: 'qr', text: 'WIFI:S:CasaYasmin;T:WPA;P:suasenha;;', x: 30, y: 16, w: 12, h: 12 }
    ]
  },
  {
    name: 'Tempero / cozinha', cat: 'casa', widthMm: 30, heightMm: 15,
    elements: [
      border(30, 15, 0.4),
      { id: id(), type: 'ornament', ornament: 'div-dots', x: 4, y: 2, w: 22, h: 2 },
      T('ORÉGANO', 2, 5, 26, 5, 4, true, 'center'),
      { id: id(), type: 'ornament', ornament: 'div-dots', x: 4, y: 11, w: 22, h: 2 }
    ]
  },
  {
    name: 'Manutenção / data', cat: 'casa', widthMm: 40, heightMm: 20,
    elements: [
      border(40, 20),
      { id: id(), type: 'icon', iconLib: 'etiqya', icon: 'wrench', x: 2, y: 5.5, w: 9, h: 9 },
      T('Troca do filtro', 12.5, 3, 26, 4.5, 3, true),
      D(12.5, 8, 26, 3.5, 2.3, { prefix: 'Trocado: ' }),
      D(12.5, 12, 26, 4, 2.6, { dateMode: 'offset', offsetDays: 90, prefix: 'Próx: ', bold: true })
    ]
  },

  // ---------------- Joias & presentes ----------------
  {
    name: 'Etiqueta de joia', cat: 'joias', widthMm: 25, heightMm: 12,
    elements: [
      { id: id(), type: 'rect', x: 0.5, y: 0.5, w: 24, h: 11, fill: false, lineMm: 0.3 },
      T('Anel prata 925', 1.5, 1.5, 22, 3.5, 2.2, true, 'center'),
      T('R$ 89,90', 1.5, 5, 14, 4.5, 3, true),
      { id: id(), type: 'qr', text: 'joia-925-anel', x: 16.5, y: 4.5, w: 6.5, h: 6.5 }
    ]
  },
  {
    name: 'Presente / para-de', cat: 'joias', widthMm: 50, heightMm: 25,
    elements: [
      { id: id(), type: 'rect', x: 1, y: 1, w: 48, h: 23, fill: false, lineMm: 0.5 },
      { id: id(), type: 'ornament', ornament: 'corner-flourish-tl', x: 1.5, y: 1.5, w: 8, h: 8 },
      T('Para:', 12, 4, 36, 4, 2.8, false, 'center', { font: '"Georgia", serif' }),
      T('Yasmin', 12, 8.5, 36, 6, 5, true, 'center', { font: '"Dancing Script", cursive' }),
      T('Com carinho ♥', 12, 16.5, 36, 4, 2.6, false, 'center', { font: '"Georgia", serif' })
    ]
  },
  {
    name: 'Tag de roupa', cat: 'joias', widthMm: 30, heightMm: 40,
    elements: [
      border(30, 40),
      T('TAGYA', 2, 3, 26, 4, 3, true, 'center'),
      { id: id(), type: 'line', x: 6, y: 8, w: 18, h: 1, lineMm: 0.3 },
      T('Tam', 2, 11, 26, 3, 2.2, false, 'center'),
      T('M', 2, 14, 26, 9, 8, true, 'center'),
      T('R$ 79,90', 2, 25, 26, 5, 3.4, true, 'center'),
      { id: id(), type: 'barcode', text: '789456123', x: 3, y: 31, w: 24, h: 7 }
    ]
  }
]
