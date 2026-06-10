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

/** 创建支付订单请求（国心H5） */
export interface WxPayCreateParam {
  /** 商品ID */
  productId: number
  /** 用户openid */
  openId?: string
}

/** chooseWXPay 所需参数 */
export interface WxPayParamsVo {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}
