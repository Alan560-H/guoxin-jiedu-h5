/** 问答流式请求 / SSE 相关类型 */

export interface ChatMessageRequest {
  query: string
  conversationId?: string
  baziUserId: string
  inputs: ChatMessageInputs
}

export interface ChatMessageInputs {
  reportTime: number
  bizSource: string
  baziUserId: string
  baziInfo: string
  relation: string
  profileName: string
}

export interface ChatStreamSession {
  conversationId: string
  messageId?: string
}

export type ChatStreamQuotaError = Error & { code: 'QUOTA_EXCEEDED' }

export function isChatStreamQuotaError(e: unknown): e is ChatStreamQuotaError {
  return e instanceof Error && (e as ChatStreamQuotaError).code === 'QUOTA_EXCEEDED'
}

export function createChatStreamQuotaError(message = '今日问答次数已用完'): ChatStreamQuotaError {
  const err = new Error(message) as ChatStreamQuotaError
  err.code = 'QUOTA_EXCEEDED'
  return err
}
