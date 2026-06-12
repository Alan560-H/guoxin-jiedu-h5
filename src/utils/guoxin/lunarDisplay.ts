/** 农历表单展示：中文数字年月日、十二时辰（仅 UI；提交仍用 HH:mm） */

const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const

const LUNAR_MONTH_NAMES = [
  '正月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '冬月',
  '腊月',
] as const

export interface ShichenOption {
  label: string
  hour: number
  minute: number
}

/** 时辰选项（早子/晚子分开；选中后映射为整点 HH:mm） */
export const SHICHEN_OPTIONS: readonly ShichenOption[] = [
  { label: '子时(早)', hour: 0, minute: 0 },
  { label: '子时(晚)', hour: 23, minute: 0 },
  { label: '丑时', hour: 1, minute: 0 },
  { label: '寅时', hour: 3, minute: 0 },
  { label: '卯时', hour: 5, minute: 0 },
  { label: '辰时', hour: 7, minute: 0 },
  { label: '巳时', hour: 9, minute: 0 },
  { label: '午时', hour: 11, minute: 0 },
  { label: '未时', hour: 13, minute: 0 },
  { label: '申时', hour: 15, minute: 0 },
  { label: '酉时', hour: 17, minute: 0 },
  { label: '戌时', hour: 19, minute: 0 },
  { label: '亥时', hour: 21, minute: 0 },
]

export function toChineseYear(year: number, withSuffix = true): string {
  const cn = String(year).split('').map(d => CN_DIGITS[Number(d)]).join('')
  return withSuffix ? `${cn}年` : cn
}

/** month 可为负表示闰月（与 lunar-javascript 一致） */
export function formatLunarMonthLabel(month: number): string {
  const abs = Math.abs(month)
  const base = LUNAR_MONTH_NAMES[abs - 1] ?? `${abs}月`
  return month < 0 ? `闰${base}` : base
}

export function formatLunarDayLabel(day: number): string {
  if (day === 10)
    return '初十'
  if (day < 10)
    return `初${CN_DIGITS[day]}`
  if (day < 20)
    return `十${CN_DIGITS[day - 10]}`
  if (day === 20)
    return '二十'
  if (day < 30)
    return `廿${CN_DIGITS[day - 20]}`
  return '三十'
}

/** 按传统两小时段反查时辰下标（用于编辑回显） */
export function resolveShichenIndex(hour: number, _minute = 0): number {
  if (hour === 23)
    return 1
  if (hour === 0)
    return 0
  if (hour <= 2)
    return 2
  if (hour <= 4)
    return 3
  if (hour <= 6)
    return 4
  if (hour <= 8)
    return 5
  if (hour <= 10)
    return 6
  if (hour <= 12)
    return 7
  if (hour <= 14)
    return 8
  if (hour <= 16)
    return 9
  if (hour <= 18)
    return 10
  if (hour <= 20)
    return 11
  return 12
}

export function resolveShichenLabel(hour: number, minute = 0): string {
  return SHICHEN_OPTIONS[resolveShichenIndex(hour, minute)]?.label ?? '子时(早)'
}

export function shichenLabels(): string[] {
  return SHICHEN_OPTIONS.map(o => o.label)
}
