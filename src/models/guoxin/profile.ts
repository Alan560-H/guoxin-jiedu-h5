import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'

export interface ProfileVo {
  id: string
  name: string
  relation: RelationValue
  relationText: string
  gender: GenderValue
  genderText: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: string
  birthPlace: string
  calendarType: CalendarValue
  calendarTypeText: string
  jieduCount: number
  lastJieduTime: string
}

export interface CreateProfileDto {
  name: string
  relation: RelationValue
  relationText: string
  gender: GenderValue
  genderText: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: string
  birthPlace: string
  calendarType: CalendarValue
  calendarTypeText: string
}
