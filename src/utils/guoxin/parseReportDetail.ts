import type { DirectionValue } from '@/constants/guoxin'
import type { RecordVo, ReportSection } from '@/models/guoxin/record'
import type { ReportChapter, ReportComponent, ReportDocument, ReportSectionBlock, ReportSubSection } from '@/models/guoxin/reportContent'

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractComponentText(component: Record<string, unknown>): string {
  if (!component || typeof component !== 'object')
    return ''

  const type = component.type as string | undefined

  if (type === 'text' && typeof component.content === 'string')
    return stripHtml(component.content)
  if ((type === 'callout' || type === 'quote') && typeof component.content === 'string') {
    const text = stripHtml(component.content)
    if (type === 'quote' && typeof component.source === 'string')
      return `${text} —— ${component.source}`
    return text
  }
  if (type === 'card') {
    const title = typeof component.title === 'string' ? component.title : ''
    const inner = Array.isArray(component.children)
      ? component.children
          .map(c => extractComponentText(c as Record<string, unknown>))
          .filter(Boolean)
          .join('\n')
      : ''
    return [title, inner].filter(Boolean).join('\n')
  }
  if (type === 'styledList' && Array.isArray(component.items)) {
    return component.items
      .map((item: { boldPrefix?: string, text?: string }) => `${item.boldPrefix || ''}${item.text || ''}`)
      .join('\n')
  }
  if (type === 'grid' && Array.isArray(component.items)) {
    return component.items
      .map((item: { label?: string, value?: string }) => `${item.label || ''}: ${item.value || ''}`)
      .join(' | ')
  }
  if (type === 'progressGroup' && Array.isArray(component.items)) {
    const title = typeof component.title === 'string' ? `${component.title}\n` : ''
    const lines = component.items
      .map((item: { name?: string, description?: string, displayValue?: string }) =>
        [item.name, item.displayValue, item.description].filter(Boolean).join(' · '))
      .join('\n')
    return title + lines
  }
  if (type === 'upgradePath' && Array.isArray(component.steps)) {
    return component.steps
      .map((step: { label?: string, description?: string }) => [step.label, step.description].filter(Boolean).join('：'))
      .join('\n')
  }
  if (type === 'timeline' && Array.isArray(component.items)) {
    return component.items
      .map((item: { period?: string, title?: string, description?: string }) =>
        [item.period, item.title, item.description].filter(Boolean).join(' '))
      .join('\n')
  }
  if (typeof component.content === 'string')
    return stripHtml(component.content)

  return ''
}

function extractSectionBodyFromBlock(sec: ReportSectionBlock): string {
  const parts: string[] = []
  if (Array.isArray(sec.components)) {
    for (const c of sec.components)
      parts.push(extractComponentText(c as Record<string, unknown>))
  }
  if (Array.isArray(sec.subSections)) {
    for (const sub of sec.subSections) {
      if (sub.label)
        parts.push(sub.label)
      if (Array.isArray(sub.components)) {
        for (const c of sub.components)
          parts.push(extractComponentText(c as Record<string, unknown>))
      }
    }
  }
  return parts.filter(Boolean).join('\n\n')
}

function extractSectionBody(sections: unknown[]): string {
  const parts: string[] = []
  for (const sec of sections) {
    if (!sec || typeof sec !== 'object')
      continue
    parts.push(extractSectionBodyFromBlock(sec as ReportSectionBlock))
  }
  return parts.filter(Boolean).join('\n\n')
}

/** reportContent.chapters → 详情页段落 */
export function chaptersToReportSections(chapters: unknown[]): ReportSection[] {
  const result: ReportSection[] = []
  for (const ch of chapters) {
    if (!ch || typeof ch !== 'object')
      continue
    const chapter = ch as { chapterTitle?: string, sections?: unknown[] }
    const title = chapter.chapterTitle || '章节'
    const body = Array.isArray(chapter.sections) ? extractSectionBody(chapter.sections) : ''
    if (body)
      result.push({ title, body })
  }
  return result
}

/** directions 可能是 JSON 字符串或数组 */
export function parseReportDirections(raw: unknown): DirectionValue[] {
  if (Array.isArray(raw))
    return raw as DirectionValue[]
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed as DirectionValue[] : []
    }
    catch {
      return []
    }
  }
  return []
}

function normalizeReportContentRaw(raw: unknown): Record<string, unknown> | null {
  if (raw == null)
    return null
  let obj: unknown = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    }
    catch {
      return null
    }
  }
  if (typeof obj !== 'object' || obj === null)
    return null
  return obj as Record<string, unknown>
}

function parseComponents(raw: unknown): ReportComponent[] {
  if (!Array.isArray(raw))
    return []
  return raw.filter(c => c && typeof c === 'object') as ReportComponent[]
}

function parseSubSections(raw: unknown): ReportSubSection[] {
  if (!Array.isArray(raw))
    return []
  return raw
    .filter(s => s && typeof s === 'object')
    .map((s) => {
      const sub = s as ReportSubSection
      return {
        label: sub.label,
        components: parseComponents(sub.components),
      }
    })
}

function parseSections(raw: unknown): ReportSectionBlock[] {
  if (!Array.isArray(raw))
    return []
  return raw
    .filter(s => s && typeof s === 'object')
    .map((s) => {
      const sec = s as ReportSectionBlock
      return {
        sectionTitle: sec.sectionTitle,
        sectionId: sec.sectionId,
        components: parseComponents(sec.components),
        subSections: parseSubSections(sec.subSections),
      }
    })
}

function parseChapters(raw: unknown): ReportChapter[] {
  if (!Array.isArray(raw))
    return []
  return raw
    .filter(c => c && typeof c === 'object')
    .map((c) => {
      const ch = c as ReportChapter
      return {
        chapterTitle: ch.chapterTitle,
        chapterNum: ch.chapterNum,
        sections: parseSections(ch.sections),
      }
    })
}

/** 保留树形结构的 reportContent 解析 */
export function parseReportContent(raw: unknown): ReportDocument | null {
  const obj = normalizeReportContentRaw(raw)
  if (!obj)
    return null

  const chapters = parseChapters(obj.chapters)
  if (!chapters.length && typeof obj.htmlContent !== 'string')
    return null

  return {
    hero: obj.hero as ReportDocument['hero'],
    meta: obj.meta as ReportDocument['meta'],
    footer: obj.footer as ReportDocument['footer'],
    chapters,
    htmlContent: typeof obj.htmlContent === 'string' ? obj.htmlContent : undefined,
  }
}

function normalizeReportContent(raw: unknown): { chapters?: unknown[], htmlContent?: string } | null {
  const obj = normalizeReportContentRaw(raw)
  if (!obj)
    return null
  return { chapters: obj.chapters as unknown[], htmlContent: obj.htmlContent as string | undefined }
}

/** report/detail 响应 → RecordVo（兼容扁平 data 与旧版 detail.report 嵌套） */
export function mapReportDetailToRecordVo(detail: Record<string, unknown>): RecordVo | null {
  const root = detail.report && typeof detail.report === 'object'
    ? (detail.report as Record<string, unknown>)
    : detail

  if (root.id == null)
    return null

  const reportContent = normalizeReportContent(root.reportContent ?? detail.reportContent)
  let content: ReportSection[] | null = null
  let reportDocument: ReportDocument | null = null

  if (reportContent) {
    reportDocument = parseReportContent(root.reportContent ?? detail.reportContent)
    if (Array.isArray(reportContent.chapters) && reportContent.chapters.length > 0)
      content = chaptersToReportSections(reportContent.chapters)
    else if (typeof reportContent.htmlContent === 'string')
      content = [{ title: '完整报告', body: stripHtml(reportContent.htmlContent) }]
  }

  const version = detail.currentVersion as { htmlContent?: string } | undefined
  if ((!content || content.length === 0) && version?.htmlContent)
    content = [{ title: '完整报告', body: stripHtml(version.htmlContent) }]

  return {
    id: String(root.id),
    profileId: root.profileId != null ? String(root.profileId) : 'server',
    profileName: String(root.profileName || '心语档案'),
    title: String(root.reportName || root.title || '专属解读报告'),
    time: String(root.createTime || root.time || ''),
    directions: parseReportDirections(root.directions ?? root.focusDirections),
    content,
    reportDocument,
    status: typeof root.status === 'string' ? root.status : undefined,
  }
}
