import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { createMockDb } from './db'
import { handleGuoxinMock } from './handlers'

export function guoxinMockPlugin(): Plugin {
  let db = createMockDb()

  return {
    name: 'guoxin-mock',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      if (env.VITE_USE_MOCK !== 'true')
        return

      process.env.VITE_MOCK_OPENID = env.VITE_MOCK_OPENID || 'mock_o_dev'
      db = createMockDb()

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/prod-api/app/guoxin'))
          return next()

        const parsed = new URL(url, 'http://localhost')
        const handled = await handleGuoxinMock(req, res, db, parsed.pathname.replace('/prod-api', ''), parsed.searchParams)
        if (handled)
          return
        next()
      })
    },
  }
}
