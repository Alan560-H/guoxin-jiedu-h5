import { prepareMarkdownForDisplay } from '@/utils/guoxin/chat/displayMarkdownPrep'
import { normalizeMarkdownText } from '@/utils/guoxin/chat/markdownNormalize'
import { ERROR_HTML, ERROR_TEXT, renderAssistantMarkdownHtml } from '@/utils/guoxin/chat/markdownRenderer'

const streamHtmlCache = new Map<string, { source: string, html: string }>()
/** 历史：按 messageId 存完整 source，避免 length+prefix 碰撞 */
const historyHtmlCache = new Map<string, { source: string, html: string }>()

export function clearChatMarkdownCache(messageId?: string) {
  if (!messageId) {
    streamHtmlCache.clear()
    historyHtmlCache.clear()
    return
  }
  for (const key of streamHtmlCache.keys()) {
    if (key === messageId || key.startsWith(`${messageId}::`))
      streamHtmlCache.delete(key)
  }
  historyHtmlCache.delete(messageId)
}

/**
 * 展示用：Markdown → 消毒 HTML。
 * streaming=true 时按 messageId + 展示源全文缓存；历史按 messageId + 全量 source 比对。
 */
export function formatChatAnswerHtml(
  raw: string,
  options?: { messageId?: string, streaming?: boolean },
): string {
  const streaming = options?.streaming === true
  const normalized = normalizeMarkdownText(raw)
  if (!normalized)
    return ''
  if (normalized === ERROR_TEXT)
    return ERROR_HTML

  const prepared = prepareMarkdownForDisplay(normalized, streaming)
  if (!prepared)
    return ''

  const messageId = String(options?.messageId || '').trim() || '_'

  if (streaming) {
    const hit = streamHtmlCache.get(messageId)
    if (hit && hit.source === prepared)
      return hit.html
    const html = renderAssistantMarkdownHtml(prepared)
    streamHtmlCache.set(messageId, { source: prepared, html })
    return html
  }

  const histHit = historyHtmlCache.get(messageId)
  if (histHit && histHit.source === prepared)
    return histHit.html
  const html = renderAssistantMarkdownHtml(prepared)
  historyHtmlCache.set(messageId, { source: prepared, html })
  return html
}
