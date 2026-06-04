/** App 内嵌 WebView（Flutter inappwebview 等），与 http 拦截器共用 */
export function isAppEmbeddedWebView(): boolean {
  if (typeof window === 'undefined')
    return false
  if (window.flutter_inappwebview)
    return true
  try {
    const q = new URLSearchParams(window.location.search)
    if (q.get('embedded') === '1' || q.get('inApp') === '1')
      return true
  }
  catch {
    /* ignore */
  }
  return false
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
