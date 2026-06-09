export interface MockProfile {
  id: string
  name: string
  relation: string
  relationText: string
  gender: string
  genderText: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: string
  birthPlace: string
  calendarType: string
  calendarTypeText: string
  jieduCount: number
  lastJieduTime: string
  useTrueSolarTime?: boolean
}

export interface MockRecord {
  id: string
  profileId: string
  profileName: string
  title: string
  time: string
  directions: string[]
  content: { title: string, body: string }[] | null
}

export interface MockUser {
  openid: string
  phone?: string
}

export interface MockTask {
  taskId: string
  profileId: string
  directions: string[]
  userQuestion?: string
  status: 'pending' | 'streaming' | 'done' | 'error'
  recordId?: string
  msg?: string
}

export interface MockDb {
  users: MockUser[]
  profiles: MockProfile[]
  records: MockRecord[]
  credits: number
  tasks: Map<string, MockTask>
  smsCodes: Map<string, string>
}

const DEFAULT_PROFILES: MockProfile[] = [
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
    useTrueSolarTime: false,
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
    useTrueSolarTime: false,
  },
]

const DEFAULT_RECORDS: MockRecord[] = [
  {
    id: 'r1',
    profileId: 'p1',
    profileName: '王建国',
    title: '个人表达与近期状态梳理',
    time: '2026-05-20 14:30',
    directions: ['近期状态', '情绪状态'],
    content: null,
  },
]

export const RETURNING_OPENID = 'mock_o_returning'
export const RETURNING_PHONE = '13800138000'

export function createMockDb(): MockDb {
  return {
    users: [{ openid: RETURNING_OPENID, phone: RETURNING_PHONE }],
    profiles: [...DEFAULT_PROFILES],
    records: [...DEFAULT_RECORDS],
    credits: 3,
    tasks: new Map(),
    smsCodes: new Map(),
  }
}

export function getDefaultMockOpenId(): string {
  return process.env.VITE_MOCK_OPENID || 'mock_o_dev'
}

export function maskPhone(phone: string): string {
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export function createToken(openid: string): string {
  return `mock_guoxin_${openid}_${Date.now()}`
}

export function parseTokenOpenid(token: string): string | null {
  const m = token.match(/^mock_guoxin_(.+)_\d+$/)
  return m?.[1] ?? null
}
