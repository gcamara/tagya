// Impressão direta em impressoras Niimbot via Web Bluetooth, usando a niimbluelib
// (protocolo de engenharia reversa). Funciona em navegadores com Web Bluetooth
// (Chrome/Edge desktop e Android). iOS não expõe Web Bluetooth.
//
// Modelos suportados pela lib: D11, D110, D110M, B1, B21, B3S, etc.

import { renderTemplateToCanvas, preloadTemplateImages, createCanvas, DPMM } from './labelTemplate.js'
import { bridgeAvailable, createBridgeClient } from './niimbotBridge.js'
// IMPORTA ESTÁTICO (não `import()` dinâmico): o app nativo carrega o editor de um
// HTML embarcado offline (baseUrl app.tagya.local, sem servidor), então um chunk
// async de niimbluelib NÃO seria buscável → o connect travava em "Conectando…"
// pra sempre. Estático faz a lib entrar no chunk principal (inlinado por embed-editor).
import * as niimblue from '@mmote/niimbluelib'

export function bluetoothSupported() {
  return bridgeAvailable() || (typeof navigator !== 'undefined' && !!navigator.bluetooth)
}

// Canvas de teste: borda grossa + faixa preta + "TESTE". Garante saída visível p/ calibrar.
export function makeTestCanvas(widthMm, heightMm) {
  const w = Math.max(1, Math.round(widthMm * DPMM))
  const h = Math.max(1, Math.round(heightMm * DPMM))
  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#000'
  const b = Math.max(4, Math.round(h * 0.08))
  ctx.fillRect(0, 0, w, b); ctx.fillRect(0, h - b, w, b)
  ctx.fillRect(0, 0, b, h); ctx.fillRect(w - b, 0, b, h)
  ctx.fillRect(b * 2, b * 2, Math.round(w * 0.18), h - b * 4)
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${Math.max(16, Math.round(h * 0.4))}px sans-serif`
  ctx.fillText('TESTE', Math.round(w * 0.28), Math.round(h / 2))
  return canvas
}

async function connectClient(printTask, onStatus) {
  if (!bluetoothSupported()) throw new Error('Bluetooth não disponível neste ambiente (use Chrome/Edge no desktop, Chrome no Android, ou o app TagYa).')
  onStatus('Carregando driver…')
  const lib = niimblue
  const useBridge = bridgeAvailable()
  const client = useBridge ? createBridgeClient(lib) : new lib.NiimbotBluetoothClient()
  onStatus(useBridge ? 'Procurando impressoras Niimbot…' : 'Selecione a impressora Niimbot…')
  await client.connect()

  let meta = null
  try { meta = client.getModelMetadata?.() } catch { /* ignore */ }
  let detected = null
  try { detected = client.getPrintTaskType?.() } catch { /* ignore */ }

  onStatus(`Conectado: ${meta?.model ?? '?'} · cabeçote ${meta?.printheadPixels ?? '?'}px`)
  const forced = printTask && printTask !== 'auto' ? printTask : null
  const taskName = forced || detected || 'B21_V1'
  onStatus(`Tarefa: ${detected ?? 'nenhuma detectada'} · usando ${taskName}`)
  return { client, lib, taskName, meta }
}

// ---- Conexão persistente ----
// Mantém uma conexão viva com a impressora durante o uso do app (a niimbluelib tem
// heartbeat, então a conexão fica viva). Assim não precisa escanear/escolher a cada
// impressão. A UI assina via subscribeConnection e dispara connectPrinter/disconnectPrinter.
let active = null // { client, lib, taskName, name }
let connStatus = 'disconnected' // 'disconnected' | 'connecting' | 'connected'
let connError = null
const connSubs = new Set()
const connSnap = () => ({ status: connStatus, name: active ? active.name : null, error: connError })
const emitConn = () => { const s = connSnap(); connSubs.forEach((f) => f(s)) }

export function subscribeConnection(cb) { connSubs.add(cb); cb(connSnap()); return () => connSubs.delete(cb) }
export function connectionState() { return connSnap() }
export function printerConnected() { return connStatus === 'connected' && !!active }

function handleDrop() { if (!active) return; active = null; connStatus = 'disconnected'; emitConn() }

export async function connectPrinter(opts = {}) {
  const { printTask = 'auto', onStatus = () => {} } = opts
  if (connStatus === 'connected' || connStatus === 'connecting') return connSnap()
  connStatus = 'connecting'; connError = null; emitConn()
  try {
    const { client, lib, taskName, meta } = await connectClient(printTask, onStatus)
    active = { client, lib, taskName, name: (meta && meta.model) ? meta.model : 'Niimbot' }
    try { client.on('disconnect', handleDrop) } catch { /* */ }
    connStatus = 'connected'; emitConn()
  } catch (e) {
    active = null; connStatus = 'disconnected'; connError = e.message || String(e); emitConn()
    throw e
  }
  return connSnap()
}

export async function disconnectPrinter() {
  const c = active && active.client
  active = null; connStatus = 'disconnected'; connError = null; emitConn()
  if (c) { try { await c.disconnect() } catch { /* */ } }
}

function labelTypeValue(lib, key) {
  const LT = lib.LabelType || {}
  const map = { gaps: LT.WithGaps, continuous: LT.Continuous, black: LT.BlackMarkGap, transparent: LT.Transparent }
  const v = map[key]
  return v == null ? (LT.WithGaps ?? 1) : v
}

async function runPrint(canvases, opts, onStatus) {
  const { density = 3, direction = 'left', printTask = 'auto', labelType = 'gaps', copies = 1 } = opts

  // Reusa a conexão persistente se houver; senão conecta só para esta impressão (efêmera).
  let client, lib, taskName, ephemeral = false
  if (printerConnected()) {
    client = active.client; lib = active.lib
    taskName = (printTask && printTask !== 'auto') ? printTask : active.taskName
    onStatus(`Impressora conectada (${active.name}) · tarefa ${taskName}`)
  } else {
    ephemeral = true
    ;({ client, lib, taskName } = await connectClient(printTask, onStatus))
  }

  try {
    const pages = canvases.length * Math.max(1, copies)
    onStatus(`Preparando impressão (${taskName})…`)
    const task = client.abstraction.newPrintTask(taskName, {
      totalPages: pages,
      density: Number(density),
      labelType: labelTypeValue(lib, labelType),
      statusPollIntervalMs: 100,
      statusTimeoutMs: 8000
    })

    await task.printInit()
    let page = 0
    for (let c = 0; c < Math.max(1, copies); c++) {
      for (let i = 0; i < canvases.length; i++) {
        const encoded = lib.ImageEncoder.encodeCanvas(canvases[i], direction)
        if (page === 0) {
          const black = encoded.rowsData.reduce((s, r) => s + ((r.blackPixelsCount || 0) * (r.repeat || 1)), 0)
          onStatus(`Imagem: ${encoded.cols}×${encoded.rows} · ${black} pixels pretos (dir ${direction})`)
        }
        page++
        onStatus(`Imprimindo ${page} de ${pages}…`)
        await task.printPage(encoded, 1)
        await task.waitForPageFinished()
      }
    }
    await task.waitForFinished()
    await task.printEnd()
    onStatus(`Concluído: ${pages} etiqueta(s).`)
  } finally {
    // Só desconecta se a conexão foi efêmera; a persistente fica viva para o próximo print.
    if (ephemeral) { try { await client.disconnect() } catch { /* ignore */ } }
  }
}

// Imprime a etiqueta (modelo atual) — uma ou várias cópias.
export async function printTemplateNiimbot(template, opts = {}) {
  const { onStatus = () => {} } = opts
  await preloadTemplateImages(template)
  const canvas = renderTemplateToCanvas(template, DPMM)
  await runPrint([canvas], opts, onStatus)
}

// Imprime várias etiquetas diferentes de uma vez (lote).
export async function printBatchNiimbot(templates, opts = {}) {
  const { onStatus = () => {} } = opts
  const canvases = []
  for (const t of templates) {
    await preloadTemplateImages(t)
    canvases.push(renderTemplateToCanvas(t, DPMM))
  }
  if (!canvases.length) throw new Error('Nada para imprimir.')
  await runPrint(canvases, opts, onStatus)
}

// Imprime UMA etiqueta de teste (padrão sólido) para calibrar.
export async function printTestNiimbot(opts = {}) {
  const { widthMm = 40, heightMm = 12, onStatus = () => {} } = opts
  const canvas = makeTestCanvas(widthMm, heightMm)
  await runPrint([canvas], opts, onStatus)
}
