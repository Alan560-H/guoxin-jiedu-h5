import type { DirectionValue } from '@/constants/guoxin'
import type { ProfileVo } from '@/models/guoxin/profile'

/** report/generate 的 inputJson 结构（与档案接口字段一致） */
export interface ReportGenerateInput {
  profileId: number | string
  directions: DirectionValue[]
  userQuestion?: string
  profileName: string
  relation: ProfileVo['relation']
  relationText: string
  gender: ProfileVo['gender']
  genderText: string
  birthDay: string
  birthDaySolar: string
  birthDayLunar: string
  lunarLeapMonth?: boolean
  birthPlace: string
  areaCode: string
  calendarType: ProfileVo['calendarType']
  calendarTypeText: string
  useTrueSolarTime: boolean
}

export interface ReportGenerateResult {
  taskId: number | string
  reportId?: number | string | null
}

export type ReportTaskStatus =
  | 'pending'
  | 'processing'
  | 'streaming'
  | 'generating'
  | 'running'
  | 'success'
  | 'done'
  | 'completed'
  | 'failed'
  | 'error'
  | 'cancelled'

export interface ReportTaskStatusVo {
  status?: ReportTaskStatus | string
  reportId?: number | string
  recordId?: number | string
  progress?: number
  message?: string
}
