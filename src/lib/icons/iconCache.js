// Cache persistente minúsculo para os dados de desenho das libs de ícones.
// Usa o global `indexedDB` quando disponível (web/PWA). Em ambientes sem
// IndexedDB (ex.: WebView nativo sem suporte, SSR, testes) TODOS os métodos
// viram no-op graciosos — nunca lançam, nunca quebram offline.
//
// Formato do registro guardado: o objeto JSON da lib { id, version, kind, vb?, data }.
// A chave inclui id + version (ex.: "lucide@3") para que uma versão nova não
// colida com a antiga; a limpeza da versão velha é feita por `prune`.

const DB_NAME = 'tagya-icons'
const STORE = 'libs'
const DB_VERSION = 1

const hasIDB = () => {
  try { return typeof indexedDB !== 'undefined' && indexedDB !== null } catch (_) { return false }
}

let dbPromise = null
function openDB() {
  if (!hasIDB()) return Promise.resolve(null)
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    let req
    try { req = indexedDB.open(DB_NAME, DB_VERSION) } catch (_) { resolve(null); return }
    req.onupgradeneeded = () => {
      try {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      } catch (_) { /* ignora */ }
    }
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => resolve(null)
    req.onblocked = () => resolve(null)
  }).catch(() => null)
  return dbPromise
}

function tx(mode) {
  return openDB().then((db) => {
    if (!db) return null
    try { return db.transaction(STORE, mode).objectStore(STORE) } catch (_) { return null }
  })
}

const cacheKey = (id, version) => `${id}@${version == null ? '?' : version}`

// Lê o registro da lib para (id, version). Resolve com o objeto guardado ou null.
export function getLib(id, version) {
  return tx('readonly').then((store) => {
    if (!store) return null
    return new Promise((resolve) => {
      let req
      try { req = store.get(cacheKey(id, version)) } catch (_) { resolve(null); return }
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  }).catch(() => null)
}

// Grava o registro da lib. Resolve sempre (true/false), nunca rejeita.
export function putLib(id, version, value) {
  return tx('readwrite').then((store) => {
    if (!store) return false
    return new Promise((resolve) => {
      let req
      try { req = store.put(value, cacheKey(id, version)) } catch (_) { resolve(false); return }
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    })
  }).catch(() => false)
}

// Remove entradas antigas dessa lib que não sejam a versão `keepVersion`.
// Best-effort: usa o cursor de chaves e apaga as que começam com "id@" e diferem.
export function prune(id, keepVersion) {
  const keep = cacheKey(id, keepVersion)
  const prefix = `${id}@`
  return tx('readwrite').then((store) => {
    if (!store) return false
    return new Promise((resolve) => {
      let req
      try { req = store.openKeyCursor() } catch (_) { resolve(false); return }
      req.onsuccess = () => {
        const cur = req.result
        if (!cur) { resolve(true); return }
        const k = cur.key
        if (typeof k === 'string' && k.indexOf(prefix) === 0 && k !== keep) {
          try { store.delete(k) } catch (_) { /* ignora */ }
        }
        cur.continue()
      }
      req.onerror = () => resolve(false)
    })
  }).catch(() => false)
}

export const cacheAvailable = hasIDB
