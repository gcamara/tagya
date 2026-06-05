import { useEffect, useState } from 'react'
import { printTemplateNiimbot, printTestNiimbot, bluetoothSupported, subscribeConnection } from '../lib/niimbot.js'
import { savePrintRecord, listPrintRecords, clearPrintRecords } from '../lib/storage.js'

function whenStr(iso) {
  try { const d = new Date(iso); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}

// Modal de impressão: Bluetooth direto quando disponível.
export default function PrintModal({ open, onClose, template }) {
  const [density, setDensity] = useState(3)
  const [direction, setDirection] = useState('left')
  const [printTask, setPrintTask] = useState('auto')
  const [labelType, setLabelType] = useState('gaps')
  const [copies, setCopies] = useState(1)
  const [phase, setPhase] = useState('config') // config | printing | done | error
  const [log, setLog] = useState([])
  const [conn, setConn] = useState({ status: 'disconnected', name: null })
  const [showHist, setShowHist] = useState(false)
  const [hist, setHist] = useState([])
  useEffect(() => subscribeConnection(setConn), [])
  useEffect(() => { if (open) setHist(listPrintRecords()) }, [open])

  if (!open) return null
  const connected = conn.status === 'connected'
  const supported = bluetoothSupported()
  const pushLog = (m) => setLog((p) => [...p, m])

  const opts = () => ({
    widthMm: template.widthMm, heightMm: template.heightMm,
    density: Number(density), direction, printTask, labelType, copies: Number(copies),
    onStatus: pushLog
  })

  async function run(fn, isTest) {
    setPhase('printing'); setLog(['Iniciando…'])
    try {
      await fn(opts()); setPhase('done')
      if (!isTest) { savePrintRecord({ name: template.name || 'Etiqueta', size: `${template.widthMm}×${template.heightMm}mm`, copies: Number(copies) }); setHist(listPrintRecords()) }
    } catch (e) { pushLog('⚠ ' + (e.message || String(e))); setPhase('error') }
  }

  const busy = phase === 'printing'

  return (
    <div className="overlay" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🖨 Imprimir</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        {/* Bluetooth direto */}
        <div className="print-card">
          <div className="print-card-head"><strong>🔵 Bluetooth direto</strong></div>
          {!supported
            ? <div className="banner" style={{ margin: 0 }}>Indisponível neste navegador. O Web Bluetooth funciona no <b>Chrome/Edge no PC</b> e no <b>Chrome no Android</b> — o iPhone (Safari) não suporta.</div>
            : (
              <>
                <p className="hint" style={{ marginTop: 0 }}>Conecta e imprime direto. Se sair cortada/girada mude a <b>direção</b>; fraca, aumente a <b>densidade</b>.</p>
                <div className="row2">
                  <div className="field"><label>Cópias</label><input type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} /></div>
                  <div className="field"><label>Densidade (1–5)</label>
                    <select value={density} onChange={(e) => setDensity(e.target.value)}>{[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}</select>
                  </div>
                </div>
                <div className="row2">
                  <div className="field"><label>Tipo de etiqueta</label>
                    <select value={labelType} onChange={(e) => setLabelType(e.target.value)}>
                      <option value="gaps">Com gaps (padrão)</option><option value="transparent">Transparente</option>
                      <option value="continuous">Contínua</option><option value="black">Marca preta</option>
                    </select>
                  </div>
                  <div className="field"><label>Direção</label>
                    <select value={direction} onChange={(e) => setDirection(e.target.value)}><option value="left">Esquerda</option><option value="top">Topo</option></select>
                  </div>
                </div>
                <div className="field"><label>Modelo da impressora</label>
                  <select value={printTask} onChange={(e) => setPrintTask(e.target.value)}>
                    <option value="auto">Auto (detectar)</option><option value="B21_V1">B21</option><option value="B3S">B3S</option>
                    <option value="B1">B1</option><option value="D110">D110</option><option value="D110M_V4">D110M (2025)</option><option value="D11_V1">D11</option>
                  </select>
                </div>
                {log.length > 0 && <div className={`log ${phase}`}>{log.map((l, i) => <div key={i}>{l}</div>)}</div>}
                <div className="modal-actions" style={{ marginTop: 12 }}>
                  <button className="btn" onClick={() => run((o) => printTestNiimbot(o), true)} disabled={busy} title="1 etiqueta de teste p/ calibrar">🧪 Teste</button>
                  <button className="btn primary" onClick={() => run((o) => printTemplateNiimbot(template, o))} disabled={busy}>
                    {busy ? 'Imprimindo…' : connected ? `Imprimir em ${conn.name || 'Niimbot'}` : 'Conectar e imprimir'}
                  </button>
                </div>
              </>
            )}
        </div>

        <div className="print-card" style={{ marginBottom: 0 }}>
          <div className="print-card-head" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowHist((v) => !v)}>
            <strong>🧾 Histórico de impressão {hist.length ? `(${hist.length})` : ''}</strong>
            <span style={{ color: 'var(--muted)' }}>{showHist ? '▲' : '▼'}</span>
          </div>
          {showHist && (
            hist.length === 0
              ? <p className="hint" style={{ margin: 0 }}>Nenhuma impressão registrada ainda.</p>
              : (
                <>
                  <div style={{ maxHeight: 160, overflow: 'auto' }}>
                    {hist.slice(0, 50).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b>{r.name}</b> · {r.size}{r.copies > 1 ? ` · ${r.copies}×` : ''}</span>
                        <span style={{ color: 'var(--muted)', flexShrink: 0 }}>{whenStr(r.at)}</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn sm" style={{ marginTop: 8 }} onClick={() => { clearPrintRecords(); setHist([]) }}>Limpar histórico</button>
                </>
              )
          )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={busy}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
