import type { ResponseData } from '@/models/responseData'
import type { GetNameInfoParams } from '@/models/xingMingDetail'
import { http } from 'uview-pro'

/** 姓名学排盘（与老 http_old getNameInfo 一致：GET app/getPartialAnalysis） */
export function getPartialAnalysis(param: GetNameInfoParams): Promise<ResponseData<Record<string, unknown>>> {
  return http.get('/app/getPartialAnalysis', param)
}
