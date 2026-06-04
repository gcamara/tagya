# TagYa

**Editor de etiquetas para impressoras Niimbot** (B21, B3S, B1, D110, D11…).
*tag (etiqueta) + ya (you) — uma etiqueta feita por você.*

Crie etiquetas com texto, QR code, código de barras, formas e ícones, previsualize
em tempo real e imprima direto por Bluetooth.

Feito em **React Native + Expo**, exportado como **PWA** (`expo export --platform web`).

## Recursos

- Elementos: **texto**, **QR code**, **código de barras** (CODE128), **ícones** P&B,
  **retângulo**, **linha** e **imagem/logo**
- **Biblioteca de 73 ícones** desenhados por código (nítidos p/ térmica), organizados em
  9 categorias: Geral & status, Setas, Formas, Oficina & marcenaria, Casa & objetos,
  Cozinha & comida, Envio & escritório, Natureza, Cuidados & símbolos
- **Modelos prontos**: galeria com 8 templates (produto, envio, caixa, preço,
  identificação, validade, Wi-Fi, simples) — comece de um e edite
- Tamanhos de rolo Niimbot: **12 / 15 / 25 / 40 / 50 mm** de largura + presets prontos
  e tamanho **personalizado**
- **Preview em tempo real** renderizado em canvas monocromático (igual à saída térmica)
- **Arrastar e redimensionar** elementos direto na etiqueta
- **Tema claro / escuro** na interface (a etiqueta continua P&B para impressão térmica)
- **Salvar / carregar** modelos no dispositivo (localStorage)
- **Exportar PNG** em alta resolução
- **Impressão Bluetooth** na Niimbot (Web Bluetooth) com densidade, direção, tipo de
  etiqueta, modelo da impressora e cópias; botão de **teste de calibração**

## Rodando em desenvolvimento

```bash
npm install
npx expo start --web      # abre o editor no navegador
```

> A impressão Niimbot usa **Web Bluetooth** — funciona no **Chrome/Edge no desktop**
> e no **Chrome no Android**. iOS não expõe Web Bluetooth.

## Build do PWA

```bash
npx expo export --platform web   # gera o site estático em dist/
npx serve dist                   # serve o PWA localmente
```

## Estrutura

```
App.web.js            editor completo (PWA) — UI em DOM via react-native-web
App.js                tela nativa (stub) — direciona ao navegador
src/lib/
  labelTemplate.js    modelo de etiqueta + render em canvas (P&B, 203 DPI)
  labelIcons.js       ícones desenhados por código (nítidos p/ térmica)
  niimbot.js          impressão Bluetooth (@mmote/niimbluelib)
  sizes.js            presets de tamanho / larguras de rolo
  storage.js          persistência de modelos (localStorage)
  exportImage.js      exportação PNG
src/ui/
  styles.js           CSS do app
  Stage.js            palco com canvas + alças de arraste/resize
  Inspector.js        painel de propriedades do elemento
  PrintModal.js       diálogo de impressão Niimbot
  TemplatesModal.js   modelos salvos
```

Todas as dimensões são em **milímetros**. A impressão renderiza a 8 px/mm (~203 DPI).
