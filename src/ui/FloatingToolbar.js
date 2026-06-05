import { useEffect, useRef, useState } from 'react'
import { Copy, BringToFront, SendToBack, Trash2 } from './icons.js'

// Barra flutuante de contexto: aparece logo acima (ou abaixo) do elemento
// selecionado, sobre o stage. Reusa os handlers do App (duplicar, reordenar,
// cor/fill, remover) — não duplica lógica.
//
// Props:
//  rect   = { left, top, width, height } em px relativos ao container do stage
//  bounds = { width, height } do container (para clampar dentro do stage)
//  el     = elemento selecionado (p/ saber o tipo e estado atual de cor/fill)
//  onDuplicate(id) onReorder(id, dir) onRemove(id) onSetFill(id, bool)
export default function FloatingToolbar({ rect, bounds, el, onDuplicate, onReorder, onRemove, onSetFill }) {
  const ref = useRef(null)
  const [colorOpen, setColorOpen] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // mede a própria barra p/ clampar e centralizar
  useEffect(() => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setSize({ w: r.width, h: r.height })
  }, [el && el.id, el && el.type, colorOpen])

  // fecha o popover de cor ao trocar de elemento
  useEffect(() => { setColorOpen(false) }, [el && el.id])

  if (!el || !rect) return null

  const GAP = 10
  const tbW = size.w || 180
  const tbH = size.h || 38
  // limites do stage em coords do host (rect/left/top já incluem o offset do stage)
  const minX = (bounds.left || 0) + 4
  const maxX = (bounds.left || 0) + (bounds.width || tbW) - tbW - 4
  const minY = (bounds.top || 0) + 4
  // posição horizontal: centralizada no elemento, presa dentro do stage
  let left = rect.left + rect.width / 2 - tbW / 2
  left = Math.max(minX, Math.min(left, Math.max(minX, maxX)))
  // acima do elemento; se não couber, vai abaixo
  let top = rect.top - tbH - GAP
  let placement = 'top'
  if (top < minY) { top = rect.top + rect.height + GAP; placement = 'bottom' }

  const hasFill = el.type === 'rect'
  const filled = !!el.fill

  return (
    <div
      ref={ref}
      className={`ftb ftb-${placement}`}
      style={{ left, top }}
      // o pointerdown no stage limpa a seleção; impedir que a barra propague
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button className="ftb-btn" title="Duplicar" onClick={() => onDuplicate(el.id)}><Copy size={16} /></button>

      {hasFill && (
        <div className="ftb-color-wrap">
          <button className="ftb-btn" title="Cor / preenchimento" onClick={() => setColorOpen((v) => !v)}>
            <span className={`ftb-swatch ${filled ? 'on' : ''}`} />
          </button>
          {colorOpen && (
            <div className="ftb-pop" onPointerDown={(e) => e.stopPropagation()}>
              <button className={`ftb-pop-opt ${filled ? 'sel' : ''}`} onClick={() => { onSetFill(el.id, true); setColorOpen(false) }}>
                <span className="ftb-swatch on" /> Preto
              </button>
              <button className={`ftb-pop-opt ${!filled ? 'sel' : ''}`} onClick={() => { onSetFill(el.id, false); setColorOpen(false) }}>
                <span className="ftb-swatch" /> Contorno
              </button>
            </div>
          )}
        </div>
      )}

      <button className="ftb-btn" title="Trazer para frente" onClick={() => onReorder(el.id, 'front')}><BringToFront size={16} /></button>
      <button className="ftb-btn" title="Enviar para trás" onClick={() => onReorder(el.id, 'back')}><SendToBack size={16} /></button>
      <span className="ftb-sep" />
      <button className="ftb-btn danger" title="Excluir" onClick={() => onRemove(el.id)}><Trash2 size={16} /></button>
    </div>
  )
}
