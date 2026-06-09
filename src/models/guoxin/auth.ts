export type AuthStep = 'anonymous' | 'need_wx_auth' | 'need_phone' | 'ready'

export interface WxSessionReq {
  openid?: string
  wxCode?: string
}

export type WxSessionStep = 'ready' | 'need_phone' | 'need_wx_auth'

export interface WxSessionVo {
  step: WxSessionStep
  openid: string
  token?: string
  phoneMasked?: string
}

export interface WxAuthorizeVo {
  openid: string
}

export interface SmsCodeReq {
  phone: string
}

export interface SmsCodeVo {
  sent: boolean
}

export interface BindPhoneReq {
  openid: string
  phone: string
  smsCode: string
}

export interface BindPhoneVo {
  token: string
  phoneMasked: string
}

export interface CreditsVo {
  credits: number
}
