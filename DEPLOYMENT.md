# Deploy

## GitHub Pages

Este repo esta preparado para publicar o web build do Expo pelo GitHub Actions.

1. Garanta que o repo exista no GitHub e que este clone tenha `origin` configurado.
2. No GitHub, abra `Settings > Pages`.
3. Em `Build and deployment`, escolha `Source: GitHub Actions`.
4. Faça push para `master` ou `main`.

O workflow `.github/workflows/deploy-pages.yml` roda:

```bash
npm ci
npm run build:web
npm run postbuild:github-pages
```

O script de pos-build ajusta os assets para o path do repo, por exemplo `/tagya`, cria
`.nojekyll` e copia `index.html` para `404.html` para fallback de SPA.

## Build local

```bash
npm run build:web
$env:BASE_PATH="/tagya"; npm run postbuild:github-pages
```

Se usar dominio customizado apontando para a raiz do site, rode o pos-build com
`BASE_PATH` vazio.
