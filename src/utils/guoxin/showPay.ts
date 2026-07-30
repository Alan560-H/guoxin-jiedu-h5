import {
  IS_SHOW_PAY_QUERY_KEY,
  IS_SHOW_PAY_QUERY_OFF,
  IS_SHOW_PAY_QUERY_ON,
} from '@/constants/guoxin'

/** 本地持久化：入口带 ?isShowPay 后，跳转丢 query 时权益页仍可读 */
const STORAGE_KEY = 'guoxin-is-show-pay'

function normalizeShowPay(raw: unknown): string | null {
  if (raw == null)
    return null
  const value = String(raw).trim()
  if (value === IS_SHOW_PAY_QUERY_ON || value === IS_SHOW_PAY_QUERY_OFF)
    return value
  return null
}

function readUrlShowPay(): string | null {
  if (typeof window === 'undefined')
    return null
  try {
    const fromSearch = normalizeShowPay(
      new URLSearchParams(window.location.search).get(IS_SHOW_PAY_QUERY_KEY),
    )
    if (fromSearch)
      return fromSearch
    // hash 路由兜底：#/pages/xxx?isShowPay=0
    const hash = window.location.hash || ''
    const qIndex = hash.indexOf('?')
    if (qIndex < 0)
      return null
    return normalizeShowPay(
      new URLSearchParams(hash.slice(qIndex + 1)).get(IS_SHOW_PAY_QUERY_KEY),
    )
  }
  catch {
    return null
  }
}

function persistShowPay(value: string): void {
  try {
    uni.setStorageSync(STORAGE_KEY, value)
  }
  catch {
    /* ignore */
  }
}

function readPersistedShowPay(): string | null {
  try {
    return normalizeShowPay(uni.getStorageSync(STORAGE_KEY))
  }
  catch {
    return null
  }
}

/**
 * 同步 isShowPay：
 * - URL / 页面 query 有 0/1 → 写入本地（覆盖）
 * - 未带参数 → **不覆盖**已写入值；无本地值时默认 1
 *
 * 注意：勿在「路由已丢掉 query」后再用默认 1 覆盖，否则 `?isShowPay=0` 会被冲掉。
 */
export function captureShowPayFromUrl(
  pageQuery?: Record<string, string | undefined> | null,
): void {
  const fromPage = normalizeShowPay(pageQuery?.[IS_SHOW_PAY_QUERY_KEY])
  if (fromPage) {
    persistShowPay(fromPage)
    return
  }
  const fromUrl = readUrlShowPay()
  if (fromUrl) {
    persistShowPay(fromUrl)
    return
  }
  if (!readPersistedShowPay())
    persistShowPay(IS_SHOW_PAY_QUERY_ON)
}

/**
 * 是否走微信支付。
 * 优先 URL / hash；否则读入口持久化；默认 true（等同 isShowPay=1）。
 */
export function isShowPayEnabled(): boolean {
  const fromUrl = readUrlShowPay()
  if (fromUrl != null) {
    persistShowPay(fromUrl)
    return fromUrl === IS_SHOW_PAY_QUERY_ON
  }
  const persisted = readPersistedShowPay()
  if (persisted != null)
    return persisted === IS_SHOW_PAY_QUERY_ON
  return true
}
