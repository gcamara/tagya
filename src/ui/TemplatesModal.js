import { useEffect, useRef } from 'react'
import { renderTemplateToCanvas } from '../lib/labelTemplate.js'

// Miniatura de um modelo salvo.
function Thumb({ template }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = renderTemplateToCanvas(template, 4)
    const dst = ref.current
    if (!dst) return
    const maxW = 84, scale = Math.min(1, maxW / c.width)
    dst.width = c.width * scale; dst.height = c.height * scale
    dst.getContext('2d').drawImage(c, 0, 0, dst.width, dst.height)
  }, [template])
  return <canvas ref={ref} />
}

// Drawer com os modelos salvos no dispositivo.
export default function TemplatesModal({ open, onClose, templates, onLoad, onDelete }) {
  if (!open) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>📁 Meus modelos</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>
        {templates.length === 0 && <p className="hint">Nenhum modelo salvo ainda. Crie sua etiqueta e clique em <b>Salvar</b>.</p>}
        <div className="tpl-list">
          {templates.map((t) => (
            <div key={t.id} className="tpl-card" onClick={() => onLoad(t)}>
              <Thumb template={t} />
              <div className="info">
                <b>{t.name || 'Sem nome'}</b>
                <span>{t.widthMm}×{t.heightMm} mm · {(t.elements || []).length} elem.</span>
              </div>
              <button className="btn icon" title="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(t.id) }}>🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
