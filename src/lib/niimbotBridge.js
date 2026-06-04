// Cliente Niimbot que usa a PONTE NATIVA (App.js / react-native-ble-plx) em vez de
// Web Bluetooth. Toda a lógica de protocolo vem da niimbluelib (NiimbotAbstractClient);
// aqui só trocamos o transporte: scan/connect/write/notify passam pelo WebView↔nativo.
//
// Ativo apenas dentro do app nativo (quando window.TagYaNative existe). A niimbluelib
// é injetada via createBridgeClient(lib) para continuar carregando sob demanda.

export function bridgeAvailable() {
  return typeof window !== 'undefined' && !!window.TagYaNative && typeof window.TagYaNative.send === 'function'
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function bytesToB64(u8) {
  let s = ''
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i])
  return btoa(s)
}
function b64ToBytes(b64) {
  const bin = atob(b64)
  const u8 = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
  return u8
}

// ---- despacho de eventos nativo → web ----
const handlers = {}
const on = (ev, fn) => { handlers[ev] = fn }
const off = (ev) => { delete handlers[ev] }
const sendNative = (obj) => window.TagYaNative.send(obj)
if (typeof window !== 'undefined') {
  window.__tagyaNativeRecv = (msg) => { const h = msg && handlers[msg.ev]; if (h) h(msg) }
}

// ---- escolha de dispositivo (a UI assina via subscribeChoice) ----
let pending = null
const choiceSubs = new Set()
const notify = () => choiceSubs.forEach((f) => f(pending))
export function subscribeChoice(cb) { choiceSubs.add(cb); cb(pending); return () => choiceSubs.delete(cb) }
export function pickDevice(id) { if (pending) pending.onPick(id) }
export function cancelChoice() { if (pending) pending.onCancel() }

let BridgeClass = null

// Cria a classe (uma vez) usando a niimbluelib já carregada e devolve uma instância.
export function createBridgeClient(lib) {
  if (!BridgeClass) {
    BridgeClass = class extends lib.NiimbotAbstractClient {
      constructor() { super(); this._connected = false }

      isConnected() { return this._connected }

      async connect() {
        await this.disconnect()
        on('notify', (m) => this.processRawPacket(b64ToBytes(m.data)))
        on('disconnected', () => this.onNativeDisconnect())

        const id = await this.scanAndChoose()
        const meta = await new Promise((resolve, reject) => {
          on('connected', (m) => { off('connected'); resolve(m) })
          on('error', (m) => { off('connected'); reject(new Error(m.message || 'Falha ao conectar')) })
          sendNative({ cmd: 'connect', id })
        })
        off('error')
        this._connected = true

        try { await this.initialNegotiate(); await this.fetchPrinterInfo() } catch (e) { console.error('Info da impressora falhou', e) }

        const result = { deviceName: meta.name, result: this.info.connectResult ?? 0 }
        this.emit('connect', new lib.ConnectEvent(result))
        return result
      }

      scanAndChoose() {
        return new Promise((resolve, reject) => {
          const found = {}
          const cleanup = () => { off('devices'); off('error'); off('scanEnd'); pending = null; notify() }
          on('devices', (m) => { (m.devices || []).forEach((d) => { found[d.id] = d }); if (pending) { pending.devices = Object.values(found); notify() } })
          on('error', (m) => { cleanup(); reject(new Error(m.message || 'Falha no Bluetooth')) })
          on('scanEnd', () => { if (pending) { pending.done = true; notify() } })
          pending = {
            devices: [], done: false,
            onPick: (devId) => { cleanup(); resolve(devId) },
            onCancel: () => { cleanup(); sendNative({ cmd: 'disconnect' }); reject(new Error('Conexão cancelada')) }
          }
          notify()
          sendNative({ cmd: 'scan' })
        })
      }

      onNativeDisconnect() { this._connected = false; this.info = {}; this.emit('disconnect', new lib.DisconnectEvent()) }

      async disconnect() {
        this.stopHeartbeat()
        if (this._connected) sendNative({ cmd: 'disconnect' })
        this._connected = false
        this.info = {}
        off('notify'); off('disconnected')
      }

      async sendRaw(data, force) {
        const run = async () => {
          if (!this._connected) throw new Error('Channel is closed')
          await sleep(this.packetIntervalMs)
          sendNative({ cmd: 'write', data: bytesToB64(data) })
          this.emit('rawpacketsent', new lib.RawPacketSentEvent(data))
        }
        if (force) await run(); else await this.mutex.runExclusive(run)
      }
    }
  }
  return new BridgeClass()
}
