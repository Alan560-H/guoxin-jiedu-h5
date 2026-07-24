/** 从二期接口无示例响应中防御性抽出问题文案列表 */

function pushText(out: string[], v: unknown) {
  if (typeof v === 'string') {
    const t = v.trim()
    if (t)
      out.push(t)
    return
  }
  if (!v || typeof v !== 'object')
    return
  const o = v as Record<string, unknown>
  const text = o.question ?? o.title ?? o.text ?? o.content ?? o.name
  if (typeof text === 'string' && text.trim())
    out.push(text.trim())
}

function fromArray(arr: unknown[]): string[] {
  const out: string[] = []
  for (const item of arr)
    pushText(out, item)
  return out
}

/** 题库：string[] / 二维数组 / { list|questions|items } */
export function parseQuestionBankPayload(raw: unknown): string[][] {
  if (!raw)
    return []

  if (Array.isArray(raw)) {
    if (raw.length === 0)
      return []
    if (Array.isArray(raw[0])) {
      return (raw as unknown[][])
        .map(group => fromArray(group))
        .filter(g => g.length > 0)
    }
    const flat = fromArray(raw)
    return flat.length ? [flat] : []
  }

  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const nested = o.list ?? o.questions ?? o.items ?? o.data ?? o.bank ?? o.banks
    if (nested != null)
      return parseQuestionBankPayload(nested)
  }

  return []
}

export interface SuggestedItem {
  question: string
  tip: string
}

/** 建议问：string[] 或带 tip/desc 的对象列表 */
export function parseSuggestedPayload(raw: unknown): SuggestedItem[] {
  if (!raw)
    return []

  let list: unknown[] = []
  if (Array.isArray(raw)) {
    list = raw
  }
  else if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const nested = o.list ?? o.questions ?? o.items ?? o.suggestions ?? o.data
    if (Array.isArray(nested))
      list = nested
    else
      return parseSuggestedPayload(nested)
  }

  const out: SuggestedItem[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const q = item.trim()
      if (q)
        out.push({ question: q, tip: '' })
      continue
    }
    if (!item || typeof item !== 'object')
      continue
    const o = item as Record<string, unknown>
    const question = String(o.question ?? o.title ?? o.text ?? o.content ?? '').trim()
    if (!question)
      continue
    const tip = String(o.tip ?? o.desc ?? o.description ?? o.subtitle ?? '').trim()
    out.push({ question, tip })
  }
  return out
}

/** 兼容 { code, data } 与直接业务对象 */
export function unwrapBizPayload(res: unknown): unknown {
  if (!res || typeof res !== 'object')
    return res
  const root = res as Record<string, unknown>
  const nested = root.data

  const looksBiz = (v: unknown) => {
    if (!v || typeof v !== 'object' || Array.isArray(v))
      return Array.isArray(v)
    const o = v as Record<string, unknown>
    return [
      'reportCredits',
      'questionRemaining',
      'questionUnlimited',
      'memberStatus',
      'memberSku',
      'credits',
      'chatRemaining',
      'list',
      'questions',
      'items',
      'has_more',
      'hasMore',
    ].some(k => k in o)
  }

  if (looksBiz(nested))
    return nested
  if (looksBiz(root) || Array.isArray(root))
    return root
  if (nested !== undefined)
    return nested
  return root
}
