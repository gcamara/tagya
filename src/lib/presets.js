// Modelos prontos — todos no tamanho 40×12 mm (padrão D110), gerados por layouts
// reaproveitáveis + arrays de conteúdo. Cada modelo tem `cat` (categoria de uso).

let n = 0
const id = () => `e_${n++}`
const W = 40, H = 12

const bd = (lw = 0.4) => ({ id: id(), type: 'rect', x: 0.6, y: 0.6, w: W - 1.2, h: H - 1.2, fill: false, lineMm: lw })
const T = (text, x, y, w, h, fontMm, bold = false, align = 'left', extra = {}) => ({ id: id(), type: 'text', text, x, y, w, h, fontMm, bold, align, ...extra })
const IC = (icon, x, y, s) => ({ id: id(), type: 'icon', iconLib: 'etiqya', icon, x, y, w: s, h: s })
const QR = (text, x = 29.6, y = 1.6, s = 8.8) => ({ id: id(), type: 'qr', text, x, y, w: s, h: s })
const BAR = (text, x = 2, y = 5, w = 36, h = 5.2) => ({ id: id(), type: 'barcode', text, x, y, w, h })
const DT = (x, y, w, h, fontMm, extra = {}) => ({ id: id(), type: 'date', x, y, w, h, fontMm, bold: false, align: 'left', dateMode: 'today', fmt: 'dd/MM/yyyy', prefix: '', ...extra })
const LN = (x, y, w, lw = 0.3) => ({ id: id(), type: 'line', x, y, w, h: 1, lineMm: lw })

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const code = (i) => '789' + String(1000000000 + i * 73).slice(-10)
const tpl = (cat, name, elements) => ({ name, cat, widthMm: W, heightMm: H, elements })

// ---- layouts (40×12) ----
const layTitleSub = (t, s) => [bd(), T(t, 2, 1.4, 36, 4.6, 3.3, true), s && T(s, 2, 6.5, 36, 3.4, 2.3, false)].filter(Boolean)
const layIcon = (ic, t, s) => [bd(), IC(ic, 1.8, 2.2, 7.6), T(t, 10.6, 1.7, 27.4, 4.2, 3, true), s && T(s, 10.6, 6.4, 27.4, 3.4, 2.2, false)].filter(Boolean)
const layIconBig = (ic, t) => [bd(), IC(ic, 2, 1.6, 8.8), T(t, 12, 3.2, 26, 5.6, 4, true)]
const layQR = (t, s, q) => [bd(), T(t, 2, 1.7, 26, 4.2, 3, true), s && T(s, 2, 6.4, 26, 3.4, 2.2, false), QR(q)].filter(Boolean)
const layIconQR = (ic, t, q) => [bd(), IC(ic, 1.8, 2.4, 7), T(t, 9.6, 3, 19, 5.4, 3, true), QR(q)]
const layBar = (t, c) => [bd(), T(t, 2, 1.1, 36, 3.4, 2.7, true), BAR(c, 2, 5)]
const layPrice = (nm, pr) => [bd(), T(nm, 2, 1.2, 36, 3.2, 2.5, true), T(pr, 2, 4.6, 30, 6.4, 5.2, true)]
const layPriceQR = (nm, pr, q) => [bd(), T(nm, 2, 1.2, 26, 3.2, 2.4, true), T(pr, 2, 4.8, 24, 5.6, 4.4, true), QR(q)]
const layPriceBar = (nm, pr, c) => [bd(), T(nm + '   ' + pr, 2, 1.1, 36, 3.4, 2.7, true), BAR(c, 2, 5)]
const layVal = (nm, days) => [bd(), T(nm, 2, 1.1, 36, 3.4, 2.7, true), DT(2, 5, 22, 5, 3.4, { dateMode: 'offset', offsetDays: days, bold: true, prefix: 'Val ' })]
const layValQR = (nm, days, q) => [bd(), T(nm, 2, 1.2, 24, 3.6, 2.6, true), DT(2, 6, 22, 4.2, 2.5, { dateMode: 'offset', offsetDays: days, prefix: 'Val ' }), QR(q)]
const layHoje = (nm) => [bd(), T(nm, 2, 1.1, 36, 3.2, 2.6, true), DT(2, 5, 26, 5, 3.4, { bold: true })]
const layCenter = (t, s) => [bd(), T(t, 2, s ? 1.6 : 3.4, 36, s ? 4.4 : 5.2, s ? 3.4 : 4, true, 'center'), s && T(s, 2, 6.6, 36, 3.2, 2.3, false, 'center')].filter(Boolean)
const layCenterOrn = (t, orn) => [bd(), { id: id(), type: 'ornament', ornament: orn, x: 5, y: 1.4, w: 30, h: 2 }, T(t, 2, 4, 36, 4.6, 3.4, true, 'center'), { id: id(), type: 'ornament', ornament: orn, x: 5, y: 9, w: 30, h: 2 }]

// gera N templates de uma categoria, alternando layouts pra dar variedade
const gen = (cat, items, layouts) => items.map((it, i) => tpl(cat, Array.isArray(it) ? it[0] : it, layouts[i % layouts.length](it, i)))

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

// ---------------- Preços ----------------
const precos = gen('precos', [
  ['Caneta azul', 'R$ 2,50'], ['Caderno 96 fls', 'R$ 18,90'], ['Borracha branca', 'R$ 1,20'],
  ['Lápis HB', 'R$ 1,50'], ['Marca-texto', 'R$ 4,90'], ['Cola bastão', 'R$ 3,90'],
  ['Tesoura escolar', 'R$ 6,90'], ['Régua 30cm', 'R$ 2,90'], ['Apontador', 'R$ 1,90'],
  ['Estojo', 'R$ 12,90'], ['Mochila', 'R$ 89,90'], ['Pasta elástico', 'R$ 5,90'],
  ['Grampeador', 'R$ 14,90'], ['Fita adesiva', 'R$ 3,50'], ['Post-it bloco', 'R$ 7,90'],
  ['Calculadora', 'R$ 22,90'], ['Mouse sem fio', 'R$ 39,90'], ['Pen drive 32GB', 'R$ 29,90']
], [
  (it) => layPrice(it[0], it[1]),
  (it, i) => layPriceQR(it[0], it[1], slug(it[0])),
  (it, i) => layPriceBar(it[0], it[1], code(i)),
  (it) => layTitleSub(it[0], it[1])
])

// ---------------- Alimentos & validade ----------------
const alimentos = gen('alimentos', [
  ['Geleia de morango', 180], ['Molho de tomate', 90], ['Pão caseiro', 5],
  ['Bolo de cenoura', 4], ['Granola', 120], ['Iogurte natural', 7],
  ['Sopa congelada', 90], ['Lasanha', 60], ['Marmita fitness', 5],
  ['Suco de laranja', 3], ['Queijo minas', 15], ['Manteiga', 60],
  ['Doce de leite', 90], ['Castanhas', 150], ['Café moído', 120],
  ['Mel puro', 365], ['Conserva caseira', 180], ['Pasta de amendoim', 120]
], [
  (it) => layVal(it[0], it[1]),
  (it) => layValQR(it[0], it[1], slug(it[0])),
  (it) => layIcon('jar', it[0], 'Validade abaixo'),
  (it) => layHoje(it[0])
])

// ---------------- Organização ----------------
const organizacao = gen('organizacao', [
  'Parafusos sortidos', 'Pregos 3mm', 'Pilhas AA', 'Carregadores', 'Cabos diversos',
  'Material de limpeza', 'Ferramentas', 'Linhas e agulhas', 'Documentos 2026', 'Fotos antigas',
  'Roupas de inverno', 'Brinquedos', 'Decoração natal', 'Panelas', 'Talheres extras',
  'Remédios', 'Tintas', 'Velas'
], [
  (it) => layIcon('box', it, 'Prateleira A2'),
  (it) => layQR(it, 'Caixa de armazenamento', slug(it)),
  (it) => layIconBig('box', it),
  (it) => layTitleSub(it, 'Caixa / setor')
])

// ---------------- Envio & endereço ----------------
const envio = gen('envio', [
  'Yasmin Silva', 'João Pereira', 'Maria Souza', 'Carlos Lima', 'Ana Costa',
  'Pedro Alves', 'Beatriz Rocha', 'Lucas Martins', 'Júlia Fernandes', 'Rafael Gomes',
  'Camila Dias', 'Bruno Carvalho', 'Larissa Melo', 'Thiago Barros', 'Fernanda Ramos',
  'Gustavo Pinto'
], [
  (it) => layQR('PARA: ' + it, 'Pedido nº 0000', slug(it)),
  (it) => layTitleSub('PARA:', it),
  (it, i) => layBar(it, code(i)),
  (it) => layIcon('box', it, 'Destinatário')
])

// ---------------- Nome & identificação ----------------
const identificacao = gen('identificacao', [
  'YASMIN', 'Caderno de Mat.', 'Estojo da Ana', 'Garrafa do Léo', 'THOR (pet)',
  'Lancheira', 'Guarda-chuva', 'Chaves de casa', 'Notebook', 'Fone de ouvido',
  'Carregador', 'Mochila 5ºB', 'Agasalho', 'Tênis nº 38', 'Squeeze',
  'Crachá visitante'
], [
  (it) => layCenter(it, '3º ano B'),
  (it) => layIcon('star', it, 'Pertence a ___'),
  (it) => layIcon('heart', it, '(11) 99999-0000'),
  (it) => layCenterOrn(it, 'div-dots')
])

// ---------------- Cosméticos ----------------
const cosmeticos = gen('cosmeticos', [
  ['Sabonete lavanda', 365], ['Hidratante corporal', 540], ['Óleo capilar', 365],
  ['Shampoo sólido', 365], ['Máscara facial', 180], ['Perfume artesanal', 540],
  ['Bálsamo labial', 365], ['Esfoliante', 180], ['Creme de mãos', 365],
  ['Loção pós-banho', 365], ['Vela aromática', 365], ['Difusor', 365],
  ['Argila facial', 180], ['Sérum', 180], ['Tônico', 180], ['Manteiga corporal', 365]
], [
  (it) => layCenterOrn(it[0], 'div-leaf'),
  (it) => layValQR(it[0], it[1], slug(it[0])),
  (it) => layCenter(it[0], 'Natural · artesanal'),
  (it) => layVal(it[0], it[1])
])

// ---------------- Cabos & eletrônicos ----------------
const cabos = gen('cabos', [
  'HDMI — TV', 'USB-C — Notebook', 'Carregador celular', 'Cabo de força', 'Rede RJ45',
  'Cabo monitor', 'Áudio P2', 'Fonte impressora', 'Extensão 3 tomadas', 'Cabo câmera',
  'USB roteador', 'Carregador tablet', 'Cabo console', 'Fonte modem', 'Cabo projetor',
  'Adaptador VGA'
], [
  (it) => layIcon('plug', it, 'Identificação'),
  (it) => layIconQR('plug', it, slug(it)),
  (it) => layIconBig('plug', it),
  (it) => layTitleSub(it, 'Mesa / sala ___')
])

// ---------------- Escritório ----------------
const escritorio = gen('escritorio', [
  'Notas fiscais', 'Contratos', 'Recibos', 'Comprovantes', 'RH — Admissões',
  'Financeiro Jan-Jun', 'Projetos 2026', 'Clientes A-M', 'Clientes N-Z', 'Fornecedores',
  'Impostos', 'Folha de pagamento', 'Atas de reunião', 'Garantias', 'Manuais',
  'Patrimônio'
], [
  (it) => layIcon('folder', it, 'Arquivo 2026'),
  (it) => layTitleSub(it, 'Pasta / arquivo'),
  (it) => layQR(it, 'Documento', slug(it)),
  (it) => layIcon('folder', it, 'Setor / ano')
])

// ---------------- Casa & utilidades ----------------
const casa = gen('casa', [
  'Wi-Fi: CasaYasmin', 'Orégano', 'Açúcar', 'Sal grosso', 'Café',
  'Farinha de trigo', 'Arroz', 'Feijão', 'Macarrão', 'Chá de camomila',
  'Detergente', 'Amaciante', 'Troca do filtro', 'Manutenção ar', 'Lâmpadas',
  'Pilhas controle'
], [
  (it) => layIcon('wifi', it, 'Senha: ______'),
  (it) => layCenter(it, null),
  (it) => layIcon('wrench', it, 'Próxima: ___'),
  (it) => layCenterOrn(it, 'div-dots')
])

// ---------------- Joias & presentes ----------------
const joias = gen('joias', [
  ['Anel prata 925', 'R$ 89,90'], ['Colar folheado', 'R$ 59,90'], ['Brinco pérola', 'R$ 39,90'],
  ['Pulseira couro', 'R$ 29,90'], ['Pingente coração', 'R$ 24,90'], ['Aliança', 'R$ 149,90'],
  ['Relógio clássico', 'R$ 199,90'], ['Tornozeleira', 'R$ 19,90'], ['Broche vintage', 'R$ 34,90'],
  ['Gargantilha', 'R$ 44,90'], ['Anel solitário', 'R$ 99,90'], ['Berloque', 'R$ 14,90'],
  ['Presente · Yasmin', ''], ['Para você ♥', ''], ['Com carinho', ''], ['Feliz aniversário', '']
], [
  (it) => it[1] ? layPriceQR(it[0], it[1], slug(it[0])) : layCenterOrn(it[0], 'floral-tl'),
  (it) => it[1] ? layPrice(it[0], it[1]) : layCenter(it[0], 'com carinho ♥'),
  (it, i) => it[1] ? layPriceBar(it[0], it[1], code(i)) : layCenterOrn(it[0], 'div-leaf'),
  (it) => it[1] ? layTitleSub(it[0], it[1]) : layCenter(it[0], null)
])

export const STARTER_TEMPLATES = [
  ...precos, ...alimentos, ...organizacao, ...envio, ...identificacao,
  ...cosmeticos, ...cabos, ...escritorio, ...casa, ...joias
]
