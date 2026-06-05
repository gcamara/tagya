import { useEffect, useRef } from 'react'

// Editor inline de texto: um <textarea> posicionado exatamente sobre o rect do
// elemento de texto, aproximando fonte/tamanho/alinhamento. Commit no blur/Enter,
// cancela no Esc. O commit vai pelo mesmo caminho que o Inspector (onCommit →
// editEl) e o push de histórico é feito no App.
//
// Props:
//  rect  = { left, top, width, height } px relativos ao container do stage
//  el    = elemento de texto
//  scale = px por mm (p/ derivar font-size do fontMm)
//  onCommit(id, text)  onCancel()
export default function InlineTextEditor({ rect, el, scale, onCommit, onCancel }) {
  const ref = useRef(null)
  const startedRef = useRef(el ? String(el.text ?? '') : '')

  useEffect(() => {
    startedRef.current = el ? String(el.text ?? '') : ''
    const ta = ref.current
    if (!ta) return
    ta.value = startedRef.current
    // foca e seleciona tudo p/ digitar por cima imediatamente
    ta.focus()
    try { ta.select() } catch { /* ok */ }
  }, [el && el.id])

  if (!el || !rect) return null

  const fontPx = Math.max(8, (el.fontMm || 3) * scale)
  const commit = () => {
    const ta = ref.current
    if (!ta) return
    const v = ta.value
    if (v !== startedRef.current) onCommit(el.id, v)
    else onCancel()
  }
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onCancel() }
    // Enter commita; Shift+Enter insere quebra de linha
    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() }
  }

  return (
    <textarea
      ref={ref}
      className="inline-edit"
      defaultValue={startedRef.current}
      onBlur={commit}
      onKeyDown={onKey}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        fontSize: fontPx,
        fontFamily: el.font || 'Arial, Helvetica, sans-serif',
        fontWeight: el.bold ? 700 : 400,
        textAlign: el.align || 'left',
        lineHeight: rect.height + 'px',
        transform: el.rot ? `rotate(${el.rot}deg)` : undefined
      }}
    />
  )
}
