
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
  /** 授权回调地址，须与公众号「网页授权域名」一致；部署后请改为正式 H5 域名 */
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
