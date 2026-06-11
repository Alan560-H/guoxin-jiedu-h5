/** 微信 JSSDK 签名配置 */
export interface WxJssdkSignVo {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
}

/** 微信 OAuth 登录响应 */
export interface WxOAuthLoginVo {
  token: string
  userInfo?: import('@/models/userInfoVo').UserInfoVo
}

/** 创建支付订单请求（公众号 JSAPI） */
export interface WxPayCreateParam {
  /** 商品ID */
  productId: number
  /** 用户 openid，JSAPI 统一下单必填 */
  openId?: string
}

/** chooseWXPay 所需参数（pay/create 返回） */
export interface WxPayParamsVo {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

/** @deprecated MWEB 回退字段，JSAPI 模式不应返回 */
export interface WxPayMwebVo {
  mwebUrl?: string
  mweb_url?: string
  h5Url?: string
  h5_url?: string
}
