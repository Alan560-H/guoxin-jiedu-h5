/** 微信 OAuth 登录响应 */
export interface WxOAuthLoginVo {
  token: string
  userInfo?: import('@/models/userInfoVo').UserInfoVo
}

/** 前端发起支付入参（渠道由环境在 pay.ts 内补齐） */
export interface WxPayOrderInput {
  productId: number
}

/** pay/create 请求渠道 */
export type WxPayChannel = 'jsapi' | 'mweb'

/** MWEB 场景（后端字段名 h5ScenceType） */
export type H5ScenceType = 'Wap' | 'iOS' | 'Android'

/** 创建支付订单请求（pay/create）；openid 由后端从登录态获取 */
export type WxPayCreateParam = WxPayOrderInput & (
  | { payChannel: 'jsapi' }
  | { payChannel: 'mweb', h5ScenceType: H5ScenceType }
)

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

/** 微信 H5 下单 scene_info（与后端 req_data 结构一致） */
export interface WxPayMwebSceneInfo {
  payer_client_ip?: string
  h5_info?: {
    type?: H5ScenceType
  }
}

/** pay/create MWEB 时后端返回的 req_data（微信下单体） */
export interface WxPayMwebReqData {
  mchid?: string
  out_trade_no?: string
  appid?: string
  description?: string
  notify_url?: string
  amount?: {
    total?: number
    currency?: string
  }
  scene_info?: WxPayMwebSceneInfo
}

/** 微信 H5 支付（MWEB）pay/create 响应 data */
export interface WxPayMwebCreateVo {
  req_data?: WxPayMwebReqData
  reqData?: WxPayMwebReqData
  mwebUrl?: string
  mweb_url?: string
  h5Url?: string
  h5_url?: string
  redirectUrl?: string
  redirect_url?: string
  res_data?: Record<string, unknown>
  resData?: Record<string, unknown>
}

/** @deprecated 请用 WxPayMwebCreateVo */
export type WxPayMwebVo = WxPayMwebCreateVo
