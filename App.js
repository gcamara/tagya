// App NATIVO (iOS/Android): WebView com o editor TagYa + ponte Bluetooth nativa
// (react-native-ble-plx). Toda a lógica do editor e do protocolo Niimbot roda no
// WebView (o código web que já funciona); o nativo só faz scan/connect/write/notify.
// A versão web (PWA) usa App.web.js — este arquivo não entra no bundle web.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, PermissionsAndroid, Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BleManager, ScanMode } from 'react-native-ble-plx';
import * as Updates from 'expo-updates';

// Marca do código JS atual — bate o olho na faixa pra saber qual versão está rodando.
const DIAG_TAG = 'v4-scanfix';
function codeSource() {
  try {
    if (Updates.isEmbeddedLaunch) return 'EMBUTIDO (build)';
    return 'OTA ' + String(Updates.updateId || '?').slice(0, 8);
  } catch { return 'updates n/d'; }
}

const EDITOR_URL = 'https://tagya.netlify.app';
// Cache-bust por inicialização: o WKWebView preserva o NSURLCache entre updates do
// TestFlight e pode servir um index.html velho. Um parâmetro único por launch força
// o WebView a buscar o HTML novo (o JS é hasheado, então continua cacheado por URL).
const EDITOR_URL_FRESH = EDITOR_URL + '?cb=' + Date.now();

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
  const selfTestTimer = useRef(null);
  const [loading, setLoading] = useState(true);
  // Diagnóstico de BLE NATIVO (faixa no topo, fora do WebView — não depende de cache).
  const [diag, setDiag] = useState('BLE: testando…');
  const [showDiag, setShowDiag] = useState(true);

  const toWeb = useCallback((obj) => {
    const js = 'window.__tagyaNativeRecv && window.__tagyaNativeRecv(' + JSON.stringify(obj) + ');true;';
    webRef.current?.injectJavaScript(js);
  }, []);

  const handleCmd = useCallback(async (msg) => {
    let m;
    try {
      // getManager() DENTRO do try: se o módulo BLE nativo não estiver disponível
      // (não linkado/incompatível), o erro vira um evento visível em vez de silêncio.
      try { m = getManager(); }
      catch (e) { return toWeb({ ev: 'error', message: 'Módulo Bluetooth nativo indisponível neste build: ' + String(e.message || e) }); }
      if (!m) return toWeb({ ev: 'error', message: 'Bluetooth nativo não inicializou (BleManager nulo).' });

      if (msg.cmd === 'scan') {
        // Ack imediato (antes de qualquer await): prova que o comando chegou ao nativo
        // e que o canal nativo→web funciona. Se isto não aparecer, o problema é o canal.
        toWeb({ ev: 'scanState', state: 'starting' });
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

        // allowDuplicates:true re-reporta devices mesmo que outro scan (ex.: o self-test
        // nativo) já os tenha visto — sem isso o iOS não devolve nada. Paramos qualquer
        // scan anterior antes (e cancelamos o stop pendente do self-test, que senão
        // mataria este scan no 6º segundo) pra garantir uma sessão de scan limpa.
        if (selfTestTimer.current) { clearTimeout(selfTestTimer.current); selfTestTimer.current = null; }
        try { m.stopDeviceScan(); } catch { /* */ }
        const scanOpts = { allowDuplicates: true };
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

  // Teste de BLE 100% nativo: cria o manager, lê o estado e faz um scan de 6s, mostrando
  // o resultado na faixa nativa. Independe do WebView/cache — é a fonte da verdade.
  const runBleSelfTest = useCallback(async () => {
    setShowDiag(true);
    setDiag('BLE: criando manager…');
    let mgr;
    try { mgr = getManager(); }
    catch (e) { return setDiag('❌ Módulo BLE falhou ao criar: ' + String(e.message || e)); }
    if (!mgr) return setDiag('❌ BleManager nulo (módulo nativo não linkado)');
    setDiag('BLE: lendo estado do adaptador…');
    let st = 'Unknown';
    try { st = await resolveBleState(mgr); }
    catch (e) { return setDiag('❌ Erro ao ler estado: ' + String(e.message || e)); }
    if (st !== 'PoweredOn') return setDiag('BLE estado: ' + st + ' (precisa estar PoweredOn)');
    setDiag('BLE ligado · escaneando 6s…');
    const seen = {};
    try {
      mgr.startDeviceScan(null, { allowDuplicates: false }, (err, dev) => {
        if (err) return setDiag('❌ Erro no scan: ' + String(err.message || err));
        if (dev) {
          seen[dev.id] = dev.name || dev.localName || ('?' + String(dev.id).slice(0, 5));
          setDiag('BLE ligado · ' + Object.keys(seen).length + ' visto(s)…');
        }
      });
      selfTestTimer.current = setTimeout(() => {
        selfTestTimer.current = null;
        try { mgr.stopDeviceScan(); } catch { /* */ }
        const n = Object.keys(seen).length;
        setDiag(n === 0
          ? '⚠️ BLE ligado, mas 0 dispositivos no scan (6s). Aproxime a D110 ligada.'
          : '✅ BLE ' + n + ' visto(s): ' + Object.values(seen).slice(0, 5).join(', '));
      }, 6000);
    } catch (e) { setDiag('❌ Scan lançou: ' + String(e.message || e)); }
  }, []);

  // Auto-aplica updates OTA no launch: busca, baixa e recarrega com o código novo —
  // sem depender de o usuário fechar/reabrir várias vezes. Recarrega só 1x (depois já
  // está na última versão, então checkForUpdate não acha nada novo → sem loop).
  useEffect(() => {
    (async () => {
      try {
        const r = await Updates.checkForUpdateAsync();
        if (r.isAvailable) { await Updates.fetchUpdateAsync(); await Updates.reloadAsync(); }
      } catch { /* dev/sem updates: ignora */ }
    })();
  }, []);

  // Cria o BleManager já na montagem e dispara o self-test de diagnóstico.
  useEffect(() => {
    const m = getManager();
    const sub = m.onStateChange(() => {}, true);
    runBleSelfTest();
    return () => { try { sub.remove(); } catch { /* */ } try { m.destroy(); } catch { /* */ } bleManager = null; };
  }, [runBleSelfTest]);

  return (
    <View style={styles.fill}>
      <StatusBar barStyle="light-content" backgroundColor="#7c4dff" />
      <WebView
        ref={webRef}
        source={{ uri: EDITOR_URL_FRESH }}
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
      {showDiag && (
        <View style={styles.diag}>
          <Text style={styles.diagTitle}>Diag BLE · {DIAG_TAG} · {codeSource()}</Text>
          <Text style={styles.diagText}>{diag}</Text>
          <View style={styles.diagBtns}>
            <Pressable onPress={runBleSelfTest} style={styles.diagBtn}><Text style={styles.diagBtnText}>↻ Testar de novo</Text></Pressable>
            <Pressable onPress={() => setShowDiag(false)} style={styles.diagBtn}><Text style={styles.diagBtnText}>Fechar ✕</Text></Pressable>
          </View>
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
  diag: { position: 'absolute', top: 58, left: 10, right: 10, backgroundColor: 'rgba(20,16,30,0.96)', borderRadius: 12, padding: 12, zIndex: 100 },
  diagTitle: { color: '#b388ff', fontSize: 11, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  diagText: { color: '#fff', fontSize: 14, lineHeight: 19, marginBottom: 10 },
  diagBtns: { flexDirection: 'row', gap: 8 },
  diagBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  diagBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
