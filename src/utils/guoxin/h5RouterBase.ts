/** uni H5 router.base（如 /h6/），与 manifest h5.router.base 一致 */
export function getH5RouterBase(): string {
  const raw = import.meta.env.BASE_URL || '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

/** 拼接带 base 的 H5 路径，如 /h6/pages/credits/index */
export function joinH5RouterPath(routerPath: string): string {
  const segment = routerPath.replace(/^\//, '')
  const base = getH5RouterBase()
  if (base === '/')
    return `/${segment}`
  return `${base}${segment}`.replace(/\/{2,}/g, '/')
}

/** MWEB 支付完成/取消后回跳地址（须含 router.base，避免落到 /pages/... 丢前缀） */
export function buildCreditsPayReturnUrl(): string {
  if (typeof window === 'undefined')
    return ''
  const path = joinH5RouterPath('/pages/credits/index')
  const url = new URL(path, window.location.origin)
  url.searchParams.set('payReturn', '1')
  return url.href
}

/**
 * 微信 MWEB 回跳若落在 /pages/...（无 /h6），纠正到带 base 的地址。
 * 典型原因：后端 redirect_url 未含子路径前缀。
 */
export function ensureH5RouterBasePath(): boolean {
  if (typeof window === 'undefined')
    return false
  const base = getH5RouterBase()
  if (base === '/')
    return false
  const basePrefix = base.replace(/\/$/, '')
  const { pathname, search, hash } = window.location
  if (pathname === basePrefix || pathname.startsWith(`${basePrefix}/`))
    return false
  if (!pathname.startsWith('/pages/'))
    return false
  const fixed = `${basePrefix}${pathname}${search}${hash}`
  window.location.replace(fixed)
  return true
}
