import { useEffect, useState } from 'react'
import { subscribeChoice, pickDevice, cancelChoice } from '../lib/niimbotBridge.js'

// Seletor de impressora para o app nativo: aparece quando o cliente-ponte está
// escaneando e devolve a lista de dispositivos vinda do Bluetooth nativo.
export default function BridgePicker() {
  const [choice, setChoice] = useState(null)
  useEffect(() => subscribeChoice(setChoice), [])
  if (!choice) return null
  return (
    <div className="overlay" style={{ zIndex: 200 }} onClick={cancelChoice}>
      <div className="modal" style={{ width: 'min(380px,92vw)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Selecione a impressora</h3>
          <button className="btn icon" onClick={cancelChoice}>×</button>
        </div>
        {choice.devices.length === 0
          ? <p className="hint">{choice.done ? 'Nenhum dispositivo encontrado. Verifique se a impressora está ligada, carregada e por perto — e tente de novo.' : 'Procurando dispositivos Bluetooth… deixe a impressora ligada e por perto.'}</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {choice.devices.map((d) => (
                <button key={d.id} className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => pickDevice(d.id)}>🖨 {d.name}</button>
              ))}
            </div>
          )}
        <div className="modal-actions"><button className="btn" onClick={cancelChoice}>Cancelar</button></div>
      </div>
    </div>
  )
}
