// App NATIVO (iOS/Android): WebView com o editor TagYa + ponte Bluetooth nativa
// (react-native-ble-plx). Toda a lógica do editor e do protocolo Niimbot roda no
// WebView (o código web que já funciona); o nativo só faz scan/connect/write/notify.
// A versão web (PWA) usa App.web.js — este arquivo não entra no bundle web.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, PermissionsAndroid, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BleManager } from 'react-native-ble-plx';

const EDITOR_URL = 'https://tagya.netlify.app';

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

async function ensureAndroidPerms() {
  if (Platform.OS !== 'android') return true;
  try {
    if (Platform.Version >= 31) {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return Object.values(res).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
    }
    const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return r === PermissionsAndroid.RESULTS.GRANTED;
  } catch { return false; }
}

// Espera o adaptador Bluetooth ficar ligado (PoweredOn) antes de escanear.
async function waitPoweredOn(m) {
  try {
    if ((await m.state()) === 'PoweredOn') return true
    return await new Promise((resolve) => {
      const sub = m.onStateChange((st) => { if (st === 'PoweredOn') { sub.remove(); resolve(true) } }, true)
      setTimeout(() => { try { sub.remove() } catch { /* */ } resolve(false) }, 4500)
    })
  } catch { return false }
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
        const ok = await ensureAndroidPerms();
        if (!ok) return toWeb({ ev: 'error', message: 'Permissão de Bluetooth negada. Autorize o Bluetooth nas configurações.' });
        const on = await waitPoweredOn(m);
        if (!on) return toWeb({ ev: 'error', message: 'Bluetooth desligado. Ligue o Bluetooth e tente de novo.' });
        const found = {};
        const report = () => {
          const list = Object.values(found)
            .sort((a, b) => (b.named ? 1 : 0) - (a.named ? 1 : 0) || a.name.localeCompare(b.name))
            .map(({ id, name }) => ({ id, name }));
          toWeb({ ev: 'devices', devices: list });
        };
        m.startDeviceScan(null, { allowDuplicates: false }, (err, dev) => {
          if (err) { m.stopDeviceScan(); return toWeb({ ev: 'error', message: String(err.message || err) }); }
          if (!dev || found[dev.id]) return;
          const nm = dev.name || dev.localName; // nome às vezes só vem em localName
          found[dev.id] = { id: dev.id, name: nm || `Bluetooth ${dev.id.slice(0, 8)}`, named: !!nm };
          report();
        });
        setTimeout(() => { m.stopDeviceScan(); toWeb({ ev: 'scanEnd' }); }, 8000);
      } else if (msg.cmd === 'connect') {
        m.stopDeviceScan();
        const dev = await m.connectToDevice(msg.id, { requestMTU: 200 }).catch(() => m.connectToDevice(msg.id));
        await dev.discoverAllServicesAndCharacteristics();
        let svc = null, chr = null;
        for (const s of await dev.services()) {
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
      }
    } catch (e) { toWeb({ ev: 'error', message: String(e.message || e) }); }
  }, [toWeb]);

  const onMessage = useCallback((e) => {
    let msg; try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg && msg.cmd) handleCmd(msg);
  }, [handleCmd]);

  useEffect(() => () => { try { getManager().destroy(); } catch { /* */ } bleManager = null; }, []);

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
