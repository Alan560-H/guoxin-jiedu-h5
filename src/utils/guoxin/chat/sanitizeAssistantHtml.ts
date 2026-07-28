import DOMPurify from 'dompurify'

/**
 * 助手 Markdown 渲染后的 HTML 消毒。
 * 保留复制按钮所需 button/class/type。
 */
export function sanitizeAssistantHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel', 'class', 'type'],
    ADD_TAGS: ['button'],
  })
}
