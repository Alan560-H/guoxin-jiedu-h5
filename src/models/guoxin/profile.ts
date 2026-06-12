import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'

export interface ProfileVo {
  id: string
  name: string
  relation: RelationValue
  relationText: string
  gender: GenderValue
  genderText: string
  /** 公历出生时间（与 birthDaySolar 一致），格式 YYYY-MM-DD HH:mm:ss */
  birthDay: string
  /** 公历出生时间 */
  birthDaySolar: string
  /** 农历出生时间（月份为绝对值；闰月见 lunarLeapMonth） */
  birthDayLunar: string
  lunarLeapMonth?: boolean
  birthPlace: string
  /** 区县 6 位 adcode */
  areaCode: string
  calendarType: CalendarValue
  calendarTypeText: string
  jieduCount: number
  lastJieduTime: string
  useTrueSolarTime?: boolean
}

export interface CreateProfileDto {
  name: string
  relation: RelationValue
  relationText: string
  gender: GenderValue
  genderText: string
  birthDay: string
  birthDaySolar: string
  birthDayLunar: string
  lunarLeapMonth?: boolean
  birthPlace: string
  areaCode: string
  calendarType: CalendarValue
  calendarTypeText: string
  useTrueSolarTime?: boolean
}
