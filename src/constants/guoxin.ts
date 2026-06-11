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

/** 本地演示套餐；远程模式商品来自后端 getProducts */
export const CREDIT_PACKAGES = [
  { id: 'trial', name: '心语解读体验包', amount: 1, price: 19.9, originPrice: 39, desc: '适合首次体验，了解国心解读服务' },
  { id: 'standard', name: '心语解读权益包', amount: 10, price: 99, originPrice: 199, hot: true, desc: '可为多位家庭成员分别解读' },
  { id: 'family', name: '家庭心语权益包', amount: 20, price: 159, originPrice: 299, desc: '适合全家使用，为每位成员建立专属档案' },
] as const

export type CreditPackageId = typeof CREDIT_PACKAGES[number]['id']

export const DISCLAIMER_TEXT = '内容仅供传统文化学习与生活参考，不作为医疗、法律、理财等任何现实决策依据。'

export const CREDITS_PAYWALL_TEXT = '权益开通后不支持退款，请根据实际需要选择。'
