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
  '认识自己',
  '事业路径',
  '你的财富',
  '爱与关系',
  '家人与社交',
  '身体与能量',
  '人生周期',
  '重大选择',
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

export const FEEDBACK_FORM_TITLE = '投诉与建议'

export const FEEDBACK_FORM_URL = 'https://wcnzvwcua4e6.feishu.cn/share/base/form/shrcn8SlMhLb9vtzU90x8TiePTx'

export const CREDITS_PAYWALL_TEXT = '权益开通后不支持退款，请根据实际需要选择。'

/**
 * 轻舟 App 发现页入口：URL 带 ?source=1 时展示返回栏，并视同 App 内嵌（h5ScenceType / custom-eader）。
 */
export const SOURCE_ENTRY_QUERY_VALUE = '1'

/** 轻舟云课堂发现页地址（source=1 时「返回上一页」跳转目标） */
export const SOURCE_ENTRY_BACK_URL = 'https://nr.cxfangtang.cn/'

/** 是否开放短信验证码登录（绑定手机号仍使用短信验证码） */
export const SMS_LOGIN_ENABLED = false
