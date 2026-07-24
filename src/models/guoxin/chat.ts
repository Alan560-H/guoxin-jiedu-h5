/** 问答流式请求 / SSE 相关类型 */

/**
 * streamChat 附件字段（与后端约定一致；字段名即为 tyep）
 */
export interface StreamChatFile {
  tyep: string
  transfer_method: 'remote_url' | 'local_file'
  url: string
}

export interface ChatMessageRequest {
  /** 档案 ID */
  profileId: number | string
  query: string
  file?: StreamChatFile[]
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

/** 无图时仍按约定传占位 file */
export function defaultStreamChatFiles(): StreamChatFile[] {
  return [{
    tyep: 'image',
    transfer_method: 'remote_url',
    url: '',
  }]
}
