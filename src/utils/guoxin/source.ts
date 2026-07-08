import { SOURCE_QUERY_KEY } from '@/constants/guoxin'
import { getOAuthCodeFromUrl } from '@/utils/weixin/env'

/** 本地 key：带 ?source 进入后，SPA / OAuth 回跳丢 query 时仍可读写请求头 */
const STORAGE_KEY = 'guoxin-source'

function readUrlSource(): string | null {
  if (typeof window === 'undefined')
    return null
  try {
    const raw = new URLSearchParams(window.location.search).get(SOURCE_QUERY_KEY)
    if (raw == null)
      return null
    const value = raw.trim()
    return value.length > 0 ? value : null
  }
  catch {
    return null
  }
}

function persistSource(value: string): void {
  try {
    uni.setStorageSync(STORAGE_KEY, value)
  }
  catch {
    /* ignore */
  }
}

function clearPersistedSource(): void {
  try {
    uni.removeStorageSync(STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

function readPersistedSource(): string | null {
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
 * - 有 source → 写入本地（覆盖）
 * - 微信 OAuth 回跳（仅 code/state）→ 保留已写入本地，勿误清
 * - 其余无 source → 清除本地，后续请求不带头
 */
export function captureSourceFromUrl(): void {
  const fromUrl = readUrlSource()
  if (fromUrl) {
    persistSource(fromUrl)
    return
  }
  if (getOAuthCodeFromUrl())
    return
  clearPersistedSource()
}

/** 当前应带到请求头的 source：优先 URL；无则读本次捕获写入的本地 */
export function getSource(): string | null {
  const fromUrl = readUrlSource()
  if (fromUrl) {
    persistSource(fromUrl)
    return fromUrl
  }
  return readPersistedSource()
}
