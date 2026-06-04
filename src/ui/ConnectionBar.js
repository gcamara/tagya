import { useEffect, useState } from 'react'
import { subscribeConnection, connectPrinter, disconnectPrinter, bluetoothSupported } from '../lib/niimbot.js'
import { Printer } from './icons.js'

// Barra de status da impressora no topo: mostra se está conectada e oferece a CTA
// "Buscar e conectar". A conexão fica viva durante o uso do app (ver niimbot.js).
export default function ConnectionBar({ onFlash }) {
  const [conn, setConn] = useState({ status: 'disconnected', name: null, error: null })
  const [busy, setBusy] = useState(false)
  useEffect(() => subscribeConnection(setConn), [])

  // Sem Bluetooth direto (ex.: iPhone no Safari web): não faz sentido mostrar a barra.
  if (!bluetoothSupported()) return null

  const connected = conn.status === 'connected'
  const connecting = conn.status === 'connecting' || busy

  async function connect() {
    setBusy(true)
    try { await connectPrinter({ onStatus: () => {} }) }
    catch (e) { onFlash && onFlash('Não conectou: ' + (e.message || e)) }
    finally { setBusy(false) }
  }
  async function disconnect() {
    setBusy(true)
    try { await disconnectPrinter() } finally { setBusy(false) }
  }

  return (
    <div className={`conn-bar ${connected ? 'on' : ''}`}>
      <span className="conn-left">
        <span className={`conn-dot ${connected ? 'ok' : connecting ? 'wait' : 'off'}`} />
        <Printer size={15} />
        {connected
          ? <span>Conectada: <b>{conn.name || 'Niimbot'}</b></span>
          : connecting
            ? <span>Conectando à impressora…</span>
            : <span>Impressora desconectada</span>}
      </span>
      {connected
        ? <button className="conn-btn ghost" onClick={disconnect} disabled={busy}>Desconectar</button>
        : <button className="conn-btn" onClick={connect} disabled={connecting}>{connecting ? '…' : 'Buscar e conectar'}</button>}
    </div>
  )
}
