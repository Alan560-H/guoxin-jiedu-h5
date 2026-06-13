/** 提取后端 msg 并 toast（HTTP/业务错误优先展示 msg） */
export function toastApiError(error: unknown, fallback = '请求失败'): string {
  const msg = extractApiErrorMsg(error, fallback)
  uni.hideLoading()
  uni.showToast({ title: msg, icon: 'none', duration: 2500 })
  return msg
}

/** toast 后再 resolve，便于跳转前让用户看到 msg */
export function toastApiErrorAndWait(
  error: unknown,
  fallback = '请求失败',
  duration = 2500,
): Promise<string> {
  const msg = extractApiErrorMsg(error, fallback)
  uni.hideLoading()
  return new Promise((resolve) => {
    uni.showToast({
      title: msg,
      icon: 'none',
      duration,
      complete: () => resolve(msg),
    })
  })
}

export interface ApiErrorModalOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  fallback?: string
}

/** 弹窗展示后端 msg；confirm / cancel 由用户选择，不自动跳转 */
export function showApiErrorModal(
  error: unknown,
  options: ApiErrorModalOptions = {},
): Promise<'confirm' | 'cancel'> {
  const msg = extractApiErrorMsg(error, options.fallback ?? '请求失败')
  uni.hideLoading()
  return new Promise((resolve) => {
    uni.showModal({
      title: options.title ?? '提示',
      content: msg,
      confirmText: options.confirmText ?? '确定',
      cancelText: options.cancelText ?? '取消',
      showCancel: true,
      success: (res) => resolve(res.confirm ? 'confirm' : 'cancel'),
      fail: () => resolve('cancel'),
    })
  })
}

/** 从拦截器 reject 的 rawData 或 Error 中提取后端 msg */
export function extractApiErrorMsg(error: unknown, fallback = '请求失败'): string {
  if (error && typeof error === 'object') {
    const o = error as Record<string, unknown>
    if (typeof o.msg === 'string' && o.msg.trim())
      return o.msg.trim()
    if (typeof o.message === 'string' && o.message.trim())
      return o.message.trim()
  }
  if (error instanceof Error && error.message && !/^请求错误\[\d+\]$/.test(error.message))
    return error.message
  return fallback
}

/** 从 HTTP 响应体解析业务 msg（HTTP 4xx/5xx 时 body 可能仍是 JSON） */
export function extractHttpResponseMsg(rawData: unknown, statusCode: number): string {
  const fallback = `请求错误[${statusCode}]`
  if (rawData && typeof rawData === 'object') {
    const body = rawData as { msg?: unknown, message?: unknown }
    if (typeof body.msg === 'string' && body.msg.trim())
      return body.msg.trim()
    if (typeof body.message === 'string' && body.message.trim())
      return body.message.trim()
  }
  if (typeof rawData === 'string') {
    try {
      const parsed = JSON.parse(rawData) as { msg?: string }
      if (typeof parsed.msg === 'string' && parsed.msg.trim())
        return parsed.msg.trim()
    }
    catch {
      // ignore
    }
  }
  return fallback
}
