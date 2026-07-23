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

/** 统一权益：报告次数 + 问答次数（同一 getCredits 接口） */
export interface CreditsVo {
  /** 报告可用次数 */
  credits: number
  productId?: number
  /** 今日/套餐内问答剩余 */
  chatRemaining: number
  /** 套餐期内问答不限次 */
  chatUnlimited: boolean
  /** 响应是否显式带了问答字段（用于区分「未下发」与「剩余 0」） */
  chatFieldsPresent: boolean
}
