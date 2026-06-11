import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'

export interface ProfileVo {
  id: string
  name: string
  relation: RelationValue
  relationText: string
  gender: GenderValue
  genderText: string
  /** 出生日期时间，格式 YYYY-MM-DD HH:mm */
  birthDay: string
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
  birthPlace: string
  areaCode: string
  calendarType: CalendarValue
  calendarTypeText: string
  useTrueSolarTime?: boolean
}
