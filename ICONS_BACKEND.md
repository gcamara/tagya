# Backend remoto das libs de ícones (Supabase Storage) + cache local

Permite **atualizar as bibliotecas de ícones do editor subindo JSON ao Storage**,
sem publicar um novo update do app. As libs grandes (Lucide, Tabler, Material,
Font Awesome, Bootstrap, Phosphor, Remix, Heroicons, Marcas, Silhuetas, Animais,
Casa & Oficina) passam a poder ser servidas de um bucket público do Supabase,
com cache local (memória + IndexedDB) e **fallback garantido para os dados
embarcados** (`src/lib/icons/*Data.js`).

> **Etiqya** (lib core) é sempre embarcada e nunca remota — o editor abre offline.

---

## Fase 1 (este commit) — infraestrutura, não destrutiva

Nada muda no comportamento atual **até** você preencher `SUPABASE_ICONS_BASE_URL`.
Com a URL vazia (padrão), o loader usa só os dados embarcados — idêntico a hoje,
100% offline.

### Como o loader resolve `ensureLib(id)`

Ordem de resolução em `src/lib/icons/index.js` (`resolveLib`):

1. **Cache em memória** — se a lib já foi carregada nesta sessão (`DRAW[id]`), retorna na hora.
2. **Remoto desativado?** Se `SUPABASE_ICONS_BASE_URL` está vazia → vai direto ao passo 5 (embarcado).
3. **Manifest** — baixa `<base>/manifest.json` para descobrir a **versão** alvo da lib.
4. **Cache persistente (IndexedDB)** — procura `id@version`. Se achar, reconstrói a fábrica de desenho e retorna.
5. **Fetch remoto** — baixa `<base>/<id>.json`, reconstrói a fábrica, **grava no cache** (`id@version`) e remove versões antigas (`prune`).
6. **Fallback embarcado** — se qualquer passo remoto falhar (offline, 404, JSON inválido), usa `*Data.js` do bundle.

A chave de cache inclui a versão (`id@version`), então uma versão nova **invalida**
automaticamente a antiga. O wrapper de IndexedDB (`src/lib/icons/iconCache.js`) é
no-op gracioso quando `indexedDB` não existe — nunca quebra.

### Formato do JSON por lib

Cada `<id>.json` (gerado pelo conversor) tem exatamente:

```json
{ "id": "lucide", "version": 1, "kind": "strokeNodes", "data": { ... } }
```

- `kind` ∈ `strokeNodes` | `singlePaths` | `faPaths` | `fillPaths` (espelha as fábricas do loader).
- `vb` (número) está presente quando `kind === "fillPaths"` (viewBox). Ex.: `bootstrap` → `vb: 16`.
- `data` é o mesmo objeto exportado pelo `*Data.js` correspondente.

E o `manifest.json`:

```json
{ "lucide": 1, "tabler": 1, "mdi": 1, "...": 1 }
```

---

## Passo a passo para ligar o remoto

### 1. Criar/reusar um projeto Supabase

- Acesse https://supabase.com/dashboard, crie um projeto (ou reuse um existente).
- Anote o **Project URL** (`https://<ref>.supabase.co`) e a **service_role key**
  em *Project Settings → API*. A service_role key é **secreta** — só usada no
  upload (servidor/sua máquina), nunca no app.

### 2. Criar o bucket público `icons`

- Em *Storage → New bucket*, nome `icons`, marque **Public bucket**.
- Bucket público porque o app lê sem credencial via
  `…/storage/v1/object/public/icons/<arquivo>`.

### 3. Gerar os JSONs locais

```bash
node scripts/convert-icons-to-json.mjs
```

Lê os `src/lib/icons/*Data.js` e escreve `dist-icons/<id>.json` + `dist-icons/manifest.json`.

Para subir **uma versão nova** de uma lib específica (incrementa a versão dela
no manifest, mantendo as outras):

```bash
node scripts/convert-icons-to-json.mjs --bump=lucide
```

(também dá para fixar versões à mão editando `ICON_VERSIONS` no script.)

### 4. Subir para o Storage

Defina os segredos por **variável de ambiente** (nunca commitados):

```bash
# bash / Linux / macOS
export SUPABASE_URL="https://<ref>.supabase.co"
export SUPABASE_SERVICE_KEY="<service_role_key>"
export SUPABASE_ICONS_BUCKET="icons"      # opcional, padrão "icons"
node scripts/upload-icons-supabase.mjs
```

```powershell
# Windows PowerShell
$env:SUPABASE_URL = "https://<ref>.supabase.co"
$env:SUPABASE_SERVICE_KEY = "<service_role_key>"
$env:SUPABASE_ICONS_BUCKET = "icons"       # opcional
node scripts/upload-icons-supabase.mjs
```

O script sobe os JSONs das libs primeiro e o `manifest.json` **por último**
(upsert), para que um cliente nunca leia um manifest com versão nova antes do
JSON correspondente existir. Ao final ele imprime o valor exato de
`SUPABASE_ICONS_BASE_URL`.

### 5. Apontar o app para o bucket

Em `src/lib/icons/remoteConfig.js`, preencha (sem barra final):

```js
export const SUPABASE_ICONS_BASE_URL = 'https://<ref>.supabase.co/storage/v1/object/public/icons'
```

Pronto. No próximo carregamento de cada lib, o app baixa do Storage, cacheia em
IndexedDB e usa o embarcado só como rede de segurança.

### Variáveis de ambiente (resumo)

| Variável | Onde | Para quê |
|---|---|---|
| `SUPABASE_URL` | upload script (env) | URL do projeto, ex. `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | upload script (env) | service_role key (secreta) p/ escrever no bucket |
| `SUPABASE_ICONS_BUCKET` | upload script (env, opcional) | nome do bucket (padrão `icons`) |
| `SUPABASE_ICONS_BASE_URL` | `remoteConfig.js` (constante no app) | base pública de leitura; vazia = só embarcado |

---

## Fluxo de atualização (depois de ligado)

1. Regenerar dados embarcados (se for o caso) com os scripts `bake-*.mjs` existentes.
2. `node scripts/convert-icons-to-json.mjs --bump=<id>` para a(s) lib(s) que mudaram.
3. `node scripts/upload-icons-supabase.mjs`.
4. Clientes pegam a versão nova no próximo load (o manifest muda a versão → cache antigo é ignorado e re-baixado).

Nenhuma republicação de app é necessária para trocar o conteúdo das libs já registradas.

---

## Fase 2 (futura, opcional) — encolher o bundle

Hoje os `*Data.js` continuam **embarcados** (fallback seguro). Quando o backend
remoto estiver validado em produção, dá para **remover os dados pesados do
bundle** das libs grandes para reduzir o tamanho do app:

1. Trocar os imports estáticos de `*Data.js` em `index.js` por um carregamento
   sob demanda (ou remover do `BUNDLED` as libs que passam a ser só-remotas).
2. Manter embarcadas apenas Etiqya + talvez 1–2 libs essenciais para uso offline.

**Tradeoff:** o **primeiro** uso de cada lila remota passa a exigir rede (uma vez).
Depois disso fica em cache (IndexedDB) e funciona offline. Libs sem fallback
embarcado não aparecem se o usuário nunca teve rede — por isso a Fase 2 deve
manter offline pelo menos o núcleo (Etiqya). O ganho é um bundle bem menor
(a maior parte do peso de ícones — ex. `gameData.js` ~2,3 MB — sai do app).

---

## Arquivos

- `src/lib/icons/remoteConfig.js` — config do remoto (`SUPABASE_ICONS_BASE_URL`, manifest).
- `src/lib/icons/iconCache.js` — wrapper IndexedDB (get/put/prune), no-op gracioso.
- `src/lib/icons/index.js` — loader com cadeia memória → IndexedDB → remoto → embarcado. API pública inalterada.
- `scripts/convert-icons-to-json.mjs` — gera `dist-icons/*.json` + `manifest.json`.
- `scripts/upload-icons-supabase.mjs` — sobe `dist-icons/*` para o bucket (env-driven, sem SDK).
