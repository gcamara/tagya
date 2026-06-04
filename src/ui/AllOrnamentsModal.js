import { useEffect, useRef, useState } from 'react'
import { ORNAMENT_CATEGORIES, ORNAMENT_COUNT, drawOrnament } from '../lib/ornaments.js'

function Prev({ okey }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    drawOrnament(ctx, okey, 4, 4, c.width - 8, c.height - 8)
  }, [okey])
  return <canvas ref={ref} width={120} height={54} />
}

// Modal "ver todos" dos ornamentos: todas as categorias + busca por nome.
export default function AllOrnamentsModal({ open, value, onPick, onClose }) {
  const [q, setQ] = useState('')
  if (!open) return null
  const query = q.trim().toLowerCase()
  const cats = ORNAMENT_CATEGORIES
    .map((c) => ({ ...c, keys: query ? c.keys.filter((k) => k.includes(query)) : c.keys }))
    .filter((c) => c.keys.length)
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide allicons" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Todos os ornamentos <span className="count-pill">{ORNAMENT_COUNT}</span></h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>
        <input className="ai-search" type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar… (ex: div, frame, corner, star)" />
        <div className="ai-scroll">
          {cats.length === 0 && <p className="hint">Nenhum ornamento encontrado.</p>}
          {cats.map((c) => (
            <div key={c.id} className="ai-cat">
              <h4>{c.name}</h4>
              <div className="orn-grid">
                {c.keys.map((k) => (
                  <button key={k} className={`orn-opt ${value === k ? 'sel' : ''}`} title={k} onClick={() => { onPick(k); onClose() }}>
                    <Prev okey={k} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
