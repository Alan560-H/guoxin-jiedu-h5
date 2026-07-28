/** 问答流式请求 / SSE 相关类型 */

/**
 * streamChat 附件字段（对齐 Dify files）
 * 请求体字段名为 files
 */
export interface StreamChatFile {
  type: string
  transfer_method: 'remote_url' | 'local_file'
  url: string
  upload_file_id: string
}

export interface ChatMessageRequest {
  /** 档案 ID */
  profileId: number | string
  query: string
  files?: StreamChatFile[]
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

/** 无图时仍按约定传占位 files */
export function defaultStreamChatFiles(): StreamChatFile[] {
  return [{
    type: 'image',
    transfer_method: 'local_file',
    url: '',
    upload_file_id: '',
  }]
}

/** 有图时用 upload 返回的 id 组装 files；无 id 则回退占位 */
export function buildStreamChatFiles(uploadFileId?: string): StreamChatFile[] {
  const id = String(uploadFileId || '').trim()
  if (!id)
    return defaultStreamChatFiles()
  return [{
    type: 'image',
    transfer_method: 'local_file',
    url: '',
    upload_file_id: id,
  }]
}

/** composer 选图上传成功后的待发送附件 */
export interface ChatComposerAttachment {
  localPath: string
  file: StreamChatFile
}
