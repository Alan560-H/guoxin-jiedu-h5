import type { DirectionValue } from '@/constants/guoxin'
import type { ProfileVo } from '@/models/guoxin/profile'

/** report/generate 的 inputJson 结构（与 Java 联调） */
export interface ReportGenerateInput {
  profileId: number | string
  directions: DirectionValue[]
  userQuestion?: string
  profileName: string
  relation: ProfileVo['relation']
  relationText: string
  gender: ProfileVo['gender']
  genderText: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: string
  birthPlace: string
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
  | 'success'
  | 'done'
  | 'completed'
  | 'failed'
  | 'error'
  | string

export interface ReportTaskStatusVo {
  status: ReportTaskStatus
  reportId?: number | string
  recordId?: number | string
  msg?: string
  message?: string
}
