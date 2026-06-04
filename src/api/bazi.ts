import { http } from 'uview-pro'
import type { FormData,AIChatFormData,AIContentFormData,AIHistoryFormData } from "@/models/customForm"
import type { ResponseData,AIChat, } from "@/models/responseData";

// 生成排盘订单
// export const getAppVorder = () => http.post('/app/vorder/v1/add')
// 获得八字排盘
// 参数 ?userName=%E8%BF%98%E7%9C%9F%E6%98%AF&birthDay=2026-1-14%2016%3A45&districtGeocode=110102&sex=%E7%94%B7&solar=true
// oId=0&name=%E9%BB%84&sex=1&year=2026&month=1&day=14&hour=17&minute=41&solar=true&districtGeocode=110000&area=110101
export const getBaZiPanInfo = (param : FormData) => http.get('/app/bazi/baziPan', param)

// 获取流月数据
export const getBaZiLiuYue =  (param : FormData) => http.get('/app/bazi/getLiuYue', param)


// 获取ai生成剩余次数，需登录
export const getTimes = ():Promise<ResponseData>=>http.get('/coze/ai/getTimes')
// 获取ai生成会话，返回聊天返回的chatId   //聊天返回的会话ID
export const postAIChat = (param:AIContentFormData):Promise<ResponseData<AIChat>>=>http.post('/coze/ai/chat',param)
// 获取ai生成内容
export const postAIContent = (param:AIChatFormData):Promise<ResponseData>=>http.post('/coze/ai/message',param)
// 获取ai生成内容历史记录 ?pageNum=1&pageSize=10
export const getAILogs = (param:AIHistoryFormData):Promise<ResponseData>=>http.get('/coze/ai/getLogs',param)
