/** 与生平子时一致：1 男 0 女 */
export type XingMingSex = 0 | 1

/** 0 三才五格 1 三才六格（与老项目 type 一致） */
export type XingMingPaiPanType = 0 | 1

/** 姓名学一级页表单 */
export interface XingMingFormData {
  firstName: string
  lastName: string
  sex: XingMingSex
  type: XingMingPaiPanType
}
