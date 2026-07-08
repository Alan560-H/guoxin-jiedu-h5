import { SOURCE_ENTRY_QUERY_VALUE } from '@/constants/guoxin'

/** 同 tab 内 SPA 路由跳转后 URL query 会丢失，用 session 保持 App 内嵌识别 */
const APP_EMBEDDED_SESSION_KEY = 'guoxin-app-embedded'

function readUrlAppEmbeddedSignal(): boolean {
  try {
    const q = new URLSearchParams(window.location.search)
    if (q.get('embedded') === '1' || q.get('inApp') === '1')
      return true
    // 轻舟 App 发现页入口 ?source=1 视同 App 内嵌（与 inApp=1 等价）
    if (q.get('source') === SOURCE_ENTRY_QUERY_VALUE)
      return true
  }
  catch {
    /* ignore */
  }
  return false
}

function persistAppEmbeddedWebView(): void {
  try {
    sessionStorage.setItem(APP_EMBEDDED_SESSION_KEY, '1')
  }
  catch {
    /* ignore */
  }
}

function hasPersistedAppEmbeddedWebView(): boolean {
  try {
    return sessionStorage.getItem(APP_EMBEDDED_SESSION_KEY) === '1'
  }
  catch {
    return false
  }
}

/** App 内嵌 WebView（Flutter inappwebview、轻舟 source=1/inApp=1 等），与 http 拦截器共用 */
export function isAppEmbeddedWebView(): boolean {
  if (typeof window === 'undefined')
    return false
  if (window.flutter_inappwebview) {
    persistAppEmbeddedWebView()
    return true
  }
  if (readUrlAppEmbeddedSignal()) {
    persistAppEmbeddedWebView()
    return true
  }
  return hasPersistedAppEmbeddedWebView()
}

/** 在 document 上打标，供全局 CSS 隐藏 H5 顶栏 / 安全区占位 */
export function markAppEmbeddedWebView(): void {
  if (!isAppEmbeddedWebView())
    return
  document.documentElement.classList.add('in-app-webview')
  document.body?.classList.add('in-app-webview')
}

/** Flutter 桥可能晚于首屏注入，短时重试打标 */
export function scheduleMarkAppEmbeddedWebView(): void {
  markAppEmbeddedWebView()
  if (isAppEmbeddedWebView())
    return
  const delays = [0, 100, 300, 800]
  delays.forEach((ms) => {
    setTimeout(markAppEmbeddedWebView, ms)
  })
}
