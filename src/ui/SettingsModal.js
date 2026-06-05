import { SIZE_PRESETS } from '../lib/sizes.js'
import { Moon, Sun } from './icons.js'

// Configurações da etiqueta: nome, tamanho, formato, dimensões e aparência.
export default function SettingsModal({ open, onClose, template, onName, onApplySize, onShape, onDim, dark, onToggleDark }) {
  if (!open) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>⚙️ Configurações da etiqueta</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>

        <div className="field">
          <label>Nome da etiqueta</label>
          <input type="text" value={template.name || ''} onChange={(e) => onName(e.target.value)} placeholder="Nome da etiqueta" />
        </div>

        <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--muted)', margin: '14px 0 8px' }}>Tamanho</h3>
        <div className="sizes">
          {SIZE_PRESETS.map((p) => {
            const cur = template.widthMm === p.widthMm && template.heightMm === p.heightMm
            return (
              <div key={p.id} className={`size-opt ${cur ? 'sel' : ''}`} onClick={() => onApplySize(p)}>
                <span className="nm">{p.label}</span>
                <span className="nt">{p.note}</span>
              </div>
            )
          })}
        </div>

        <div className="row2" style={{ marginTop: 10 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Largura (mm)</label>
            <input type="number" min="8" value={template.widthMm} onChange={(e) => onDim('widthMm', e.target.value)} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Altura (mm)</label>
            <input type="number" min="8" value={template.heightMm} onChange={(e) => onDim('heightMm', e.target.value)} />
          </div>
        </div>

        <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--muted)', margin: '16px 0 8px' }}>Formato</h3>
        <div className="seg">
          <button className={`seg-btn ${template.shape !== 'round' ? 'sel' : ''}`} onClick={() => onShape('rect')}>▭ Retangular</button>
          <button className={`seg-btn ${template.shape === 'round' ? 'sel' : ''}`} onClick={() => onShape('round')}>◯ Redondo</button>
        </div>

        <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--muted)', margin: '16px 0 8px' }}>Aparência</h3>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onToggleDark}>
          {dark ? <><Sun size={16} /> Tema claro</> : <><Moon size={16} /> Tema escuro</>}
        </button>

        <div className="modal-actions">
          <button className="btn primary" onClick={onClose}>Pronto</button>
        </div>
      </div>
    </div>
  )
}
