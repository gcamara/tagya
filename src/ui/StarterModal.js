import { useEffect, useRef, useState } from 'react'
import { renderTemplateToCanvas } from '../lib/labelTemplate.js'
import { STARTER_TEMPLATES, STARTER_CATEGORIES } from '../lib/presets.js'

// Thumbnail lazy: só renderiza no canvas quando o card entra na viewport
// (suporta centenas de modelos sem travar ao abrir).
function Thumb({ template }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect() }
    }, { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!show) return
    const c = renderTemplateToCanvas(template, 4)
    const dst = ref.current
    if (!dst) return
    const maxW = 130, scale = Math.min(1, maxW / c.width)
    dst.width = c.width * scale; dst.height = c.height * scale
    dst.getContext('2d').drawImage(c, 0, 0, dst.width, dst.height)
  }, [template, show])
  return <canvas ref={ref} width={130} height={40} />
}

// Galeria de modelos prontos, organizada por categoria de uso.
export default function StarterModal({ open, onClose, onPick }) {
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  if (!open) return null

  const query = q.trim().toLowerCase()
  const list = STARTER_TEMPLATES.filter((t) => {
    if (cat !== 'all' && t.cat !== cat) return false
    if (query && !t.name.toLowerCase().includes(query)) return false
    return true
  })

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>✨ Modelos prontos <span className="count-pill">{STARTER_TEMPLATES.length}</span></h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        <input className="ai-search" placeholder="Buscar modelo…" value={q} onChange={(e) => setQ(e.target.value)} />

        <div className="lib-tabs">
          <button className={`lib-tab ${cat === 'all' ? 'sel' : ''}`} onClick={() => setCat('all')}>Todos <span>{STARTER_TEMPLATES.length}</span></button>
          {STARTER_CATEGORIES.map((c) => {
            const count = STARTER_TEMPLATES.filter((t) => t.cat === c.id).length
            if (!count) return null
            return (
              <button key={c.id} className={`lib-tab ${cat === c.id ? 'sel' : ''}`} onClick={() => setCat(c.id)}>
                {c.name} <span>{count}</span>
              </button>
            )
          })}
        </div>

        {list.length === 0
          ? <p className="hint">Nenhum modelo encontrado.</p>
          : (
            <div className="starter-grid">
              {list.map((t, i) => (
                <button key={i} className="starter-card" onClick={() => onPick(t)}>
                  <Thumb template={t} />
                  <div className="starter-info">
                    <b>{t.name}</b>
                    <span>{t.widthMm}×{t.heightMm} mm</span>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
