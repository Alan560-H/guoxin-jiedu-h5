import { repairStreamMarkdownArtifacts } from '@/utils/guoxin/chat/streamMarkdownRepair'

/**
 * 规范化 Markdown 源（防御性再跑 repair，兼容历史脏数据）。
 * 仅处理会写回/参与渲染的 Markdown，不含展示层 HTML 转换。
 */
export function normalizeMarkdownText(content: string): string {
  if (!content)
    return ''
  return repairStreamMarkdownArtifacts(content).trim()
}
