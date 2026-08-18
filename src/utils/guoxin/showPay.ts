import { ref } from 'vue'
import { getH5Module } from '@/api/h5'
import {
  IS_SHOW_PAY_OFF,
  IS_SHOW_PAY_ON,
} from '@/constants/guoxin'

const STORAGE_KEY = 'guoxin-is-show-pay'
const MODULE_PROJECT_CODE = 'isShowPay'

function normalizeShowPay(raw: unknown): string | null {
  if (raw == null)
    return null
  const value = String(raw).trim()
  if (value === IS_SHOW_PAY_ON || value === IS_SHOW_PAY_OFF)
    return value
  return null
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
 * 购买模块开关。先使用最近一次接口成功值，首次访问保持原有默认值 1。
 * ref 让现有 computed 在接口返回后自动更新显示状态。
 */
const showPayValue = ref(readPersistedShowPay() ?? IS_SHOW_PAY_ON)
let refreshPromise: Promise<boolean> | null = null

/** 清理历史入口遗留的 isShowPay 参数，开关值只以接口为准。 */
export function removeLegacyShowPayFromUrl(): void {
  if (typeof window === 'undefined')
    return

  try {
    const url = new URL(window.location.href)
    let changed = false

    if (url.searchParams.has(MODULE_PROJECT_CODE)) {
      url.searchParams.delete(MODULE_PROJECT_CODE)
      changed = true
    }

    const hashQueryIndex = url.hash.indexOf('?')
    if (hashQueryIndex >= 0) {
      const hashPath = url.hash.slice(0, hashQueryIndex)
      const hashParams = new URLSearchParams(url.hash.slice(hashQueryIndex + 1))
      if (hashParams.has(MODULE_PROJECT_CODE)) {
        hashParams.delete(MODULE_PROJECT_CODE)
        const query = hashParams.toString()
        url.hash = `${hashPath}${query ? `?${query}` : ''}`
        changed = true
      }
    }

    if (changed)
      window.history.replaceState({}, '', url.toString())
  }
  catch {
    // URL 清理失败不影响页面启动和接口开关。
  }
}

/**
 * 从 H5 模块配置接口刷新购买模块开关。
 * 仅接受 data[0].value 的 0/1；请求或数据异常时保留当前值。
 */
export async function refreshShowPayFromApi(): Promise<boolean> {
  if (refreshPromise)
    return refreshPromise

  const task = (async () => {
    try {
      const response = await getH5Module(MODULE_PROJECT_CODE)
      const value = normalizeShowPay(response.data?.[0]?.value)
      if (value != null) {
        showPayValue.value = value
        persistShowPay(value)
      }
    }
    catch {
      // 配置接口失败时沿用缓存/当前值，不打断页面主流程。
    }
    return showPayValue.value === IS_SHOW_PAY_ON
  })()

  refreshPromise = task
  try {
    return await task
  }
  finally {
    if (refreshPromise === task)
      refreshPromise = null
  }
}

/** value=1 显示购买模块；value=0 隐藏购买模块。 */
export function isShowPayEnabled(): boolean {
  return showPayValue.value === IS_SHOW_PAY_ON
}
