import { wxAppId, wxOAuthRedirectUri, wxOAuthScope } from '@/api/env'

/** 是否微信内置浏览器（H5） */
export function isWeChatBrowser(): boolean {
  if (typeof navigator === 'undefined')
    return false
  return /MicroMessenger/i.test(navigator.userAgent)
}

/** 当前页 URL，用于 JSSDK 签名（不含 hash） */
export function getJssdkSignUrl(): string {
  if (typeof window === 'undefined')
    return ''
  return window.location.href.split('#')[0]
}

/** OAuth 回调地址：优先 env 配置，否则取当前 origin + pathname */
export function getOAuthRedirectUri(): string {
  if (wxOAuthRedirectUri)
    return wxOAuthRedirectUri
  if (typeof window === 'undefined')
    return ''
  const { origin, pathname } = window.location
  return `${origin}${pathname}`
}

/** 构建微信网页授权跳转 URL */
export function buildOAuthUrl(state = 'STATE'): string {
  const redirectUri = encodeURIComponent(getOAuthRedirectUri())
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wxAppId}&redirect_uri=${redirectUri}&response_type=code&scope=${wxOAuthScope}&state=${state}#wechat_redirect`
}

/** 从 URL 解析 OAuth code */
export function getOAuthCodeFromUrl(): string | null {
  if (typeof window === 'undefined')
    return null
  const params = new URLSearchParams(window.location.search)
  return params.get('code')
}

/** 清除 URL 中的 OAuth 参数（code、state） */
export function clearOAuthParamsFromUrl(): void {
  if (typeof window === 'undefined')
    return
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next)
}
