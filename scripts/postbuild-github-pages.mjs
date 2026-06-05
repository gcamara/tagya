import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const indexPath = join(dist, 'index.html')

if (!existsSync(indexPath)) {
  console.error('dist/index.html nao encontrado. Rode npm run build:web primeiro.')
  process.exit(1)
}

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
let basePath = process.env.BASE_PATH || (repoName ? `/${repoName}` : '')

// Git Bash/MSYS can rewrite env values like "/tagya" to "C:/Program Files/Git/tagya"
// when npm spawns Node on Windows. Convert that back to the intended URL path.
basePath = basePath.replace(/^[A-Z]:\/Program Files\/Git/i, '')
if (basePath && !basePath.startsWith('/')) basePath = `/${basePath}`
basePath = basePath.replace(/\/$/, '')

let html = readFileSync(indexPath, 'utf8')

if (basePath) {
  html = html
    .replaceAll('href="/', `href="${basePath}/`)
    .replaceAll('src="/', `src="${basePath}/`)
}

writeFileSync(indexPath, html)
copyFileSync(indexPath, join(dist, '404.html'))
writeFileSync(join(dist, '.nojekyll'), '')

console.log(`GitHub Pages preparado${basePath ? ` com base path ${basePath}` : ''}.`)
