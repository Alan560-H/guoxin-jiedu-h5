import { fileURLToPath, URL } from 'node:url'

import Uni from '@uni-helper/plugin-uni'
import Components from '@uni-helper/vite-plugin-uni-components'
import { uViewProResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'
import UniMiddleware from '@uni-helper/vite-plugin-uni-middleware'
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'
import UniPlatformModifier from '@uni-helper/vite-plugin-uni-platform-modifier'
import UniRoot from '@uni-ku/root'
import UnoCSS from 'unocss/vite'
import { guoxinDevProxyTarget } from './src/api/devProxy'
import { PROD_WX_APP_ID } from './src/constants/weixin'
import { defineConfig, loadEnv } from 'vite'

function assertProductionWeixinEnv(mode: string, env: Record<string, string>) {
  if (mode !== 'production')
    return

  const appId = env.VITE_WX_APP_ID
  if (!appId) {
    throw new Error('生产构建缺少 VITE_WX_APP_ID，请在 .env.production 中配置正式 AppId')
  }
  if (appId !== PROD_WX_APP_ID) {
    throw new Error(
      `生产构建 AppId 必须为 ${PROD_WX_APP_ID}，当前为 ${appId}（请检查 .env.production）`,
    )
  }
  if (env.VITE_OAUTH_REDIRECT_URI) {
    throw new Error('生产构建不得设置 VITE_OAUTH_REDIRECT_URI，OAuth 应使用地址栏 URL')
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  assertProductionWeixinEnv(mode, env)

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 9999, // 端口（保留）
      host: '0.0.0.0', // 替代 disableHostCheck: true，允许外部访问
      proxy: {
        '/app-api': {
          target: 'https://paipanapp.yipuwh.com',
          changeOrigin: true,
          secure: false,
        },
        '/prod-api/api/yiqixue/app/guoxin': {
          target: guoxinDevProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/prod-api/, ''),
        },

        '/test-api': {
          target: 'https://test-app.yipuwh.com',
          changeOrigin: true,
          secure: false,
        },
        '/care-api': {
          target: 'https://care.yipuwenhua.com',
          changeOrigin: true,
          secure: false,
        },

      },
    },
    plugins: [
      // https://uni-helper.js.org/vite-plugin-uni-components
      Components({
        dts: true,
        resolvers: [uViewProResolver()],
      }),
      // https://uni-helper.js.org/vite-plugin-uni-pages
      UniPages(),
      // https://uni-helper.js.org/vite-plugin-uni-layouts
      UniLayouts(),
      // https://uni-helper.js.org/vite-plugin-uni-manifest
      UniManifest(),
      // https://uni-helper.js.org/vite-plugin-uni-platform
      UniPlatform(),
      // https://uni-helper.js.org/vite-plugin-uni-platform-modifier
      UniPlatformModifier(),
      // https://uni-helper.js.org/vite-plugin-uni-middleware
      UniMiddleware(),
      // https://github.com/uni-ku/root
      UniRoot(),
      // https://uni-helper.js.org/plugin-uni
      Uni(),
      UnoCSS(),
    ],
    build: {
      target: 'es6',
      cssTarget: 'chrome61',
    },
    optimizeDeps: {
      exclude: [
        'vue-demi',
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "uview-pro/theme.scss";',
        },
      },
    },
  }
})
