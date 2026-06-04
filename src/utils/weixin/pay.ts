import type { WxPayCreateParam } from '@/models/weixin'
import { postWxPayCreate } from '@/api/weixin'
import { initWxJssdk, wx } from '@/utils/weixin/jssdk'
import { isWeChatBrowser } from '@/utils/weixin/env'

/** 调起微信支付 */
export async function wxChoosePay(param: WxPayCreateParam): Promise<void> {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return Promise.reject(new Error('not_wechat'))
  }

  await initWxJssdk(['chooseWXPay'])
  const res = await postWxPayCreate(param)
  const payParams = res.data

  return new Promise((resolve, reject) => {
    wx.chooseWXPay({
      timestamp: Number(payParams.timeStamp),
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType as wx.chooseWXPaySignType,
      paySign: payParams.paySign,
      success: () => {
        uni.showToast({ title: '支付成功', icon: 'success' })
        resolve()
      },
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
