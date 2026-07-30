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

/** 对话版报告确认页：解读重点默认文案（可自行改） */
export const REPORT_CONFIRM_FOCUS_DEFAULT = '整体命理 · 近期状态 · 行动建议'

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

/** 权益页信任标识（展示用，非接口字段） */
export const CREDITS_TRUST_BADGES = [
  { title: '微信支付', desc: '安全保障', icon: 'trust-wechat' },
  { title: 'AI生成', desc: '可追溯', icon: 'trust-ai' },
  { title: '仅供参考', desc: '不决策', icon: 'trust-info' },
] as const

/** 套餐卡图标：按次数档位映射，其余按列表顺序兜底 */
export const CREDITS_PACKAGE_ICON_BY_AMOUNT: Record<number, string> = {
  1: 'pkg-gift',
  10: 'pkg-family',
  20: 'pkg-calendar',
}

export const CREDITS_PACKAGE_ICON_FALLBACK = ['pkg-gift', 'pkg-family', 'pkg-calendar'] as const

export const CREDITS_INSUFFICIENT_HINT
  = '开通后可用于任意心语档案；每次完整解读消耗 1 次。'

export const CREDITS_PAY_HINT
  = '支付前请确认次数、有效期、适用档案与扣次规则。'

/**
 * 轻舟发现页入口：URL 带 ?isShowBack=1 时首页展示「返回上一页」栏。
 */
export const IS_SHOW_BACK_QUERY_KEY = 'isShowBack'
export const IS_SHOW_BACK_QUERY_VALUE = '1'

/**
 * 入口开关：?isShowPay=1 或未传走微信支付（默认 1）；?isShowPay=0 咨询弹客服二维码。
 */
export const IS_SHOW_PAY_QUERY_KEY = 'isShowPay'
export const IS_SHOW_PAY_QUERY_ON = '1'
export const IS_SHOW_PAY_QUERY_OFF = '0'

/** 轻舟云课堂发现页地址（isShowBack=1 时「返回上一页」跳转目标） */
export const SHOW_BACK_ENTRY_URL = 'https://nr.cxfangtang.cn/'

/** 来源统计：URL query / 请求头字段名（如 ?source=1） */
export const SOURCE_QUERY_KEY = 'source'

/** 是否开放短信验证码登录（绑定手机号仍使用短信验证码） */
/** 对话版：全环境（含微信）启用手机号+短信登录 */
export const SMS_LOGIN_ENABLED = true
