import { http } from 'uview-pro'
import type { ResponseData } from '@/models/responseData'
import type { WxJssdkSignVo, WxOAuthLoginVo, WxPayCreateParam, WxPayParamsVo } from '@/models/weixin'
import { wxJssdkSignPath, wxOAuthLoginPath, wxPayCreatePath } from '@/api/env'

/** 获取 JSSDK 签名（url 不含 hash） */
export const getWxJssdkSign = (url: string): Promise<ResponseData<WxJssdkSignVo>> =>
  http.get(wxJssdkSignPath, { url })

/** 微信 OAuth code 换 token / 用户信息 */
export const postWxOAuthLogin = (code: string): Promise<ResponseData<WxOAuthLoginVo>> =>
  http.post(wxOAuthLoginPath, { code })

/** 创建微信支付订单，返回 chooseWXPay 参数 */
export const postWxPayCreate = (param: WxPayCreateParam): Promise<ResponseData<WxPayParamsVo>> =>
  http.post(wxPayCreatePath, param)
