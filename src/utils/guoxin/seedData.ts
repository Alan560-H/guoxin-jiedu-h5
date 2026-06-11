import type { ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { normalizeProfileVo } from '@/utils/guoxin/normalizeProfile'

export const DEFAULT_PROFILES: ProfileVo[] = [
  normalizeProfileVo({
    id: 'p1',
    name: '王建国',
    relation: 'self',
    relationText: '本人',
    gender: 'male',
    genderText: '男',
    birthDay: '1962-10-01 12:00',
    birthPlace: '北京市市辖区东城区',
    areaCode: '110101',
    calendarType: 'solar',
    calendarTypeText: '公历',
    jieduCount: 3,
    lastJieduTime: '2026-05-20 14:30',
  }),
  normalizeProfileVo({
    id: 'p2',
    name: '李兰珍',
    relation: 'parent',
    relationText: '父母',
    gender: 'female',
    genderText: '女',
    birthDay: '1940-03-15 08:00',
    birthPlace: '上海市市辖区静安区',
    areaCode: '310106',
    calendarType: 'lunar',
    calendarTypeText: '农历',
    jieduCount: 1,
    lastJieduTime: '2026-05-30 09:12',
  }),
  normalizeProfileVo({
    id: 'p3',
    name: '王小梅',
    relation: 'child',
    relationText: '子女',
    gender: 'female',
    genderText: '女',
    birthDay: '1991-05-12 18:00',
    birthPlace: '江苏省苏州市姑苏区',
    areaCode: '320508',
    calendarType: 'solar',
    calendarTypeText: '公历',
    jieduCount: 0,
    lastJieduTime: '无',
  }),
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
  const next = normalizeProfileVo(profile as unknown as Record<string, unknown>)
  if (next.relationText === '自己')
    next.relationText = '本人'
  next.useTrueSolarTime = next.useTrueSolarTime ?? false
  return next
}
