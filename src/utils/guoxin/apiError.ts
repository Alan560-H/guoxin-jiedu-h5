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
    const msg = (rawData as { msg?: unknown }).msg
    if (typeof msg === 'string' && msg.trim())
      return msg.trim()
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
