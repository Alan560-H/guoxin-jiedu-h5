import type { WxPayCreateParam, WxPayParamsVo } from '@/models/weixin'
import { createWxPayOrder } from '@/api/guoxin'
import { isWeChatBrowser } from '@/utils/weixin/env'
import { initWxJssdk, wx } from '@/utils/weixin/jssdk'

function normalizePayParams(data: Record<string, unknown>): WxPayParamsVo {
  if (data.mwebUrl ?? data.mweb_url ?? data.h5Url ?? data.h5_url)
    throw new Error('backend_mweb_response')

  const timeStamp = String(data.timeStamp ?? data.timestamp ?? '')
  const nonceStr = String(data.nonceStr ?? data.nonce_str ?? '')
  const packageVal = String(data.package ?? '')
  const signType = String(data.signType ?? data.sign_type ?? 'RSA')
  const paySign = String(data.paySign ?? data.pay_sign ?? '')

  if (!timeStamp || !nonceStr || !packageVal || !paySign)
    throw new Error('invalid_jsapi_params')

  return { timeStamp, nonceStr, package: packageVal, signType, paySign }
}

/** 公众号内 JSAPI 支付：JSSDK 签名 → 下单 → chooseWXPay */
export async function wxChoosePay(param: WxPayCreateParam): Promise<void> {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return Promise.reject(new Error('not_wechat'))
  }

  if (!param.openId) {
    uni.showToast({ title: '请先完成微信授权', icon: 'none' })
    return Promise.reject(new Error('missing_openid'))
  }

  await initWxJssdk(['chooseWXPay'])

  uni.showLoading({ title: '创建订单...', mask: true })
  let payParams: WxPayParamsVo
  try {
    const res = await createWxPayOrder({
      productId: param.productId,
      openId: param.openId,
    })
    payParams = normalizePayParams(res.data as unknown as Record<string, unknown>)
  }
  finally {
    uni.hideLoading()
  }

  return new Promise((resolve, reject) => {
    wx.chooseWXPay({
      timestamp: Number(payParams.timeStamp),
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType as 'MD5' | 'RSA',
      paySign: payParams.paySign,
      success: () => resolve(),
      cancel: () => {
        uni.showToast({ title: '已取消支付', icon: 'none' })
        reject(new Error('cancel'))
      },
      fail: () => {
        uni.showToast({ title: '支付失败', icon: 'none' })
        reject(new Error('pay_fail'))
      },
    })
  })
}

/** @deprecated 请用 wxChoosePay（公众号 JSAPI） */
export const wxMwebPay = wxChoosePay

export function formatWxPayError(err: unknown): string {
  const code = err instanceof Error ? err.message : ''
  if (code === 'not_wechat')
    return '请在微信内打开'
  if (code === 'missing_openid')
    return '请先完成微信授权'
  if (code === 'cancel')
    return '已取消支付'
  if (code === 'backend_mweb_response')
    return '后端返回 MWEB 链接，请 Java 改为 JSAPI 并返回 paySign 等参数'
  if (code === 'invalid_jsapi_params')
    return '支付参数不完整，请确认 pay/create 已对接 JSAPI'
  return '支付失败，请稍后重试'
}

/** @deprecated 请用 formatWxPayError */
export const formatMwebPayError = formatWxPayError
