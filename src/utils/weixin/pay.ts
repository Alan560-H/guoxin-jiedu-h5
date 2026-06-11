import type { WxPayCreateParam, WxPayMwebVo } from '@/models/weixin'
import { createWxPayOrder } from '@/api/guoxin'

function extractMwebUrl(data: WxPayMwebVo | Record<string, unknown>): string {
  const raw = data as Record<string, unknown>
  if (raw.timeStamp && raw.paySign)
    throw new Error('backend_jsapi_response')

  const url = raw.mwebUrl
    ?? raw.mweb_url
    ?? raw.h5Url
    ?? raw.h5_url
    ?? raw.payUrl
  if (typeof url === 'string' && /^https?:\/\//.test(url))
    return url
  throw new Error('invalid_mweb_url')
}

/** 当前页 URL（不含 hash），用作 H5 支付回跳 */
export function getMwebReturnUrl(): string {
  if (typeof window === 'undefined')
    return ''
  return window.location.href.split('#')[0]
}

/** 微信 H5 支付（MWEB）：下单后跳转 mweb_url，在微信 App 内完成支付 */
export async function wxMwebPay(param: WxPayCreateParam): Promise<void> {
  uni.showLoading({ title: '创建订单...', mask: true })
  try {
    const res = await createWxPayOrder({
      productId: param.productId,
      openId: param.openId || undefined,
      returnUrl: param.returnUrl || getMwebReturnUrl(),
    })
    uni.hideLoading()

    const mwebUrl = extractMwebUrl(res.data)
    uni.showToast({ title: '正在跳转微信支付…', icon: 'none', duration: 1500 })

    // #ifdef H5
    window.location.href = mwebUrl
    // #endif

    // #ifndef H5
    return Promise.reject(new Error('mweb_h5_only'))
    // #endif
  }
  catch (e) {
    uni.hideLoading()
    throw e
  }
}

/** @deprecated 请用 wxMwebPay（MWEB 手机网站支付） */
export const wxChoosePay = wxMwebPay

export function formatMwebPayError(err: unknown): string {
  const code = err instanceof Error ? err.message : ''
  if (code === 'backend_jsapi_response')
    return '后端仍返回 JSAPI 参数，请 Java 改为 MWEB 并返回 mweb_url'
  if (code === 'invalid_mweb_url')
    return '未收到 mweb_url，请确认 pay/create 已对接 H5 支付'
  if (code === 'mweb_h5_only')
    return 'H5 支付仅支持浏览器环境'
  return '支付失败，请稍后重试'
}
