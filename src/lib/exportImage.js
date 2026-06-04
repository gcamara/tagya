// Exportação/compartilhamento da etiqueta como PNG (alta resolução, P&B).

import { renderTemplateToCanvas, preloadTemplateImages } from './labelTemplate.js'

const fileName = (template) => `${(template.name || 'etiqueta').replace(/[^\w-]+/g, '_')}.png`

async function renderBlob(template, scale) {
  await preloadTemplateImages(template)
  const canvas = renderTemplateToCanvas(template, scale)
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Baixa a etiqueta como PNG.
export async function exportTemplatePNG(template, scale = 24) {
  const blob = await renderBlob(template, scale)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName(template)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function canShareImage() {
  if (typeof navigator === 'undefined' || !navigator.canShare || !navigator.share) return false
  try { return navigator.canShare({ files: [new File([new Blob()], 'x.png', { type: 'image/png' })] }) } catch { return false }
}

// Compartilha a imagem pela folha do sistema (iOS/Android) — p/ enviar ao app Niimbot.
// Retorna 'shared' | 'downloaded' (fallback quando não há Web Share de arquivos).
export async function shareTemplatePNG(template, scale = 24) {
  const blob = await renderBlob(template, scale)
  const file = new File([blob], fileName(template), { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: template.name || 'Etiqueta TagYa' })
      return 'shared'
    } catch (e) {
      if (e && e.name === 'AbortError') return 'shared' // usuário cancelou a folha
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName(template)
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}
