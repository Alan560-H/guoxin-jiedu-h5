import { SOURCE_ENTRY_QUERY_VALUE } from '@/constants/guoxin'

/**
 * 是否从「轻舟云课堂 · 发现页」外链进入。
 * 约定：发现页跳转国心解读首页时携带 ?source=1。
 */
export function isSourceEntryFromExternal(): boolean {
  if (typeof window === 'undefined')
    return false
  try {
    return new URLSearchParams(window.location.search).get('source') === SOURCE_ENTRY_QUERY_VALUE
  }
  catch {
    return false
  }
}
