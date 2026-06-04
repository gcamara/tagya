// App NATIVO (iOS/Android): WebView com o editor TagYa + ponte Bluetooth nativa
// (react-native-ble-plx). Toda a lógica do editor e do protocolo Niimbot roda no
// WebView (o código web que já funciona); o nativo só faz scan/connect/write/notify.
// A versão web (PWA) usa App.web.js — este arquivo não entra no bundle web.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, PermissionsAndroid, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BleManager, ScanMode } from 'react-native-ble-plx';

const EDITOR_URL = 'https://tagya.netlify.app';

// Serviço GATT das impressoras Niimbot (mesmo que a niimbluelib usa no Web Bluetooth).
// Usado para destacar/priorizar a impressora na lista de dispositivos.
const NIIMBOT_SERVICE = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';

// Injetado antes do conteúdo: expõe a ponte pro editor web detectar e usar.
const BRIDGE_SHIM = `(function(){
  if (window.TagYaNative) return;
  window.TagYaNative = {
    version: 1,
    send: function(obj){ try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch(e){} }
  };
})(); true;`;

let bleManager = null;
const getManager = () => (bleManager || (bleManager = new BleManager()));

// Pede as permissões de Bluetooth no Android. Devolve 'granted' | 'denied' | 'blocked'
// ('blocked' = "nunca mais perguntar", precisa abrir as configurações do app).
async function ensureAndroidPerms() {
  if (Platform.OS !== 'android') return 'granted';
  try {
    if (Platform.Version >= 31) {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const vals = Object.values(res);
      if (vals.every((v) => v === PermissionsAndroid.RESULTS.GRANTED)) return 'granted';
      if (vals.some((v) => v === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) return 'blocked';
      return 'denied';
    }
    const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (r === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (r === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
    return 'denied';
  } catch { return 'denied'; }
}

// Resolve um estado DEFINITIVO do adaptador. O ble-plx começa em 'Unknown' até o
// CoreBluetooth/Android inicializar; aqui esperamos sair de Unknown/Resetting para
// um estado real (PoweredOn / PoweredOff / Unauthorized / Unsupported).
const FINAL_STATES = ['PoweredOn', 'PoweredOff', 'Unauthorized', 'Unsupported'];
async function resolveBleState(m, timeoutMs = 7000) {
  let st = 'Unknown';
  try { st = await m.state(); } catch { /* */ }
  if (FINAL_STATES.includes(st)) return st;
  return await new Promise((resolve) => {
    let done = false;
    const finish = (s) => { if (done) return; done = true; try { sub.remove(); } catch { /* */ } resolve(s); };
    const sub = m.onStateChange((s) => { if (FINAL_STATES.includes(s)) finish(s); }, true);
    setTimeout(() => finish(st), timeoutMs);
  });
}

// Mensagem amigável + flag de ação para cada estado não-imprimível.
function stateError(st) {
  if (st === 'PoweredOff') return { message: 'O Bluetooth está desligado. Ligue o Bluetooth e tente de novo.', needsEnable: true };
  if (st === 'Unauthorized') return { message: 'O TagYa não tem permissão para usar o Bluetooth. Abra as configurações do app e ative o Bluetooth.', needsSettings: true };
  if (st === 'Unsupported') return { message: 'Este aparelho não suporta Bluetooth LE.' };
  return { message: 'Bluetooth indisponível (estado: ' + st + '). Verifique se o Bluetooth está ligado e tente de novo.', needsEnable: true };
}

export default function App() {
  const webRef = useRef(null);
  const conn = useRef({ device: null, service: null, char: null, sub: null });
  const [loading, setLoading] = useState(true);

  const toWeb = useCallback((obj) => {
    const js = 'window.__tagyaNativeRecv && window.__tagyaNativeRecv(' + JSON.stringify(obj) + ');true;';
    webRef.current?.injectJavaScript(js);
  }, []);

  const handleCmd = useCallback(async (msg) => {
    const m = getManager();
    try {
      if (msg.cmd === 'scan') {
        const perm = await ensureAndroidPerms();
        if (perm !== 'granted') {
          return toWeb({ ev: 'error', message: 'Permissão de Bluetooth negada. Autorize o Bluetooth nas configurações do app.', needsSettings: perm === 'blocked' });
        }
        const st = await resolveBleState(m);
        toWeb({ ev: 'scanState', state: st });
        if (st !== 'PoweredOn') return toWeb({ ev: 'error', ...stateError(st) });

        const found = {};
        const isPrinter = (dev) => {
          const uuids = (dev.serviceUUIDs || []).map((u) => String(u).toLowerCase());
          if (uuids.includes(NIIMBOT_SERVICE)) return true;
          const nm = (dev.name || dev.localName || '').toLowerCase();
          return /niimbot/.test(nm);
        };
        const add = (dev, named, printer) => {
          const nm = dev.name || dev.localName;
          found[dev.id] = { id: dev.id, name: nm || `Bluetooth ${dev.id.slice(0, 8)}`, named, printer };
        };
        const report = () => {
          const list = Object.values(found)
            .sort((a, b) => (b.printer ? 1 : 0) - (a.printer ? 1 : 0) || (b.named ? 1 : 0) - (a.named ? 1 : 0) || a.name.localeCompare(b.name))
            .map(({ id, name, printer }) => ({ id, name, printer }));
          toWeb({ ev: 'devices', devices: list });
        };

        // Impressoras já conectadas no sistema não aparecem no scan — busca direta.
        try {
          const already = await m.connectedDevices([NIIMBOT_SERVICE]);
          already.forEach((d) => add(d, !!(d.name || d.localName), true));
          if (already.length) report();
        } catch { /* */ }

        const scanOpts = { allowDuplicates: false };
        if (Platform.OS === 'android' && ScanMode) scanOpts.scanMode = ScanMode.LowLatency;
        m.startDeviceScan(null, scanOpts, (err, dev) => {
          if (err) { m.stopDeviceScan(); return toWeb({ ev: 'error', message: String(err.message || err) }); }
          if (!dev || found[dev.id]) return;
          add(dev, !!(dev.name || dev.localName), isPrinter(dev));
          report();
        });
        setTimeout(() => { m.stopDeviceScan(); toWeb({ ev: 'scanEnd' }); }, 9000);
      } else if (msg.cmd === 'connect') {
        m.stopDeviceScan();
        const dev = await m.connectToDevice(msg.id, { requestMTU: 200 }).catch(() => m.connectToDevice(msg.id));
        await dev.discoverAllServicesAndCharacteristics();
        let svc = null, chr = null;
        for (const s of await dev.services()) {
          if ((s.uuid || '').length < 5) continue; // ignora serviços genéricos (GAP/GATT)
          for (const c of await s.characteristics()) {
            if (c.isNotifiable && c.isWritableWithoutResponse) { svc = s.uuid; chr = c.uuid; break; }
          }
          if (svc) break;
        }
        if (!svc) { await dev.cancelConnection(); return toWeb({ ev: 'error', message: 'Característica BLE compatível não encontrada.' }); }
        const sub = dev.monitorCharacteristicForService(svc, chr, (err, c) => { if (!err && c?.value) toWeb({ ev: 'notify', data: c.value }); });
        dev.onDisconnected(() => { conn.current = { device: null, service: null, char: null, sub: null }; toWeb({ ev: 'disconnected' }); });
        conn.current = { device: dev, service: svc, char: chr, sub };
        toWeb({ ev: 'connected', name: dev.name, service: svc, characteristic: chr });
      } else if (msg.cmd === 'write') {
        const { device, service, char } = conn.current;
        if (!device) return toWeb({ ev: 'error', message: 'Não conectado.' });
        await device.writeCharacteristicWithoutResponseForService(service, char, msg.data);
      } else if (msg.cmd === 'disconnect') {
        const { device, sub } = conn.current;
        try { sub?.remove(); } catch { /* */ }
        try { await device?.cancelConnection(); } catch { /* */ }
        conn.current = { device: null, service: null, char: null, sub: null };
        toWeb({ ev: 'disconnected' });
      } else if (msg.cmd === 'openSettings') {
        try { await Linking.openSettings(); } catch { /* */ }
      }
    } catch (e) { toWeb({ ev: 'error', message: String(e.message || e) }); }
  }, [toWeb]);

  const onMessage = useCallback((e) => {
    let msg; try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg && msg.cmd) handleCmd(msg);
  }, [handleCmd]);

  // Cria o BleManager já na montagem para o adaptador inicializar (e o iOS pedir a
  // permissão) antes do primeiro scan — evita o estado 'Unknown' no momento de imprimir.
  useEffect(() => {
    const m = getManager();
    const sub = m.onStateChange(() => {}, true);
    return () => { try { sub.remove(); } catch { /* */ } try { m.destroy(); } catch { /* */ } bleManager = null; };
  }, []);

  return (
    <View style={styles.fill}>
      <StatusBar barStyle="light-content" backgroundColor="#7c4dff" />
      <WebView
        ref={webRef}
        source={{ uri: EDITOR_URL }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScriptBeforeContentLoaded={BRIDGE_SHIM}
        onMessage={onMessage}
        onLoadEnd={() => setLoading(false)}
        allowsInlineMediaPlayback
        style={styles.fill}
      />
      {loading && (
        <View style={styles.loader}>
          <View style={styles.logo}><Text style={styles.logoText}>Ya</Text></View>
          <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#7c4dff' },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: '#7c4dff', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#7c4dff', fontSize: 30, fontWeight: '800', letterSpacing: -1 },
});
