/** 报告 component 颜色 token（与后端 color 字段对齐） */
export type ReportColorToken
  = | 'water' | 'wood' | 'fire' | 'earth' | 'metal' | 'gold'
    | 'danger' | 'warning' | 'success' | 'accent' | 'cyan' | 'purple' | 'pink' | 'orange'

export interface ReportHeroPillar {
  label?: string
  tiangan?: string
  dizhi?: string
}

export interface ReportHero {
  badge?: string
  subtitle?: string
  title?: {
    pattern?: string
    subtitle?: string
  }
  pillars?: ReportHeroPillar[]
}

export interface ReportMeta {
  reportType?: string
  currentAge?: number
  birthYear?: number
  generatedAt?: string
}

export interface ReportFooter {
  pillars?: string
  motto?: string
  reportTitle?: string
  blessing?: string
}

export interface ReportGridItem {
  label?: string
  value?: string
  color?: ReportColorToken | string
}

export interface ReportProgressItem {
  name?: string
  description?: string
  displayValue?: string
  value?: number
  color?: ReportColorToken | string
}

export interface ReportPieSegment {
  label?: string
  percentage?: number
  description?: string
  color?: ReportColorToken | string
}

export interface ReportHbarItem {
  label?: string
  percentage?: number
  displayText?: string
  color?: ReportColorToken | string
}

export interface ReportEnergyBar {
  label?: string
  height?: number
  color?: ReportColorToken | string
  isHighlight?: boolean
}

export interface ReportTableCell {
  text?: string
  type?: 'text' | 'tag' | 'stars'
  tagColor?: ReportColorToken | string
  starsValue?: number
}

export interface ReportStyledListItem {
  boldPrefix?: string
  text?: string
}

export interface ReportTagItem {
  text?: string
  color?: ReportColorToken | string
}

export interface ReportTimelineItem {
  period?: string
  title?: string
  description?: string
}

export interface ReportUpgradeStep {
  version?: string
  label?: string
  description?: string
  color?: ReportColorToken | string
}

export interface ReportSeasonItem {
  seasonType?: string
  name?: string
  icon?: string
  description?: string
  energy?: string
}

export type ReportComponent
  = | { type: 'text', content?: string }
    | { type: 'callout', content?: string, icon?: string, variant?: string }
    | { type: 'quote', content?: string, source?: string }
    | { type: 'divider' }
    | { type: 'card', title?: string, variant?: string, gradient?: { from?: string, to?: string }, children?: ReportComponent[] }
    | { type: 'grid', items?: ReportGridItem[] }
    | { type: 'progressGroup', title?: string, items?: ReportProgressItem[] }
    | { type: 'pieChart', segments?: ReportPieSegment[] }
    | { type: 'hbarChart', title?: string, note?: string, items?: ReportHbarItem[] }
    | { type: 'energyWave', title?: string, bottomLabel?: string, bars?: ReportEnergyBar[] }
    | { type: 'scoreCircle', label?: string, value?: number, maxValue?: number }
    | { type: 'dataTable', headers?: string[], rows?: ReportTableCell[][] }
    | { type: 'styledList', items?: ReportStyledListItem[] }
    | { type: 'tagList', items?: ReportTagItem[] }
    | { type: 'timeline', items?: ReportTimelineItem[] }
    | { type: 'upgradePath', steps?: ReportUpgradeStep[] }
    | { type: 'seasonGrid', seasons?: ReportSeasonItem[] }
    | { type: string, [key: string]: unknown }

export interface ReportSubSection {
  label?: string
  components?: ReportComponent[]
}

export interface ReportSectionBlock {
  sectionTitle?: string
  sectionId?: string
  components?: ReportComponent[]
  subSections?: ReportSubSection[]
}

export interface ReportChapter {
  chapterTitle?: string
  chapterNum?: string
  sections?: ReportSectionBlock[]
}

export interface ReportDocument {
  hero?: ReportHero
  meta?: ReportMeta
  footer?: ReportFooter
  chapters: ReportChapter[]
  htmlContent?: string
}
