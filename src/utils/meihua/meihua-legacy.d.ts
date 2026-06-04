/** 梅花算法 .js 的类型声明（源码已为 ESM 导出，便于 Vite H5） */

declare module '@/utils/meihua/calendarConverterFn.js' {
  export class CalendarConverter {
    solar2lunar(date: Date): Record<string, unknown>
    lunar2solar(...args: unknown[]): unknown
  }
}

declare module '@/utils/meihua/siZhuInfo.js' {
  export class SiZhuInfo {
    getSiZhu(cDay: string, hour: number): string
    getKongWang(cDay: string): string
  }
}
