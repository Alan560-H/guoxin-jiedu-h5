import type { ChatMessageRequest, ChatStreamSession } from '@/models/guoxin/chat'
import { createChatStreamQuotaError } from '@/models/guoxin/chat'
import { isAppEmbeddedWebView } from '@/utils/appWebView'
import { repairStreamMarkdownArtifacts } from '@/utils/guoxin/chat'
import { getSource } from '@/utils/guoxin/source'

const STREAM_TIMEOUT_MS = 180_000
/** 国心二期流式问答 */
const CHAT_MESSAGES_PATH = '/api/yiqixue/app/guoxin/dify/streamChat'

export interface ChatStreamHandlers {
  onDelta?: (fullText: string) => void
  onSession?: (session: ChatStreamSession) => void
}

function mergeAbortWithTimeout(
  userSignal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal | undefined {
  if (typeof AbortSignal === 'undefined' || typeof AbortSignal.timeout !== 'function')
    return userSignal
  const timeoutSig = AbortSignal.timeout(timeoutMs)
  if (!userSignal)
    return timeoutSig
  if (typeof AbortSignal.any === 'function')
    return AbortSignal.any([userSignal, timeoutSig])
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  userSignal.addEventListener('abort', onAbort, { once: true })
  timeoutSig.addEventListener('abort', onAbort, { once: true })
  return controller.signal
}

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'custom-eader': isAppEmbeddedWebView() ? 'app' : 'apph5',
  }
  const source = getSource()
  if (source)
    headers.source = source
  const token = uni.getStorageSync('apph5Token') as string
  if (token)
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  return headers
}

function looksLikeQuotaMessage(msg: string): boolean {
  return /次数|额度|用完|用尽|quota|剩余\s*0/i.test(msg)
}

function extractDeltaText(payload: Record<string, unknown>): string {
  if (typeof payload.answer === 'string')
    return payload.answer
  if (typeof payload.content === 'string')
    return payload.content
  if (typeof payload.text === 'string')
    return payload.text
  if (typeof payload.delta === 'string')
    return payload.delta
  const data = payload.data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.answer === 'string')
      return d.answer
    if (typeof d.content === 'string')
      return d.content
  }
  return ''
}

function pickSession(payload: Record<string, unknown>): ChatStreamSession | null {
  const conversationId = String(
    payload.conversation_id
    ?? payload.conversationId
    ?? (payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>).conversation_id
      ?? (payload.data as Record<string, unknown>).conversationId
      : '')
    ?? '',
  ).trim()
  const messageId = String(
    payload.message_id
    ?? payload.messageId
    ?? payload.id
    ?? (payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>).message_id
      ?? (payload.data as Record<string, unknown>).messageId
      ?? (payload.data as Record<string, unknown>).id
      : '')
    ?? '',
  ).trim()
  if (!conversationId && !messageId)
    return null
  return {
    conversationId: conversationId || '',
    messageId: messageId || undefined,
  }
}

/**
 * H5 流式问答：fetch + ReadableStream 解析 SSE / 兼容 JSON 整包。
 */
export async function postChatMessagesStream(
  body: ChatMessageRequest,
  handlers: ChatStreamHandlers = {},
  signal?: AbortSignal,
): Promise<string> {
  const query = (body.query ?? '').trim()
  if (!query)
    return ''

  const profileIdNum = Number(body.profileId)
  const profileId = Number.isFinite(profileIdNum) && !Number.isNaN(profileIdNum)
    ? profileIdNum
    : body.profileId

  const files = (body.files ?? [])
    .filter(f => String(f.upload_file_id || '').trim())
    .map(f => ({
      type: f.type || 'image',
      transfer_method: f.transfer_method || 'local_file',
      url: f.url ?? '',
      upload_file_id: String(f.upload_file_id).trim(),
    }))

  const conversationId = String(body.conversationId || '').trim()

  const payload: Record<string, unknown> = {
    profileId,
    query,
  }
  if (conversationId)
    payload.conversationId = conversationId
  const userinputBazi = String(body.userinput_bazi || '').trim()
  if (userinputBazi)
    payload.inputs = { userinput_bazi: userinputBazi }
  if (files.length)
    payload.files = files

  const mergedSignal = mergeAbortWithTimeout(signal, STREAM_TIMEOUT_MS)
  const response = await fetch(CHAT_MESSAGES_PATH, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
    signal: mergedSignal,
  })

  if (!response.ok) {
    let msg = `问答服务暂不可用（${response.status}）`
    try {
      const errBody = await response.json() as { msg?: string, message?: string }
      msg = errBody.msg || errBody.message || msg
    }
    catch {
      // ignore
    }
    if (response.status === 429 || looksLikeQuotaMessage(msg))
      throw createChatStreamQuotaError(msg)
    throw new Error(msg)
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const payload = await response.json() as Record<string, unknown>
    const code = Number(payload.code)
    if (Number.isFinite(code) && !(code >= 200 && code < 300)) {
      const msg = String(payload.msg || payload.message || '请求失败')
      if (code === 429 || looksLikeQuotaMessage(msg))
        throw createChatStreamQuotaError(msg)
      throw new Error(msg)
    }
    const session = pickSession(payload)
    if (session)
      handlers.onSession?.(session)
    const text = repairStreamMarkdownArtifacts(extractDeltaText(payload).trim())
    if (text)
      handlers.onDelta?.(text)
    return text
  }

  if (!response.body)
    return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''
  let isAborted = false
  let chunkRafId: number | null = null

  const clearChunkRaf = () => {
    if (chunkRafId !== null) {
      cancelAnimationFrame(chunkRafId)
      chunkRafId = null
    }
  }

  const onAbort = () => {
    isAborted = true
    clearChunkRaf()
  }
  mergedSignal?.addEventListener('abort', onAbort)

  const scheduleEmit = () => {
    if (!handlers.onDelta || isAborted)
      return
    const emit = () => {
      if (!isAborted)
        handlers.onDelta?.(repairStreamMarkdownArtifacts(fullText))
    }
    if (typeof requestAnimationFrame !== 'function') {
      emit()
      return
    }
    if (chunkRafId !== null)
      return
    chunkRafId = requestAnimationFrame(() => {
      chunkRafId = null
      emit()
    })
  }

  const appendText = (text: string) => {
    if (!text || isAborted)
      return
    fullText += text
    scheduleEmit()
  }

  const appendFromSseData = (rawData: string) => {
    const trimmed = rawData.replace(/\r/g, '').trim()
    if (!trimmed || trimmed === '[DONE]')
      return
    try {
      const isJson = (trimmed.startsWith('{') && trimmed.endsWith('}'))
        || (trimmed.startsWith('[') && trimmed.endsWith(']'))
      if (!isJson) {
        if (/^done$/i.test(trimmed))
          return
        appendText(rawData)
        return
      }
      const payload = JSON.parse(trimmed) as Record<string, unknown>
      const event = String(payload.event || '')
      if (event === 'error' || payload.status === 'error') {
        const msg = String(payload.message || payload.msg || '流式响应异常')
        if (looksLikeQuotaMessage(msg))
          throw createChatStreamQuotaError(msg)
        throw new Error(msg)
      }
      const session = pickSession(payload)
      if (session)
        handlers.onSession?.(session)
      if (
        event === 'message_end'
        || event === 'workflow_finished'
        || event === 'done'
      ) {
        return
      }
      const delta = extractDeltaText(payload)
      if (delta)
        appendText(delta)
    }
    catch (e) {
      if (e instanceof Error && (e as { code?: string }).code === 'QUOTA_EXCEEDED')
        throw e
      if (e instanceof SyntaxError)
        appendText(rawData)
      else if (e instanceof Error && e.message && !e.message.includes('JSON'))
        throw e
      else
        appendText(rawData)
    }
  }

  const handleSseEventBlock = (block: string) => {
    const lines = block.split('\n')
    let eventName = 'message'
    /** 二期 SSE：`id:` 行即为 suggested 接口所需的 messageId */
    let sseMessageId = ''
    const dataLines: string[] = []
    for (const line of lines) {
      if (!line)
        continue
      if (line.startsWith('id:')) {
        sseMessageId = line.slice(3).trim()
        continue
      }
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim() || 'message'
        continue
      }
      if (line.startsWith('data:'))
        dataLines.push(line.slice(5))
    }
    if (sseMessageId)
      handlers.onSession?.({ conversationId: '', messageId: sseMessageId })

    const payload = dataLines.join('\n')
    if (eventName === 'error') {
      const msg = payload.trim() || '流式响应异常'
      if (looksLikeQuotaMessage(msg))
        throw createChatStreamQuotaError(msg)
      throw new Error(msg)
    }
    if (eventName === 'session') {
      const conversationId = payload.trim()
      if (conversationId)
        handlers.onSession?.({ conversationId })
      return
    }
    // 结束/心跳事件不当正文（避免气泡末尾出现 done）
    if (
      eventName === 'done'
      || eventName === 'ping'
      || eventName === 'message_end'
      || eventName === 'workflow_finished'
    ) {
      return
    }
    if (payload === '') {
      appendText('\n')
      return
    }
    if (/^done$/i.test(payload.trim()))
      return
    appendFromSseData(payload)
  }

  const consumeBuffer = (flush = false) => {
    const normalized = buffer.replace(/\r\n/g, '\n')
    const blocks = flush ? [normalized] : normalized.split('\n\n')
    const count = flush ? blocks.length : Math.max(0, blocks.length - 1)
    for (let i = 0; i < count; i++) {
      const block = blocks[i]
      if (block?.trim())
        handleSseEventBlock(block)
    }
    buffer = flush ? '' : (blocks[blocks.length - 1] || '')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done || isAborted)
        break
      buffer += decoder.decode(value, { stream: true })
      consumeBuffer(false)
    }
    buffer += decoder.decode()
    consumeBuffer(true)
    const repaired = repairStreamMarkdownArtifacts(fullText)
    if (handlers.onDelta && repaired)
      handlers.onDelta(repaired)
    return repaired.trim()
  }
  finally {
    mergedSignal?.removeEventListener('abort', onAbort)
    clearChunkRaf()
  }
}
