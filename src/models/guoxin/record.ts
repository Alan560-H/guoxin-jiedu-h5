import type { DirectionValue } from '@/constants/guoxin'
import type { ReportDocument } from '@/models/guoxin/reportContent'

export interface ReportSection {
  title: string
  body: string
}

export interface RecordVo {
  id: string
  profileId: string
  profileName: string
  title: string
  time: string
  directions: DirectionValue[]
  content: ReportSection[] | null
  reportDocument: ReportDocument | null
  status?: string
}
