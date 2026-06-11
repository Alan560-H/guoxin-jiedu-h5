
interface EnvConfig {
    baseUrl: string
}

export type WxOAuthScope = 'snsapi_base' | 'snsapi_userinfo'

interface AppConfig {
    wxAppId: string
    wxOAuthRedirectUri: string
    wxOAuthScope: WxOAuthScope
    /** 本地 Vite 代理国心 Java；勿用 im 域名（hosts 指本机时会环回 IIS，wxLogin 会返回 HTML） */
    guoxinDevProxyTarget: string
    wxJssdkSignPath: string
    wxOAuthLoginPath: string
    wxPayCreatePath: string
    domain: {
        baseUrl: string
    }
    dev: EnvConfig
    prod: EnvConfig
}

const appConfig: AppConfig = {
    //   wxAppId: 'wxfc83f32036d920f3',// 测试不要删
    wxAppId: 'wx845946f84bcc1745',
    /** 固定 OAuth 回调，须与公众号授权域名及 Java wxLogin redirect_uri 完全一致 */
    wxOAuthRedirectUri: 'https://maggot-doily-flatness.ngrok-free.dev/',
    /** 静默授权仅拿 openid，用户信息由 Java wxLogin 返回 */
    wxOAuthScope: 'snsapi_userinfo',
    /** 本地 Vite 代理国心 Java；勿用 im 域名；换环境请改此地址或后续抽至 .env.local */
    guoxinDevProxyTarget: 'http://172.16.140.87:8082',
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
    wxOAuthRedirectUri,
    wxOAuthScope,
    guoxinDevProxyTarget,
    wxJssdkSignPath,
    wxOAuthLoginPath,
    wxPayCreatePath,
    domain,
    dev,
    prod,
} = appConfig
