/**
 * Parse meihua/about/about.vue list → TS module (run once if source changes)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const aboutVue = fs.readFileSync(path.join(root, 'meihua/about/about.vue'), 'utf8')

const listMatch = aboutVue.match(/list:\s*\[([\s\S]*?)\]\s*\}\s*\}/)
if (!listMatch)
  throw new Error('list not found')

const block = listMatch[1]
const items = []
const topRe = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*open:\s*![01],\s*pages:\s*\[([\s\S]*?)\]\s*\}/g
let m
while ((m = topRe.exec(block)) !== null) {
  const [, id, name, pagesBlock] = m
  const pages = []
  const pageRe = /\{\s*zh:\s*"([^"]+)",\s*url:[^,]+,\s*img:\s*'([^']+)'\s*\}/g
  let pm
  while ((pm = pageRe.exec(pagesBlock)) !== null)
    pages.push({ zh: pm[1], guapath: pm[2] })

  items.push({ id, name, pages })
}

const out = `/** 八宫六十四盘列表（由 meihua/about/about.vue 生成，勿手改） */
export interface MeiHuaAboutGuaPage {
  zh: string
  guapath: string
}

export interface MeiHuaAboutPalace {
  id: string
  name: string
  pages: MeiHuaAboutGuaPage[]
}

export const MEI_HUA_ABOUT_GUA_LIST: MeiHuaAboutPalace[] = ${JSON.stringify(items, null, 2)}
`

const outPath = path.join(root, 'src/utils/meihua/aboutGuaList.ts')
fs.writeFileSync(outPath, out, 'utf8')
console.log('palaces', items.length, 'total pages', items.reduce((s, x) => s + x.pages.length, 0))
