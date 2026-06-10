
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
  wxAppId: 'wx845946f84bcc1745',
  /** 固定 OAuth 回调，须与公众号授权域名及 Java wxLogin redirect_uri 完全一致 */
  wxOAuthRedirectUri: 'https://im.whhongyi.com.cn/',
  /** 静默授权仅拿 openid，用户信息由 Java wxLogin 返回 */
  wxOAuthScope: 'snsapi_base',
  guoxinDevProxyTarget: 'http://172.16.140.87:8082',
  wxJssdkSignPath: '/app/wx/jssdk/sign',
  wxOAuthLoginPath: '/app/wx/oauth/login',
  wxPayCreatePath: '/api/yiqixue/app/guoxin/pay/create',
  domain: {
    baseUrl: 'https://test.yipuwenhua.com/app-api',
  },
  dev: {
    baseUrl: '/prod-api',
  },
  prod: {
    baseUrl: '/prod-api',
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
