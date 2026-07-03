import type { WxPayCreateVo, WxPayMwebCreateVo, WxPayOrderInput, WxPayParamsVo } from '@/models/weixin'
import { wxAppId } from '@/api/env'
import { createWxPayOrder } from '@/api/guoxin'
import { buildCreditsPayReturnUrl } from '@/utils/guoxin/h5RouterBase'
import { isWeChatBrowser, OPEN_IN_WECHAT_MESSAGE, promptOpenInWeChat } from '@/utils/weixin/env'
import { resolveH5ScenceType } from '@/utils/weixin/h5ScenceType'

interface WeixinJSBridgeInvokeResult {
  err_msg?: string
}

interface WeixinJSBridge {
  invoke: (
    method: 'getBrandWCPayRequest',
    params: Record<string, string>,
    callback: (res: WeixinJSBridgeInvokeResult) => void,
  ) => void
}

declare global {
  interface Window {
    WeixinJSBridge?: WeixinJSBridge
  }
}

/** MWEB 跳转微信收银台后，无同步成功回调 */
export type WxPayMwebRedirect = 'mweb_redirect'

/** getBrandWCPayRequest 的 package 须为 prepay_id=wx... */
function resolveWxPayPackage(data: Record<string, unknown>): string {
  const direct = data.package
  if (direct != null && String(direct).length > 0)
    return String(direct)

  const prepayRaw = data.prepay_id ?? data.prepayId
  if (prepayRaw == null || prepayRaw === '')
    return ''

  const prepay = String(prepayRaw)
  if (prepay.startsWith('prepay_id=')) {
    const id = prepay.slice('prepay_id='.length)
    if (!id || id === 'null')
      return ''
    return prepay
  }
  if (prepay === 'null')
    return ''
  return `prepay_id=${prepay}`
}

function normalizeJsapiPayParams(data: WxPayCreateVo | Record<string, unknown>): WxPayParamsVo {
  const raw = data as Record<string, unknown>

  const appId = String(raw.appId ?? wxAppId)
  const timeStamp = String(raw.timeStamp ?? raw.timestamp ?? '')
  const nonceStr = String(raw.nonceStr ?? raw.nonce_str ?? '')
  const packageVal = resolveWxPayPackage(raw)
  const signType = String(raw.signType ?? raw.sign_type ?? 'RSA')
  const paySign = String(raw.paySign ?? raw.pay_sign ?? '')

  if (!appId || !timeStamp || !nonceStr || !packageVal || !paySign)
    throw new Error('invalid_jsapi_params')

  return { appId, timeStamp, nonceStr, package: packageVal, signType, paySign }
}

function pickMwebRedirectUrl(raw: Record<string, unknown>): string {
  const url = raw.mwebUrl ?? raw.mweb_url ?? raw.h5Url ?? raw.h5_url
  return url != null ? String(url) : ''
}

/** 从 pay/create MWEB 的 data 提取跳转链接（兼容 req_data 与 res_data 结构） */
function extractMwebUrl(data: WxPayMwebCreateVo | Record<string, unknown> | null | undefined): string {
  if (!data || typeof data !== 'object')
    return ''
  const raw = data as Record<string, unknown>

  const direct = pickMwebRedirectUrl(raw)
  if (direct)
    return direct

  for (const key of ['res_data', 'resData', 'response'] as const) {
    const nested = raw[key]
    if (nested && typeof nested === 'object') {
      const url = pickMwebRedirectUrl(nested as Record<string, unknown>)
      if (url)
        return url
    }
  }

  return ''
}

/** 等待 WeixinJSBridge 就绪后唤起收银台 */
function invokeWeixinPay(params: WxPayParamsVo): Promise<void> {
  return new Promise((resolve, reject) => {
    const onBridgeReady = () => {
      const bridge = window.WeixinJSBridge
      if (!bridge) {
        reject(new Error('no_weixin_bridge'))
        return
      }
      bridge.invoke('getBrandWCPayRequest', {
        appId: params.appId,
        timeStamp: params.timeStamp,
        nonceStr: params.nonceStr,
        package: params.package,
        signType: params.signType,
        paySign: params.paySign,
      }, (res) => {
        const msg = res.err_msg ?? ''
        if (msg.includes(':ok')) {
          resolve()
        }
        else if (msg.includes(':cancel')) {
          uni.showToast({ title: '已取消支付', icon: 'none' })
          reject(new Error('cancel'))
        }
        else {
          uni.showToast({ title: '支付失败', icon: 'none' })
          reject(new Error('pay_fail'))
        }
      })
    }

    if (window.WeixinJSBridge)
      onBridgeReady()
    else
      document.addEventListener('WeixinJSBridgeReady', onBridgeReady, { once: true })
  })
}

/** 公众号 JSAPI：pay/create → WeixinJSBridge 唤起支付 */
export async function wxChoosePay(param: WxPayOrderInput): Promise<void> {
  if (!isWeChatBrowser()) {
    promptOpenInWeChat({ force: true })
    return Promise.reject(new Error('not_wechat'))
  }

  uni.showLoading({ title: '创建订单...', mask: true })
  let payParams: WxPayParamsVo
  try {
    const res = await createWxPayOrder({ productId: param.productId, payChannel: 'jsapi' })
    if (res.code !== 200 || !res.data)
      throw new Error('pay_create_failed')
    payParams = normalizeJsapiPayParams(res.data)
  }
  finally {
    uni.hideLoading()
  }

  return invokeWeixinPay(payParams)
}

/** 非微信环境 H5/MWEB：pay/create + payChannel=mweb → 跳转 mweb_url */
export async function wxMwebPay(param: WxPayOrderInput): Promise<WxPayMwebRedirect> {
  if (isWeChatBrowser())
    return Promise.reject(new Error('mweb_in_wechat'))

  uni.showLoading({ title: '创建订单...', mask: true })
  try {
    const res = await createWxPayOrder({
      productId: param.productId,
      payChannel: 'mweb',
      h5ScenceType: resolveH5ScenceType(),
      redirectUrl: buildCreditsPayReturnUrl(),
    })
    if (res.code !== 200 || !res.data)
      throw new Error('pay_create_failed')
    const mwebUrl = extractMwebUrl(res.data)
    if (!mwebUrl)
      throw new Error('mweb_url_missing')
    window.location.href = mwebUrl
    return 'mweb_redirect'
  }
  finally {
    uni.hideLoading()
  }
}

/** 按环境分流：微信内 JSAPI，否则 MWEB */
export async function wxPay(param: WxPayOrderInput): Promise<void | WxPayMwebRedirect> {
  if (isWeChatBrowser())
    return wxChoosePay(param)
  return wxMwebPay(param)
}

export function formatWxPayError(err: unknown): string {
  const code = err instanceof Error ? err.message : ''
  if (code === 'not_wechat')
    return OPEN_IN_WECHAT_MESSAGE
  if (code === 'no_weixin_bridge')
    return '微信支付环境未就绪，请稍后重试'
  if (code === 'cancel')
    return '已取消支付'
  if (code === 'pay_create_failed')
    return '创建订单失败，请稍后重试'
  if (code === 'mweb_url_missing')
    return '未获取到支付链接，请稍后重试'
  if (code === 'mweb_in_wechat')
    return '当前环境请使用微信内支付'
  if (code === 'invalid_jsapi_params')
    return '支付参数不完整，请确认 pay/create 返回有效 prepay_id 与 paySign'
  return '支付失败，请稍后重试'
}

/** @deprecated 请用 formatWxPayError */
export const formatMwebPayError = formatWxPayError
