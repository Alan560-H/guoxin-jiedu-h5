/**
 * Markdown HTML 增强（纯字符串，不触碰 DOM）。
 */

/** 每个 <pre> 外包一层并插入复制按钮，供事件委托 */
export function wrapCodeBlocksWithCopyButton(html: string): string {
  return html.replace(/<pre(\b[^>]*)>([\s\S]*?)<\/pre>/g, (_m, attrs: string, inner: string) => {
    return `<div class="md-code-wrap"><button type="button" class="copy-code-btn">复制</button><pre${attrs}>${inner}</pre></div>`
  })
}

/** 表格外包可横向滚动容器，避免撑破气泡 */
export function wrapMarkdownTables(html: string): string {
  return html.replace(/<table(\s[^>]*)?>[\s\S]*?<\/table>/gi, match =>
    `<div class="md-table-wrap">${match}</div>`)
}
