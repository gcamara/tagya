import { useEffect, useRef, useState } from 'react'
import { LIBRARIES, getLibrary, drawLibIcon, libIconCount } from '../lib/icons/index.js'
import { FONTS, DEFAULT_FONT } from '../lib/labelTemplate.js'
import { ORNAMENT_CATEGORIES, ORNAMENT_COUNT, drawOrnament } from '../lib/ornaments.js'
import { useIconLib } from './useIconLib.js'
import { Trash2, Copy, BringToFront, SendToBack, ChevronUp, ChevronDown } from './icons.js'
import AllIconsModal from './AllIconsModal.js'
import AllOrnamentsModal from './AllOrnamentsModal.js'

const round = (v) => Math.round((Number(v) || 0) * 10) / 10
const ELABEL = { text: 'Texto', rect: 'Retângulo', line: 'Linha', qr: 'QR Code', barcode: 'Cód. barras', icon: 'Ícone', ornament: 'Ornamento', image: 'Imagem' }

// Painel de propriedades do elemento selecionado.
export default function Inspector({ el, index = -1, count = 0, onUpdate, onRemove, onImageFile, onDuplicate, onReorder }) {
  if (!el) {
    return (
      <div className="inspector">
        <h3>Propriedades</h3>
        <p className="empty">Selecione um elemento na etiqueta (ou adicione um pela barra à esquerda) para editar suas propriedades aqui.</p>
      </div>
    )
  }

  const set = (patch) => onUpdate(el.id, patch)

  return (
    <div className="inspector">
      <div className="ins-head">
        <h3 style={{ margin: 0 }}>{ELABEL[el.type] || el.type}</h3>
        <span className="tag">{el.type}</span>
      </div>

      {(onDuplicate || onReorder) && (
        <div className="ins-actions">
          {onDuplicate && (
            <button className="iact" title="Duplicar (Ctrl+D)" onClick={() => onDuplicate(el.id)}><Copy size={16} /></button>
          )}
          {onReorder && (
            <>
              <button className="iact" title="Trazer para frente" disabled={index >= count - 1} onClick={() => onReorder(el.id, 'front')}><BringToFront size={16} /></button>
              <button className="iact" title="Avançar uma camada" disabled={index >= count - 1} onClick={() => onReorder(el.id, 'up')}><ChevronUp size={16} /></button>
              <button className="iact" title="Recuar uma camada" disabled={index <= 0} onClick={() => onReorder(el.id, 'down')}><ChevronDown size={16} /></button>
              <button className="iact" title="Enviar para trás" disabled={index <= 0} onClick={() => onReorder(el.id, 'back')}><SendToBack size={16} /></button>
            </>
          )}
        </div>
      )}

      <div className="field">
        <label>Posição e tamanho (mm)</label>
        <div className="row4">
          <input type="number" title="X" value={round(el.x)} onChange={(e) => set({ x: Number(e.target.value) })} />
          <input type="number" title="Y" value={round(el.y)} onChange={(e) => set({ y: Number(e.target.value) })} />
          <input type="number" title="Largura" value={round(el.w)} onChange={(e) => set({ w: Number(e.target.value) })} />
          <input type="number" title="Altura" value={round(el.h)} onChange={(e) => set({ h: Number(e.target.value) })} />
        </div>
      </div>

      {el.type === 'text' && (
        <div className="field">
          <label>Texto</label>
          <textarea value={el.text} onChange={(e) => set({ text: e.target.value })} />
        </div>
      )}

      {(el.type === 'qr' || el.type === 'barcode') && (
        <div className="field">
          <label>Conteúdo {el.type === 'qr' ? '(URL ou texto)' : '(números/letras)'}</label>
          <input type="text" value={el.text || ''} onChange={(e) => set({ text: e.target.value })} />
        </div>
      )}

      {el.type === 'text' && (
        <>
          <div className="field">
            <label>Tipografia · {FONTS.length} fontes</label>
            <FontPicker value={el.font || DEFAULT_FONT} text={el.text} onPick={(css) => set({ font: css })} />
          </div>
          <div className="row2">
            <div className="field">
              <label>Fonte (mm)</label>
              <input type="number" step="0.2" value={el.fontMm} onChange={(e) => set({ fontMm: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Alinhar</label>
              <select value={el.align} onChange={(e) => set({ align: e.target.value })}>
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>
          </div>
          <label className="check"><input type="checkbox" checked={!!el.bold} onChange={(e) => set({ bold: e.target.checked })} /> Negrito</label>
        </>
      )}

      {(el.type === 'rect' || el.type === 'line') && (
        <div className="field">
          <label>Espessura da linha (mm)</label>
          <input type="number" step="0.1" value={el.lineMm ?? 0.4} onChange={(e) => set({ lineMm: Number(e.target.value) })} />
        </div>
      )}
      {el.type === 'rect' && (
        <label className="check"><input type="checkbox" checked={!!el.fill} onChange={(e) => set({ fill: e.target.checked })} /> Preenchido (preto)</label>
      )}

      {el.type === 'icon' && <IconPicker libId={el.iconLib || 'etiqya'} value={el.icon} onPick={(lib, k) => set({ iconLib: lib, icon: k })} />}

      {el.type === 'ornament' && <OrnamentPicker value={el.ornament} onPick={(k) => set({ ornament: k })} />}

      {el.type === 'image' && (
        <div className="field">
          <label>Imagem (logo P&B)</label>
          <input type="file" accept="image/*" onChange={(e) => onImageFile(el.id, e)} />
        </div>
      )}

      <button className="btn danger" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }} onClick={() => onRemove(el.id)}><Trash2 size={15} /> Remover elemento</button>
    </div>
  )
}

// Seletor de ícones: biblioteca → categoria → ícone (+ "ver todos").
function IconPicker({ libId, value, onPick }) {
  const [lib, setLib] = useState(libId)
  const library = getLibrary(lib)
  const startCat = library.categories.find((c) => c.keys.includes(value)) || library.categories[0]
  const [catId, setCatId] = useState(startCat.id)
  const [showAll, setShowAll] = useState(false)
  const cat = library.categories.find((c) => c.id === catId) || library.categories[0]

  function changeLib(id) { setLib(id); setCatId(getLibrary(id).categories[0].id) }

  return (
    <div className="field">
      <div className="ip-head">
        <label style={{ margin: 0 }}>Ícone · {libIconCount(lib)} na lib</label>
        <button className="btn sm" onClick={() => setShowAll(true)}>Ver todos</button>
      </div>
      <select value={lib} onChange={(e) => changeLib(e.target.value)} style={{ margin: '8px 0' }}>
        {LIBRARIES.map((l) => <option key={l.id} value={l.id}>{l.name} ({libIconCount(l.id)})</option>)}
      </select>
      <select value={catId} onChange={(e) => setCatId(e.target.value)} style={{ marginBottom: 8 }}>
        {library.categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.keys.length})</option>)}
      </select>
      <div className="icon-grid">
        {cat.keys.map((k) => (
          <button key={k} className={`icon-opt ${lib === libId && value === k ? 'sel' : ''}`} onClick={() => onPick(lib, k)} title={k}>
            <IconPreview libId={lib} icon={k} />
          </button>
        ))}
      </div>
      <AllIconsModal open={showAll} libId={lib} value={value} onPick={onPick} onClose={() => setShowAll(false)} />
    </div>
  )
}

export function IconPreview({ libId, icon }) {
  const ref = useRef(null)
  const ready = useIconLib(libId || 'etiqya')
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawLibIcon(ctx, libId || 'etiqya', icon, 3, 3, c.width - 6)
  }, [libId, icon, ready])
  return <canvas ref={ref} width={28} height={28} />
}

// Seletor de ornamentos: categoria → ornamento (preview em retângulo, pois muitos esticam).
function OrnamentPicker({ value, onPick }) {
  const startCat = ORNAMENT_CATEGORIES.find((c) => c.keys.includes(value)) || ORNAMENT_CATEGORIES[0]
  const [catId, setCatId] = useState(startCat.id)
  const [showAll, setShowAll] = useState(false)
  const cat = ORNAMENT_CATEGORIES.find((c) => c.id === catId) || ORNAMENT_CATEGORIES[0]
  return (
    <div className="field">
      <div className="ip-head">
        <label style={{ margin: 0 }}>Ornamento · {ORNAMENT_COUNT}</label>
        <button className="btn sm" onClick={() => setShowAll(true)}>Ver todos</button>
      </div>
      <select value={catId} onChange={(e) => setCatId(e.target.value)} style={{ margin: '8px 0' }}>
        {ORNAMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.keys.length})</option>)}
      </select>
      <div className="orn-grid">
        {cat.keys.map((k) => (
          <button key={k} className={`orn-opt ${value === k ? 'sel' : ''}`} onClick={() => onPick(k)} title={k}>
            <OrnamentPreview okey={k} />
          </button>
        ))}
      </div>
      <AllOrnamentsModal open={showAll} value={value} onPick={onPick} onClose={() => setShowAll(false)} />
    </div>
  )
}

function OrnamentPreview({ okey }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawOrnament(ctx, okey, 4, 4, c.width - 8, c.height - 8)
  }, [okey])
  return <canvas ref={ref} width={88} height={44} />
}

// Seletor de fonte com preview: cada opção mostra o texto real na própria fonte.
function FontPicker({ value, text, onPick }) {
  const sample = (text && text.trim()) ? text.trim() : 'Texto'
  return (
    <div className="font-list">
      {FONTS.map((f) => (
        <button key={f.id} className={`font-opt ${value === f.css ? 'sel' : ''}`} onClick={() => onPick(f.css)} title={f.name}>
          <span className="font-sample" style={{ fontFamily: f.css }}>{sample}</span>
          <span className="font-name">{f.name}</span>
        </button>
      ))}
    </div>
  )
}
