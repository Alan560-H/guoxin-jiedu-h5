import type { CreditsVo } from '@/models/guoxin/auth'
import { DAILY_QUESTION_LIMIT } from '@/constants/chatHome'

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'string' && v.trim() === '')
    return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean')
    return v
  if (v === 1 || v === '1' || v === 'true' || v === 'TRUE')
    return true
  return false
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string')
    return undefined
  const t = v.trim()
  return t || undefined
}

/** 约定：questionRemaining / chatRemaining 为 -1（或任意负数）表示问答不限次 */
export function isUnlimitedChatRemaining(remaining: number): boolean {
  return Number.isFinite(remaining) && remaining < 0
}

const CHAT_REMAINING_KEYS = [
  'questionRemaining',
  'question_remaining',
  'chatRemaining',
  'chat_remaining',
  'qaRemaining',
  'qa_remaining',
  'chatQuotaRemaining',
  'dailyQuestionRemaining',
  'questionQuota',
] as const

const UNLIMITED_KEYS = [
  'chatUnlimited',
  'chat_unlimited',
  'questionUnlimited',
  'question_unlimited',
  'qaUnlimited',
  'unlimitedChat',
  'isChatUnlimited',
] as const

/** 把一层业务对象及常见嵌套（data/result/member/quota）摊平，便于取字段 */
function flattenCreditsSource(raw: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const merge = (obj: unknown, depth: number) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 3)
      return
    const rec = obj as Record<string, unknown>
    for (const [k, v] of Object.entries(rec)) {
      if (v != null && typeof v === 'object' && !Array.isArray(v)
        && ['data', 'result', 'member', 'quota', 'status', 'creditsInfo', 'chat'].includes(k)) {
        merge(v, depth + 1)
        continue
      }
      if (!(k in out) || out[k] == null)
        out[k] = v
    }
  }
  merge(raw, 0)
  return out
}

function readFirstNumber(data: Record<string, unknown>, keys: readonly string[]): number | null {
  for (const k of keys) {
    if (data[k] == null)
      continue
    return num(data[k], Number.NaN)
  }
  return null
}

/**
 * 解析统一权益 / member/status data。
 * 问答次：questionRemaining；`<0`（含 -1）或不限次标记 → chatUnlimited
 */
export function parseCreditsPayload(raw: unknown): CreditsVo {
  const data = flattenCreditsSource(raw)

  const credits = num(
    data.credits ?? data.availableCount ?? data.reportCredits ?? data.report_remaining ?? data.reportRemaining,
    0,
  )

  let chatUnlimited = UNLIMITED_KEYS.some(k => bool(data[k]))

  // 先扫一遍：任意剩余字段为负数 → 不限次
  let chatRemaining: number | null = null
  for (const k of CHAT_REMAINING_KEYS) {
    if (data[k] == null)
      continue
    const v = num(data[k], Number.NaN)
    if (!Number.isFinite(v))
      continue
    if (isUnlimitedChatRemaining(v)) {
      chatRemaining = -1
      chatUnlimited = true
      break
    }
    if (chatRemaining == null)
      chatRemaining = v
  }

  const chatFieldsPresent = chatRemaining != null || UNLIMITED_KEYS.some(k => data[k] != null)

  if (chatRemaining == null) {
    chatRemaining = chatUnlimited ? -1 : DAILY_QUESTION_LIMIT
  }

  // 再读一遍优先 questionRemaining（若上面因先扫到其它键漏了 -1，这里兜底）
  const preferred = readFirstNumber(data, ['questionRemaining', 'question_remaining'])
  if (preferred != null && isUnlimitedChatRemaining(preferred)) {
    chatRemaining = -1
    chatUnlimited = true
  }

  const productId = data.productId != null
    ? num(data.productId)
    : (data.product_id != null ? num(data.product_id) : undefined)

  return {
    credits,
    productId,
    chatRemaining: chatUnlimited
      ? (isUnlimitedChatRemaining(chatRemaining) ? -1 : Math.max(chatRemaining, 1))
      : Math.max(0, chatRemaining),
    chatUnlimited,
    chatFieldsPresent,
    memberStatus: str(data.memberStatus ?? data.member_status),
    memberSku: str(data.memberSku ?? data.member_sku),
    memberExpiresAt: str(data.memberExpiresAt ?? data.member_expires_at),
  }
}
