import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import MarkdownIt from 'markdown-it'
import {
  wrapCodeBlocksWithCopyButton,
  wrapMarkdownTables,
} from '@/utils/guoxin/chat/markdownEnhance'
import { sanitizeAssistantHtml } from '@/utils/guoxin/chat/sanitizeAssistantHtml'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)

const ERROR_TEXT = '当前回复失败，请重试'
const ERROR_HTML = `<p class="md-error">${ERROR_TEXT}</p>`

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const md = new MarkdownIt({
  // 允许受信助手 HTML（如 <details>）；输出经 DOMPurify
  html: true,
  linkify: true,
  breaks: true,
  highlight(str, lang) {
    const language = String(lang || '').trim()
    try {
      if (language && hljs.getLanguage(language)) {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language, ignoreIllegals: true }).value}</code></pre>`
      }
    }
    catch {
      // fall through
    }
    return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`
  },
})

/**
 * 将已预处理的 Markdown/HTML 混合文本渲成可注入 DOM 的安全 HTML。
 * 调用方若为业务错误文案，应在本函数前短路；此处仍做兜底。
 */
export function renderAssistantMarkdownHtml(preparedContent: string): string {
  if (!preparedContent)
    return ''
  if (preparedContent === ERROR_TEXT)
    return ERROR_HTML

  let html = md.render(preparedContent)
  html = wrapCodeBlocksWithCopyButton(html)
  html = wrapMarkdownTables(html)
  return sanitizeAssistantHtml(html)
}

export { ERROR_HTML, ERROR_TEXT }
