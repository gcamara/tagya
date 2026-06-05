// Persistência local dos modelos de etiqueta (localStorage no PWA).

const KEY = 'tagya.templates.v1'
const PREFS = 'tagya.prefs.v1'
const PRINTS = 'tagya.prints.v1'

const uid = () => 'tpl_' + Math.random().toString(36).slice(2, 9)

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export function listTemplates() {
  return read()
}

export function saveTemplate(template) {
  const list = read()
  const id = template.id || uid()
  const record = { ...template, id, updatedAt: stamp() }
  const idx = list.findIndex((t) => t.id === id)
  if (idx >= 0) list[idx] = record
  else list.unshift(record)
  write(list)
  return record
}

export function deleteTemplate(id) {
  write(read().filter((t) => t.id !== id))
}

export function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS) || '{}') } catch { return {} }
}
export function savePrefs(prefs) {
  try { localStorage.setItem(PREFS, JSON.stringify(prefs)) } catch { /* ignore */ }
}

// ---- Histórico de impressão ----
export function listPrintRecords() {
  try { return JSON.parse(localStorage.getItem(PRINTS) || '[]') } catch { return [] }
}
export function savePrintRecord(rec) {
  try {
    const list = listPrintRecords()
    list.unshift({ ...rec, at: stamp() })
    localStorage.setItem(PRINTS, JSON.stringify(list.slice(0, 100)))
  } catch { /* quota */ }
}
export function clearPrintRecords() {
  try { localStorage.removeItem(PRINTS) } catch { /* */ }
}

// data/hora local em ISO curto — sem usar Date.now diretamente fora daqui.
function stamp() {
  try { return new Date().toISOString() } catch { return '' }
}
