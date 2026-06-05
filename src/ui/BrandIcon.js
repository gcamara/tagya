// Logo TagYa — Direção C (do Claude Design): etiqueta apontando à esquerda com
// gradiente roxo→coral e "Ya" + furo vazados (knockout). Fonte do "Ya": Baloo 2.
const TAG = 'M44 20 H92 a16 16 0 0 1 16 16 V84 a16 16 0 0 1 -16 16 H44 L14 60 Z'

export default function BrandIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-label="TagYa">
      <defs>
        <linearGradient id="tgGradBrand" x1="0.146" y1="0.146" x2="0.854" y2="0.854">
          <stop offset="0" stopColor="#7C5CFF" />
          <stop offset="1" stopColor="#FF6B6B" />
        </linearGradient>
        <mask id="tgMaskBrand" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <path d={TAG} fill="#fff" />
          <circle cx="28" cy="60" r="4.8" fill="#000" />
          <text x="71" y="61" fill="#000" fontFamily="'Baloo 2','Segoe UI',sans-serif" fontWeight="800" fontSize="47" letterSpacing="-1" textAnchor="middle" dominantBaseline="central">Ya</text>
        </mask>
      </defs>
      <path d={TAG} fill="url(#tgGradBrand)" mask="url(#tgMaskBrand)" />
    </svg>
  )
}
