import { IS_SHOW_BACK_QUERY_KEY, IS_SHOW_BACK_QUERY_VALUE } from '@/constants/guoxin'

/**
 * 是否从「轻舟云课堂 · 发现页」外链进入。
 * 约定：发现页跳转国心解读首页时携带 ?isShowBack=1。
 */
export function isShowBackEntry(): boolean {
  if (typeof window === 'undefined')
    return false
  try {
    return new URLSearchParams(window.location.search).get(IS_SHOW_BACK_QUERY_KEY) === IS_SHOW_BACK_QUERY_VALUE
  }
  catch {
    return false
  }
}
