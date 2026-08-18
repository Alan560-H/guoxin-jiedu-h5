import { http } from 'uview-pro'
import type { ResponseData } from '@/models/responseData'
import type { ProfileVo } from '@/models/guoxin/profile'
import type { WxPayCreateParam, WxPayRedirectVo } from '@/models/weixin'

const BASE = '/api/yiqixue/app/guoxin'
const SUNLAND_PAY_API = `${BASE}/pay/sunlandPay`

/** 发送短信验证码 */
export const sendSmsCode = (data: { mobile: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/sendSms`, data)

/** 短信验证码登录（非微信 H5 / App） */
export const smsLogin = (data: { mobile: string; smsCode: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/smsLogin`, data)

/** @deprecated 请用 smsLogin */
export const loginBySms = smsLogin

/** 微信网页授权登录（GET，code 拼在 query） */
export const wxLogin = (data: { code: string }): Promise<ResponseData<any>> =>
  http.get(`${BASE}/wxLogin`, { code: data.code })

/** 用户登录（微信openid） */
export const login = (data: { openid: string; unionid?: string; nickname?: string; avatarUrl?: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/login`, data)

/** 绑定手机号（需短信验证码） */
export const bindMobile = (data: { userId: number; mobile: string; smsCode: string }): Promise<ResponseData<any>> =>
  http.post(`${BASE}/bindMobile`, data)

/** 获取用户信息（userId由后端从JWT解析） */
export const getUserInfo = (config?: Record<string, unknown>): Promise<ResponseData<any>> =>
  http.get(`${BASE}/userInfo`, {}, config)

/** 获取商品列表(上架) */
export const getProducts = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/products`, { productType: 'member' })

/** 获取用户订单列表（userId由后端从JWT解析） */
export const getOrders = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/orders`)

/** 获取用户可用权益次数（userId由后端从JWT解析） */
export const getAvailableCount = (productId: number): Promise<ResponseData<any>> =>
  http.get(`${BASE}/availableCount`, { productId })

/** 获取解读记录列表（含档案信息，userId由后端从JWT解析） */
export const getReadingRecords = (params?: { profileId?: string | number, pageSize?: number }): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/readingRecords`, params)

/** 获取用户总可用次数（userId由后端从JWT解析） */
export const getCredits = (): Promise<ResponseData<any>> =>
  http.get(`${BASE}/credits`)

/** 获取报告详情 */
export const getReportDetail = (reportId: number): Promise<ResponseData<any>> =>
  http.get(`${BASE}/report/detail`, { reportId })

/** 提交报告生成请求（userId由后端从JWT解析） */
export const generateReport = (
  data: { productId: number, inputJson?: string },
  config?: Record<string, unknown>,
): Promise<ResponseData<any>> =>
  http.post(`${BASE}/report/generate`, data, config)

/** 查询任务状态 */
export const getTaskStatus = (
  taskId: number | string,
  config?: Record<string, unknown>,
): Promise<ResponseData<any>> =>
  http.get(`${BASE}/task/status`, { taskId }, config)

/** 获取消费记录（userId由后端从JWT解析） */
export const getConsumeRecords = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/consumeRecords`)

/** 根据字典类型获取字典数据 */
export const getDictData = (dictType: string): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/dict/${dictType}`)

/** 获取当前用户的档案列表 */
export const getProfiles = (): Promise<ResponseData<any[]>> =>
  http.get(`${BASE}/profiles`)

/** 获取档案详情 */
export const getProfileDetail = (id: number): Promise<ResponseData<any>> =>
  http.get(`${BASE}/profile/${id}`)

/** 创建档案 */
export const createProfile = (data: any, config?: Record<string, unknown>): Promise<ResponseData<any>> =>
  http.post(`${BASE}/profile`, data, config)

/** 编辑档案 */
export const updateProfile = (id: number, data: any, config?: Record<string, unknown>): Promise<ResponseData<any>> =>
  http.put(`${BASE}/profile/${id}`, data, config)

/** 删除档案 */
export const deleteProfile = (id: number, config?: Record<string, unknown>): Promise<ResponseData<any>> =>
  http.delete(`${BASE}/profile/${id}`, config)

/** 创建尚德支付订单；请求字段暂按后端现有协议保留。 */
export const createWxPayOrder = (data: WxPayCreateParam): Promise<ResponseData<WxPayRedirectVo>> =>
  // toast 交给购买流程 formatWxPayError，避免拦截器 toast 被后续通用文案覆盖
  http.post(SUNLAND_PAY_API, data, { meta: { loading: false, toast: false } })
