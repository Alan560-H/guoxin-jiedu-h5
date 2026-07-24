/** 权益套餐：仅映射后台 products，不做本地假数据 */

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
  chatBenefit: string
  reportBenefit: string
  footnote: string
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
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
      const memberExclusive = Boolean(p.memberExclusive)
      const showCountdown = Boolean(p.showCountdown ?? p.countdown)

      const chatBenefit = days > 0
        ? `${days} 天问答权益`
        : (desc || '问答额度以套餐说明为准')
      const reportBenefit = reports > 0
        ? `${reports} 次深度报告`
        : '报告额度以套餐说明为准'

      return {
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
        chatBenefit,
        reportBenefit,
        footnote: desc,
      } satisfies DisplayMemberPlan
    })
    .filter((p): p is DisplayMemberPlan => p != null)
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
