import { PROJECT_CODE_QUERY_KEY, SHOW_BACK_ENTRY_URL } from '@/constants/guoxin'

/** 本地持久化：入口带 ?projectCode 后，跳转丢 query 时仍可读 */
const STORAGE_KEY = 'guoxin-project-code'

function normalizeProjectCode(raw: unknown): string | null {
  if (raw == null)
    return null
  const value = String(raw).trim()
  return value.length > 0 ? value : null
}

function readUrlProjectCode(): string | null {
  if (typeof window === 'undefined')
    return null
  try {
    const fromSearch = normalizeProjectCode(
      new URLSearchParams(window.location.search).get(PROJECT_CODE_QUERY_KEY),
    )
    if (fromSearch)
      return fromSearch
    const hash = window.location.hash || ''
    const qIndex = hash.indexOf('?')
    if (qIndex < 0)
      return null
    return normalizeProjectCode(
      new URLSearchParams(hash.slice(qIndex + 1)).get(PROJECT_CODE_QUERY_KEY),
    )
  }
  catch {
    return null
  }
}

function persistProjectCode(value: string): void {
  try {
    uni.setStorageSync(STORAGE_KEY, value)
  }
  catch {
    /* ignore */
  }
}

function clearPersistedProjectCode(): void {
  try {
    uni.removeStorageSync(STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

function readPersistedProjectCode(): string | null {
  try {
    return normalizeProjectCode(uni.getStorageSync(STORAGE_KEY))
  }
  catch {
    return null
  }
}

/**
 * 同步 projectCode：
 * - URL / 页面 query 有值 → 写入本地
 * - 首页冷启动明确无参时可 clearIfAbsent，避免沿用上次入口
 * - 其余无参 → 不覆盖（避免路由丢掉 query 后误清）
 */
export function captureProjectCodeFromUrl(
  pageQuery?: Record<string, string | undefined> | null,
  options?: { clearIfAbsent?: boolean },
): void {
  const fromPage = normalizeProjectCode(pageQuery?.[PROJECT_CODE_QUERY_KEY])
  if (fromPage) {
    persistProjectCode(fromPage)
    return
  }
  const fromUrl = readUrlProjectCode()
  if (fromUrl) {
    persistProjectCode(fromUrl)
    return
  }
  if (options?.clearIfAbsent)
    clearPersistedProjectCode()
}

/** 当前入口 projectCode：优先 URL，否则读本地 */
export function getProjectCode(): string | null {
  const fromUrl = readUrlProjectCode()
  if (fromUrl) {
    persistProjectCode(fromUrl)
    return fromUrl
  }
  return readPersistedProjectCode()
}

export function hasProjectCode(): boolean {
  return !!getProjectCode()
}

/** 回轻舟发现页并带回 projectCode，如 https://nr.cxfangtang.cn/?projectCode=xxx */
export function buildShowBackEntryUrl(): string {
  const code = getProjectCode()
  const base = SHOW_BACK_ENTRY_URL.replace(/\?.*$/, '').replace(/\/?$/, '/')
  if (!code)
    return base
  const url = new URL(base)
  url.searchParams.set(PROJECT_CODE_QUERY_KEY, code)
  return url.toString()
}
