/**
 * 仅用于展示（formatChatAnswerHtml），结果不得写回 message.content。
 */

/**
 * CommonMark 在「」"" 等标点紧贴 ** 时不认强调；
 * 代码块外把 **…** 先转成 <strong>，避免星号裸露。
 */
export function convertBoldOutsideCode(text: string): string {
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]+`)/)
  return parts.map((part, i) => {
    if (i % 2 === 1)
      return part
    return part.replace(/\*\*((?:[^*]|\*(?!\*))+?)\*\*/g, '<strong>$1</strong>')
  }).join('')
}

/** 流式展示时临时闭合未完成的 **，避免半截星号露出来（不写回存储） */
export function softenIncompleteEmphasis(source: string): string {
  const marks = source.match(/\*\*/g)
  if (marks && marks.length % 2 === 1)
    return `${source}**`
  return source
}

/** 展示前预处理：streaming 时先软闭合，再转中文场景加粗 */
export function prepareMarkdownForDisplay(normalized: string, streaming = false): string {
  let source = normalized
  if (streaming)
    source = softenIncompleteEmphasis(source)
  return convertBoldOutsideCode(source)
}
