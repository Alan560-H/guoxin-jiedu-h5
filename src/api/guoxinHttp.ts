import type { ResponseData } from '@/models/responseData'
import { dev, prod } from '@/api/env'

const GUOXIN_TOKEN_KEY = 'guoxin-token'
const baseUrl = import.meta.env.DEV ? dev.baseUrl : prod.baseUrl

export function getGuoxinToken(): string {
  return uni.getStorageSync(GUOXIN_TOKEN_KEY) || ''
}

export function setGuoxinToken(token: string) {
  uni.setStorageSync(GUOXIN_TOKEN_KEY, token)
}

export function clearGuoxinToken() {
  uni.removeStorageSync(GUOXIN_TOKEN_KEY)
}

interface GuoxinRequestOptions {
  method?: string
  params?: Record<string, string | number | undefined>
  body?: object
  loading?: boolean
  toast?: boolean
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${baseUrl}${path}`, 'http://localhost')
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '')
        url.searchParams.set(k, String(v))
    })
  }
  return `${baseUrl}${path}${url.search}`
}

async function guoxinRequest<T>(path: string, options: GuoxinRequestOptions = {}): Promise<ResponseData<T>> {
  const { method = 'GET', params, body, loading = true, toast = true } = options
  if (loading)
    uni.showLoading({ title: '加载中...', mask: true })

  try {
    const token = getGuoxinToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token)
      headers.Authorization = `Bearer ${token}`

    let res: Response
    try {
      res = await fetch(buildUrl(path, params), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
    }
    catch {
      if (toast)
        uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      return Promise.reject(new Error('network'))
    }

    let rawData: ResponseData<T>
    try {
      rawData = await res.json() as ResponseData<T>
    }
    catch {
      if (toast)
        uni.showToast({ title: '服务响应异常', icon: 'none' })
      return Promise.reject(new Error('invalid_json'))
    }

    const { code, msg = '请求错误' } = rawData

    if (code === 4002)
      return Promise.reject({ ...rawData, needAuth: true })

    if (!(code >= 200 && code < 300)) {
      if (toast)
        uni.showToast({ title: msg, icon: 'none' })
      return Promise.reject(rawData)
    }
    return rawData
  }
  finally {
    if (loading)
      uni.hideLoading()
  }
}

export function guoxinGet<T>(path: string, params?: Record<string, string | number | undefined>, opts?: Partial<GuoxinRequestOptions>) {
  return guoxinRequest<T>(path, { method: 'GET', params, ...opts })
}

export function guoxinPost<T>(path: string, body?: object, opts?: Partial<GuoxinRequestOptions>) {
  return guoxinRequest<T>(path, { method: 'POST', body, ...opts })
}

export function guoxinPut<T>(path: string, body?: object, opts?: Partial<GuoxinRequestOptions>) {
  return guoxinRequest<T>(path, { method: 'PUT', body, ...opts })
}

export function guoxinDelete<T>(path: string, opts?: Partial<GuoxinRequestOptions>) {
  return guoxinRequest<T>(path, { method: 'DELETE', ...opts })
}
