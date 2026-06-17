/**
 * UniRoot / uni-layouts 在 Vite 启动时会同步读取 src/pages.json。
 * 若文件为空（例如 UniPages 重写瞬间），会抛 Cannot read properties of undefined (reading 'pages')。
 * 本脚本在 dev/build 前保证 pages.json 至少为合法 JSON；完整路由仍由 pages.config.ts 生成。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const pagesJsonPath = join(process.cwd(), 'src', 'pages.json')

const FALLBACK = {
  pages: [
    {
      path: 'pages/index',
      type: 'home',
      layout: 'guoxin',
      style: { navigationBarTitleText: '国心解读' },
    },
  ],
  globalStyle: {
    backgroundColor: '#FAF6EF',
    navigationBarBackgroundColor: '#1E3F35',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '国心解读 H5',
    navigationStyle: 'custom',
  },
  subPackages: [],
}

function isValidPagesJson(raw) {
  if (!raw?.trim())
    return false
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data?.pages)
  }
  catch {
    return false
  }
}

function main() {
  const raw = existsSync(pagesJsonPath) ? readFileSync(pagesJsonPath, 'utf-8') : ''
  if (isValidPagesJson(raw))
    return

  writeFileSync(pagesJsonPath, `${JSON.stringify(FALLBACK, null, 2)}\n`, 'utf-8')
  console.warn('[ensure-pages-json] src/pages.json 无效或为空，已写入最小占位；启动后 UniPages 会按 pages.config.ts 重新生成。')
}

main()
