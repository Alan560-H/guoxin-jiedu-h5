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

  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar
    getYear(): number
    getMonth(): number
    getDay(): number
    getLunar(): Lunar
  }

  export class Lunar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar
    getYear(): number
    getMonth(): number
    getDay(): number
    getSolar(): Solar
  }
}
