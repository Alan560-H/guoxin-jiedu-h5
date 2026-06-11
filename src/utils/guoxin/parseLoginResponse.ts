/** 国心 wxLogin / userInfo 归一化后的会话字段 */
export interface GuoxinLoginSession {
  userId?: number
  mobile?: string
  bindStatus?: number
  token?: string
  openId?: string
  openid?: string
  nickname?: string
  avatarUrl?: string
  needBindMobile?: boolean
}

/** 归一化 guoxin 登录 / userInfo 接口 data，兼容 Java 多种字段命名与嵌套 */
export function parseGuoxinLoginData(raw: Record<string, unknown> | null | undefined): GuoxinLoginSession {
  if (!raw || typeof raw !== 'object')
    return {}

  const nested = (raw.userInfo ?? raw.user ?? {}) as Record<string, unknown>
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const v = raw[key] ?? nested[key]
      if (v !== undefined && v !== null && v !== '')
        return v
    }
    return undefined
  }

  const token = pick('token', 'accessToken', 'access_token') as string | undefined
  const userIdRaw = pick('userId', 'user_id', 'id')
  const userId = userIdRaw != null ? Number(userIdRaw) : undefined
  const mobile = (pick('mobile', 'phonenumber', 'phone', 'phoneMasked') as string | undefined) ?? ''
  const bindStatusRaw = pick('bindStatus', 'bind_status')
  const bindStatus = bindStatusRaw != null ? Number(bindStatusRaw) : undefined
  const openId = (pick('openId', 'openid', 'wxOpenId', 'wx_openid') as string | undefined)
  const nickname = pick('nickname', 'nickName', 'nick_name') as string | undefined
  const avatarUrl = pick('avatarUrl', 'avatar', 'headImgUrl', 'head_img_url') as string | undefined
  const needBindMobileRaw = pick('needBindMobile', 'need_bind_mobile')
  const needBindMobile = needBindMobileRaw != null
    ? Boolean(needBindMobileRaw)
    : (raw.step === 'need_phone' || nested.step === 'need_phone')

  return {
    userId: Number.isFinite(userId) ? userId : undefined,
    mobile,
    bindStatus,
    token,
    openId,
    openid: openId,
    nickname,
    avatarUrl,
    needBindMobile,
  }
}

export const GUOXIN_USER_SESSION_KEY = 'guoxin-user-session'

export function readGuoxinUserSessionSnapshot(): GuoxinLoginSession | null {
  try {
    const raw = uni.getStorageSync(GUOXIN_USER_SESSION_KEY)
    if (!raw)
      return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  }
  catch {
    return null
  }
}

export function writeGuoxinUserSessionSnapshot(session: GuoxinLoginSession) {
  try {
    uni.setStorageSync(GUOXIN_USER_SESSION_KEY, JSON.stringify(session))
  }
  catch {
    // ignore
  }
}

export function clearGuoxinUserSessionSnapshot() {
  try {
    uni.removeStorageSync(GUOXIN_USER_SESSION_KEY)
  }
  catch {
    // ignore
  }
}
