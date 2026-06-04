import { http } from 'uview-pro'
import type {SendCode,LoginFormData} from "../models/customForm"
import type {ResponseData} from "../models/responseData"

// 发送短信
export const postSendCode = (param:SendCode):Promise<ResponseData>=>http.post('/app/v3/getsmscode',param)
// 用户登录
export const postLogin = (param:LoginFormData):Promise<ResponseData>=>http.post('/app/smslogin',param)
