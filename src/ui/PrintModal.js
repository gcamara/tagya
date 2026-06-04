import { useState } from 'react'
import { printTemplateNiimbot, printTestNiimbot, bluetoothSupported } from '../lib/niimbot.js'
import { shareTemplatePNG, canShareImage } from '../lib/exportImage.js'

// Modal de impressão: Bluetooth direto (quando disponível) + via app Niimbot (imagem).
export default function PrintModal({ open, onClose, template }) {
  const [density, setDensity] = useState(3)
  const [direction, setDirection] = useState('left')
  const [printTask, setPrintTask] = useState('auto')
  const [labelType, setLabelType] = useState('gaps')
  const [copies, setCopies] = useState(1)
  const [phase, setPhase] = useState('config') // config | printing | done | error
  const [log, setLog] = useState([])
  const [shareMsg, setShareMsg] = useState(null)

  if (!open) return null
  const supported = bluetoothSupported()
  const pushLog = (m) => setLog((p) => [...p, m])

  const opts = () => ({
    widthMm: template.widthMm, heightMm: template.heightMm,
    density: Number(density), direction, printTask, labelType, copies: Number(copies),
    onStatus: pushLog
  })

  async function run(fn) {
    setPhase('printing'); setLog(['Iniciando…'])
    try { await fn(opts()); setPhase('done') }
    catch (e) { pushLog('⚠ ' + (e.message || String(e))); setPhase('error') }
  }

  async function doShare() {
    setShareMsg('Gerando imagem…')
    try {
      const r = await shareTemplatePNG(template)
      setShareMsg(r === 'shared' ? '✓ Compartilhado — escolha o app Niimbot na lista.' : '✓ Imagem salva. Abra o app Niimbot e importe a imagem.')
    } catch (e) { setShareMsg('⚠ ' + (e.message || String(e))) }
  }

  const busy = phase === 'printing'

  return (
    <div className="overlay" onClick={busy ? undefined : onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🖨 Imprimir <span className="exp-tag">beta</span></h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        {/* Via app Niimbot (imagem) — único caminho no iPhone */}
        <div className="print-card">
          <div className="print-card-head">
            <strong>📱 Pelo app Niimbot (imagem)</strong>
            {!supported && <span className="exp-tag" style={{ background: '#e3f6ec', color: '#1f8a52' }}>recomendado aqui</span>}
          </div>
          <p className="hint" style={{ margin: '0 0 10px' }}>
            Gera a etiqueta ({template.widthMm}×{template.heightMm} mm) como imagem e abre o compartilhamento — escolha o
            app <b>Niimbot</b>, selecione o tamanho da etiqueta e imprima. Funciona no iPhone e em qualquer aparelho.
          </p>
          <button className="btn primary" style={{ width: '100%' }} onClick={doShare}>
            {canShareImage() ? '📤 Enviar imagem para o app Niimbot' : '⬇ Salvar imagem (abra no app Niimbot)'}
          </button>
          {shareMsg && <p className="hint" style={{ margin: '8px 0 0' }}>{shareMsg}</p>}
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
                  <button className="btn" onClick={() => run((o) => printTestNiimbot(o))} disabled={busy} title="1 etiqueta de teste p/ calibrar">🧪 Teste</button>
                  <button className="btn primary" onClick={() => run((o) => printTemplateNiimbot(template, o))} disabled={busy}>
                    {busy ? 'Imprimindo…' : 'Conectar e imprimir'}
                  </button>
                </div>
              </>
            )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={busy}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
