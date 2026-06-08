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

/** 应用启动时处理 OAuth：仅静默用 URL 中的 code 换 token，不自动跳转授权页 */
export async function handleOAuthOnLaunch(): Promise<void> {
  // #ifndef H5
  return
  // #endif

  // #ifdef H5
  if (!isWeChatBrowser())
    return

  const code = getOAuthCodeFromUrl()
  const store = userInfoStore()

  if (!code)
    return
  const oauthCode = code as string

  try {
    const res = await postWxOAuthLogin(oauthCode)
    const { token, userInfo } = res.data
    if (token)
      store.setToken(token)
    if (userInfo)
      store.setUserInfo(userInfo as Parameters<typeof store.setUserInfo>[0])
    clearOAuthParamsFromUrl()
  }
  catch {
    clearOAuthParamsFromUrl()
  }
  // #endif
}
