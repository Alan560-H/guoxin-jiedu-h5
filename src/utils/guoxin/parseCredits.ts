import type { CreditsVo } from '@/models/guoxin/auth'
import { DAILY_QUESTION_LIMIT } from '@/constants/chatHome'

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean')
    return v
  if (v === 1 || v === '1' || v === 'true')
    return true
  return false
}

function hasOwn(data: Record<string, unknown>, keys: string[]): boolean {
  return keys.some(k => Object.prototype.hasOwnProperty.call(data, k) && data[k] != null)
}

/**
 * 解析统一权益接口 data。
 * 报告次：credits / availableCount
 * 问答次：chatRemaining / questionRemaining / qaRemaining 等别名
 */
export function parseCreditsPayload(raw: unknown): CreditsVo {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>

  const credits = num(
    data.credits ?? data.availableCount ?? data.reportCredits ?? data.reportRemaining,
    0,
  )

  const chatKeys = [
    'chatRemaining',
    'questionRemaining',
    'qaRemaining',
    'chatQuotaRemaining',
    'dailyQuestionRemaining',
    'questionQuota',
  ]
  const unlimitedKeys = [
    'chatUnlimited',
    'questionUnlimited',
    'qaUnlimited',
    'unlimitedChat',
    'isChatUnlimited',
  ]

  const chatFieldsPresent = hasOwn(data, chatKeys) || hasOwn(data, unlimitedKeys)
  const chatUnlimited = unlimitedKeys.some(k => bool(data[k]))

  let chatRemaining = DAILY_QUESTION_LIMIT
  if (hasOwn(data, chatKeys)) {
    for (const k of chatKeys) {
      if (data[k] != null) {
        chatRemaining = num(data[k], 0)
        break
      }
    }
  }
  else if (chatUnlimited) {
    chatRemaining = DAILY_QUESTION_LIMIT
  }

  const productId = data.productId != null ? num(data.productId) : undefined

  return {
    credits,
    productId,
    chatRemaining: chatUnlimited ? Math.max(chatRemaining, 1) : Math.max(0, chatRemaining),
    chatUnlimited,
    chatFieldsPresent,
  }
}
