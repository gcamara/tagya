import { useEffect, useRef } from 'react'
import { renderTemplateToCanvas } from '../lib/labelTemplate.js'
import { STARTER_TEMPLATES } from '../lib/presets.js'

function Thumb({ template }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = renderTemplateToCanvas(template, 4)
    const dst = ref.current
    if (!dst) return
    const maxW = 120, scale = Math.min(1, maxW / c.width)
    dst.width = c.width * scale; dst.height = c.height * scale
    dst.getContext('2d').drawImage(c, 0, 0, dst.width, dst.height)
  }, [template])
  return <canvas ref={ref} />
}

// Galeria de modelos prontos.
export default function StarterModal({ open, onClose, onPick }) {
  if (!open) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>✨ Modelos prontos</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>
        <p className="hint">Comece de um modelo e edite o conteúdo. As medidas e elementos já vêm posicionados.</p>
        <div className="starter-grid">
          {STARTER_TEMPLATES.map((t, i) => (
            <button key={i} className="starter-card" onClick={() => onPick(t)}>
              <Thumb template={t} />
              <div className="starter-info">
                <b>{t.name}</b>
                <span>{t.widthMm}×{t.heightMm} mm</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
