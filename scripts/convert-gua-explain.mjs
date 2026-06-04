import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcDir = path.join(root, 'meihua/about/explain/js')
const outDir = path.join(root, 'src/utils/meihua/guaExplain')

fs.mkdirSync(outDir, { recursive: true })

for (const f of fs.readdirSync(srcDir)) {
  if (f === 'index.js')
    continue
  if (!f.endsWith('.js'))
    continue
  let s = fs.readFileSync(path.join(srcDir, f), 'utf8')
  s = s.replace(/module\.exports\s*=\s*\{\s*dataList:\s*/s, 'export const dataList = ')
  s = s.replace(/\r?\n\s*\}\s*;\s*$/s, ';')
  const out = f.replace(/\.js$/u, '.ts')
  fs.writeFileSync(path.join(outDir, out), s, 'utf8')
}

const n = fs.readdirSync(outDir).filter(x => x.endsWith('.ts')).length
console.log('written', n, 'ts files')
