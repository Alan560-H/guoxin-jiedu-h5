import type { ResponseData } from '@/models/responseData'
import type { WxOAuthLoginVo } from '@/models/weixin'
import { http } from 'uview-pro'
import { wxOAuthLoginPath } from '@/api/env'

export { getWxJssdkSign, createWxPayOrder as postWxPayCreate } from '@/api/guoxin'

/** 微信 OAuth code 换 token / 用户信息（遗留路径，国心主流程用 guoxin.wxLogin） */
export const postWxOAuthLogin = (code: string): Promise<ResponseData<WxOAuthLoginVo>> =>
  http.post(wxOAuthLoginPath, { code })
