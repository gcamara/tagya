// Impressão em lote: o usuário usa placeholders {{coluna}} nos textos/QR/código de
// barras/células/prefixo de data do modelo, cola um CSV, e geramos uma etiqueta por linha.

const PH = /\{\{\s*([^}]+?)\s*\}\}/g

// Parser de CSV simples e robusto (aspas, vírgula/;/tab; autodetecta o separador).
export function parseCSV(text) {
  const t = String(text || '').replace(/\r\n?/g, '\n').trim()
  if (!t) return { headers: [], rows: [] }
  const firstLine = t.slice(0, t.indexOf('\n') < 0 ? t.length : t.indexOf('\n'))
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length
    ? ';' : (firstLine.includes('\t') ? '\t' : ',')
  const records = parseRecords(t, delim)
  if (!records.length) return { headers: [], rows: [] }
  const headers = records[0].map((h) => h.trim())
  const rows = records.slice(1)
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => {
      const obj = {}
      headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim() })
      return obj
    })
  return { headers, rows }
}

function parseRecords(t, delim) {
  const records = []
  let row = [], field = '', inQ = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (inQ) {
      if (ch === '"') { if (t[i + 1] === '"') { field += '"'; i++ } else inQ = false }
      else field += ch
    } else if (ch === '"') inQ = true
    else if (ch === delim) { row.push(field); field = '' }
    else if (ch === '\n') { row.push(field); records.push(row); row = []; field = '' }
    else field += ch
  }
  row.push(field); records.push(row)
  return records
}

// Coleta os nomes de placeholder usados no modelo (texto, prefixo de data, células).
export function findPlaceholders(template) {
  const set = new Set()
  const scan = (s) => { if (typeof s !== 'string') return; let m; PH.lastIndex = 0; while ((m = PH.exec(s))) set.add(m[1].trim()) }
  for (const el of template.elements || []) {
    scan(el.text); scan(el.prefix)
    if (el.type === 'table' && Array.isArray(el.cells)) el.cells.forEach(scan)
  }
  return [...set]
}

// Substitui {{coluna}} pelos valores da linha e devolve um modelo novo.
export function expandTemplate(template, row) {
  const sub = (s) => typeof s === 'string' ? s.replace(PH, (_, k) => (row[k.trim()] ?? '')) : s
  const t = JSON.parse(JSON.stringify(template))
  t.elements = (t.elements || []).map((el) => {
    const e = { ...el }
    if (typeof e.text === 'string') e.text = sub(e.text)
    if (typeof e.prefix === 'string') e.prefix = sub(e.prefix)
    if (e.type === 'table' && Array.isArray(e.cells)) e.cells = e.cells.map(sub)
    return e
  })
  return t
}
