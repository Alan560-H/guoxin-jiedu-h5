import type { ProfileVo } from '@/models/guoxin/profile'
import { resolveBirthDayString } from '@/utils/guoxin/birthDateTime'
import { getRegionLabelByCode } from '@/utils/guoxin/chinaRegion'

/** 后端 / 本地 persist 旧结构 → 统一 ProfileVo */
export function normalizeProfileVo(raw: Record<string, unknown>): ProfileVo {
  const birthDay = resolveBirthDayString({
    birthDay: raw.birthDay as string | number | undefined,
    birthYear: raw.birthYear as number | undefined,
    birthMonth: raw.birthMonth as number | undefined,
    birthHour: raw.birthHour as string | undefined,
    calendarType: raw.calendarType as ProfileVo['calendarType'],
  })
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
    birthDay,
    birthPlace,
    areaCode,
    calendarType: raw.calendarType as ProfileVo['calendarType'],
    calendarTypeText: String(raw.calendarTypeText ?? ''),
    jieduCount: Number(raw.jieduCount ?? 0),
    lastJieduTime: String(raw.lastJieduTime ?? '无'),
    useTrueSolarTime: !!raw.useTrueSolarTime,
  }
}
