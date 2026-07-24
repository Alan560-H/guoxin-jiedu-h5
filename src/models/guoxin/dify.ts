/** 国心二期 Dify 相关接口类型 */

export interface MemberStatusVo {
  memberStatus?: string
  memberSku?: string
  memberExpiresAt?: string
  questionUnlimited?: boolean
  questionRemaining?: number
  reportCredits?: number
  /** 兼容旧字段 */
  credits?: number
  availableCount?: number
  chatRemaining?: number
  chatUnlimited?: boolean
  productId?: number
}

export interface DifyChatFile {
  type: string
  transfer_method: 'remote_url' | 'local_file'
  url?: string
  upload_file_id?: string
}

export interface DifyUploadResult {
  id?: string
  name?: string
  extension?: string
  mime_type?: string
  size?: number
  /** 上传成功后的可访问地址（streamChat file.url 用这个） */
  source_url?: string
  preview_url?: string | null
  original_url?: string | null
  tenant_id?: string
  created_at?: number
  created_by?: string
  /** 兼容旧字段 */
  fileId?: string
  url?: string
  [key: string]: unknown
}

export interface DifyPreviewResult {
  url?: string
  previewUrl?: string
  [key: string]: unknown
}

/** GET dify/messages 单条（对齐 Dify message list） */
export interface DifyHistoryMessageItem {
  id?: string
  conversation_id?: string
  conversationId?: string
  query?: string
  answer?: string
  created_at?: number
  createdAt?: number
  [key: string]: unknown
}

export interface DifyHistoryMessagesPage {
  limit?: number
  has_more?: boolean
  hasMore?: boolean
  data?: DifyHistoryMessageItem[]
  list?: DifyHistoryMessageItem[]
  records?: DifyHistoryMessageItem[]
  [key: string]: unknown
}
