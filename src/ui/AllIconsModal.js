import { useEffect, useRef, useState } from 'react'
import { LIBRARIES, getLibrary, drawLibIcon, libIconCount } from '../lib/icons/index.js'
import { useIconLib } from './useIconLib.js'

function Preview({ libId, icon }) {
  const ref = useRef(null)
  const ready = useIconLib(libId)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawLibIcon(ctx, libId, icon, 4, 4, c.width - 8)
  }, [libId, icon, ready])
  return <canvas ref={ref} width={34} height={34} />
}

function IconBtn({ libId, icon, value, valueLib, onPick, onClose }) {
  return (
    <button
      className={`icon-opt ${libId === valueLib && value === icon ? 'sel' : ''}`}
      title={icon}
      onClick={() => { onPick(libId, icon); onClose() }}
    >
      <Preview libId={libId} icon={icon} />
    </button>
  )
}

// Modal "ver todos": navega por biblioteca/categoria; com busca, procura em TODAS as libs.
export default function AllIconsModal({ open, libId, value, onPick, onClose }) {
  const [lib, setLib] = useState(libId || 'etiqya')
  const [q, setQ] = useState('')
  useEffect(() => { if (open) { setLib(libId || 'etiqya'); setQ('') } }, [open, libId])
  if (!open) return null

  const query = q.trim().toLowerCase()
  const searching = query.length > 0

  // Resultados globais (todas as libs) quando há busca.
  const globalResults = searching
    ? LIBRARIES.map((l) => {
      const keys = []
      l.categories.forEach((c) => c.keys.forEach((k) => { if (k.includes(query) && !keys.includes(k)) keys.push(k) }))
      return { id: l.id, name: l.name, keys: keys.slice(0, 120) }
    }).filter((l) => l.keys.length)
    : []

  const library = getLibrary(lib)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide allicons" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Todos os ícones</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        <input
          className="ai-search"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar em todas as bibliotecas… (ex: car, star, heart)"
        />

        {!searching && (
          <div className="lib-tabs">
            {LIBRARIES.map((l) => (
              <button key={l.id} className={`lib-tab ${lib === l.id ? 'sel' : ''}`} onClick={() => setLib(l.id)}>
                {l.name} <span>{libIconCount(l.id)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="ai-scroll">
          {searching ? (
            globalResults.length === 0
              ? <p className="hint">Nenhum ícone encontrado em nenhuma biblioteca.</p>
              : globalResults.map((l) => (
                <div key={l.id} className="ai-cat">
                  <h4>{l.name} · {l.keys.length}</h4>
                  <div className="ai-grid">
                    {l.keys.map((k) => <IconBtn key={l.id + k} libId={l.id} icon={k} value={value} valueLib={libId} onPick={onPick} onClose={onClose} />)}
                  </div>
                </div>
              ))
          ) : (
            library.categories.map((c) => (
              <div key={c.id} className="ai-cat">
                <h4>{c.name}</h4>
                <div className="ai-grid">
                  {c.keys.map((k) => <IconBtn key={k} libId={lib} icon={k} value={value} valueLib={libId} onPick={onPick} onClose={onClose} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
