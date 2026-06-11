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

/** 创建支付订单请求（国心 H5 MWEB） */
export interface WxPayCreateParam {
  /** 商品ID */
  productId: number
  /** 可选：后端可从 JWT 识别用户；JSAPI 遗留字段 */
  openId?: string
  /** H5 支付完成回跳地址，不传则后端默认 */
  returnUrl?: string
}

/** 微信 H5 支付（MWEB）下单响应 */
export interface WxPayMwebVo {
  mwebUrl?: string
  mweb_url?: string
  h5Url?: string
  h5_url?: string
}

/** @deprecated JSAPI chooseWXPay 参数，MWEB 模式不再使用 */
export interface WxPayParamsVo {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}
