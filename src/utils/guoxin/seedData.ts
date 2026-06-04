import type { ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { BIRTH_HOUR_OPTIONS } from '@/constants/guoxin'

export const DEFAULT_PROFILES: ProfileVo[] = [
  {
    id: 'p1',
    name: '王建国',
    relation: 'self',
    relationText: '本人',
    gender: 'male',
    genderText: '男',
    birthYear: 1962,
    birthMonth: 10,
    birthDay: 1,
    birthHour: '午时（11-13点）',
    birthPlace: '北京市东城区',
    calendarType: 'solar',
    calendarTypeText: '公历',
    jieduCount: 3,
    lastJieduTime: '2026-05-20 14:30',
  },
  {
    id: 'p2',
    name: '李兰珍',
    relation: 'parent',
    relationText: '父母',
    gender: 'female',
    genderText: '女',
    birthYear: 1940,
    birthMonth: 3,
    birthDay: 15,
    birthHour: '辰时（7-9点）',
    birthPlace: '上海市静安区',
    calendarType: 'lunar',
    calendarTypeText: '农历',
    jieduCount: 1,
    lastJieduTime: '2026-05-30 09:12',
  },
  {
    id: 'p3',
    name: '王小梅',
    relation: 'child',
    relationText: '子女',
    gender: 'female',
    genderText: '女',
    birthYear: 1991,
    birthMonth: 5,
    birthDay: 12,
    birthHour: '酉时（17-19点）',
    birthPlace: '江苏省苏州市',
    calendarType: 'solar',
    calendarTypeText: '公历',
    jieduCount: 0,
    lastJieduTime: '无',
  },
]

export const DEFAULT_RECORDS: RecordVo[] = [
  {
    id: 'r1',
    profileId: 'p1',
    profileName: '王建国',
    title: '个人表达与近期状态梳理',
    time: '2026-05-20 14:30',
    directions: ['近期状态', '情绪状态'],
    content: null,
  },
  {
    id: 'r2',
    profileId: 'p2',
    profileName: '李兰珍',
    title: '健康作息与家庭情绪照护建议',
    time: '2026-05-30 09:12',
    directions: ['健康作息', '家庭关系'],
    content: null,
  },
]

export function normalizeSeedProfile(profile: ProfileVo): ProfileVo {
  const next = { ...profile }
  if (next.relationText === '自己')
    next.relationText = '本人'
  const isHourFormat = BIRTH_HOUR_OPTIONS.some(h => h === next.birthHour)
  if (!isHourFormat)
    next.birthHour = '记不清了'
  return next
}
