/**
 * Generate src/utils/meihua/guaExplain/index.ts from meihua/about/explain/js/index.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const indexPath = path.join(root, 'meihua/about/explain/js/index.js')
const outPath = path.join(root, 'src/utils/meihua/guaExplain/index.ts')

const src = fs.readFileSync(indexPath, 'utf8')

const ifRe = /if\s*\(\s*"([^"]+)"\s*==\s*qi\s*\)\s*(?:var\s+)?oi\s*=\s*([\w$]+)\.dataList/g
const reqRe = /var\s+([\w$]+)\s*=\s*require\("\.\/([^"]+)"\)/g

/** @type {Map<string, string>} guapath -> variable */
const guaToVar = new Map()
for (const m of src.matchAll(ifRe))
  guaToVar.set(m[1], m[2])

/** @type {Map<string, string>} variable -> file base */
const varToFile = new Map()
for (const m of src.matchAll(reqRe))
  varToFile.set(m[1], m[2].replace(/\.js$/u, ''))

const lines = []
lines.push(`import type { MeiHuaGuaExplainDataList } from './types'`)
lines.push('')

const usedFiles = new Set()
for (const [, v] of guaToVar) {
  const file = varToFile.get(v)
  if (!file)
    throw new Error(`No require for var ${v}`)
  usedFiles.add(file)
}

for (const file of [...usedFiles].sort()) {
  const alias = `g_${file.replace(/[^a-z0-9]/giu, '_')}`
  lines.push(`import { dataList as ${alias} } from './${file}'`)
}

lines.push('')
lines.push('/** 六十四卦 guapath → 卦爻辞数据 */')
lines.push('export const MEI_HUA_GUA_EXPLAIN: Record<string, MeiHuaGuaExplainDataList> = {')

const keys = [...guaToVar.keys()].sort()
for (const gua of keys) {
  const v = guaToVar.get(gua)
  const file = varToFile.get(v)
  const alias = `g_${file.replace(/[^a-z0-9]/giu, '_')}`
  lines.push(`  '${gua}': ${alias},`)
}

lines.push('}')
lines.push('')
lines.push('const DEFAULT_PATH = \'qianqian\'')
lines.push('')
lines.push('export function getMeihuaGuaExplain(guapath: string): MeiHuaGuaExplainDataList {')
lines.push('  const key = guapath && MEI_HUA_GUA_EXPLAIN[guapath] ? guapath : DEFAULT_PATH')
lines.push('  if (key !== guapath && guapath)')
lines.push('    console.warn(\'[meihua] unknown guapath, fallback:\', guapath)')
lines.push('  return MEI_HUA_GUA_EXPLAIN[key]!')
lines.push('}')
lines.push('')

fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log('wrote', outPath, 'keys', keys.length)
