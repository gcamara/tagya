// Configuração do backend remoto das libs de ícones (Supabase Storage).
//
// Fase 1 (atual): infraestrutura NÃO destrutiva. Com `SUPABASE_ICONS_BASE_URL`
// VAZIA o loader PULA o remoto e usa exclusivamente os dados embarcados
// (*Data.js) — comportamento idêntico ao de hoje, 100% offline.
//
// Para ligar o remoto, aponte para a pasta PÚBLICA do bucket onde estão os
// arquivos gerados por scripts/convert-icons-to-json.mjs (manifest.json + um
// JSON por lib). Exemplo de URL pública de um bucket Supabase Storage:
//
//   https://<PROJECT_REF>.supabase.co/storage/v1/object/public/icons
//
// O loader então busca:
//   <base>/manifest.json     -> { "lucide": 3, "tabler": 1, ... }
//   <base>/<id>.json         -> { id, version, kind, vb?, data }

// Base pública do storage. VAZIO => remoto desativado (usa bundled). SEM barra final.
export const SUPABASE_ICONS_BASE_URL = ''

// Nome do manifest de versões dentro da base.
export const ICONS_MANIFEST_NAME = 'manifest.json'

// true quando há um backend remoto configurado.
export const remoteEnabled = () =>
  typeof SUPABASE_ICONS_BASE_URL === 'string' && SUPABASE_ICONS_BASE_URL.trim().length > 0

const trimSlash = (s) => String(s || '').replace(/\/+$/, '')

// URL completa do manifest, ou null se remoto desativado.
export const manifestUrl = () =>
  remoteEnabled() ? `${trimSlash(SUPABASE_ICONS_BASE_URL)}/${ICONS_MANIFEST_NAME}` : null

// URL completa do JSON de uma lib, ou null se remoto desativado.
export const libUrl = (id) =>
  remoteEnabled() ? `${trimSlash(SUPABASE_ICONS_BASE_URL)}/${id}.json` : null
