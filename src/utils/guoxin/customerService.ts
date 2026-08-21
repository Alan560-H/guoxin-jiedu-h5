import { getCustomerServiceLink } from '@/api/guoxin'

/** 企业微信客服二维码 */
export const CUSTOMER_SERVICE_QR_URL
  = 'https://oss.yipuwh.com/img/2026/07/30/微信二维码_20260730110959A010.png'

let openingPromise: Promise<boolean> | null = null

function normalizeCustomerServiceUrl(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim())
    throw new Error('customer_service_url_missing')

  const url = new URL(raw.trim())
  if (url.protocol !== 'https:' && url.protocol !== 'http:')
    throw new Error('customer_service_url_invalid')
  return url.href
}

/** 动态读取客服链接并跳转；并发点击只会发送一次请求。 */
export function openCustomerServiceLink(): Promise<boolean> {
  if (openingPromise)
    return openingPromise

  openingPromise = (async () => {
    uni.showLoading({ title: '正在连接客服...', mask: true })
    try {
      const res = await getCustomerServiceLink()
      if (res.code !== 200)
        throw new Error(res.msg || 'customer_service_request_failed')

      const url = normalizeCustomerServiceUrl(res.data?.url)
      uni.hideLoading()

      // #ifdef H5
      if (typeof window !== 'undefined') {
        window.location.href = url
        return true
      }
      // #endif

      uni.showToast({ title: '请在 H5 中联系客服', icon: 'none' })
      return false
    }
    catch (error) {
      uni.hideLoading()
      console.error('获取客服链接失败', error)
      uni.showToast({ title: '暂时无法连接客服，请稍后再试', icon: 'none' })
      return false
    }
    finally {
      openingPromise = null
    }
  })()

  return openingPromise
}
