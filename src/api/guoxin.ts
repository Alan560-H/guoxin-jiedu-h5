import { http } from 'uview-pro'
import type { ResponseData } from '@/models/responseData'
import type { ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'

const BASE = '/api/yiqixue/app/guoxin'

/** 发送短信验证码 */
export const sendSmsCode = (data: { mobile: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/sendSms`, data)

/** 短信验证码登录 */
export const loginBySms = (data: { mobile: string; smsCode: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/loginBySms`, data)

/** 微信网页授权登录（code换用户信息） */
export const wxLogin = (data: { code: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/wxLogin`, data)

/** 用户登录（微信openid） */
export const login = (data: { openid: string; unionid?: string; nickname?: string; avatarUrl?: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/login`, data)

/** 绑定手机号（需短信验证码） */
export const bindMobile = (data: { userId: number; mobile: string; smsCode: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/bindMobile`, data)

/** 获取用户信息（userId由后端从JWT解析） */
export const getUserInfo = (): Promise<ResponseData<any>> =>
  http.get(`${BASE}/userInfo`)

/** 获取商品列表(上架) */
export const getProducts = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/products`)

/** 获取用户订单列表（userId由后端从JWT解析） */
export const getOrders = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/orders`)

/** 获取用户可用权益次数（userId由后端从JWT解析） */
export const getAvailableCount = (productId: number): Promise<ResponseData<any>> =>
  http.get(`${BASE}/availableCount`, { productId })

/** 获取用户报告列表（userId由后端从JWT解析） */
export const getReports = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/reports`)

/** 获取报告详情 */
export const getReportDetail = (reportId: number): Promise<ResponseData<any>> =>
  http.get(`${BASE}/report/detail`, { reportId })

/** 提交报告生成请求（userId由后端从JWT解析） */
export const generateReport = (data: { productId: number; inputJson?: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/report/generate`, data)

/** 查询任务状态 */
export const getTaskStatus = (taskId: number): Promise<ResponseData<any>> =>
  http.get(`${BASE}/task/status`, { taskId })

/** 获取消费记录（userId由后端从JWT解析） */
export const getConsumeRecords = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/consumeRecords`)

/** V2 预留：档案列表 */
export const getProfiles = (): Promise<ResponseData<ProfileVo[]>> =>
  http.get(`${BASE}/profiles`)

/** V2 预留：解读记录 */
export const getJieduRecords = (profileId: string): Promise<ResponseData<RecordVo[]>> =>
  http.get(`${BASE}/records`, { profileId })

/** V2 预留：创建解读任务 */
export const createJieduTask = (profileId: string, directions: string[]): Promise<ResponseData<{ taskId: string }>> =>
  http.post(`${BASE}/jiedu/create`, { profileId, directions })

/** V2 预留：获取解读报告 */
export const getJieduReport = (recordId: string): Promise<ResponseData<RecordVo>> =>
  http.get(`${BASE}/jiedu/report`, { recordId })
