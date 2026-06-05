import { useEffect, useRef, useState } from 'react'
import { renderTemplateToCanvas, preloadTemplateImages } from '../lib/labelTemplate.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const ELABEL = { text: 'Texto', rect: 'Retângulo', line: 'Linha', qr: 'QR', barcode: 'Cód. barras', icon: 'Ícone', ornament: 'Ornamento', image: 'Imagem', date: 'Data', table: 'Tabela' }

// Palco do editor: canvas + alças arrastáveis + guias de alinhamento (snap).
export default function Stage({ template, scale, zoom = 1, onZoom, selId, selIds = [], onSelect, onChange }) {
  const canvasRef = useRef(null)
  const [guides, setGuides] = useState([])
  const { widthMm, heightMm, elements } = template
  // Pinça (2 dedos) → zoom do preview. O zoom do navegador está desativado no app.
  const pointers = useRef(new Map())
  const pinch = useRef(null)
  function onWrapDown(e) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: zoom }
    }
  }
  function onWrapMove(e) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && pinch.current && onZoom) {
      e.preventDefault()
      const [a, b] = [...pointers.current.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      onZoom(clamp(pinch.current.z0 * d / pinch.current.d0, 0.5, 4))
    }
  }
  function onWrapUp(e) {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }

  useEffect(() => {
    let alive = true
    preloadTemplateImages(template).then(() => {
      if (!alive || !canvasRef.current) return
      const c = renderTemplateToCanvas(template, scale)
      const dst = canvasRef.current
      dst.width = c.width; dst.height = c.height
      dst.getContext('2d').drawImage(c, 0, 0)
    })
    return () => { alive = false }
  }, [template, scale])

  // Encaixa nas bordas/centro da etiqueta e de outros elementos; devolve guias ativas.
  function snap(nx, ny, w, h, el) {
    const TH = 6 / scale // tolerância em mm
    const others = elements.filter((e) => e.id !== el.id)
    const vT = [0, widthMm / 2, widthMm]
    const hT = [0, heightMm / 2, heightMm]
    others.forEach((o) => { vT.push(o.x, o.x + o.w / 2, o.x + o.w); hT.push(o.y, o.y + o.h / 2, o.y + o.h) })
    const g = []
    let bv = null
    for (const xv of [nx, nx + w / 2, nx + w]) for (const t of vT) { const d = Math.abs(xv - t); if (d < TH && (!bv || d < bv.d)) bv = { d, shift: t - xv, p: t } }
    if (bv) { nx += bv.shift; g.push({ o: 'v', p: bv.p }) }
    let bh = null
    for (const yv of [ny, ny + h / 2, ny + h]) for (const t of hT) { const d = Math.abs(yv - t); if (d < TH && (!bh || d < bh.d)) bh = { d, shift: t - yv, p: t } }
    if (bh) { ny += bh.shift; g.push({ o: 'h', p: bh.p }) }
    return { nx, ny, g }
  }

  // Arraste/redimensiona via Pointer Events — mouse, toque e caneta.
  function startDrag(e, el, mode) {
    e.preventDefault(); e.stopPropagation()
    // Mover um elemento que já faz parte de uma seleção múltipla → arrasta todos juntos.
    const multi = mode === 'move' && selIds.length > 1 && selIds.includes(el.id)
    if (!multi) onSelect(el.id)
    try { e.currentTarget.setPointerCapture?.(e.pointerId) } catch { /* ok */ }
    const sx = e.clientX, sy = e.clientY
    const o = { x: el.x, y: el.y, w: el.w, h: el.h }
    const origins = multi ? selIds.map((id) => elements.find((x) => x.id === id)).filter(Boolean).map((E) => ({ id: E.id, x: E.x, y: E.y, w: E.w, h: E.h })) : null
    const move = (ev) => {
      ev.preventDefault()
      const dx = (ev.clientX - sx) / scale
      const dy = (ev.clientY - sy) / scale
      if (mode === 'move' && multi) {
        for (const g of origins) {
          onChange(g.id, { x: clamp(g.x + dx, 0, widthMm - g.w), y: clamp(g.y + dy, 0, heightMm - g.h) })
        }
      } else if (mode === 'move') {
        let nx = clamp(o.x + dx, 0, widthMm - o.w)
        let ny = clamp(o.y + dy, 0, heightMm - o.h)
        const s = snap(nx, ny, o.w, o.h, el)
        nx = clamp(s.nx, 0, widthMm - o.w)
        ny = clamp(s.ny, 0, heightMm - o.h)
        setGuides(s.g)
        onChange(el.id, { x: nx, y: ny })
      } else {
        onChange(el.id, {
          w: clamp(o.w + dx, 2, widthMm - o.x),
          h: clamp(o.h + dy, 2, heightMm - o.y)
        })
      }
    }
    const up = () => {
      setGuides([])
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  return (
    <div className="stage-wrap" onPointerDown={onWrapDown} onPointerMove={onWrapMove} onPointerUp={onWrapUp} onPointerCancel={onWrapUp}>
      <div className="stage" style={{ width: widthMm * scale, height: heightMm * scale, borderRadius: template.shape === 'round' ? '50%' : 6 }} onPointerDown={() => onSelect(null)}>
        <canvas ref={canvasRef} style={{ width: widthMm * scale, height: heightMm * scale }} />
        {guides.map((g, i) => (
          <span
            key={i}
            className={`guide ${g.o}`}
            style={g.o === 'v'
              ? { left: g.p * scale, top: 0, height: heightMm * scale }
              : { top: g.p * scale, left: 0, width: widthMm * scale }}
          />
        ))}
        {elements.map((el) => (
          <div
            key={el.id}
            className={`de-handle ${(el.id === selId || selIds.includes(el.id)) ? 'sel' : ''}`}
            style={{ left: el.x * scale, top: el.y * scale, width: (el.w || 2) * scale, height: (el.h || 2) * scale, touchAction: 'none', transform: el.rot ? `rotate(${el.rot}deg)` : undefined }}
            onPointerDown={(e) => { if (e.shiftKey) { e.preventDefault(); e.stopPropagation(); onSelect(el.id, true) } else startDrag(e, el, 'move') }}
            title={ELABEL[el.type] || el.type}
          >
            {el.id === selId && selIds.length <= 1 && <span className="de-resize" style={{ touchAction: 'none' }} onPointerDown={(e) => startDrag(e, el, 'resize')} />}
          </div>
        ))}
      </div>
      <div className="stage-meta">
        <b>{widthMm} × {heightMm} mm</b> · {elements.length} elemento(s)
        {Math.abs(zoom - 1) > 0.01
          ? <> · <button className="zoom-reset" onClick={() => onZoom && onZoom(1)}>zoom {Math.round(zoom * 100)}% ✕</button></>
          : <> · pinça p/ ampliar · arraste para mover</>}
      </div>
    </div>
  )
}
