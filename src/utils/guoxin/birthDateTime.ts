import type { CalendarValue } from '@/constants/guoxin'
import { Lunar, Solar } from 'lunar-javascript'
import { formatLunarBirthDayDisplay } from '@/utils/guoxin/lunarDisplay'

export interface BirthDateTimeParts {
  year: number
  /** 公历 1-12；农历可为负表示闰月（lunar-javascript 约定） */
  month: number
  day: number
  hour: number
  minute: number
  second: number
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

const BIRTH_DAY_RE = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatBirthDay(parts: BirthDateTimeParts): string {
  const monthAbs = Math.abs(parts.month)
  const second = parts.second ?? 0
  return `${parts.year}-${pad2(monthAbs)}-${pad2(parts.day)} ${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(second)}`
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
    second: m[6] != null ? Number(m[6]) : 0,
  }
}

function partsFromSolar(solar: InstanceType<typeof Solar>): BirthDateTimeParts {
  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
    hour: solar.getHour(),
    minute: solar.getMinute(),
    second: solar.getSecond(),
  }
}

function partsFromLunar(lunar: InstanceType<typeof Lunar>): BirthDateTimeParts {
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    hour: lunar.getHour(),
    minute: lunar.getMinute(),
    second: lunar.getSecond(),
  }
}

/** 农历展示/提交用月份（绝对值，不含闰月符号） */
function lunarPartsForFormat(parts: BirthDateTimeParts): BirthDateTimeParts {
  return { ...parts, month: Math.abs(parts.month) }
}

export function parseLegacyBirthHour(hourText: string | null | undefined): [number, number] {
  if (!hourText?.trim())
    return [0, 0]
  const hhmm = hourText.match(/^(\d{1,2}):(\d{2})$/)
  if (hhmm)
    return [Number(hhmm[1]), Number(hhmm[2])]
  return LEGACY_SHICHEN_TIME[hourText] ?? [0, 0]
}

export interface DualBirthDays {
  /** 公历出生时间（与 birthDaySolar 一致） */
  birthDay: string
  birthDaySolar: string
  birthDayLunar: string
  lunarLeapMonth: boolean
}

/** 由 picker 所选历法 + 年月日时分，换算并生成公历/农历双日期 */
export function buildDualBirthDays(
  calendarType: CalendarValue,
  parts: BirthDateTimeParts,
): DualBirthDays | null {
  if (!parts.year || !parts.month || !parts.day)
    return null

  const { hour, minute, second } = parts
  const sec = second ?? 0

  if (calendarType === 'solar') {
    const solar = Solar.fromYmdHms(parts.year, parts.month, parts.day, hour, minute, sec)
    const lunar = solar.getLunar()
    const solarParts = partsFromSolar(solar)
    const lunarParts = partsFromLunar(lunar)
    const birthDaySolar = formatBirthDay(solarParts)
    return {
      birthDay: birthDaySolar,
      birthDaySolar,
      birthDayLunar: formatBirthDay(lunarPartsForFormat(lunarParts)),
      lunarLeapMonth: lunarParts.month < 0,
    }
  }

  const lunar = Lunar.fromYmdHms(parts.year, parts.month, parts.day, hour, minute, sec)
  const solar = lunar.getSolar()
  const solarParts = partsFromSolar(solar)
  const lunarParts = partsFromLunar(lunar)
  const birthDaySolar = formatBirthDay(solarParts)
  const birthDayLunar = formatBirthDay(lunarPartsForFormat(lunarParts))
  return {
    birthDay: birthDaySolar,
    birthDaySolar,
    birthDayLunar,
    lunarLeapMonth: lunarParts.month < 0,
  }
}

/** 仅有 birthDay + calendarType 时补全双日期 */
export function resolveDualBirthDays(
  birthDay: string,
  calendarType: CalendarValue = 'solar',
  lunarLeapMonth?: boolean,
): DualBirthDays | null {
  const parts = parseBirthDay(birthDay)
  if (!parts)
    return null
  if (calendarType === 'lunar' && lunarLeapMonth)
    parts.month = -parts.month
  return buildDualBirthDays(calendarType, parts)
}

/** 年龄计算优先公历年 */
export function getBirthYearFromBirthDay(birthDay: string): number {
  return parseBirthDay(birthDay)?.year ?? new Date().getFullYear()
}

export function getProfileBirthYear(profile: {
  birthDaySolar?: string
  birthDay: string
}): number {
  const solar = profile.birthDaySolar?.trim() || profile.birthDay
  return getBirthYearFromBirthDay(solar)
}

export function formatBirthDayDisplay(
  birthDay: string,
  calendarType?: CalendarValue,
  calendarTypeText?: string,
  lunarLeapMonth?: boolean,
): string {
  const p = parseBirthDay(birthDay)
  if (!p)
    return birthDay || '未填写'
  if (calendarType === 'lunar')
    return formatLunarBirthDayDisplay(p, lunarLeapMonth)
  const cal = calendarTypeText ?? '公历'
  return `${cal} ${p.year}年${p.month}月${p.day}日 ${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second ?? 0)}`
}

export function formatDualBirthDayDisplay(profile: {
  birthDaySolar: string
  birthDayLunar: string
  lunarLeapMonth?: boolean
}): string {
  const solar = formatBirthDayDisplay(profile.birthDaySolar, 'solar', '公历')
  const lunar = formatBirthDayDisplay(
    profile.birthDayLunar,
    'lunar',
    '农历',
    profile.lunarLeapMonth,
  )
  return `${solar}\n${lunar}`
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
  return formatBirthDay({ year: y, month: m, day: d, hour, minute, second: 0 })
}
