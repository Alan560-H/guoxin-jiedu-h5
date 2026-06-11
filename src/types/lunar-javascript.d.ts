declare module 'lunar-javascript' {
  export interface LunarMonth {
    getMonth(): number
    isLeap(): boolean
    getDayCount(): number
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear
    getMonths(): LunarMonth[]
    getMonth(month: number): LunarMonth
  }
}
