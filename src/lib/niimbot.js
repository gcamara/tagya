// Impressão direta em impressoras Niimbot via Web Bluetooth, usando a niimbluelib
// (protocolo de engenharia reversa). Funciona em navegadores com Web Bluetooth
// (Chrome/Edge desktop e Android). iOS não expõe Web Bluetooth.
//
// Modelos suportados pela lib: D11, D110, D110M, B1, B21, B3S, etc.

import { renderTemplateToCanvas, preloadTemplateImages, createCanvas, DPMM } from './labelTemplate.js'
import { bridgeAvailable, createBridgeClient } from './niimbotBridge.js'

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
  const lib = await import('@mmote/niimbluelib')
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

function labelTypeValue(lib, key) {
  const LT = lib.LabelType || {}
  const map = { gaps: LT.WithGaps, continuous: LT.Continuous, black: LT.BlackMarkGap, transparent: LT.Transparent }
  const v = map[key]
  return v == null ? (LT.WithGaps ?? 1) : v
}

async function runPrint(canvases, opts, onStatus) {
  const { density = 3, direction = 'left', printTask = 'auto', labelType = 'gaps', copies = 1 } = opts
  const { client, lib, taskName } = await connectClient(printTask, onStatus)

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
    try { await client.disconnect() } catch { /* ignore */ }
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
