import type { CalendarValue } from '@/constants/guoxin'

export interface BirthDateTimeParts {
  year: number
  /** 公历 1-12；农历可为负表示闰月（lunar-javascript 约定） */
  month: number
  day: number
  hour: number
  minute: number
}

const LEGACY_SHICHEN_TIME: Record<string, [number, number]> = {
  '子时（23-1点）': [0, 0],
  '丑时（1-3点）': [2, 0],
  '寅时（3-5点）': [4, 0],
  '卯时（5-7点）': [6, 0],
  '辰时（7-9点）': [8, 0],
  '巳时（9-11点）': [10, 0],
  '午时（11-13点）': [12, 0],
  '未时（13-15点）': [14, 0],
  '申时（15-17点）': [16, 0],
  '酉时（17-19点）': [18, 0],
  '戌时（19-21点）': [20, 0],
  '亥时（21-23点）': [22, 0],
  '记不清了': [0, 0],
}

const BIRTH_DAY_RE = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?$/

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatBirthDay(parts: BirthDateTimeParts): string {
  const monthAbs = Math.abs(parts.month)
  return `${parts.year}-${pad2(monthAbs)}-${pad2(parts.day)} ${pad2(parts.hour)}:${pad2(parts.minute)}`
}

export function parseBirthDay(value: string | null | undefined): BirthDateTimeParts | null {
  if (!value?.trim())
    return null
  const m = value.trim().match(BIRTH_DAY_RE)
  if (!m)
    return null
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: m[4] != null ? Number(m[4]) : 0,
    minute: m[5] != null ? Number(m[5]) : 0,
  }
}

export function parseLegacyBirthHour(hourText: string | null | undefined): [number, number] {
  if (!hourText?.trim())
    return [0, 0]
  const hhmm = hourText.match(/^(\d{1,2}):(\d{2})$/)
  if (hhmm)
    return [Number(hhmm[1]), Number(hhmm[2])]
  return LEGACY_SHICHEN_TIME[hourText] ?? [0, 0]
}

/** 从 birthDay 取展示用年份（年龄计算用公历/农历数字年） */
export function getBirthYearFromBirthDay(birthDay: string): number {
  return parseBirthDay(birthDay)?.year ?? new Date().getFullYear()
}

export function formatBirthDayDisplay(
  birthDay: string,
  calendarType?: CalendarValue,
  calendarTypeText?: string,
): string {
  const p = parseBirthDay(birthDay)
  if (!p)
    return birthDay || '未填写'
  const cal = calendarTypeText ?? (calendarType === 'lunar' ? '农历' : '公历')
  const monthLabel = p.month < 0 ? `闰${Math.abs(p.month)}` : String(p.month)
  return `${cal} ${p.year}年${monthLabel}月${p.day}日 ${pad2(p.hour)}:${pad2(p.minute)}`
}

export function buildYearRange(start = 1930, end = new Date().getFullYear()): number[] {
  const years: number[] = []
  for (let y = end; y >= start; y--)
    years.push(y)
  return years
}

export function getDaysInSolarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function buildHourOptions(): number[] {
  return Array.from({ length: 24 }, (_, i) => i)
}

export function buildMinuteOptions(): number[] {
  return Array.from({ length: 60 }, (_, i) => i)
}

export interface LegacyProfileBirth {
  birthDay?: string | number
  birthYear?: number
  birthMonth?: number
  birthHour?: string
  calendarType?: CalendarValue
}

/** 将后端/本地旧档案归一为 birthDay 字符串 */
export function resolveBirthDayString(raw: LegacyProfileBirth): string {
  if (typeof raw.birthDay === 'string' && BIRTH_DAY_RE.test(raw.birthDay.trim()))
    return raw.birthDay.trim()

  const y = raw.birthYear
  const m = raw.birthMonth
  const d = typeof raw.birthDay === 'number' ? raw.birthDay : undefined
  if (y == null || m == null || d == null)
    return ''
  const [hour, minute] = parseLegacyBirthHour(raw.birthHour)
  return formatBirthDay({ year: y, month: m, day: d, hour, minute })
}
