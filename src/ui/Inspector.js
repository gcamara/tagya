import { useEffect, useRef, useState } from 'react'
import { LIBRARIES, getLibrary, drawLibIcon, libIconCount } from '../lib/icons/index.js'
import { FONTS, DEFAULT_FONT, DATE_FORMATS, BARCODE_FORMATS } from '../lib/labelTemplate.js'
import { ORNAMENT_CATEGORIES, ORNAMENT_COUNT, drawOrnament } from '../lib/ornaments.js'
import { useIconLib } from './useIconLib.js'
import { Trash2, Copy, BringToFront, SendToBack, ChevronUp, ChevronDown } from './icons.js'
import AllIconsModal from './AllIconsModal.js'
import AllOrnamentsModal from './AllOrnamentsModal.js'

const round = (v) => Math.round((Number(v) || 0) * 10) / 10
const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || a))

// Editor de tabela: dimensões + conteúdo de cada célula.
function TableEditor({ el, set }) {
  const rows = Math.max(1, el.rows || 1)
  const cols = Math.max(1, el.cols || 1)
  const cells = el.cells || []
  const setDim = (nr, nc) => {
    const next = []
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) next[r * nc + c] = (r < rows && c < cols) ? (cells[r * cols + c] || '') : ''
    set({ rows: nr, cols: nc, cells: next })
  }
  const setCell = (i, v) => { const next = cells.slice(); next[i] = v; set({ cells: next }) }
  return (
    <>
      <div className="row2">
        <div className="field"><label>Linhas</label><input type="number" min="1" max="12" value={rows} onChange={(e) => setDim(clamp(e.target.value, 1, 12), cols)} /></div>
        <div className="field"><label>Colunas</label><input type="number" min="1" max="8" value={cols} onChange={(e) => setDim(rows, clamp(e.target.value, 1, 8))} /></div>
      </div>
      <div className="row2">
        <div className="field"><label>Fonte (mm)</label><input type="number" step="0.1" value={el.fontMm ?? 2.4} onChange={(e) => set({ fontMm: Number(e.target.value) })} /></div>
        <div className="field"><label>Linha (mm)</label><input type="number" step="0.1" value={el.lineMm ?? 0.3} onChange={(e) => set({ lineMm: Number(e.target.value) })} /></div>
      </div>
      <label className="check"><input type="checkbox" checked={!!el.headerBold} onChange={(e) => set({ headerBold: e.target.checked })} /> 1ª linha em negrito</label>
      <div className="field">
        <label>Conteúdo das células</label>
        <div className="tbl-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
          {Array.from({ length: rows * cols }).map((_, i) => (
            <input key={i} className="tbl-cell" value={cells[i] || ''} onChange={(e) => setCell(i, e.target.value)} />
          ))}
        </div>
      </div>
    </>
  )
}
const ELABEL = { text: 'Texto', rect: 'Retângulo', line: 'Linha', qr: 'QR Code', barcode: 'Cód. barras', icon: 'Ícone', ornament: 'Ornamento', image: 'Imagem', date: 'Data', table: 'Tabela' }

const ALIGN_CELLS = [
  ['left', 'top'], ['center', 'top'], ['right', 'top'],
  ['left', 'middle'], ['center', 'middle'], ['right', 'middle'],
  ['left', 'bottom'], ['center', 'bottom'], ['right', 'bottom']
]
const ALIGN_TITLE = {
  left: 'esquerda', center: 'centro', right: 'direita', top: 'topo', middle: 'meio', bottom: 'base'
}

// Painel de propriedades do elemento selecionado — seções viram abas (estilo Canva).
export default function Inspector({ el, multi, index = -1, count = 0, onUpdate, onRemove, onImageFile, onDuplicate, onReorder, onAlign, embedded = false, autoFocusId, onAutoFocused }) {
  const [tab, setTab] = useState(0)
  const txtRef = useRef(null)
  useEffect(() => { setTab(0) }, [el && el.id, el && el.type]) // volta à 1ª aba ao trocar de elemento
  // Auto-foca o campo de texto quando o elemento foi recém-criado (sobe o teclado pronto).
  useEffect(() => {
    if (autoFocusId && el && el.id === autoFocusId && el.type === 'text' && txtRef.current) {
      txtRef.current.focus()
      onAutoFocused && onAutoFocused()
    }
  }, [autoFocusId, el && el.id])

  if (multi) {
    return (
      <div className="inspector">
        <div className="ins-head">
          <h3 style={{ margin: 0 }}>{multi.count} selecionados</h3>
          <span className="tag">grupo</span>
        </div>
        <p className="empty" style={{ marginTop: 0 }}>Arraste para mover todos juntos · setas para ajustar · Delete para remover. Shift+clique adiciona/remove da seleção.</p>
        <div className="field">
          <label>Alinhar todos na etiqueta</label>
          <div className="align-grid">
            {ALIGN_CELLS.map(([h, v]) => (
              <button key={h + v} className="align-cell" title={`Alinhar: ${ALIGN_TITLE[h]} · ${ALIGN_TITLE[v]}`} onClick={() => multi.onAlign(h, v)}>
                <span className={`align-dot h-${h} v-${v}`} />
              </button>
            ))}
          </div>
        </div>
        {multi.count >= 3 && (
          <div className="field">
            <label>Distribuir (espaçar igual)</label>
            <div className="row2">
              <button className="btn sm" onClick={() => multi.onDistribute('h')}>↔ Horizontal</button>
              <button className="btn sm" onClick={() => multi.onDistribute('v')}>↕ Vertical</button>
            </div>
          </div>
        )}
        {!embedded && <button className="btn danger" style={{ width: '100%', marginTop: 6, justifyContent: 'center' }} onClick={multi.onRemove}><Trash2 size={15} /> Remover {multi.count} elementos</button>}
      </div>
    )
  }
  if (!el) {
    return (
      <div className="inspector">
        <h3>Propriedades</h3>
        <p className="empty">Selecione um elemento na etiqueta (ou adicione um pela barra à esquerda) para editar suas propriedades aqui.</p>
      </div>
    )
  }

  const set = (patch) => onUpdate(el.id, patch)

  // --- conteúdo de cada seção (vira aba) ---
  const posNode = (
    <>
      <div className="field">
        <label>Posição e tamanho (mm)</label>
        <div className="row4">
          <input type="number" title="X" value={round(el.x)} onChange={(e) => set({ x: Number(e.target.value) })} />
          <input type="number" title="Y" value={round(el.y)} onChange={(e) => set({ y: Number(e.target.value) })} />
          <input type="number" title="Largura" value={round(el.w)} onChange={(e) => set({ w: Number(e.target.value) })} />
          <input type="number" title="Altura" value={round(el.h)} onChange={(e) => set({ h: Number(e.target.value) })} />
        </div>
      </div>
      <div className="field">
        <label>Ajuste fino (0,5 mm)</label>
        <div className="nudge-pad">
          <button className="nbtn nb-u" title="Cima" onClick={() => set({ y: round((el.y || 0) - 0.5) })}>↑</button>
          <button className="nbtn nb-l" title="Esquerda" onClick={() => set({ x: round((el.x || 0) - 0.5) })}>←</button>
          <button className="nbtn nb-r" title="Direita" onClick={() => set({ x: round((el.x || 0) + 0.5) })}>→</button>
          <button className="nbtn nb-d" title="Baixo" onClick={() => set({ y: round((el.y || 0) + 0.5) })}>↓</button>
        </div>
      </div>
      {onAlign && (
        <div className="field">
          <label>Alinhar na etiqueta</label>
          <div className="align-grid">
            {ALIGN_CELLS.map(([h, v]) => (
              <button key={h + v} className="align-cell" title={`Alinhar: ${ALIGN_TITLE[h]} · ${ALIGN_TITLE[v]}`} onClick={() => onAlign(el.id, h, v)}>
                <span className={`align-dot h-${h} v-${v}`} />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="field">
        <label>Rotação · {Math.round(el.rot || 0)}°</label>
        <div className="rot-row">
          <input type="range" min="0" max="360" step="1" value={el.rot || 0} onChange={(e) => set({ rot: Number(e.target.value) })} />
          {[0, 90, 180, 270].map((d) => (
            <button key={d} className={`rot-q ${(el.rot || 0) === d ? 'sel' : ''}`} onClick={() => set({ rot: d })}>{d}°</button>
          ))}
        </div>
      </div>
    </>
  )

  const fontNode = (
    <>
      <div className="field">
        <label>Tipografia · {FONTS.length} fontes</label>
        <FontPicker value={el.font || DEFAULT_FONT} text={el.type === 'date' ? 'Data' : el.text} onPick={(css) => set({ font: css })} />
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
      <div className="field">
        <label>Curvatura (arco) · {Math.round(el.curve || 0)}°</label>
        <input type="range" min="-180" max="180" step="1" value={el.curve || 0} onChange={(e) => set({ curve: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
      </div>
    </>
  )

  const sections = []
  if (el.type === 'text') {
    sections.push({ id: 'txt', label: 'Texto', node: (
      <div className="field"><label>Texto</label><textarea ref={txtRef} value={el.text} onChange={(e) => set({ text: e.target.value })} /></div>
    ) })
    sections.push({ id: 'fnt', label: 'Fonte', node: fontNode })
  } else if (el.type === 'date') {
    sections.push({ id: 'dt', label: 'Data', node: (
      <>
        <div className="field">
          <label>Tipo de data</label>
          <select value={el.dateMode || 'today'} onChange={(e) => set({ dateMode: e.target.value })}>
            <option value="today">Hoje (data de impressão)</option>
            <option value="offset">Validade (hoje + dias)</option>
            <option value="fixed">Data fixa</option>
          </select>
        </div>
        {el.dateMode === 'offset' && (
          <div className="field"><label>Dias de validade (+)</label><input type="number" value={el.offsetDays ?? 0} onChange={(e) => set({ offsetDays: Number(e.target.value) })} /></div>
        )}
        {el.dateMode === 'fixed' && (
          <div className="field"><label>Data</label><input type="date" value={el.fixedDate || ''} onChange={(e) => set({ fixedDate: e.target.value })} /></div>
        )}
        <div className="row2">
          <div className="field"><label>Formato</label><select value={el.fmt || 'dd/MM/yyyy'} onChange={(e) => set({ fmt: e.target.value })}>{DATE_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
          <div className="field"><label>Prefixo</label><input type="text" placeholder="Val: " value={el.prefix || ''} onChange={(e) => set({ prefix: e.target.value })} /></div>
        </div>
      </>
    ) })
    sections.push({ id: 'fnt', label: 'Fonte', node: fontNode })
  } else if (el.type === 'qr') {
    sections.push({ id: 'c', label: 'Conteúdo', node: (
      <>
        <div className="field"><label>Conteúdo (URL ou texto)</label><input type="text" value={el.text || ''} onChange={(e) => set({ text: e.target.value })} /></div>
        <div className="field">
          <label>Correção de erro</label>
          <select value={el.qrEcc || 'M'} onChange={(e) => set({ qrEcc: e.target.value })}>
            <option value="L">Baixa (L)</option><option value="M">Média (M)</option><option value="Q">Alta (Q)</option><option value="H">Máxima (H) — c/ logo</option>
          </select>
        </div>
        <div className="field">
          <label>Logo no centro (opcional)</label>
          {el.logoSrc ? <button className="btn sm danger" onClick={() => set({ logoSrc: null })}><Trash2 size={13} /> Remover logo</button> : <input type="file" accept="image/*" onChange={(e) => onImageFile(el.id, e, 'logoSrc')} />}
        </div>
      </>
    ) })
  } else if (el.type === 'barcode') {
    sections.push({ id: 'c', label: 'Conteúdo', node: (
      <>
        <div className="field"><label>Conteúdo (números/letras)</label><input type="text" value={el.text || ''} onChange={(e) => set({ text: e.target.value })} /></div>
        <div className="field"><label>Formato</label><select value={el.barFormat || 'CODE128'} onChange={(e) => set({ barFormat: e.target.value })}>{BARCODE_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <label className="check"><input type="checkbox" checked={!!el.barText} onChange={(e) => set({ barText: e.target.checked })} /> Mostrar números</label>
      </>
    ) })
  } else if (el.type === 'icon') {
    sections.push({ id: 'i', label: 'Ícone', node: <IconPicker libId={el.iconLib || 'etiqya'} value={el.icon} onPick={(lib, k) => set({ iconLib: lib, icon: k })} /> })
  } else if (el.type === 'ornament') {
    sections.push({ id: 'o', label: 'Ornamento', node: <OrnamentPicker value={el.ornament} onPick={(k) => set({ ornament: k })} /> })
  } else if (el.type === 'table') {
    sections.push({ id: 't', label: 'Tabela', node: <TableEditor el={el} set={set} /> })
  } else if (el.type === 'image') {
    sections.push({ id: 'im', label: 'Imagem', node: (
      <>
        <div className="field"><label>Imagem (logo)</label><input type="file" accept="image/*" onChange={(e) => onImageFile(el.id, e)} /></div>
        {el.src && (
          <>
            <label className="check"><input type="checkbox" checked={el.bw !== false} onChange={(e) => set({ bw: e.target.checked })} /> Preto e branco (térmica)</label>
            {el.bw !== false && (
              <>
                <div className="field"><label>Limiar · {Math.round(el.threshold ?? 128)}</label><input type="range" min="20" max="235" step="1" value={el.threshold ?? 128} onChange={(e) => set({ threshold: Number(e.target.value) })} style={{ accentColor: 'var(--accent)' }} /></div>
                <label className="check"><input type="checkbox" checked={!!el.dither} onChange={(e) => set({ dither: e.target.checked })} /> Dithering (meio-tom p/ fotos)</label>
              </>
            )}
          </>
        )}
      </>
    ) })
  } else if (el.type === 'rect' || el.type === 'line') {
    sections.push({ id: 'st', label: 'Estilo', node: (
      <>
        <div className="field"><label>Espessura da linha (mm)</label><input type="number" step="0.1" value={el.lineMm ?? 0.4} onChange={(e) => set({ lineMm: Number(e.target.value) })} /></div>
        {el.type === 'rect' && <label className="check"><input type="checkbox" checked={!!el.fill} onChange={(e) => set({ fill: e.target.checked })} /> Preenchido (preto)</label>}
      </>
    ) })
  }
  sections.push({ id: 'pos', label: 'Posição', node: posNode })
  const cur = Math.min(tab, sections.length - 1)

  return (
    <div className="inspector">
      {!embedded && (
        <div className="ins-head">
          <h3 style={{ margin: 0 }}>{ELABEL[el.type] || el.type}</h3>
          <span className="tag">{el.type}</span>
        </div>
      )}

      {!embedded && (onDuplicate || onReorder) && (
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

      {sections.length > 1 && (
        <div className="ins-tabs">
          {sections.map((s, i) => (
            <button key={s.id} className={`ins-tab ${i === cur ? 'sel' : ''}`} onClick={() => setTab(i)}>{s.label}</button>
          ))}
        </div>
      )}

      <div className="ins-pane">{sections[cur].node}</div>

      {!embedded && <button className="btn danger" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => onRemove(el.id)}><Trash2 size={15} /> Remover elemento</button>}
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
