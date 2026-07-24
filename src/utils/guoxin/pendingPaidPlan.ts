const STORAGE_KEY = 'guoxin-pending-paid-plan'

export interface PendingPaidPlan {
  sku: string
  name: string
  days: number
  reports: number
  price: number
}

export function savePendingPaidPlan(plan: PendingPaidPlan) {
  // #ifdef H5
  try {
    const payload: PendingPaidPlan = {
      sku: plan.sku,
      name: plan.name,
      days: plan.days,
      reports: plan.reports,
      price: plan.price,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }
  catch {
    // ignore
  }
  // #endif
}

export function takePendingPaidPlan(): PendingPaidPlan | null {
  // #ifdef H5
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw)
      return null
    sessionStorage.removeItem(STORAGE_KEY)
    const parsed = JSON.parse(raw) as PendingPaidPlan
    if (!parsed?.name)
      return null
    return parsed
  }
  catch {
    return null
  }
  // #endif
  // #ifndef H5
  return null
  // #endif
}

export function peekPendingPaidPlan(): PendingPaidPlan | null {
  // #ifdef H5
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw)
      return null
    return JSON.parse(raw) as PendingPaidPlan
  }
  catch {
    return null
  }
  // #endif
  // #ifndef H5
  return null
  // #endif
}
