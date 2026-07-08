import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import uViewPro, { httpPlugin } from 'uview-pro'
import { createSSRApp } from 'vue'

import { httpInterceptor, httpRequestConfig } from '@/api/http.interceptor'
import theme from '@/uview-pro.theme'
import App from './App.vue'

import 'core-js/actual/array/iterator'
import 'core-js/actual/promise'
import 'core-js/actual/object/assign'
import 'core-js/actual/promise/finally'
import './common/app-webview.css'
import './common/common.css'
import './common/guoxin-theme.scss'
import '@/styles/report-html-theme.scss'
import 'uno.css'
import { i18n } from '@/i18n'
import { scheduleMarkAppEmbeddedWebView } from '@/utils/appWebView'
import { captureSourceFromUrl } from '@/utils/guoxin/source'

scheduleMarkAppEmbeddedWebView()
captureSourceFromUrl()

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
