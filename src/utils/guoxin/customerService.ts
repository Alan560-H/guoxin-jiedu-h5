/** 企业微信客服二维码（点客服时打开） */
export const CUSTOMER_SERVICE_QR_URL =
  'https://oss.yipuwh.com/img/2026/07/28/%E5%9B%BD%E5%BF%83_20260728160418A009.jpg'

/** 打开客服二维码页 */
export function openCustomerService() {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.location.href = CUSTOMER_SERVICE_QR_URL
    return
  }
  // #endif
  uni.showToast({ title: '请在微信中打开联系客服', icon: 'none' })
}
