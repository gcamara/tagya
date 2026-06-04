# TagYa — app nativo (iOS/Android) com Bluetooth nativo

A versão web (PWA) imprime via **Web Bluetooth**, que só funciona em Chrome/Edge no
PC e Chrome no Android — **não funciona no iPhone** (o iOS não tem Web Bluetooth).

O app **nativo** resolve isso: ele é um **WebView** com o editor TagYa + uma **ponte
Bluetooth nativa** (`react-native-ble-plx`). Todo o editor e o protocolo da Niimbot
rodam no WebView (o mesmo código da web, já testado); o lado nativo só faz
scan/connect/write/notify do Bluetooth.

```
App.js (nativo)  ── WebView ──►  editor web (https://tagya.netlify.app)
   │  react-native-ble-plx              │  niimbluelib (protocolo) + NiimbotBridgeClient
   └───────── ponte BLE ◄── postMessage ┘  (src/lib/niimbotBridge.js)
```

> ⚠️ **Status:** o código está pronto, mas **ainda não foi testado contra uma
> impressora/aparelho reais** (foi tudo montado sem build/sem device). Espere ajustar
> detalhes no primeiro teste — sobretudo a escolha da característica BLE (a ponte
> procura uma com `notify` + `writeWithoutResponse`; alguns modelos podem exigir UUIDs
> específicos).

## Pré-requisitos

```bash
npm i -g eas-cli
eas login           # conta Expo (grátis): https://expo.dev/signup
```

## Android (grátis — sem conta Apple, recomendado)

**Opção A — EAS Build na nuvem (não precisa de Android Studio):**
```bash
eas build -p android --profile preview
```
Sai um **APK** (link pra baixar). Instale no Android, abra, e em **Imprimir → Bluetooth
direto** ele escaneia e conecta na Niimbot.

**Opção B — local (precisa de Android Studio/SDK):**
```bash
npx expo prebuild -p android
npx expo run:android      # com um Android conectado ou emulador
```

> Dica: no Android o **Chrome já tem Web Bluetooth**, então o PWA
> (https://tagya.netlify.app) já imprime sem precisar do app nativo.

## iOS (precisa de conta Apple Developer **ou** Mac)

Um app iOS com Bluetooth nativo **exige assinatura Apple**:
- **Com conta Apple Developer (paga):** `eas build -p ios --profile preview` (o EAS
  pede pra configurar credenciais). Instala via link/TestFlight.
- **Sem conta paga, mas com Mac + Xcode:** `npx expo run:ios` com o iPhone no cabo —
  assina com Apple ID grátis (**certificado dura 7 dias**, precisa refazer).
- **Sem conta paga e sem Mac:** não há como instalar no iPhone. Use o fallback de
  **imagem → app Niimbot** (no diálogo Imprimir) até a conta sair.

## Como funciona / onde mexer

- `App.js` — WebView + ponte BLE (`react-native-ble-plx`). `EDITOR_URL` aponta pro PWA
  publicado; troque por um build local se quiser offline.
- `src/lib/niimbotBridge.js` — `NiimbotBridgeClient` (estende `NiimbotAbstractClient`):
  troca o transporte Web Bluetooth pela ponte. `createBridgeClient(lib)`.
- `src/lib/niimbot.js` — `connectClient` usa a ponte quando `bridgeAvailable()`.
- `src/ui/BridgePicker.js` — lista de impressoras (resultado do scan nativo).
- `app.json` — plugin `react-native-ble-plx` + permissões de Bluetooth (iOS/Android).
- `eas.json` — perfis de build (`development`, `preview`=APK, `production`).

## Protocolo da ponte (WebView ↔ nativo)

WebView → nativo: `{cmd:'scan'}` · `{cmd:'connect', id}` · `{cmd:'write', data:<base64>}` · `{cmd:'disconnect'}`
Nativo → WebView: `{ev:'devices', devices}` · `{ev:'connected', name, service, characteristic}` · `{ev:'notify', data:<base64>}` · `{ev:'disconnected'}` · `{ev:'error', message}`
