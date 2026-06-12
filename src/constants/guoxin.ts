export const RELATION_OPTIONS = [
  { value: 'self', label: '本人' },
  { value: 'parent', label: '父母' },
  { value: 'spouse', label: '配偶' },
  { value: 'child', label: '子女' },
  { value: 'relative', label: '亲友' },
  { value: 'other', label: '其他' },
] as const

export type RelationValue = typeof RELATION_OPTIONS[number]['value']

export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
] as const

export type GenderValue = typeof GENDER_OPTIONS[number]['value']

export const CALENDAR_OPTIONS = [
  { value: 'solar', label: '公历' },
  { value: 'lunar', label: '农历' },
] as const

export type CalendarValue = typeof CALENDAR_OPTIONS[number]['value']

export const DIRECTION_OPTIONS = [
  '家庭关系',
  '情绪状态',
  '健康作息',
  '事业方向',
  '财务规划',
  '子女关系',
  '近期状态',
] as const

export type DirectionValue = typeof DIRECTION_OPTIONS[number]

export type FontScale = 'standard' | 'large' | 'xlarge'

export interface CreditPackage {
  id: string
  name: string
  amount: number
  price: number
  originPrice: number
  desc: string
  hot?: boolean
}

/** 本地演示套餐（已清空）；远程模式商品来自 getProducts */
export const CREDIT_PACKAGES: readonly CreditPackage[] = []

export type CreditPackageId = string

export const DISCLAIMER_TEXT = '内容仅供传统文化学习与生活参考，不作为医疗、法律、理财等任何现实决策依据。'

export const CREDITS_PAYWALL_TEXT = '权益开通后不支持退款，请根据实际需要选择。'
