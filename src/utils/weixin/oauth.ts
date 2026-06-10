import { postWxOAuthLogin } from '@/api/weixin'
import { userInfoStore } from '@/stores/userInfoStore'
import {
  buildOAuthUrl,
  clearOAuthParamsFromUrl,
  getOAuthCodeFromUrl,
  getOAuthStateFromUrl,
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

const OAUTH_PENDING_START_KEY = 'guoxin-oauth-pending-start'

/** 标记：授权完成后继续「开始解读」流程 */
export function markOAuthPendingStart() {
  try {
    uni.setStorageSync(OAUTH_PENDING_START_KEY, '1')
  }
  catch {
    // ignore
  }
}

/** 读取并清除「开始解读」待续标记 */
export function consumeOAuthPendingStart(): boolean {
  try {
    const v = uni.getStorageSync(OAUTH_PENDING_START_KEY)
    if (v) {
      uni.removeStorageSync(OAUTH_PENDING_START_KEY)
      return true
    }
  }
  catch {
    // ignore
  }
  return false
}

/** 应用启动时处理 OAuth：仅静默用 URL 中的 code 换 token，不自动跳转授权页 */
export async function handleOAuthOnLaunch(): Promise<void> {
  // #ifndef H5
  return
  // #endif

  // #ifdef H5
  if (!isWeChatBrowser())
    return

  // 如果是国心解读模块的 OAuth 回调，跳过此处处理，由 index.vue 处理
  const state = getOAuthStateFromUrl()
  if (state === 'GUOXIN_LOGIN')
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
