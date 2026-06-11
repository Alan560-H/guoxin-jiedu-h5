import { LunarYear } from 'lunar-javascript'

export interface LunarMonthOption {
  /** 负数表示闰月 */
  month: number
  label: string
  dayCount: number
}

export function getLunarYearOptions(start = 1930, end = new Date().getFullYear()): number[] {
  const years: number[] = []
  for (let y = end; y >= start; y--)
    years.push(y)
  return years
}

export function getLunarMonthOptions(year: number): LunarMonthOption[] {
  const lunarYear = LunarYear.fromYear(year)
  return lunarYear.getMonths().map((lm: { getMonth: () => number, isLeap: () => boolean, getDayCount: () => number }) => {
    const m = lm.getMonth()
    const abs = Math.abs(m)
    const label = lm.isLeap() ? `闰${abs}月` : `${abs}月`
    return {
      month: m,
      label,
      dayCount: lm.getDayCount(),
    }
  })
}

export function getLunarDayOptions(year: number, month: number): number[] {
  const lunarYear = LunarYear.fromYear(year)
  const lm = lunarYear.getMonth(month)
  const count = lm.getDayCount()
  return Array.from({ length: count }, (_, i) => i + 1)
}

export function findLunarMonthIndex(options: LunarMonthOption[], month: number): number {
  const idx = options.findIndex(o => o.month === month)
  return idx >= 0 ? idx : 0
}
