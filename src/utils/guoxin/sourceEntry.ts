import { hasProjectCode } from '@/utils/guoxin/projectCode'

/**
 * 是否展示「返回上一页」栏。
 * 约定：发现页跳转国心解读时携带 ?projectCode=xxx，有值则显示。
 */
export function isShowBackEntry(): boolean {
  return hasProjectCode()
}
