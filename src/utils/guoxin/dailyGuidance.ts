import { Lunar } from 'lunar-javascript'

export interface DailyGuidance {
  dateKey: string
  lunarDate: string
  summary: string
  suitable: string
  avoid: string
}

const GUIDANCE_VARIANTS = [
  { suitable: '静心梳理', avoid: '急于求成', direction: '东南' },
  { suitable: '稳中求进', avoid: '仓促决断', direction: '正南' },
  { suitable: '和合交流', avoid: '过度应酬', direction: '正东' },
  { suitable: '调养身心', avoid: '冒进求财', direction: '西南' },
] as const

function getBeijingDate(now: Date): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? ''
  return new Date(`${value('year')}-${value('month')}-${value('day')}T12:00:00+08:00`)
}

export function createDailyGuidance(now = new Date()): DailyGuidance {
  try {
    const beijingDate = getBeijingDate(now)
    const lunar = Lunar.fromDate(beijingDate)
    const dateKey = beijingDate.toISOString().slice(0, 10)
    const index = beijingDate.getUTCDate() % GUIDANCE_VARIANTS.length
    const variant = GUIDANCE_VARIANTS[index] ?? GUIDANCE_VARIANTS[0]
    return {
      dateKey,
      lunarDate: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      summary: `今日宜${variant.suitable}，稳步而行。安顿内心，不慌不忙。${variant.direction}方气韵和顺，自见从容。`,
      suitable: variant.suitable,
      avoid: variant.avoid,
    }
  }
  catch {
    return {
      dateKey: '',
      lunarDate: '今日指引',
      summary: '今日留意心绪，稳步而行。安顿内心，不慌不忙，方向渐明，自见从容。',
      suitable: '静心梳理',
      avoid: '急于求成',
    }
  }
}
