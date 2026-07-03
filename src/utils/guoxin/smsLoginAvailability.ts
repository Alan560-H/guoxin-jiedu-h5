import { SMS_LOGIN_ENABLED } from '@/constants/guoxin'
import { isAppEmbeddedWebView } from '@/utils/appWebView'

function isNonWeChatBrowser(): boolean {
  if (typeof navigator === 'undefined')
    return false
  return !/MicroMessenger/i.test(navigator.userAgent)
}

/**
 * 允许短信验证码登录：
 * - 全局开关 SMS_LOGIN_ENABLED
 * - App 内嵌 WebView
 * - 非微信 H5（外链浏览器，配合 MWEB 支付）
 */
export function isSmsLoginAvailable(): boolean {
  if (SMS_LOGIN_ENABLED)
    return true
  if (isAppEmbeddedWebView())
    return true
  return isNonWeChatBrowser()
}
