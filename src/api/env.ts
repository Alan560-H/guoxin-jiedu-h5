
interface EnvConfig {
    baseUrl: string
}

export type WxOAuthScope = 'snsapi_base' | 'snsapi_userinfo'

interface AppConfig {
    wxAppId: string
    wxOAuthScope: WxOAuthScope
    wxJssdkSignPath: string
    wxOAuthLoginPath: string
    wxPayCreatePath: string
    domain: {
        baseUrl: string
    }
    dev: EnvConfig
    prod: EnvConfig
}

const wxAppIdFromEnv = import.meta.env.VITE_WX_APP_ID
if (!wxAppIdFromEnv) {
    throw new Error(
        '缺少 VITE_WX_APP_ID：请在 .env.development（测试号）或 .env.production（正式号）中配置',
    )
}

const appConfig: AppConfig = {
    wxAppId: wxAppIdFromEnv,
    /** 静默授权仅拿 openid，用户信息由 Java wxLogin 返回 */
    wxOAuthScope: 'snsapi_userinfo',
    /** @deprecated 请用 guoxin.ts getWxJssdkSign */
    wxJssdkSignPath: '/api/yiqixue/app/guoxin/jssdk/sign',
    wxOAuthLoginPath: '/app/wx/oauth/login',
    /** @deprecated 请用 guoxin.ts createWxPayOrder */
    wxPayCreatePath: '/api/yiqixue/app/guoxin/pay/create',
    domain: {
        baseUrl: 'https://test.yipuwenhua.com/app-api',
    },
    dev: {
        baseUrl: '/prod-api',
    },
    prod: {
        baseUrl: '',
    },
}

export const {
    wxAppId,
    wxOAuthScope,
    wxJssdkSignPath,
    wxOAuthLoginPath,
    wxPayCreatePath,
    domain,
    dev,
    prod,
} = appConfig

export { guoxinDevProxyTarget } from './devProxy'
