import { SOURCE_USER_QUERY_KEY } from '@/constants/guoxin'

/** 本地 key：仅本次带 ?source_user 进入后，SPA 跳转丢 query 时仍可读写请求头 */
const STORAGE_KEY = 'guoxin-source-user'

function readUrlSourceUser(): string | null {
  if (typeof window === 'undefined')
    return null
  try {
    const raw = new URLSearchParams(window.location.search).get(SOURCE_USER_QUERY_KEY)
    if (raw == null)
      return null
    const value = raw.trim()
    return value.length > 0 ? value : null
  }
  catch {
    return null
  }
}

function persistSourceUser(value: string): void {
  try {
    uni.setStorageSync(STORAGE_KEY, value)
  }
  catch {
    /* ignore */
  }
}

function clearPersistedSourceUser(): void {
  try {
    uni.removeStorageSync(STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

function readPersistedSourceUser(): string | null {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw == null || raw === '')
      return null
    const value = String(raw).trim()
    return value.length > 0 ? value : null
  }
  catch {
    return null
  }
}

/**
 * 首屏根据 URL 同步来源：
 * - 有 source_user → 写入本地（覆盖）
 * - 无 → 清除本地，后续请求不带头
 */
export function captureSourceUserFromUrl(): void {
  const fromUrl = readUrlSourceUser()
  if (fromUrl)
    persistSourceUser(fromUrl)
  else
    clearPersistedSourceUser()
}

/** 当前应带到请求头的 source_user：优先 URL；无则读本次捕获写入的本地 */
export function getSourceUser(): string | null {
  const fromUrl = readUrlSourceUser()
  if (fromUrl) {
    persistSourceUser(fromUrl)
    return fromUrl
  }
  return readPersistedSourceUser()
}
