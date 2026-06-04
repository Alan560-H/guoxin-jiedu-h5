import type { NameDetailLiuGeTransformed, NameDetailTransformed, ZiDesItem } from '@/models/xingMingDetail'

function emptyZi(): ZiDesItem {
  return {
    bihua: '',
    wx: '',
    zi: '',
    py: '',
  }
}

function clone<T>(v: T): T {
  try {
    return structuredClone(v)
  }
  catch {
    return JSON.parse(JSON.stringify(v)) as T
  }
}

/**
 * 与老项目 xingming/detail.vue getNameDetail 内 304–325 行逻辑一致
 */
export function transformNameDetailResponse(raw: Record<string, unknown>): NameDetailTransformed {
  const data = clone(raw) as NameDetailTransformed
  if (!data.totalgedes || typeof data.totalgedes !== 'object')
    data.totalgedes = { num: '' }

  if (!Array.isArray(data.ziDes))
    data.ziDes = []

  const ziDes = clone(data.ziDes) as ZiDesItem[]
  const list = clone(ziDes) as ZiDesItem[]
  const lastLen = String(data.lastname ?? '').length
  data.xingList = list.splice(0, lastLen)
  data.mingList = list

  const firstLen = String(data.firstname ?? '').length
  const lastStrLen = String(data.lastname ?? '').length

  if (firstLen === 1) {
    data.mingList.push(emptyZi())
  }
  if (lastStrLen === 1) {
    data.xingList.unshift(emptyZi())
  }

  if (firstLen === 1) {
    data.ziDes.push(emptyZi())
  }
  if (lastStrLen === 1 && firstLen < 3) {
    data.ziDes.unshift(emptyZi())
  }

  return data
}

/**
 * 三才六格：与老 liugeDetail getNameDetail 一致（单姓不向 xingList 插入占位格）
 */
export function transformNameDetailResponseLiuGe(raw: Record<string, unknown>): NameDetailLiuGeTransformed {
  const data = transformNameDetailResponse(raw) as NameDetailLiuGeTransformed
  const lastStrLen = String(data.lastname ?? '').length
  if (lastStrLen === 1 && data.xingList.length > 0 && !data.xingList[0]?.zi)
    data.xingList = data.xingList.slice(1)
  return data
}
