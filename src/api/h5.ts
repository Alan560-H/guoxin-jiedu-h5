import type { ResponseData } from '@/models/responseData'
import { http } from 'uview-pro'

const H5_MODULE_API = 'https://nr.cxfangtang.cn/wm-api/api/h5/getModule'

export interface H5ModuleItem {
  value?: string | number | null
}

/** 根据项目编码读取 H5 模块配置。 */
export function getH5Module(projectCode: string): Promise<ResponseData<H5ModuleItem[]>> {
  return http.get(H5_MODULE_API, { projectCode }, { meta: { loading: false, toast: false } })
}
