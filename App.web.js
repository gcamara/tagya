import { useEffect, useMemo, useState } from 'react'
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
import {
  Plus, Shapes, SlidersHorizontal, Save, Printer, MoreHorizontal,
  Type, QrCode, Barcode, Star, Square, Minus, ImageIcon,
  FilePlus2, Sparkles, FolderOpen, Download, Moon, Sun
} from './src/ui/icons.js'

const uid = () => 'el_' + Math.random().toString(36).slice(2, 8)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const clone = (o) => JSON.parse(JSON.stringify(o))

const ADD_ITEMS = [
  { type: 'text', Icon: Type, label: 'Texto' },
  { type: 'qr', Icon: QrCode, label: 'QR Code' },
  { type: 'barcode', Icon: Barcode, label: 'Cód. barras' },
  { type: 'icon', Icon: Star, label: 'Ícone' },
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

  useEffect(() => { setSaved(listTemplates()); setDark(!!loadPrefs().dark) }, [])

  useEffect(() => {
    const on = () => setVw(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  function toggleDark() {
    setDark((d) => { const v = !d; savePrefs({ ...loadPrefs(), dark: v }); return v })
  }

  // Delete remove o elemento selecionado (exceto ao digitar em um campo).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Delete') return
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (['input', 'select', 'textarea'].includes(tag)) return
      if (selId) { e.preventDefault(); removeEl(selId) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selId, template])

  function flash(msg) { setToast(msg); setTimeout(() => setToast(null), 1800) }

  function updateEl(id, patch) {
    setTemplate((t) => ({ ...t, elements: t.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  }
  function removeEl(id) {
    setTemplate((t) => ({ ...t, elements: t.elements.filter((e) => e.id !== id) }))
    setSelId(null)
  }
  function addEl(type) {
    const base = { id: uid(), x: 2, y: 2, w: 16, h: 5 }
    let el
    if (type === 'text') el = { ...base, type, text: 'Texto', fontMm: 3, bold: false, align: 'left', font: 'Arial, Helvetica, sans-serif', w: 20, h: 5 }
    else if (type === 'qr') el = { ...base, type, text: 'https://tagya.app', w: 9, h: 9 }
    else if (type === 'barcode') el = { ...base, type, text: '123456789', w: 28, h: 8 }
    else if (type === 'icon') el = { ...base, type, iconLib: 'etiqya', icon: 'star', w: 8, h: 8 }
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
    reader.onload = () => updateEl(id, { src: String(reader.result) })
    reader.readAsDataURL(file)
  }

  function applySize(p) {
    setTemplate((t) => ({ ...t, widthMm: p.widthMm, heightMm: p.heightMm }))
  }

  function setName(name) { setTemplate((t) => ({ ...t, name })) }

  function newLabel() {
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
    setTemplate(clone(t))
    setSelId(null)
    setShowTemplates(false)
    flash('Modelo carregado')
  }
  function loadStarter(t) {
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
          <input type="number" min="8" value={template.widthMm} onChange={(e) => setTemplate((t) => ({ ...t, widthMm: Math.max(8, Number(e.target.value) || 8) }))} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Altura</label>
          <input type="number" min="8" value={template.heightMm} onChange={(e) => setTemplate((t) => ({ ...t, heightMm: Math.max(8, Number(e.target.value) || 8) }))} />
        </div>
      </div>
    </>
  )

  const stage = <Stage template={template} scale={scale} selId={selId} onSelect={setSelId} onChange={updateEl} />
  const inspector = <Inspector el={sel} onUpdate={updateEl} onRemove={removeEl} onImageFile={onImageFile} />

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
        {!isMobile && (
          <div className="tb-actions">
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
