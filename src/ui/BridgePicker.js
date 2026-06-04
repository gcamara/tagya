import { useEffect, useState } from 'react'
import { subscribeChoice, pickDevice, cancelChoice, retryScan, openNativeSettings } from '../lib/niimbotBridge.js'

// Estados do adaptador → texto amigável.
const STATE_LABEL = {
  starting: 'conectando…',
  PoweredOn: 'Bluetooth ligado', PoweredOff: 'Bluetooth desligado',
  Unauthorized: 'sem permissão', Unsupported: 'não suportado',
  Resetting: 'reiniciando…', Unknown: 'inicializando…'
}

// Seletor de impressora para o app nativo: aparece quando o cliente-ponte está
// escaneando e devolve a lista de dispositivos vinda do Bluetooth nativo.
export default function BridgePicker() {
  const [choice, setChoice] = useState(null)
  useEffect(() => subscribeChoice(setChoice), [])
  if (!choice) return null

  const { devices = [], done, error, state } = choice
  const scanning = !done && !error
  const printers = devices.filter((d) => d.printer)
  const others = devices.filter((d) => !d.printer)

  return (
    <div className="overlay" style={{ zIndex: 200 }} onClick={cancelChoice}>
      <div className="modal" style={{ width: 'min(400px,92vw)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Selecione a impressora</h3>
          <button className="btn icon" onClick={cancelChoice}>×</button>
        </div>

        {/* Diagnóstico SEMPRE visível: estado do adaptador + nº de devices vistos + fase do scan. */}
        <p className="hint" style={{ margin: '0 0 10px' }}>
          {scanning && <span className="ble-spin" />}
          Bluetooth: <b>{state ? (STATE_LABEL[state] || state) : 'verificando…'}</b>
          {` · ${devices.length} visto(s)`}
          {` · ${scanning ? 'procurando' : 'busca encerrada'}`}
        </p>

        {error ? (
          <div className="banner" style={{ margin: '0 0 12px' }}>
            <div style={{ marginBottom: 10 }}>{error.message}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {error.needsSettings && (
                <button className="btn primary" onClick={openNativeSettings}>Abrir configurações do app</button>
              )}
              <button className="btn" onClick={retryScan}>Tentar de novo</button>
            </div>
          </div>
        ) : devices.length === 0 ? (
          <p className="hint">
            {done
              ? 'Nenhum dispositivo encontrado. Verifique se a impressora está ligada, carregada e por perto. Se ela já estiver pareada nas configurações de Bluetooth do aparelho, "esqueça" o dispositivo lá e tente de novo.'
              : 'Procurando dispositivos Bluetooth… deixe a impressora ligada e por perto.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {printers.length > 0 && others.length > 0 && <span className="dev-group">Impressoras Niimbot</span>}
            {printers.map((d) => (
              <button key={d.id} className="btn dev-printer" style={{ justifyContent: 'flex-start' }} onClick={() => pickDevice(d.id)}>🖨 {d.name}</button>
            ))}
            {printers.length > 0 && others.length > 0 && <span className="dev-group">Outros dispositivos</span>}
            {others.map((d) => (
              <button key={d.id} className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => pickDevice(d.id)}>📶 {d.name}</button>
            ))}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 14 }}>
          {!error && done && devices.length > 0 && <button className="btn" onClick={retryScan}>Procurar de novo</button>}
          <button className="btn" onClick={cancelChoice}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
