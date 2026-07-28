/** 权益套餐：仅映射后台 products，不做本地假数据 */

/** 1=单次报告加油包；2=新人体验包；其他=普通权益包 */
export type ProductPromotionSort = 1 | 2 | 0

export interface DisplayMemberPlan {
  id: string
  sku: string
  productId: number
  name: string
  price: number
  originalPrice: number
  showOrigin: boolean
  /** 问答有效天数（接口有则展示） */
  days: number
  /** 报告次数 */
  reports: number
  /** 促销/说明文案 */
  desc: string
  memberExclusive: boolean
  showCountdown: boolean
  /** 后台 promotionSort */
  promotionSort: ProductPromotionSort
  /** 「问答」后文案，不含「问答」前缀 */
  chatBenefit: string
  /** 「报告」后文案，不含「报告」前缀 */
  reportBenefit: string
  footnote: string
  /** 新人包利益点 chips（有则优先展示） */
  benefitChips: string[]
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function normalizePromotionSort(v: unknown): ProductPromotionSort {
  const n = num(v, 0)
  if (n === 1 || n === 2)
    return n
  return 0
}

/**
 * 从 promotionText 拆出问答行 / 报告行 / 脚注。
 * 兼容换行，或「问答…报告…含/适合/问答与…」连写。
 */
function parsePromotionCopy(raw: string): {
  chat?: string
  report?: string
  footnote?: string
} {
  const text = raw.replace(/\r\n/g, '\n').trim()
  if (!text)
    return {}

  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean)
  if (lines.length >= 2) {
    let chat = ''
    let report = ''
    const rest: string[] = []
    for (const line of lines) {
      if (!chat && /^问答/.test(line))
        chat = line.replace(/^问答[：:\s]*/, '').trim()
      else if (!report && /^报告/.test(line))
        report = line.replace(/^报告[：:\s]*/, '').trim()
      else
        rest.push(line.replace(/^咨询[：:\s]*/, '').trim())
    }
    return {
      chat: chat || undefined,
      report: stripTrailingConsult(report) || undefined,
      footnote: rest.filter(Boolean).join(' ') || undefined,
    }
  }

  // 单行连写：问答…报告…（含/适合/问答与…）
  if (!text.includes('问答') || !text.includes('报告'))
    return { footnote: text }

  const afterQa = text.replace(/^问答[：:\s]*/, '')
  const reportIdx = afterQa.indexOf('报告')
  if (reportIdx < 0)
    return { footnote: text }

  const chat = afterQa.slice(0, reportIdx).trim()
  const rest = afterQa.slice(reportIdx + 2).replace(/^[：:\s]*/, '').trim()
  const footMatch = rest.match(/^(.*?)(?:咨询)?(含.+|适合.+|问答与.+)$/)
  if (footMatch) {
    return {
      chat: chat || undefined,
      report: stripTrailingConsult(footMatch[1] || '') || undefined,
      footnote: footMatch[2]?.trim() || undefined,
    }
  }

  return {
    chat: chat || undefined,
    report: stripTrailingConsult(rest) || undefined,
  }
}

/** 后台文案偶发把按钮「咨询」拼进报告行 */
function stripTrailingConsult(s: string): string {
  return s.replace(/咨询$/u, '').trim()
}

function buildBenefitChips(plan: {
  days: number
  reports: number
  desc: string
  chatBenefit: string
  reportBenefit: string
}): string[] {
  const chips: string[] = []
  if (plan.days > 0)
    chips.push(`问答 ${plan.days} 天内每日不限次`)
  if (plan.reports > 0)
    chips.push(`赠送 ${plan.reports} 次单项深度报告`)
  if (!chips.length && plan.desc)
    chips.push(plan.desc)
  return chips.slice(0, 2)
}

function defaultChatBenefit(days: number, promotionSort: ProductPromotionSort): string {
  if (days <= 0)
    return '问答额度以套餐说明为准'
  if (promotionSort === 2)
    return `${days}天问答不限次`
  if (days >= 365)
    return `${days}天不限次1v1答疑`
  return `${days}天无限浅层追问`
}

function defaultReportBenefit(reports: number, promotionSort: ProductPromotionSort): string {
  if (reports <= 0)
    return '报告额度以套餐说明为准'
  if (promotionSort === 2)
    return `赠送 ${reports} 次单项深度报告`
  if (reports >= 100)
    return `${reports}个方面深度解析`
  if (reports >= 10)
    return `${reports}个深度解析`
  return `${reports}个深度解析报告`
}

/** 将后台商品列表转为权益页展示模型 */
export function mapProductsToPlans(serverProducts: unknown[]): DisplayMemberPlan[] {
  const products = (Array.isArray(serverProducts) ? serverProducts : []) as Record<string, unknown>[]

  return products
    .map((p) => {
      const productId = num(p.id, Number.NaN)
      if (!Number.isFinite(productId))
        return null

      const name = str(p.productName) || `套餐 ${productId}`
      const price = num(p.salePrice)
      const originalPrice = num(p.originalPrice, price)
      const reports = num(p.generateCount ?? p.reportCredits ?? p.reports)
      const days = num(p.validDays ?? p.days)
      const desc = str(p.promotionText)
      const sku = str(p.memberSku ?? p.skuCode ?? p.sku) || `product_${productId}`
      const promotionSort = normalizePromotionSort(p.promotionSort)
      const memberExclusive = Boolean(p.memberExclusive) || promotionSort === 1
      const showCountdown = promotionSort === 2 || Boolean(p.showCountdown ?? p.countdown)

      const parsed = parsePromotionCopy(desc)
      const chatFromApi = str(p.questionBenefit ?? p.chatBenefit ?? p.qaDesc ?? p.questionDesc)
      const reportFromApi = str(p.reportBenefit ?? p.reportDesc)
      const footnoteFromApi = str(p.remark ?? p.footnote ?? p.subTitle)

      const chatBenefit = chatFromApi
        || parsed.chat
        || defaultChatBenefit(days, promotionSort)
      const reportBenefit = stripTrailingConsult(
        reportFromApi
        || parsed.report
        || defaultReportBenefit(reports, promotionSort),
      )
      const footnote = footnoteFromApi
        || parsed.footnote
        || (promotionSort === 0 ? '' : desc)

      const plan = {
        id: String(productId),
        sku,
        productId,
        name,
        price,
        originalPrice,
        showOrigin: originalPrice > price,
        days,
        reports,
        desc,
        memberExclusive,
        showCountdown,
        promotionSort,
        chatBenefit,
        reportBenefit,
        footnote,
        benefitChips: [] as string[],
      } satisfies DisplayMemberPlan

      plan.benefitChips = buildBenefitChips(plan)
      return plan
    })
    .filter((p): p is DisplayMemberPlan => p != null)
}

/** 按 promotionSort 拆分：新人体验 / 普通权益 / 单次加油 */
export function splitPlansByPromotion(plans: DisplayMemberPlan[]) {
  const trial = plans.find(p => p.promotionSort === 2) ?? null
  const boost = plans.find(p => p.promotionSort === 1) ?? null
  // 普通权益包：天数高→低（年度/季度/月度）
  const regular = plans
    .filter(p => p.promotionSort !== 1 && p.promotionSort !== 2)
    .slice()
    .sort((a, b) => (b.days - a.days) || (b.price - a.price))
  return { trial, regular, boost }
}

export function formatPlanSummary(plan: Pick<DisplayMemberPlan, 'name' | 'days' | 'reports'>): string {
  if (plan.days <= 0 && plan.reports > 0)
    return `${plan.name} · ${plan.reports} 次完整报告额度`
  if (plan.days > 0 && plan.reports > 0)
    return `${plan.name} · ${plan.days} 天问答 + ${plan.reports} 次报告`
  if (plan.days > 0)
    return `${plan.name} · ${plan.days} 天问答权益`
  return plan.name
}

export function formatPlanPaidCopy(plan: Pick<DisplayMemberPlan, 'days' | 'reports'>): string {
  if (plan.days <= 0 && plan.reports > 0)
    return '报告额度已到账。生成报告会优先复用问答时保存的八字，普通问答次数不受影响。'
  return '问答权益和报告额度均已开通。普通问答不会扣报告额度，只有确认生成报告时才扣除。'
}
