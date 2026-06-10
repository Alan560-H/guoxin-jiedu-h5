import {
  buildOAuthUrl,
  clearOAuthParamsFromUrl,
  getOAuthCodeFromUrl,
  getOAuthStateFromUrl,
  isWeChatBrowser,
} from '@/utils/weixin/env'

/** 国心解读 OAuth 回调 state，须与授权跳转时一致 */
export const GUOXIN_OAUTH_STATE = 'GUOXIN_LOGIN'

const OAUTH_PENDING_START_KEY = 'guoxin-oauth-pending-start'

/** 跳转微信网页授权（须用户点击触发，见微信文档） */
export function redirectToWxOAuth(state = GUOXIN_OAUTH_STATE): void {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return
  }
  window.location.href = buildOAuthUrl(state)
}

/** 是否为国心 OAuth 授权回调（URL 带 code 且 state 匹配） */
export function getGuoxinOAuthCode(): string | null {
  const code = getOAuthCodeFromUrl()
  if (!code)
    return null
  if (getOAuthStateFromUrl() !== GUOXIN_OAUTH_STATE)
    return null
  return code
}

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

export {
  clearOAuthParamsFromUrl,
  getOAuthCodeFromUrl,
  getOAuthStateFromUrl,
}
