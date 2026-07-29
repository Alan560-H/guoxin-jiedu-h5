import type { ProfileVo } from '@/models/guoxin/profile'
import type { ReportGenerateInput, ReportGenerateResult, ReportTaskStatusVo } from '@/models/guoxin/report'

/** 组装 report/generate 的 inputJson */
export function buildReportInputJson(
  profile: ProfileVo,
  directions: string[],
  userQuestion?: string,
): string {
  const numericId = Number(profile.id)
  const payload: ReportGenerateInput = {
    profileId: Number.isNaN(numericId) ? profile.id : numericId,
    directions: [...directions],
    userQuestion: userQuestion?.trim() || undefined,
    profileName: profile.name,
    relation: profile.relation,
    relationText: profile.relationText,
    gender: profile.gender,
    genderText: profile.genderText,
    birthDay: profile.birthDay,
    birthDaySolar: profile.birthDaySolar,
    birthDayLunar: profile.birthDayLunar,
    lunarLeapMonth: profile.lunarLeapMonth ?? false,
    birthPlace: profile.birthPlace,
    areaCode: profile.areaCode,
    calendarType: profile.calendarType,
    calendarTypeText: profile.calendarTypeText,
    useTrueSolarTime: profile.useTrueSolarTime ?? false,
  }
  return JSON.stringify(payload)
}

export function normalizeGenerateResult(data: Record<string, unknown> | null | undefined): ReportGenerateResult | null {
  if (!data)
    return null
  const taskId = data.taskId ?? data.task_id ?? data.id
  if (taskId == null || taskId === '')
    return null
  const reportId = data.reportId ?? data.report_id ?? null
  return { taskId: taskId as number | string, reportId: reportId as number | string | null }
}

export function normalizeTaskStatus(status: unknown): string {
  return String(status ?? '').trim().toLowerCase()
}

export function isReportTaskSuccess(status: unknown): boolean {
  const s = normalizeTaskStatus(status)
  return ['success', 'done', 'completed', 'finish', 'finished', 'succeed'].includes(s)
}

export function isReportTaskFailed(status: unknown): boolean {
  const s = normalizeTaskStatus(status)
  return ['failed', 'fail', 'error', 'cancelled', 'canceled', 'timeout'].includes(s)
}

export function isReportTaskTerminal(status: unknown): boolean {
  return isReportTaskSuccess(status) || isReportTaskFailed(status)
}

/** 报告记录是否仍在生成中（列表展示用） */
export function isReportRecordPending(status?: string | null): boolean {
  const s = normalizeTaskStatus(status)
  if (!s)
    return false
  if (isReportTaskSuccess(status) || isReportTaskFailed(status))
    return false
  return ['pending', 'processing', 'streaming', 'generating', 'running', 'in_progress', 'queued'].includes(s)
}

export function isReportRecordReady(status?: string | null): boolean {
  if (!status)
    return true
  return isReportTaskSuccess(status)
}

export function extractReportIdFromTask(data: ReportTaskStatusVo | Record<string, unknown> | null | undefined): number | null {
  if (!data)
    return null
  const raw = (data as ReportTaskStatusVo).reportId
    ?? (data as ReportTaskStatusVo).recordId
    ?? (data as Record<string, unknown>).id
  if (raw == null || raw === '')
    return null
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
}

export function toTaskIdNumber(taskId: number | string): number {
  const n = typeof taskId === 'number' ? taskId : Number(taskId)
  return Number.isNaN(n) ? 0 : n
}
