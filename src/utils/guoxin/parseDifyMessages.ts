import type { DifyHistoryMessageItem, DifyHistoryMessagesPage } from '@/models/guoxin/dify'

/**
 * 国心 GET /dify/messages 响应约定（业务层）：
 * {
 *   code: 200,
 *   data: {
 *     data: [{ id, query, answer, conversation_id, created_at, ... }],
 *     limit: 99,
 *     has_more: false
 *   }
 * }
 */

export interface ParsedHistoryChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  showFeedback?: boolean
  feedback?: '' | 'helpful' | 'improve'
  createdAt: number
}

export interface ParsedDifyHistory {
  messages: ParsedHistoryChatMessage[]
  conversationId: string
  hasMore: boolean
  /** 本页最早一条 Dify message id，用于 firstId 翻页 */
  firstId: string
}

function peelPage(raw: unknown): DifyHistoryMessagesPage | null {
  if (!raw || typeof raw !== 'object')
    return null
  const root = raw as Record<string, unknown>

  // { code, data: { data, limit, has_more } }
  if ('data' in root && root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    const mid = root.data as Record<string, unknown>
    if (Array.isArray(mid.data) || 'has_more' in mid || 'hasMore' in mid || 'limit' in mid)
      return mid as DifyHistoryMessagesPage
  }

  // 已是分页壳 { data, limit, has_more }
  if (Array.isArray(root.data) || 'has_more' in root || 'hasMore' in root)
    return root as DifyHistoryMessagesPage

  return null
}

function asItemList(raw: unknown): DifyHistoryMessageItem[] {
  if (!raw)
    return []
  if (Array.isArray(raw))
    return raw as DifyHistoryMessageItem[]

  const page = peelPage(raw)
  if (page) {
    const nested = page.data ?? page.list ?? page.records
    if (Array.isArray(nested))
      return nested
  }

  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const nested = o.list ?? o.records ?? o.items
    if (Array.isArray(nested))
      return nested as DifyHistoryMessageItem[]
  }
  return []
}

function createdAtMs(item: DifyHistoryMessageItem): number {
  const sec = Number(item.created_at ?? item.createdAt ?? 0)
  if (!Number.isFinite(sec) || sec <= 0)
    return Date.now()
  // Dify 多为秒级时间戳
  return sec < 1e12 ? sec * 1000 : sec
}

function mapFeedback(raw: unknown): '' | 'helpful' | 'improve' {
  if (!raw || typeof raw !== 'object')
    return ''
  const rating = String((raw as Record<string, unknown>).rating ?? '').toLowerCase()
  if (rating === 'like' || rating === 'helpful' || rating === 'positive')
    return 'helpful'
  if (rating === 'dislike' || rating === 'improve' || rating === 'negative')
    return 'improve'
  return ''
}

/** 将接口响应转为按时间正序的气泡列表 */
export function parseDifyMessagesPayload(raw: unknown): ParsedDifyHistory {
  const page = peelPage(raw)
  const items = asItemList(raw)
  const sorted = [...items].sort((a, b) => createdAtMs(a) - createdAtMs(b))

  const messages: ParsedHistoryChatMessage[] = []
  let conversationId = ''
  let firstId = ''

  for (const item of sorted) {
    const baseId = String(item.id || '').trim() || `msg_${createdAtMs(item)}`
    if (!firstId && baseId)
      firstId = baseId
    const cid = String(item.conversation_id ?? item.conversationId ?? '').trim()
    if (cid)
      conversationId = cid

    const query = typeof item.query === 'string' ? item.query.trim() : ''
    const answer = typeof item.answer === 'string' ? item.answer.trim() : ''
    const ts = createdAtMs(item)
    const fb = mapFeedback(item.feedback)

    if (query) {
      messages.push({
        id: `${baseId}-u`,
        role: 'user',
        content: query,
        createdAt: ts,
      })
    }
    if (answer) {
      messages.push({
        id: `${baseId}-a`,
        role: 'assistant',
        content: answer,
        showFeedback: true,
        feedback: fb,
        createdAt: ts + 1,
      })
    }
  }

  const hasMore = Boolean(page?.has_more ?? page?.hasMore)

  return { messages, conversationId, hasMore, firstId }
}
