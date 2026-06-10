import type { WxPayCreateParam } from '@/models/weixin'
import { postWxPayCreate } from '@/api/weixin'
import { initWxJssdk, wx } from '@/utils/weixin/jssdk'
import { isWeChatBrowser } from '@/utils/weixin/env'
import { useGuoxinStore } from '@/stores/guoxinStore'

/** 调起微信支付（国心H5 JSAPI支付） */
export async function wxChoosePay(param: WxPayCreateParam): Promise<void> {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return Promise.reject(new Error('not_wechat'))
  }

  const store = useGuoxinStore()

  await initWxJssdk(['chooseWXPay'])

  // 调用国心支付接口，传入 productId 和 openId
  const res = await postWxPayCreate({
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
