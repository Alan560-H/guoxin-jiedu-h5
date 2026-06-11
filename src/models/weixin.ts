/** 微信 OAuth 登录响应 */
export interface WxOAuthLoginVo {
  token: string
  userInfo?: import('@/models/userInfoVo').UserInfoVo
}

/** 创建支付订单请求（公众号 JSAPI）；openid 由后端从登录态获取 */
export interface WxPayCreateParam {
  /** 商品ID */
  productId: number
}

/** pay/create 响应 data（Java 统一下单后返回） */
export interface WxPayCreateVo {
  timeStamp: string
  nonceStr: string
  paySign: string
  signType: string
  appId?: string
  /** 可能为 wx 单号或已带 prepay_id= 前缀 */
  prepay_id?: string
  prepayId?: string
  package?: string
}

/** WeixinJSBridge.getBrandWCPayRequest 入参（由 WxPayCreateVo 归一化） */
export interface WxPayParamsVo {
  appId: string
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
