
interface EnvConfig {
  baseUrl: string
}

export type WxOAuthScope = 'snsapi_base' | 'snsapi_userinfo'

interface AppConfig {
  wxAppId: string
  wxOAuthRedirectUri: string
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

const appConfig: AppConfig = {
  wxAppId: 'wx845946f84bcc1745',
  /** 留空则取当前页 origin + pathname（地址栏）；非空时覆盖，须与公众号授权域名一致 */
  wxOAuthRedirectUri: '',
  /** 静默授权仅拿 openid，用户信息由 Java wxLogin 返回 */
  wxOAuthScope: 'snsapi_base',
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
  wxJssdkSignPath,
  wxOAuthLoginPath,
  wxPayCreatePath,
  domain,
  dev,
  prod,
} = appConfig
