import { wxAppId, wxOAuthScope } from '@/api/env'

/** 非微信环境引导文案 */
export const OPEN_IN_WECHAT_MESSAGE = '请复制链接到微信中打开'

const OPEN_IN_WECHAT_PROMPT_KEY = 'guoxin-open-in-wechat-prompted'

/** 是否微信内置浏览器（H5） */
export function isWeChatBrowser(): boolean {
    if (typeof navigator === 'undefined')
        return false
    return /MicroMessenger/i.test(navigator.userAgent)
}

/** 供复制分享的当前页链接（去掉 OAuth 临时参数） */
export function getPageShareUrl(): string {
    if (typeof window === 'undefined')
        return ''
    const url = new URL(window.location.href)
    url.searchParams.delete('code')
    url.searchParams.delete('state')
    return `${url.origin}${url.pathname}${url.search}${url.hash}`
}

/** 非微信浏览器：弹窗提示复制链接到微信打开 */
export function promptOpenInWeChat(options?: { force?: boolean }): void {
    if (isWeChatBrowser())
        return
    const force = options?.force ?? false
    if (!force) {
        try {
            if (uni.getStorageSync(OPEN_IN_WECHAT_PROMPT_KEY))
                return
        }
        catch {
            // ignore
        }
    }
    const link = getPageShareUrl()
    uni.showModal({
        title: '温馨提示',
        content: link ? `${OPEN_IN_WECHAT_MESSAGE}\n\n${link}` : OPEN_IN_WECHAT_MESSAGE,
        confirmText: '复制链接',
        cancelText: '知道了',
        success: (res) => {
            try {
                uni.setStorageSync(OPEN_IN_WECHAT_PROMPT_KEY, '1')
            }
            catch {
                // ignore
            }
            if (res.confirm && link) {
                uni.setClipboardData({
                    data: link,
                    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
                })
            }
        },
    })
}

/** 当前页 URL，用于 JSSDK 签名（不含 hash） */
export function getJssdkSignUrl(): string {
    if (typeof window === 'undefined')
        return ''
    return window.location.href.split('#')[0]
}

/** OAuth 回调：生产用地址栏 origin+pathname；开发可在 .env.development 设 VITE_OAUTH_REDIRECT_URI（如 ngrok） */
export function getOAuthRedirectUri(): string {
    // const devOverride = import.meta.env.DEV && import.meta.env.VITE_OAUTH_REDIRECT_URI
    // if (devOverride)
    //     return devOverride

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

/** 从 URL 解析 OAuth state */
export function getOAuthStateFromUrl(): string | null {
    if (typeof window === 'undefined')
        return null
    const params = new URLSearchParams(window.location.search)
    return params.get('state')
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
