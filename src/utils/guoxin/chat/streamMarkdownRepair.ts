/**
 * 流式 SSE 拆坏 / 模型粘行的 Markdown 修复（对累计全文执行）。
 * 结果写回 message.content，必须仍是 Markdown（勿在此转 HTML）。
 */

/** 去掉 SSE 误入正文的尾噪声 */
export function stripChatAnswerNoise(raw: string): string {
  return String(raw || '')
    .replace(/\r\n/g, '\n')
    .replace(/(?:\n|^)\s*done\s*$/i, '')
    .replace(/\s+$/u, '')
}

/** 表格行被拆碎：|\n下一单元格 → | 下一单元格 */
export function repairFragmentedPipeTableRows(text: string): string {
  if (!text.includes('|'))
    return text
  let prev = ''
  let cur = text
  let guard = 0
  while (cur !== prev && guard++ < 500) {
    prev = cur
    cur = cur.replace(/\|[ \t]*\n(?=[ \t]*[^|\n\t ])/g, '| ')
  }
  return cur
}

/** 流式常在单独一行的「>」与下一行「注：」之间断开 */
export function repairBrokenNoteBlockquote(text: string): string {
  if (!text.includes('注'))
    return text
  return text.replace(/\n>\s*\n注：/g, '\n> 注：')
}

/** 「**结论：…**」与紧随的「喜用神」流式常被拆成两行 */
export function repairConclusionBoldBeforeXiyongshen(text: string): string {
  return text.replace(/(\*\*结论[^*]*\*\*)\n(?=喜用神)/g, '$1 ')
}

/** 粗体内仅有单换行（无空行）→ 空格，多为流式误拆 */
export function repairInlineBoldBrokenLines(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, (full, inner: string) => {
    if (!inner.includes('\n') || inner.includes('\n\n'))
      return full
    return `**${inner.replace(/\n+/g, ' ').trim()}**`
  })
}

/**
 * 国心：有序列表粘在段内（：1. / 。2.**）→ 提到行首；
 * 列表标记后缺空格（2.** / 3.给）→ 补空格；
 * 短项粘连（出生日期2.出生时间）→ 拆行。
 */
export function repairJammedOrderedLists(text: string): string {
  let next = text.replace(/([：:])[ \t]*(?=\d{1,2}\.(?:\s|\*\*|[^\s\d]))/g, '$1\n\n')
  next = next.replace(
    /([。！？；.!?;…」』\u201D\u2019）)])[ \t]*(?=\d{1,2}\.(?:\s|\*\*|[^\s\d]))/g,
    '$1\n\n',
  )
  // 中文后紧贴下一个序号：日期2.出生 → 日期\n2.出生（避免整段挤进同一 li）
  next = next.replace(/([\u4E00-\u9FFF])(\d{1,2}\.)(?=[\s\u4E00-\u9FFF*])/g, '$1\n$2')
  return next.replace(/(\d{1,2}\.)(?=\*\*|[\u4E00-\u9FFF])/g, '$1 ')
}

/**
 * 列表项正文后接「如果你愿意… / 你直接…」等话轮时，插入空段结束当前 ol，
 * 否则后续内容会被吃进最后一条 li。
 */
export function repairListDiscourseBreaks(text: string): string {
  const next = text.replace(
    /([。！？])\s*(?=如果你|如果您|另外|此外|接下来|你把这些|你可以把|你直接|我也可以|我可以帮)/g,
    '$1\n\n',
  )
  // 列表后仅单换行接话轮 → 补空行（结束 ol）
  return next.replace(
    /([^\n])\n(?=你直接|请按这个|按这个格式|你把这几项|你把这些|如果你愿意)/g,
    '$1\n\n',
  )
}

/**
 * 填空模板粘连：就行：出生日期：出生时间：性别： → 各标签独占一行
 */
export function repairJammedFormLabels(text: string): string {
  const labels = '出生日期|出生时间|性别|阳历/农历|农历/阳历'
  return text.replace(
    new RegExp(`(：|:)(?=(?:${labels})：)`, 'g'),
    '$1\n',
  )
}

/**
 * 国心：无序列表粘连（：- 项 / 同行多个 - 项）。
 * 匹配面保持较窄，避免误伤正文「A - B」。
 */
export function repairJammedUnorderedLists(text: string): string {
  const next = text.replace(/([：:。！？；])[ \t]*(?=[•\-*]\s+\S)/g, '$1\n\n')
  return next.replace(/([^\n])[ \t]+([•\-*]\s+[\u4E00-\u9FFFA-Z])/gi, '$1\n$2')
}

/**
 * 修复流式拆坏 / 模型粘行的 Markdown（对累计全文执行）。
 * 规则顺序固定，勿随意调换。
 */
export function repairStreamMarkdownArtifacts(raw: string): string {
  let text = stripChatAnswerNoise(String(raw || '').replace(/\\n/g, '\n'))
  text = repairFragmentedPipeTableRows(text)
  text = repairBrokenNoteBlockquote(text)
  text = repairConclusionBoldBeforeXiyongshen(text)
  text = repairInlineBoldBrokenLines(text)
  // 先断开列表后的话轮段落，再拆粘连序号，避免内容被吃进最后一条 li
  text = repairListDiscourseBreaks(text)
  text = repairJammedOrderedLists(text)
  text = repairJammedUnorderedLists(text)
  text = repairJammedFormLabels(text)
  return text
}
