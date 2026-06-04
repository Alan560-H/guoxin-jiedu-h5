/** 梅花时间/指定起盘页共用的阳历 picker 数据（与老 shijian/zhiding 脚本一致） */

export const MEI_HUA_MONTH_LABELS = [
  '01月',
  '02月',
  '03月',
  '04月',
  '05月',
  '06月',
  '07月',
  '08月',
  '09月',
  '10月',
  '11月',
  '12月',
]

export const MEI_HUA_DAY_LABELS = [
  '01日',
  '02日',
  '03日',
  '04日',
  '05日',
  '06日',
  '07日',
  '08日',
  '09日',
  '10日',
  '11日',
  '12日',
  '13日',
  '14日',
  '15日',
  '16日',
  '17日',
  '18日',
  '19日',
  '20日',
  '21日',
  '22日',
  '23日',
  '24日',
  '25日',
  '26日',
  '27日',
  '28日',
  '29日',
  '30日',
  '31日',
]

export function meiHuaDaysInMonth(year: number, month1to12: number): number {
  if (month1to12 === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28
  }
  if (month1to12 === 4 || month1to12 === 6 || month1to12 === 9 || month1to12 === 11)
    return 30
  return 31
}

export function meiHuaBuildDayLabels(year: number, monthIndex0: number): string[] {
  const dim = meiHuaDaysInMonth(year, monthIndex0 + 1)
  const out: string[] = []
  for (let i = 0; i < dim; i++)
    out.push(MEI_HUA_DAY_LABELS[i])
  return out
}

export interface MeiHuaSolarPickerInit {
  yearList: number[]
  /** 与 picker 列 0 对齐的当前年下标（1901→0） */
  yearIdx: number
  monthIdx: number
  dayIdx: number
  dayLabels: string[]
}

export function meiHuaInitSolarPicker(): MeiHuaSolarPickerInit {
  const now = new Date()
  const yearList: number[] = []
  let yearIdx = 0
  for (let x = 0; x <= 198; x++) {
    const y = 1901 + x
    if (y === now.getFullYear())
      yearIdx = x
    yearList.push(y)
  }
  const monthIdx = now.getMonth()
  const dayLabels = meiHuaBuildDayLabels(yearList[yearIdx], monthIdx)
  const dayIdx = now.getDate() - 1
  return { yearList, yearIdx, monthIdx, dayIdx, dayLabels }
}
