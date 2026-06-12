import type { ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { normalizeProfileVo } from '@/utils/guoxin/normalizeProfile'

/** 本地演示模式用；远程模式数据来自后端，此处保持空 */
export const DEFAULT_PROFILES: ProfileVo[] = []

export const DEFAULT_RECORDS: RecordVo[] = []

export function normalizeSeedProfile(profile: ProfileVo): ProfileVo {
  const next = normalizeProfileVo(profile as unknown as Record<string, unknown>)
  if (next.relationText === '自己')
    next.relationText = '本人'
  next.useTrueSolarTime = next.useTrueSolarTime ?? false
  return next
}
