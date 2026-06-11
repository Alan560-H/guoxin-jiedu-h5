import type { WxPayCreateParam, WxPayCreateVo, WxPayParamsVo } from '@/models/weixin'
import { createWxPayOrder } from '@/api/guoxin'
import { wxAppId } from '@/api/env'
import { isWeChatBrowser } from '@/utils/weixin/env'

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

function normalizePayParams(data: WxPayCreateVo | Record<string, unknown>): WxPayParamsVo {
  const raw = data as Record<string, unknown>
  if (raw.mwebUrl ?? raw.mweb_url ?? raw.h5Url ?? raw.h5_url)
    throw new Error('backend_mweb_response')

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
        if (msg.includes(':ok'))
          resolve()
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
export async function wxChoosePay(param: WxPayCreateParam): Promise<void> {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return Promise.reject(new Error('not_wechat'))
  }

  uni.showLoading({ title: '创建订单...', mask: true })
  let payParams: WxPayParamsVo
  try {
    const res = await createWxPayOrder({ productId: param.productId })
    if (res.code !== 200 || !res.data)
      throw new Error('pay_create_failed')
    payParams = normalizePayParams(res.data)
  }
  finally {
    uni.hideLoading()
  }

  return invokeWeixinPay(payParams)
}

/** @deprecated 请用 wxChoosePay */
export const wxMwebPay = wxChoosePay

export function formatWxPayError(err: unknown): string {
  const code = err instanceof Error ? err.message : ''
  if (code === 'not_wechat')
    return '请在微信内打开'
  if (code === 'no_weixin_bridge')
    return '微信支付环境未就绪，请稍后重试'
  if (code === 'cancel')
    return '已取消支付'
  if (code === 'pay_create_failed')
    return '创建订单失败，请稍后重试'
  if (code === 'backend_mweb_response')
    return '后端返回 MWEB 链接，请 Java 改为 JSAPI 并返回 paySign 等参数'
  if (code === 'invalid_jsapi_params')
    return '支付参数不完整，请确认 pay/create 返回有效 prepay_id 与 paySign'
  return '支付失败，请稍后重试'
}

/** @deprecated 请用 formatWxPayError */
export const formatMwebPayError = formatWxPayError
