/** 取消微信系统字体大小对 H5 页面的影响 */
export function fixWeixinFontsizeByWxOS(): void {
  if (typeof window === 'undefined')
    return

  const bridge = (window as Window & {
    WeixinJSBridge?: {
      invoke: (method: string, params: Record<string, unknown>, callback?: () => void) => void
      on: (event: string, callback: () => void) => void
    }
  }).WeixinJSBridge

  function handleFontSize() {
    bridge?.invoke('setFontSizeCallback', { fontSize: 0 })
    bridge?.on('menu:setfont', () => {
      bridge?.invoke('setFontSizeCallback', { fontSize: 0 })
    })
  }

  if (typeof bridge === 'object' && typeof bridge.invoke === 'function') {
    handleFontSize()
  }
  else {
    document.addEventListener('WeixinJSBridgeReady', handleFontSize, false)
  }
}
