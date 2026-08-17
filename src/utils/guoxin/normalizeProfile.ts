import type { ProfileVo } from '@/models/guoxin/profile'
import { resolveBirthDayString, resolveDualBirthDays } from '@/utils/guoxin/birthDateTime'
import { getRegionLabelByCode } from '@/utils/guoxin/chinaRegion'

/** 档案接口原始对象（浅拷贝）；无 id 则忽略 */
export function toServerProfileRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    return null
  const rec = raw as Record<string, unknown>
  if (rec.id == null || String(rec.id).trim() === '')
    return null
  return { ...rec }
}

/** 是否具备发给 streamChat 的出生时间字段（接口原文，未做历法换算） */
export function isStreamChatProfilePayload(raw: Record<string, unknown>): boolean {
  return raw.id != null
    && (
      typeof raw.birthDay === 'string'
      || typeof raw.birthDaySolar === 'string'
      || typeof raw.birthDayLunar === 'string'
    )
}

/** 档案列表 → id 索引，供 streamChat 原样发送 */
export function indexServerProfiles(list: unknown): Record<string, Record<string, unknown>> {
  const next: Record<string, Record<string, unknown>> = {}
  if (!Array.isArray(list))
    return next
  for (const item of list) {
    const rec = toServerProfileRecord(item)
    if (!rec)
      continue
    next[String(rec.id)] = rec
  }
  return next
}

/** 后端 / 本地 persist 旧结构 → 统一 ProfileVo */
export function normalizeProfileVo(raw: Record<string, unknown>): ProfileVo {
  const calendarType = (raw.calendarType as ProfileVo['calendarType']) ?? 'solar'
  const birthDay = resolveBirthDayString({
    birthDay: raw.birthDay as string | number | undefined,
    birthYear: raw.birthYear as number | undefined,
    birthMonth: raw.birthMonth as number | undefined,
    birthHour: raw.birthHour as string | undefined,
    calendarType,
  })

  const rawSolar = typeof raw.birthDaySolar === 'string' ? raw.birthDaySolar.trim() : ''
  const rawLunar = typeof raw.birthDayLunar === 'string' ? raw.birthDayLunar.trim() : ''
  // 现网：birthDay 为公历，birthDayLunar 为农历；有农历时不要把 birthDay 再当农历换算
  const solar = rawSolar || birthDay
  const dual = (solar && rawLunar)
    ? {
        birthDay: solar,
        birthDaySolar: solar,
        birthDayLunar: rawLunar,
        lunarLeapMonth: !!raw.lunarLeapMonth,
      }
    : resolveDualBirthDays(
        rawLunar || birthDay,
        rawLunar ? 'lunar' : calendarType,
        !!raw.lunarLeapMonth,
      )

  const areaCode = String(raw.areaCode ?? '')
  let birthPlace = String(raw.birthPlace ?? '')
  if (!birthPlace && areaCode)
    birthPlace = getRegionLabelByCode(areaCode)

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    relation: raw.relation as ProfileVo['relation'],
    relationText: String(raw.relationText ?? ''),
    gender: raw.gender as ProfileVo['gender'],
    genderText: String(raw.genderText ?? ''),
    birthDay: dual?.birthDaySolar ?? dual?.birthDay ?? birthDay,
    birthDaySolar: dual?.birthDaySolar ?? dual?.birthDay ?? birthDay,
    birthDayLunar: dual?.birthDayLunar ?? birthDay,
    lunarLeapMonth: dual?.lunarLeapMonth,
    birthPlace,
    areaCode,
    calendarType,
    calendarTypeText: String(raw.calendarTypeText ?? ''),
    jieduCount: Number(raw.jieduCount ?? 0),
    lastJieduTime: String(raw.lastJieduTime ?? '无'),
    useTrueSolarTime: !!raw.useTrueSolarTime,
  }
}
