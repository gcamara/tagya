// CSS do app (injetado uma vez no <head> no web). Tema claro com acento "jasmim".
import { GOOGLE_FONTS_HREF } from '../lib/labelTemplate.js'

export const CSS = `
:root{
  --bg:#f6f5fb; --panel:#ffffff; --ink:#221b2e; --muted:#6b6477;
  --line:#e6e2ef; --accent:#7c4dff; --accent-2:#b388ff; --accent-soft:#efe9ff;
  --ok:#2e9e6b; --danger:#e0443e; --shadow:0 8px 30px rgba(60,40,90,.10);
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink)}
.app{display:flex;flex-direction:column;height:100vh;overflow:hidden}

.topbar{display:flex;align-items:center;gap:14px;padding:10px 18px;background:linear-gradient(95deg,#7c4dff,#b388ff);color:#fff;box-shadow:var(--shadow);z-index:10}
.brand{display:flex;align-items:center;gap:10px}
.brand .logo{width:36px;height:36px;border-radius:10px;background:#fff;display:grid;place-items:center;color:#7c4dff;font-weight:800;font-size:15px;letter-spacing:-.5px;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.brand h1{font-size:19px;margin:0;font-weight:800;letter-spacing:.3px}
.brand small{display:block;font-size:11px;opacity:.85;font-weight:500;margin-top:-2px}
.topbar .spacer{flex:1}
.tb-actions{display:flex;gap:8px;flex-wrap:wrap}

.btn{border:1px solid var(--line);background:var(--panel);color:var(--ink);padding:8px 13px;border-radius:10px;font-size:13px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:.15s;white-space:nowrap}
.btn svg{flex-shrink:0}
.btn:hover{border-color:var(--accent-2);background:var(--accent-soft)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(124,77,255,.3)}
.btn.primary:hover{background:#6b3df0;border-color:#6b3df0}
.btn.ghost{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.28);color:#fff;backdrop-filter:blur(4px)}
.btn.ghost:hover{background:rgba(255,255,255,.24)}
.btn.icon-only{padding:8px;width:36px}
.btn.sm{padding:6px 10px;font-size:12px}
.btn.danger{color:var(--danger);border-color:#f3c9c7;background:var(--panel)}
.btn.danger:hover{background:#fdecec}
.btn.icon{padding:6px 9px;border:none;background:transparent;font-size:16px}

.body{flex:1;display:grid;grid-template-columns:230px 1fr 290px;min-height:0}
.rail,.inspector{background:var(--panel);overflow-y:auto;padding:14px}
.rail{border-right:1px solid var(--line)}
.inspector{border-left:1px solid var(--line)}
.rail h3,.inspector h3{font-size:12px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin:18px 0 8px}
.rail h3:first-child{margin-top:0}

.add-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.add-btn{display:flex;flex-direction:column;align-items:center;gap:7px;padding:13px 6px;border:1px solid var(--line);
  border-radius:12px;background:var(--panel);color:var(--ink);cursor:pointer;font-family:inherit;font-size:12px;
  font-weight:600;transition:.16s}
.add-btn:hover{border-color:var(--accent);background:var(--accent-soft);transform:translateY(-1px);box-shadow:0 4px 12px rgba(124,77,255,.12)}
.add-ico{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)}
.add-lbl{line-height:1.1;text-align:center}

.sizes{display:flex;flex-direction:column;gap:6px}
.size-opt{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:8px;padding:8px 10px;cursor:pointer;font-size:13px;background:#fff}
.size-opt:hover{border-color:var(--accent-2)}
.size-opt.sel{border-color:var(--accent);background:var(--accent-soft)}
.size-opt .nm{font-weight:700}
.size-opt .nt{font-size:11px;color:var(--muted)}

.stage-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;overflow:auto;background:
  radial-gradient(circle at 20% 10%,#efeaff 0,transparent 40%),
  radial-gradient(circle at 90% 90%,#e9f7f1 0,transparent 45%),var(--bg)}
.stage{position:relative;background:#fff;box-shadow:var(--shadow);border-radius:6px}
.stage canvas{display:block;border-radius:6px;image-rendering:pixelated}
.de-handle{position:absolute;border:1px dashed transparent;cursor:move;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.de-handle:hover{border-color:var(--accent-2)}
.de-handle.sel{border:1.5px solid var(--accent);background:rgba(124,77,255,.06)}
.de-resize{position:absolute;right:-9px;bottom:-9px;width:20px;height:20px;background:var(--accent);border:2.5px solid #fff;border-radius:50%;cursor:nwse-resize;box-shadow:0 1px 5px rgba(0,0,0,.35);touch-action:none}
.guide{position:absolute;z-index:5;pointer-events:none;background:#ff3b80;box-shadow:0 0 0 .5px rgba(255,59,128,.4)}
.guide.v{width:1px;margin-left:-.5px}
.guide.h{height:1px;margin-top:-.5px}
.stage-meta{font-size:12px;color:var(--muted);text-align:center}
.stage-meta b{color:var(--ink)}

.field{margin-bottom:12px}
.field label{display:block;font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
.field input[type=text],.field input[type=number],.field select,.field textarea{width:100%;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;background:#fff;color:var(--ink)}
.field textarea{resize:vertical;min-height:54px}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--accent)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.row4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}
.check{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin:8px 0}
.empty{color:var(--muted);font-size:13px;line-height:1.5}

.ins-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.ins-head .tag{background:var(--accent-soft);color:var(--accent);padding:3px 9px;border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}

.icon-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.icon-opt{border:1px solid var(--line);border-radius:8px;padding:4px;cursor:pointer;background:#fff;display:grid;place-items:center}
.icon-opt.sel{border-color:var(--accent);background:var(--accent-soft)}
.icon-opt:hover{border-color:var(--accent-2)}

.overlay{position:fixed;inset:0;background:rgba(34,27,46,.45);display:grid;place-items:center;z-index:50;backdrop-filter:blur(2px)}
.modal{background:var(--panel);border-radius:16px;box-shadow:var(--shadow);width:min(460px,92vw);max-height:88vh;overflow:auto;padding:22px}
.modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.modal-head h3{margin:0;font-size:18px}
.modal .hint{font-size:12px;color:var(--muted);line-height:1.5;margin:0 0 14px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.exp-tag{font-size:10px;background:#fff0d8;color:#b07400;padding:2px 7px;border-radius:20px;font-weight:800;vertical-align:middle;margin-left:6px}

.log{background:#1d1726;color:#d8cff0;border-radius:10px;padding:10px 12px;font-family:ui-monospace,monospace;font-size:11.5px;max-height:170px;overflow:auto;margin:6px 0;line-height:1.6}
.log.done{box-shadow:inset 0 0 0 1.5px var(--ok)}
.log.error{box-shadow:inset 0 0 0 1.5px var(--danger)}

.tpl-list{display:flex;flex-direction:column;gap:8px}
.tpl-card{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:10px;padding:10px;cursor:pointer;background:#fff}
.tpl-card:hover{border-color:var(--accent-2);background:var(--accent-soft)}
.tpl-card canvas{border:1px solid var(--line);border-radius:4px;background:#fff}
.tpl-card .info{flex:1;min-width:0}
.tpl-card .info b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tpl-card .info span{font-size:11px;color:var(--muted)}

.banner{background:#fff7e6;border:1px solid #ffe2a8;color:#8a5a00;border-radius:10px;padding:10px 12px;font-size:12.5px;margin-bottom:12px;line-height:1.5}
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#221b2e;color:#fff;padding:10px 18px;border-radius:30px;font-size:13px;font-weight:600;z-index:90;box-shadow:var(--shadow)}

/* ---- Modelos prontos (galeria) ---- */
.modal.wide{width:min(720px,94vw)}
.starter-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.starter-card{display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:12px;cursor:pointer;background:#fff}
.starter-card:hover{border-color:var(--accent);background:var(--accent-soft);transform:translateY(-2px)}
.starter-card canvas{max-width:100%;border:1px solid var(--line);border-radius:5px;background:#fff}
.starter-info{text-align:center}
.starter-info b{display:block;font-size:13px}
.starter-info span{font-size:11px;color:var(--muted)}

/* ---- Tema escuro (apenas a interface; a etiqueta continua P&B) ---- */
.app.dark{--bg:#16131e;--panel:#211c2b;--ink:#ece8f4;--muted:#9d95ad;--line:#352d45;--accent-soft:#2c2440;--shadow:0 8px 30px rgba(0,0,0,.4)}
.app.dark .btn{background:#2a2336;color:var(--ink);border-color:var(--line)}
.app.dark .btn:hover{background:var(--accent-soft);border-color:var(--accent-2)}
.app.dark .btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.app.dark .size-opt,.app.dark .field input,.app.dark .field select,.app.dark .field textarea,.app.dark .icon-opt,.app.dark .tpl-card,.app.dark .starter-card,.app.dark .stage{background:#2a2336;color:var(--ink)}
.app.dark .tpl-card canvas,.app.dark .starter-card canvas{background:#fff}
.app.dark .stage-wrap{background:#1b1726}
.app.dark .banner{background:#2e2710;border-color:#5a4a14;color:#e8cd84}
.app.dark .topbar input{background:#fff;color:#221b2e}

/* ---- Nome da etiqueta (topbar) ---- */
.name-input{margin-left:12px;border:none;border-radius:8px;padding:7px 12px;font-size:14px;font-weight:600;width:220px}
.name-input:focus{outline:2px solid rgba(255,255,255,.6)}

/* ---- Responsivo: tablets ---- */
@media (max-width:1100px) and (min-width:860px){
  .body{grid-template-columns:200px 1fr 250px}
}

/* ====== MOBILE (< 860px): documento rolável + navbar inferior ====== */
@media (max-width:860px){
  html,body,#root{height:auto;min-height:100%;overflow:visible}
}
.app.is-mobile{height:auto;min-height:100vh;overflow:visible;display:block}
.app.is-mobile .topbar{position:sticky;top:0;z-index:20;padding:9px 12px;gap:10px}
.app.is-mobile .brand small{display:none}
.app.is-mobile .name-input{margin-left:0;flex:1 1 100px;min-width:90px;width:auto}

.mbody{padding-bottom:84px}
.m-stage{position:sticky;top:54px;z-index:9;background:
  radial-gradient(circle at 20% 10%,#efeaff 0,transparent 45%),
  radial-gradient(circle at 90% 90%,#e9f7f1 0,transparent 50%),var(--bg);
  border-bottom:1px solid var(--line)}
.app.dark .m-stage{background:#1b1726;border-color:var(--line)}
.m-stage .stage-wrap{padding:16px 12px;min-height:0}
.m-panel{padding:18px 16px}
.m-panel .rail,.m-panel .inspector{border:none;padding:0;overflow:visible;max-height:none;background:transparent}
.m-panel .rail h3:first-child{margin-top:0}

@media (max-width:860px){
  .add-grid{grid-template-columns:repeat(4,1fr)}
}
@media (max-width:520px){
  .add-grid{grid-template-columns:repeat(3,1fr)}
  .row4{grid-template-columns:1fr 1fr}
  .modal{padding:16px}
  .starter-grid{grid-template-columns:repeat(auto-fill,minmax(125px,1fr))}
  .brand h1{font-size:17px}
}

/* Navbar inferior (estilo health-tracker) */
.mobile-nav{position:fixed;left:10px;right:10px;bottom:10px;z-index:40;display:flex;
  background:var(--panel);border:1px solid var(--line);border-radius:18px;
  box-shadow:0 6px 24px rgba(60,40,90,.18);padding:4px;gap:2px;
  padding-bottom:calc(4px + env(safe-area-inset-bottom))}
.app.dark .mobile-nav{background:#221c2b}
.mnav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:3px;border:none;background:transparent;color:var(--muted);padding:9px 2px;border-radius:14px;
  cursor:pointer;font-family:inherit;transition:.18s}
.mnav-ico{display:grid;place-items:center;line-height:0}
.mnav-label{font-size:10px;font-weight:700;letter-spacing:.1px}
.mnav-item.active{color:var(--accent);background:var(--accent-soft)}
.mnav-item.primary{color:#fff;background:var(--accent);box-shadow:0 3px 10px rgba(124,77,255,.35)}
.mnav-item.primary .mnav-label{color:#fff}

/* Bottom sheet de ações — fixado embaixo pelo próprio overlay (flex) */
.overlay-sheet{display:flex;align-items:flex-end;justify-content:stretch;padding:0}
.sheet{width:100%;background:var(--panel);
  border-radius:20px 20px 0 0;box-shadow:0 -8px 30px rgba(60,40,90,.25);
  padding:10px 18px calc(22px + env(safe-area-inset-bottom));animation:sheetUp .22s ease-out}
.sheet h3{margin:6px 0 12px;font-size:16px}
.sheet-grip{width:42px;height:5px;border-radius:3px;background:var(--line);margin:2px auto 8px}
.sheet-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.sheet-grid .btn{justify-content:center;padding:13px 8px}
@keyframes sheetUp{from{transform:translateY(14px);opacity:.4}to{transform:translateY(0);opacity:1}}

/* ---- Seletor de ícones / Ver todos ---- */
.ip-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.count-pill{font-size:12px;font-weight:700;background:var(--accent-soft);color:var(--accent);padding:2px 10px;border-radius:20px;vertical-align:middle;margin-left:6px}
.allicons{display:flex;flex-direction:column;max-height:86vh}
.lib-tabs{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.lib-tab{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:20px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.lib-tab span{color:var(--muted);font-weight:700;font-size:11px;margin-left:3px}
.lib-tab:hover{border-color:var(--accent-2)}
.lib-tab.sel{background:var(--accent);border-color:var(--accent);color:#fff}
.lib-tab.sel span{color:rgba(255,255,255,.8)}
.ai-search{width:100%;border:1px solid var(--line);border-radius:10px;padding:11px 13px;font-size:16px;font-family:inherit;background:var(--panel);color:var(--ink);margin-bottom:12px}
.ai-search:focus{outline:none;border-color:var(--accent)}
.ai-scroll{overflow-y:auto;flex:1;margin:0 -4px;padding:0 4px}
.ai-cat{margin-bottom:14px}
.ai-cat h4{margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}
.ai-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:7px}
.app.dark .ai-search{background:#2a2336}

/* ---- Seletor de fonte com preview ---- */
.font-list{display:flex;flex-direction:column;gap:6px;max-height:260px;overflow-y:auto;border:1px solid var(--line);border-radius:10px;padding:6px;background:var(--panel)}
.font-opt{display:flex;flex-direction:column;align-items:flex-start;gap:1px;border:1px solid transparent;border-radius:8px;padding:7px 11px;cursor:pointer;background:transparent;color:var(--ink);text-align:left;font-family:inherit}
.font-opt:hover{background:var(--accent-soft)}
.font-opt.sel{border-color:var(--accent);background:var(--accent-soft)}
.font-sample{font-size:19px;line-height:1.25;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.font-name{font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.app.dark .font-list{background:#2a2336}

/* ---- Cartões do diálogo de impressão ---- */
.print-card{border:1px solid var(--line);border-radius:12px;padding:13px 14px;margin-bottom:12px;background:var(--panel)}
.print-card-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:14px}
.app.dark .print-card{background:#2a2336}

/* ---- Seletor de ornamentos ---- */
.orn-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.orn-opt{border:1px solid var(--line);border-radius:9px;padding:5px;cursor:pointer;background:#fff;display:grid;place-items:center}
.orn-opt canvas{width:100%;height:auto}
.orn-opt:hover{border-color:var(--accent-2)}
.orn-opt.sel{border-color:var(--accent);background:var(--accent-soft)}
.app.dark .orn-opt{background:#fff}`

export function injectStyles() {
  if (typeof document === 'undefined') return
  fixViewport()
  injectGoogleFonts()
  if (document.getElementById('tagya-css')) return
  const tag = document.createElement('style')
  tag.id = 'tagya-css'
  tag.textContent = CSS
  document.head.appendChild(tag)
}

// Carrega as famílias do Google Fonts (uma vez).
function injectGoogleFonts() {
  if (document.getElementById('tagya-gfonts')) return
  const pre = document.createElement('link')
  pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = 'anonymous'
  document.head.appendChild(pre)
  const link = document.createElement('link')
  link.id = 'tagya-gfonts'; link.rel = 'stylesheet'; link.href = GOOGLE_FONTS_HREF
  document.head.appendChild(link)
}

// Impede o navegador (sobretudo iOS) de dar zoom ao focar inputs / tocar elementos.
function fixViewport() {
  let vp = document.querySelector('meta[name=viewport]')
  if (!vp) {
    vp = document.createElement('meta')
    vp.setAttribute('name', 'viewport')
    document.head.appendChild(vp)
  }
  vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
}
