import type { WxPayCreateVo, WxPayMwebCreateVo, WxPayOrderInput, WxPayParamsVo } from '@/models/weixin'
import { wxAppId } from '@/api/env'
import { createWxPayOrder } from '@/api/guoxin'
import { buildCreditsPayReturnUrl } from '@/utils/guoxin/h5RouterBase'
import { isWeChatBrowser, OPEN_IN_WECHAT_MESSAGE } from '@/utils/weixin/env'
import { resolveH5ScenceType } from '@/utils/weixin/h5ScenceType'

interface WeixinJSBridgeInvokeResult {
  err_msg?: string
}

interface WeixinJSBridge {
  invoke: (
    method: 'getBrandWCPayRequest',
    params: WxPayParamsVo,
    callback: (res: WeixinJSBridgeInvokeResult) => void,
  ) => void
}

declare global {
  interface Window {
    WeixinJSBridge?: WeixinJSBridge
  }
}

/** 已跳转到微信 H5 收银台。 */
export type WxPayRedirect = 'pay_redirect'

/** @deprecated 请使用 WxPayRedirect。 */
export type WxPayMwebRedirect = WxPayRedirect

function resolveWxPayPackage(data: Record<string, unknown>): string {
  const direct = data.package
  if (direct != null && String(direct).length > 0)
    return String(direct)
  const raw = data.prepay_id ?? data.prepayId
  if (raw == null || raw === '' || raw === 'null')
    return ''
  const prepay = String(raw)
  return prepay.startsWith('prepay_id=') ? prepay : `prepay_id=${prepay}`
}

function normalizeJsapiPayParams(data: WxPayCreateVo | WxPayMwebCreateVo): WxPayParamsVo {
  const raw = data as unknown as Record<string, unknown>
  const params = {
    appId: String(raw.appId ?? wxAppId),
    timeStamp: String(raw.timeStamp ?? raw.timestamp ?? ''),
    nonceStr: String(raw.nonceStr ?? raw.nonce_str ?? ''),
    package: resolveWxPayPackage(raw),
    signType: String(raw.signType ?? raw.sign_type ?? 'RSA'),
    paySign: String(raw.paySign ?? raw.pay_sign ?? ''),
  }
  if (!params.appId || !params.timeStamp || !params.nonceStr || !params.package || !params.paySign)
    throw new Error('invalid_jsapi_params')
  return params
}

/** 优先读取后端约定的 h5_url，并兼容历史 H5 支付字段。 */
function pickH5PayUrl(raw: Record<string, unknown>): string {
  const url = raw.h5_url ?? raw.h5Url ?? raw.mweb_url ?? raw.mwebUrl
  return url != null ? String(url) : ''
}

function extractH5PayUrl(data: WxPayCreateVo | WxPayMwebCreateVo): string {
  const raw = data as unknown as Record<string, unknown>
  const direct = pickH5PayUrl(raw)
  if (direct)
    return direct
  for (const key of ['res_data', 'resData', 'response'] as const) {
    const nested = raw[key]
    if (nested && typeof nested === 'object') {
      const url = pickH5PayUrl(nested as Record<string, unknown>)
      if (url)
        return url
    }
  }
  return ''
}

function invokeWeixinPay(params: WxPayParamsVo): Promise<void> {
  return new Promise((resolve, reject) => {
    const onBridgeReady = () => {
      const bridge = window.WeixinJSBridge
      if (!bridge) {
        reject(new Error('no_weixin_bridge'))
        return
      }
      bridge.invoke('getBrandWCPayRequest', params, (res) => {
        const msg = res.err_msg ?? ''
        if (msg.includes(':ok'))
          resolve()
        else if (msg.includes(':cancel'))
          reject(new Error('cancel'))
        else
          reject(new Error('pay_fail'))
      })
    }
    if (window.WeixinJSBridge)
      onBridgeReady()
    else
      document.addEventListener('WeixinJSBridgeReady', onBridgeReady, { once: true })
  })
}

/** 微信内走 JSAPI，其他浏览器/WebView 读取 h5_url 进入 H5 收银台。 */
export async function wxPay(param: WxPayOrderInput): Promise<void | WxPayRedirect> {
  uni.showLoading({ title: '创建订单...', mask: true })
  try {
    const inWeChat = isWeChatBrowser()
    const res = await createWxPayOrder(inWeChat
      ? { productId: param.productId, payChannel: 'jsapi' }
      : {
          productId: param.productId,
          payChannel: 'mweb',
          h5ScenceType: resolveH5ScenceType(),
          redirectUrl: buildCreditsPayReturnUrl(),
        })
    if (res.code !== 200 || !res.data) {
      const msg = typeof res.msg === 'string' && res.msg.trim()
        ? res.msg.trim()
        : 'pay_create_failed'
      throw new Error(msg)
    }

    if (inWeChat)
      return await invokeWeixinPay(normalizeJsapiPayParams(res.data))

    const h5Url = extractH5PayUrl(res.data)
    if (!h5Url)
      throw new Error('h5_url_missing')
    window.location.href = h5Url
    return 'pay_redirect'
  }
  finally {
    uni.hideLoading()
  }
}

const PAY_KNOWN_ERRORS: Record<string, string> = {
  not_wechat: OPEN_IN_WECHAT_MESSAGE,
  no_weixin_bridge: '微信支付环境未就绪，请稍后重试',
  cancel: '已取消支付',
  pay_fail: '支付失败，请稍后重试',
  pay_create_failed: '创建订单失败，请稍后重试',
  h5_url_missing: '未获取到 H5 支付链接，请稍后重试',
  invalid_jsapi_params: '支付参数不完整，请稍后重试',
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
