import type { WxPayCreateParam, WxPayOrderInput } from '@/models/weixin'
import { createWxPayOrder } from '@/api/guoxin'
import { buildCreditsPayReturnUrl } from '@/utils/guoxin/h5RouterBase'
import { isWeChatBrowser } from '@/utils/weixin/env'
import { resolveH5ScenceType } from '@/utils/weixin/h5ScenceType'

/** 已跳转到尚德第三方收银台。 */
export type WxPayRedirect = 'pay_redirect'

/** @deprecated 请使用 WxPayRedirect。 */
export type WxPayMwebRedirect = WxPayRedirect

/** 保留新接口声明的原请求参数格式，但不执行任何微信支付唤起。 */
function buildSunlandPayParam(productId: number): WxPayCreateParam {
  if (isWeChatBrowser())
    return { productId, payChannel: 'jsapi' }

  return {
    productId,
    payChannel: 'mweb',
    h5ScenceType: resolveH5ScenceType(),
    redirectUrl: buildCreditsPayReturnUrl(),
  }
}

/** 创建尚德支付订单，并直接跳转接口返回的第三方收银台。 */
export async function wxPay(param: WxPayOrderInput): Promise<WxPayRedirect> {
  uni.showLoading({ title: '创建订单...', mask: true })
  try {
    const res = await createWxPayOrder(buildSunlandPayParam(param.productId))
    if (res.code !== 200 || !res.data) {
      const msg = typeof res.msg === 'string' && res.msg.trim()
        ? res.msg.trim()
        : 'pay_create_failed'
      throw new Error(msg)
    }

    const redirectUrl = res.data.getOpenIdUrl
    if (!redirectUrl)
      throw new Error('pay_redirect_url_missing')

    window.location.href = redirectUrl
    return 'pay_redirect'
  }
  finally {
    uni.hideLoading()
  }
}

const PAY_KNOWN_ERRORS: Record<string, string> = {
  pay_create_failed: '创建订单失败，请稍后重试',
  pay_redirect_url_missing: '未获取到支付跳转地址，请稍后重试',
}

export function formatWxPayError(err: unknown): string {
  const code = err instanceof Error ? err.message : ''
  if (code && PAY_KNOWN_ERRORS[code])
    return PAY_KNOWN_ERRORS[code]

  if (err && typeof err === 'object') {
    const msg = (err as { msg?: unknown }).msg
    if (typeof msg === 'string' && msg.trim())
      return msg.trim()
  }
  if (err instanceof Error && err.message.trim())
    return err.message.trim()

  return '支付失败，请稍后重试'
}

/** @deprecated 请使用 formatWxPayError。 */
export const formatMwebPayError = formatWxPayError
