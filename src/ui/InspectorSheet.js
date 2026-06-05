import { useEffect, useRef, useState } from 'react'

// Bottom-sheet arrastável que envolve o Inspector no mobile. A etiqueta continua
// visível acima; a folha flutua por cima do canvas. Snap points: peek / meio /
// cheio. Desktop não usa este componente.
//
// Props:
//  open      = bool (há elemento selecionado)
//  onClose() = fecha a folha (limpa seleção no App)
//  children  = <Inspector .../>
const SNAPS = [0.32, 0.62, 0.92] // fração da altura da viewport: peek, meio, cheio

export default function InspectorSheet({ open, onClose, children }) {
  const [snap, setSnap] = useState(1) // começa no meio
  const sheetRef = useRef(null)
  const drag = useRef(null)
  const [dragY, setDragY] = useState(null) // offset px durante o arraste (override do snap)

  // ao (re)abrir, volta para o meio
  useEffect(() => { if (open) setSnap(1) }, [open])

  if (!open) return null

  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const heightFor = (s) => Math.round(SNAPS[s] * vh)
  const curHeight = heightFor(snap)

  function onGripDown(e) {
    e.preventDefault()
    try { e.currentTarget.setPointerCapture?.(e.pointerId) } catch { /* ok */ }
    drag.current = { startY: e.clientY, startH: curHeight }
    setDragY(curHeight)
  }
  function onGripMove(e) {
    if (!drag.current) return
    e.preventDefault()
    const dy = e.clientY - drag.current.startY
    const h = Math.max(80, Math.min(vh * 0.96, drag.current.startH - dy))
    setDragY(h)
  }
  function onGripUp(e) {
    if (!drag.current) return
    const h = dragY != null ? dragY : curHeight
    drag.current = null
    setDragY(null)
    // fecha se arrastou bem para baixo do peek
    if (h < SNAPS[0] * vh * 0.6) { onClose(); return }
    // encaixa no snap mais próximo
    let best = 0, bd = Infinity
    SNAPS.forEach((f, i) => { const d = Math.abs(f * vh - h); if (d < bd) { bd = d; best = i } })
    setSnap(best)
  }

  const height = dragY != null ? dragY : curHeight

  return (
    <div className="isheet" style={{ height }} onPointerDown={(e) => e.stopPropagation()}>
      <div
        className="isheet-grip-zone"
        onPointerDown={onGripDown}
        onPointerMove={onGripMove}
        onPointerUp={onGripUp}
        onPointerCancel={onGripUp}
      >
        <div className="isheet-grip" />
      </div>
      <div className="isheet-body" ref={sheetRef}>{children}</div>
    </div>
  )
}
