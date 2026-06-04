import { http } from 'uview-pro'
import type { YangPanFormData } from "../models/customForm";
import type { ResponseData } from "../models/responseData";

// 生成阳盘决策  ?birthDay=2026-2-5%2016%3A45&question=&isKe=4
export const getXingHeQimenH5 = (param : YangPanFormData):Promise<ResponseData> => http.get('/app/qimen/getXingHeQimenH5', param)
