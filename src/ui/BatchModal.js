import { useEffect, useMemo, useRef, useState } from 'react'
import { parseCSV, findPlaceholders, expandTemplate } from '../lib/batch.js'
import { renderTemplateToCanvas, preloadTemplateImages } from '../lib/labelTemplate.js'
import { printBatchNiimbot, bluetoothSupported } from '../lib/niimbot.js'

// Pré-visualização de uma etiqueta expandida.
function Preview({ template }) {
  const ref = useRef(null)
  useEffect(() => {
    let alive = true
    preloadTemplateImages(template).then(() => {
      const c = renderTemplateToCanvas(template, 5)
      const dst = ref.current
      if (!alive || !dst) return
      const maxW = 220, scale = Math.min(1, maxW / c.width)
      dst.width = c.width * scale; dst.height = c.height * scale
      dst.getContext('2d').drawImage(c, 0, 0, dst.width, dst.height)
    })
    return () => { alive = false }
  }, [template])
  return <canvas ref={ref} style={{ border: '1px solid var(--line)', borderRadius: 6, background: '#fff', maxWidth: '100%' }} />
}

// Impressão em lote a partir de um CSV, usando placeholders {{coluna}} no modelo.
export default function BatchModal({ open, onClose, template }) {
  const [csv, setCsv] = useState('')
  const [density, setDensity] = useState(3)
  const [direction, setDirection] = useState('left')
  const [phase, setPhase] = useState('config') // config | printing | done | error
  const [log, setLog] = useState([])

  const placeholders = useMemo(() => (template ? findPlaceholders(template) : []), [template])
  const { headers, rows } = useMemo(() => parseCSV(csv), [csv])
  const missing = placeholders.filter((p) => !headers.includes(p))
  const preview = rows.length ? expandTemplate(template, rows[0]) : null
  const busy = phase === 'printing'

  if (!open) return null

  function onFile(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setCsv(String(r.result || ''))
    r.readAsText(f)
  }

  function fillExample() {
    const cols = placeholders.length ? placeholders : ['nome', 'preco']
    const head = cols.join(',')
    const ex1 = cols.map((c) => c === 'preco' ? 'R$ 9,90' : 'Exemplo 1').join(',')
    const ex2 = cols.map((c) => c === 'preco' ? 'R$ 14,90' : 'Exemplo 2').join(',')
    setCsv([head, ex1, ex2].join('\n'))
  }

  async function print() {
    if (!rows.length) return
    setPhase('printing'); setLog([`Gerando ${rows.length} etiqueta(s)…`])
    try {
      const templates = rows.map((row) => expandTemplate(template, row))
      await printBatchNiimbot(templates, {
        density: Number(density), direction, copies: 1,
        onStatus: (m) => setLog((p) => [...p, m])
      })
      setPhase('done')
    } catch (e) {
      setLog((p) => [...p, '⚠ ' + (e.message || String(e))]); setPhase('error')
    }
  }

  return (
    <div className="overlay" onClick={busy ? undefined : onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🧾 Impressão em lote (CSV)</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        <p className="hint">
          Use <b>{'{{coluna}}'}</b> nos textos, QR, código de barras, células de tabela ou prefixo de data do seu modelo.
          Cole um CSV (1ª linha = nomes das colunas) e geramos uma etiqueta por linha.
        </p>

        <div className="field">
          <label>Placeholders no modelo</label>
          {placeholders.length === 0
            ? <p className="hint" style={{ margin: 0 }}>Nenhum <b>{'{{...}}'}</b> no modelo ainda. Adicione, ex.: um texto <b>{'{{nome}}'}</b> e um <b>{'{{preco}}'}</b>.</p>
            : <div className="ph-tags">{placeholders.map((p) => <span key={p} className={`ph-tag ${headers.includes(p) ? 'ok' : 'miss'}`}>{`{{${p}}}`}</span>)}</div>}
        </div>

        <div className="field">
          <div className="ip-head">
            <label style={{ margin: 0 }}>CSV</label>
            <span style={{ display: 'flex', gap: 8 }}>
              <button className="btn sm" onClick={fillExample}>Exemplo</button>
              <label className="btn sm" style={{ cursor: 'pointer', margin: 0 }}>Arquivo<input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} style={{ display: 'none' }} /></label>
            </span>
          </div>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={'nome,preco\nCaneta azul,R$ 2,50\nCaderno,R$ 18,90'} style={{ minHeight: 96, fontFamily: 'ui-monospace,monospace', fontSize: 12.5 }} />
        </div>

        {rows.length > 0 && (
          <div className="batch-info">
            <div>
              <b>{rows.length}</b> etiqueta(s) · colunas: {headers.map((h) => <code key={h} className="batch-col">{h}</code>)}
              {missing.length > 0 && <div className="banner" style={{ margin: '8px 0 0' }}>Sem coluna para: {missing.map((m) => `{{${m}}}`).join(', ')} — fica em branco.</div>}
            </div>
            {preview && <div className="batch-preview"><span className="hint" style={{ display: 'block', marginBottom: 4 }}>Prévia (1ª linha):</span><Preview template={preview} /></div>}
          </div>
        )}

        {!bluetoothSupported() && (
          <div className="banner">Impressão em lote precisa de Bluetooth direto (Chrome no PC/Android ou o app TagYa). No iPhone via Safari não dá.</div>
        )}

        <div className="row2">
          <div className="field"><label>Densidade (1–5)</label>
            <select value={density} onChange={(e) => setDensity(e.target.value)}>{[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}</select>
          </div>
          <div className="field"><label>Direção</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)}><option value="left">Esquerda</option><option value="top">Topo</option></select>
          </div>
        </div>

        {log.length > 0 && <div className={`log ${phase}`}>{log.map((l, i) => <div key={i}>{l}</div>)}</div>}

        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={busy}>Fechar</button>
          <button className="btn primary" onClick={print} disabled={busy || rows.length === 0 || !bluetoothSupported()}>
            {busy ? 'Imprimindo…' : `Imprimir ${rows.length || ''} etiqueta(s)`}
          </button>
        </div>
      </div>
    </div>
  )
}
