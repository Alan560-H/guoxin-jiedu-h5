import type { WxPayCreateParam } from '@/models/weixin'
import { createWxPayOrder } from '@/api/guoxin'
import { isWeChatBrowser } from '@/utils/weixin/env'
import { initWxJssdk, wx } from '@/utils/weixin/jssdk'

/** 调起微信支付（国心 H5 JSAPI 支付） */
export async function wxChoosePay(param: WxPayCreateParam): Promise<void> {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return Promise.reject(new Error('not_wechat'))
  }

  await initWxJssdk(['chooseWXPay'])

  const res = await createWxPayOrder({
    productId: param.productId,
    openId: param.openId || '',
  })

  const payParams = res.data

  return new Promise((resolve, reject) => {
    wx.chooseWXPay({
      timestamp: Number(payParams.timeStamp),
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType as any,
      paySign: payParams.paySign,
      success: () => resolve(),
      cancel: () => {
        uni.showToast({ title: '已取消支付', icon: 'none' })
        reject(new Error('cancel'))
      },
      fail: (err) => {
        uni.showToast({ title: '支付失败', icon: 'none' })
        reject(err)
      },
    })
  })
}
