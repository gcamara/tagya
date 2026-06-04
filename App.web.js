import { useEffect, useMemo, useRef, useState } from 'react'
import { injectStyles } from './src/ui/styles.js'
import { DEFAULT_TEMPLATE } from './src/lib/labelTemplate.js'
import { SIZE_PRESETS } from './src/lib/sizes.js'
import { listTemplates, saveTemplate, deleteTemplate, loadPrefs, savePrefs } from './src/lib/storage.js'
import { exportTemplatePNG } from './src/lib/exportImage.js'
import { bluetoothSupported } from './src/lib/niimbot.js'
import Stage from './src/ui/Stage.js'
import Inspector from './src/ui/Inspector.js'
import PrintModal from './src/ui/PrintModal.js'
import TemplatesModal from './src/ui/TemplatesModal.js'
import StarterModal from './src/ui/StarterModal.js'
import BridgePicker from './src/ui/BridgePicker.js'
import ConnectionBar from './src/ui/ConnectionBar.js'
import {
  Plus, Shapes, SlidersHorizontal, Save, Printer, MoreHorizontal,
  Type, QrCode, Barcode, Star, Square, Minus, ImageIcon,
  FilePlus2, Sparkles, FolderOpen, Download, Moon, Sun,
  Undo2, Redo2, Calendar, Table
} from './src/ui/icons.js'

const uid = () => 'el_' + Math.random().toString(36).slice(2, 8)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const clone = (o) => JSON.parse(JSON.stringify(o))

const ADD_ITEMS = [
  { type: 'text', Icon: Type, label: 'Texto' },
  { type: 'qr', Icon: QrCode, label: 'QR Code' },
  { type: 'barcode', Icon: Barcode, label: 'Cód. barras' },
  { type: 'icon', Icon: Star, label: 'Ícone' },
  { type: 'date', Icon: Calendar, label: 'Data' },
  { type: 'table', Icon: Table, label: 'Tabela' },
  { type: 'rect', Icon: Square, label: 'Retângulo' },
  { type: 'line', Icon: Minus, label: 'Linha' },
  { type: 'ornament', Icon: Sparkles, label: 'Ornamento' },
  { type: 'image', Icon: ImageIcon, label: 'Imagem' }
]

export default function App() {
  injectStyles()
  const [template, setTemplate] = useState(() => ({ ...clone(DEFAULT_TEMPLATE), id: null }))
  const [selId, setSelId] = useState(null)
  const [showPrint, setShowPrint] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showStarters, setShowStarters] = useState(false)
  const [saved, setSaved] = useState([])
  const [toast, setToast] = useState(null)
  const [dark, setDark] = useState(false)
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200))
  const [mobileTab, setMobileTab] = useState('tools') // tools | editar
  const [showActions, setShowActions] = useState(false)
  const isMobile = vw < 860

  // Escala do preview cabe na largura disponível (3 colunas no desktop, empilhado no mobile).
  const scale = useMemo(() => {
    const wide = vw >= 860
    const avail = wide ? Math.max(240, vw - 230 - 290 - 80) : Math.max(220, vw - 44)
    return clamp(Math.min(700, avail) / template.widthMm, 4, 24)
  }, [template.widthMm, vw])
  const sel = template.elements.find((e) => e.id === selId) || null

  // ---- Histórico (desfazer/refazer) ----
  // templateRef segue o template atual para que pushHistory tire o snapshot certo
  // sem depender de closures defasados durante arraste/digitação.
  const templateRef = useRef(template)
  useEffect(() => { templateRef.current = template })
  const pastRef = useRef([])
  const futureRef = useRef([])
  const clipboardRef = useRef(null)
  const coalesceRef = useRef({ t: 0, tag: null })
  const [histTick, setHistTick] = useState(0)
  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0

  // Empilha o estado atual no histórico antes de uma alteração.
  // `tag` agrupa edições contínuas (arraste, digitação, nudge) num único passo
  // se acontecerem em sequência rápida.
  function pushHistory(tag) {
    const now = Date.now()
    const c = coalesceRef.current
    if (tag && c.tag === tag && now - c.t < 700) { c.t = now; return }
    coalesceRef.current = { t: now, tag: tag || null }
    pastRef.current = [...pastRef.current, clone(templateRef.current)].slice(-80)
    futureRef.current = []
    setHistTick((n) => n + 1)
  }
  function undo() {
    if (!pastRef.current.length) return
    const prev = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    futureRef.current = [clone(templateRef.current), ...futureRef.current].slice(0, 80)
    coalesceRef.current = { t: 0, tag: null }
    setTemplate(prev)
    setSelId((id) => (prev.elements.some((e) => e.id === id) ? id : null))
    setHistTick((n) => n + 1)
  }
  function redo() {
    if (!futureRef.current.length) return
    const next = futureRef.current[0]
    futureRef.current = futureRef.current.slice(1)
    pastRef.current = [...pastRef.current, clone(templateRef.current)].slice(-80)
    coalesceRef.current = { t: 0, tag: null }
    setTemplate(next)
    setSelId((id) => (next.elements.some((e) => e.id === id) ? id : null))
    setHistTick((n) => n + 1)
  }

  useEffect(() => { setSaved(listTemplates()); setDark(!!loadPrefs().dark) }, [])

  useEffect(() => {
    const on = () => setVw(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  function toggleDark() {
    setDark((d) => { const v = !d; savePrefs({ ...loadPrefs(), dark: v }); return v })
  }

  // Atalhos de teclado. Em campos de texto só Ctrl+Z/Y funcionam (o resto é digitação).
  useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      const typing = ['input', 'select', 'textarea'].includes(tag)
      const mod = e.ctrlKey || e.metaKey

      if (mod && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if (mod && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return }
      if (typing) return

      if (mod && (e.key === 'd' || e.key === 'D')) { if (selId) { e.preventDefault(); duplicateEl(selId) } return }
      if (mod && (e.key === 'c' || e.key === 'C')) { if (selId) { e.preventDefault(); copyEl(selId) } return }
      if (mod && (e.key === 'v' || e.key === 'V')) { e.preventDefault(); pasteEl(); return }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selId) { e.preventDefault(); removeEl(selId); return }
      if (selId && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 5 : 1
        if (e.key === 'ArrowLeft') nudgeEl(selId, -step, 0)
        else if (e.key === 'ArrowRight') nudgeEl(selId, step, 0)
        else if (e.key === 'ArrowUp') nudgeEl(selId, 0, -step)
        else if (e.key === 'ArrowDown') nudgeEl(selId, 0, step)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selId, template])

  function flash(msg) { setToast(msg); setTimeout(() => setToast(null), 1800) }

  function updateEl(id, patch) {
    setTemplate((t) => ({ ...t, elements: t.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  }
  // Edição vinda do inspetor: agrupa digitação contínua no mesmo campo num passo de histórico.
  function editEl(id, patch) {
    pushHistory('edit-' + id + '-' + Object.keys(patch).join(','))
    updateEl(id, patch)
  }
  function removeEl(id) {
    pushHistory()
    setTemplate((t) => ({ ...t, elements: t.elements.filter((e) => e.id !== id) }))
    setSelId(null)
  }
  function duplicateEl(id) {
    const src = templateRef.current.elements.find((e) => e.id === id)
    if (!src) return
    pushHistory()
    const copy = { ...clone(src), id: uid(), x: clamp(src.x + 2, 0, templateRef.current.widthMm - src.w), y: clamp(src.y + 2, 0, templateRef.current.heightMm - src.h) }
    setTemplate((t) => ({ ...t, elements: [...t.elements, copy] }))
    setSelId(copy.id)
    flash('Elemento duplicado')
  }
  // Copia/cola elementos (mesmo entre etiquetas e sessões, via localStorage).
  function copyEl(id) {
    const src = templateRef.current.elements.find((e) => e.id === id)
    if (!src) return
    clipboardRef.current = clone(src)
    try { localStorage.setItem('tagya_clip', JSON.stringify(src)) } catch { /* ok */ }
    flash('Elemento copiado')
  }
  function pasteEl() {
    let src = clipboardRef.current
    if (!src) { try { src = JSON.parse(localStorage.getItem('tagya_clip') || 'null') } catch { src = null } }
    if (!src) return
    pushHistory()
    const t = templateRef.current
    const el = { ...clone(src), id: uid(), x: clamp((src.x || 0) + 2, 0, Math.max(0, t.widthMm - (src.w || 2))), y: clamp((src.y || 0) + 2, 0, Math.max(0, t.heightMm - (src.h || 2))) }
    setTemplate((tt) => ({ ...tt, elements: [...tt.elements, el] }))
    setSelId(el.id)
    flash('Elemento colado')
  }
  // Reordena a camada do elemento. dir: 'front' | 'back' | 'up' | 'down'.
  function reorderEl(id, dir) {
    const els = templateRef.current.elements
    const i = els.findIndex((e) => e.id === id)
    if (i < 0) return
    let j = i
    if (dir === 'front') j = els.length - 1
    else if (dir === 'back') j = 0
    else if (dir === 'up') j = Math.min(els.length - 1, i + 1)
    else if (dir === 'down') j = Math.max(0, i - 1)
    if (j === i) return
    pushHistory()
    const next = els.slice()
    const [moved] = next.splice(i, 1)
    next.splice(j, 0, moved)
    setTemplate((t) => ({ ...t, elements: next }))
  }
  // Alinha o elemento na etiqueta. h: left|center|right, v: top|middle|bottom.
  function alignEl(id, h, v) {
    const el = templateRef.current.elements.find((e) => e.id === id)
    if (!el) return
    pushHistory()
    const W = templateRef.current.widthMm, H = templateRef.current.heightMm
    const x = h === 'left' ? 0 : h === 'right' ? Math.max(0, W - el.w) : (W - el.w) / 2
    const y = v === 'top' ? 0 : v === 'bottom' ? Math.max(0, H - el.h) : (H - el.h) / 2
    updateEl(id, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
  }
  // Move o elemento selecionado pelas setas do teclado (mm).
  function nudgeEl(id, dx, dy) {
    const el = templateRef.current.elements.find((e) => e.id === id)
    if (!el) return
    pushHistory('nudge')
    const w = templateRef.current.widthMm, h = templateRef.current.heightMm
    updateEl(id, { x: clamp(Math.round((el.x + dx) * 10) / 10, 0, w - el.w), y: clamp(Math.round((el.y + dy) * 10) / 10, 0, h - el.h) })
  }
  function addEl(type) {
    pushHistory()
    const base = { id: uid(), x: 2, y: 2, w: 16, h: 5 }
    let el
    if (type === 'text') el = { ...base, type, text: 'Texto', fontMm: 3, bold: false, align: 'left', font: 'Arial, Helvetica, sans-serif', w: 20, h: 5 }
    else if (type === 'qr') el = { ...base, type, text: 'https://tagya.app', w: 9, h: 9 }
    else if (type === 'barcode') el = { ...base, type, text: '123456789', w: 28, h: 8 }
    else if (type === 'icon') el = { ...base, type, iconLib: 'etiqya', icon: 'star', w: 8, h: 8 }
    else if (type === 'date') el = { ...base, type, dateMode: 'today', offsetDays: 0, fixedDate: '', fmt: 'dd/MM/yyyy', prefix: '', fontMm: 3, bold: false, align: 'left', font: 'Arial, Helvetica, sans-serif', w: 28, h: 5 }
    else if (type === 'table') el = { ...base, type, rows: 2, cols: 2, cells: ['', '', '', ''], fontMm: 2.4, lineMm: 0.3, w: 36, h: 14 }
    else if (type === 'rect') el = { ...base, type, w: 20, h: 6, fill: false, lineMm: 0.4 }
    else if (type === 'line') el = { ...base, type, w: 24, h: 1, lineMm: 0.4 }
    else if (type === 'ornament') el = { ...base, type, ornament: 'div-diamond', w: 30, h: 7 }
    else if (type === 'image') el = { ...base, type, src: null, w: 12, h: 8 }
    setTemplate((t) => ({ ...t, elements: [...t.elements, el] }))
    setSelId(el.id)
  }

  function onImageFile(id, e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { pushHistory(); updateEl(id, { src: String(reader.result) }) }
    reader.readAsDataURL(file)
  }

  function applySize(p) {
    pushHistory('size')
    setTemplate((t) => ({ ...t, widthMm: p.widthMm, heightMm: p.heightMm }))
  }

  function setName(name) { pushHistory('name'); setTemplate((t) => ({ ...t, name })) }

  function newLabel() {
    pushHistory()
    setTemplate({ ...clone(DEFAULT_TEMPLATE), id: null, name: 'Nova etiqueta' })
    setSelId(null)
    flash('Nova etiqueta')
  }
  function doSave() {
    const rec = saveTemplate(template)
    setTemplate((t) => ({ ...t, id: rec.id }))
    setSaved(listTemplates())
    flash('Modelo salvo ✓')
  }
  function loadTemplate(t) {
    pushHistory()
    setTemplate(clone(t))
    setSelId(null)
    setShowTemplates(false)
    flash('Modelo carregado')
  }
  function loadStarter(t) {
    pushHistory()
    setTemplate({ ...clone(t), id: null })
    setSelId(null)
    setShowStarters(false)
    flash('Modelo aplicado')
  }
  function removeTemplate(id) {
    deleteTemplate(id)
    setSaved(listTemplates())
  }
  async function doExport() {
    await exportTemplatePNG(template)
    flash('PNG exportado')
  }

  const railTools = (
    <>
      <h3>Adicionar elemento</h3>
      <div className="add-grid">
        {ADD_ITEMS.map((it) => (
          <button key={it.type} className="add-btn" onClick={() => { addEl(it.type); if (isMobile) setMobileTab('editar') }}>
            <span className="add-ico"><it.Icon size={20} strokeWidth={2} /></span>
            <span className="add-lbl">{it.label}</span>
          </button>
        ))}
      </div>

      <h3>Tamanho da etiqueta</h3>
      <div className="sizes">
        {SIZE_PRESETS.map((p) => {
          const cur = template.widthMm === p.widthMm && template.heightMm === p.heightMm
          return (
            <div key={p.id} className={`size-opt ${cur ? 'sel' : ''}`} onClick={() => applySize(p)}>
              <span className="nm">{p.label}</span>
              <span className="nt">{p.note}</span>
            </div>
          )
        })}
      </div>

      <h3>Personalizado (mm)</h3>
      <div className="row2">
        <div className="field" style={{ margin: 0 }}>
          <label>Largura</label>
          <input type="number" min="8" value={template.widthMm} onChange={(e) => { pushHistory('size'); setTemplate((t) => ({ ...t, widthMm: Math.max(8, Number(e.target.value) || 8) })) }} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Altura</label>
          <input type="number" min="8" value={template.heightMm} onChange={(e) => { pushHistory('size'); setTemplate((t) => ({ ...t, heightMm: Math.max(8, Number(e.target.value) || 8) })) }} />
        </div>
      </div>
    </>
  )

  const stage = <Stage template={template} scale={scale} selId={selId} onSelect={setSelId} onChange={updateEl} onBeginChange={() => pushHistory()} />
  const inspector = <Inspector el={sel} index={template.elements.findIndex((e) => e.id === selId)} count={template.elements.length} onUpdate={editEl} onRemove={removeEl} onImageFile={onImageFile} onDuplicate={duplicateEl} onReorder={reorderEl} onAlign={alignEl} />

  const NAV = [
    { id: 'tools', Icon: Shapes, label: 'Elementos', onClick: () => setMobileTab('tools') },
    { id: 'editar', Icon: SlidersHorizontal, label: 'Editar', onClick: () => setMobileTab('editar') },
    { id: 'save', Icon: Save, label: 'Salvar', onClick: doSave },
    { id: 'print', Icon: Printer, label: 'Imprimir', onClick: () => setShowPrint(true), primary: true },
    { id: 'more', Icon: MoreHorizontal, label: 'Mais', onClick: () => setShowActions(true) }
  ]

  return (
    <div className={`app ${dark ? 'dark' : ''} ${isMobile ? 'is-mobile' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <div className="logo">Ya</div>
          <div>
            <h1>TagYa</h1>
            <small>editor de etiquetas · Niimbot</small>
          </div>
        </div>
        <input
          type="text"
          className="name-input"
          value={template.name || ''}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da etiqueta"
        />
        <div className="spacer" />
        {isMobile && (
          <div className="tb-mobile-hist">
            <button className="btn ghost icon-only" onClick={undo} disabled={!canUndo} title="Desfazer"><Undo2 size={16} /></button>
            <button className="btn ghost icon-only" onClick={redo} disabled={!canRedo} title="Refazer"><Redo2 size={16} /></button>
          </div>
        )}
        {!isMobile && (
          <div className="tb-actions">
            <button className="btn ghost icon-only" onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)"><Undo2 size={16} /></button>
            <button className="btn ghost icon-only" onClick={redo} disabled={!canRedo} title="Refazer (Ctrl+Y)"><Redo2 size={16} /></button>
            <button className="btn ghost" onClick={newLabel}><FilePlus2 size={15} /> Novo</button>
            <button className="btn ghost" onClick={() => setShowStarters(true)}><Sparkles size={15} /> Prontos</button>
            <button className="btn ghost" onClick={() => setShowTemplates(true)}><FolderOpen size={15} /> Meus</button>
            <button className="btn ghost" onClick={doExport}><Download size={15} /> PNG</button>
            <button className="btn ghost icon-only" onClick={toggleDark} title="Alternar tema claro/escuro">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button className="btn" onClick={doSave}><Save size={15} /> Salvar</button>
            <button className="btn primary" onClick={() => setShowPrint(true)} title={bluetoothSupported() ? 'Imprimir na Niimbot' : 'Bluetooth indisponível neste navegador'}><Printer size={15} /> Imprimir</button>
          </div>
        )}
      </header>

      <ConnectionBar onFlash={flash} />

      {!isMobile ? (
        <div className="body">
          <aside className="rail">{railTools}</aside>
          {stage}
          {inspector}
        </div>
      ) : (
        <div className="mbody">
          <div className="m-stage">{stage}</div>
          <div className="m-panel">
            {mobileTab === 'tools' ? <div className="rail">{railTools}</div> : inspector}
          </div>
        </div>
      )}

      {isMobile && (
        <nav className="mobile-nav">
          {NAV.map((n) => {
            const active = (n.id === 'tools' && mobileTab === 'tools') || (n.id === 'editar' && mobileTab === 'editar')
            return (
              <button key={n.id} className={`mnav-item ${active ? 'active' : ''} ${n.primary ? 'primary' : ''}`} onClick={n.onClick}>
                <span className="mnav-ico"><n.Icon size={21} strokeWidth={2.1} /></span>
                <span className="mnav-label">{n.label}</span>
              </button>
            )
          })}
        </nav>
      )}

      {isMobile && showActions && (
        <div className="overlay overlay-sheet" onClick={() => setShowActions(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grip" />
            <h3>Ações</h3>
            <div className="sheet-grid">
              <button className="btn" onClick={() => { newLabel(); setShowActions(false) }}><FilePlus2 size={17} /> Novo</button>
              <button className="btn" onClick={() => { setShowStarters(true); setShowActions(false) }}><Sparkles size={17} /> Prontos</button>
              <button className="btn" onClick={() => { setShowTemplates(true); setShowActions(false) }}><FolderOpen size={17} /> Meus</button>
              <button className="btn" onClick={() => { doExport(); setShowActions(false) }}><Download size={17} /> PNG</button>
              <button className="btn" onClick={() => { toggleDark(); setShowActions(false) }}>{dark ? <><Sun size={17} /> Tema claro</> : <><Moon size={17} /> Tema escuro</>}</button>
            </div>
          </div>
        </div>
      )}

      <PrintModal open={showPrint} onClose={() => setShowPrint(false)} template={template} />
      <TemplatesModal open={showTemplates} onClose={() => setShowTemplates(false)} templates={saved} onLoad={loadTemplate} onDelete={removeTemplate} />
      <StarterModal open={showStarters} onClose={() => setShowStarters(false)} onPick={loadStarter} />
      <BridgePicker />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
