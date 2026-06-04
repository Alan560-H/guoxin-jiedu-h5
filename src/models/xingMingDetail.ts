import type { XingMingFormData } from '@/models/xingMingForm'

/** 与后端 getPartialAnalysis 一致；firstname/lastname 与表单姓/名交叉，见 buildGetNameInfoPayload */
export interface GetNameInfoParams {
  birthday: string
  firstname: string
  lastname: string
  sex: number
  type: number
}

export interface ZiDesItem {
  jtz?: string
  py?: string
  zi?: string
  bihua?: string | number
  wx?: string
}

/** 三才六格 - 三才配置块 */
export interface SancaiLiuInfo {
  title?: string
  sancaiLiuJx?: string
  sancaiLiuResult?: string
}

/** 接口返回 + 与老 detail.vue 相同的派生字段 */
export interface NameDetailTransformed {
  ziDes: ZiDesItem[]
  xingList: ZiDesItem[]
  mingList: ZiDesItem[]
  firstname: string
  lastname: string
  tiange: string | number
  renge: string | number
  dige: string | number
  outge: string | number
  totalgedes: {
    num?: string | number
    [key: string]: unknown
  }
  [key: string]: unknown
}

/** 三才六格详情（老 liugeDetail.vue 字段） */
export interface NameDetailLiuGeTransformed extends NameDetailTransformed {
  outgewx?: string
  outgejx?: string
  tiangewx?: string
  tiangejx?: string
  rengewx?: string
  rengejx?: string
  digewx?: string
  digejx?: string
  totalgewx?: string
  totalgejx?: string
  biange?: string | number
  biangejx?: string
  sancai?: SancaiLiuInfo
}

/** 一级表单无生日：与老 detail 占位一致 */
export const XING_MING_DEFAULT_BIRTHDAY = '1996-12-12 00:00:00'

export function buildGetNameInfoPayload(form: XingMingFormData): GetNameInfoParams {
  return {
    birthday: XING_MING_DEFAULT_BIRTHDAY,
    firstname: form.lastName,
    lastname: form.firstName,
    sex: form.sex,
    type: form.type,
  }
}
