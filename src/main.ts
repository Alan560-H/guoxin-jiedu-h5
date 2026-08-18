import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import uViewPro, { httpPlugin } from 'uview-pro'
import { createSSRApp } from 'vue'

import { httpInterceptor, httpRequestConfig } from '@/api/http.interceptor'
import { i18n } from '@/i18n'
import { scheduleMarkAppEmbeddedWebView } from '@/utils/appWebView'
import { captureProjectCodeFromUrl } from '@/utils/guoxin/projectCode'
import { removeLegacyShowPayFromUrl } from '@/utils/guoxin/showPay'
import { captureSourceFromUrl } from '@/utils/guoxin/source'
import theme from '@/uview-pro.theme'
import App from './App.vue'

import 'core-js/actual/array/iterator'
import 'core-js/actual/promise'
import 'core-js/actual/object/assign'
import 'core-js/actual/promise/finally'
import './common/app-webview.css'
import './common/common.css'
import './common/guoxin-theme.scss'
import './styles/guoxin-chat-theme.scss'
import '@/styles/report-html-theme.scss'
import 'uno.css'

scheduleMarkAppEmbeddedWebView()
removeLegacyShowPayFromUrl()
captureSourceFromUrl()
// 应用启动时 URL 尚完整：有 projectCode 则存，无则清
captureProjectCodeFromUrl(undefined, { clearIfAbsent: true })

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  pinia.use(createPersistedState({
    storage: sessionStorage,
  }))
  app.use(pinia)
  app.use(i18n)
  app.use(uViewPro, { theme: {
    themes: theme,
    defaultTheme: 'orange',
    defaultDarkMode: 'light',
  } })
  app.use(httpPlugin, {
    interceptor: httpInterceptor,
    requestConfig: httpRequestConfig,
  })
  return {
    app,
    pinia,
  }
}
