import type { H5ScenceType } from '@/models/weixin'
import { isAppEmbeddedWebView } from '@/utils/appWebView'

function detectMobileOs(): 'ios' | 'android' | null {
  if (typeof navigator === 'undefined')
    return null
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua))
    return 'ios'
  if (/Android/i.test(ua))
    return 'android'
  return null
}

/**
 * MWEB 场景类型（后端 h5ScenceType）：
 * - Wap：PC 或手机普通浏览器
 * - iOS / Android：App 内嵌 WebView（含 ?source=1 / ?inApp=1，见 appWebView.ts）
 */
export function resolveH5ScenceType(): H5ScenceType {
  const os = detectMobileOs()
  if (isAppEmbeddedWebView()) {
    if (os === 'ios')
      return 'iOS'
    if (os === 'android')
      return 'Android'
  }
  return 'Wap'
}
