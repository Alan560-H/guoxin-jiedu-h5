import { postWxOAuthLogin } from '@/api/weixin'
import { userInfoStore } from '@/stores/userInfoStore'
import {
  buildOAuthUrl,
  clearOAuthParamsFromUrl,
  getOAuthCodeFromUrl,
  isWeChatBrowser,
} from '@/utils/weixin/env'

/** 跳转微信网页授权 */
export function redirectToWxOAuth(state = 'STATE'): void {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return
  }
  window.location.href = buildOAuthUrl(state)
}

/** 应用启动时处理 OAuth：换 code、未登录时自动跳转授权 */
export async function handleOAuthOnLaunch(): Promise<void> {
  // #ifndef H5
  return
  // #endif

  // #ifdef H5
  if (!isWeChatBrowser())
    return

  const code = getOAuthCodeFromUrl()
  const store = userInfoStore()

  if (code) {
    try {
      const res = await postWxOAuthLogin(code)
      if (res.data.token)
        store.setToken(res.data.token)
      if (res.data.userInfo)
        store.setUserInfo(res.data.userInfo)
      clearOAuthParamsFromUrl()
    }
    catch {
      clearOAuthParamsFromUrl()
    }
  }
  // #endif
}
