export type RemoteCacheKey =
  | 'products'
  | 'profiles'
  | 'credits'
  | 'orders'
  | 'consumeRecords'

/** 远程列表/次数类数据的加载去重与缓存标记（数据存 Pinia，此处只管是否已拉过） */
export function createRemoteDataCache() {
  const loaded = new Set<RemoteCacheKey>()
  const inflight = new Map<RemoteCacheKey, Promise<void>>()
  /** credits 缓存与当前商品 id 绑定，切换套餐需重新拉 */
  let creditsProductId: number | null = null

  function invalidate(keys?: RemoteCacheKey[] | 'all') {
    if (!keys || keys === 'all') {
      loaded.clear()
      inflight.clear()
      creditsProductId = null
      return
    }
    for (const key of keys) {
      loaded.delete(key)
      inflight.delete(key)
      if (key === 'credits')
        creditsProductId = null
    }
  }

  function isFresh(key: RemoteCacheKey, tag?: number | null): boolean {
    if (!loaded.has(key))
      return false
    if (key === 'credits' && tag != null && creditsProductId !== tag)
      return false
    return true
  }

  async function ensure(
    key: RemoteCacheKey,
    fetcher: () => Promise<void>,
    options?: { force?: boolean, tag?: number | null },
  ): Promise<void> {
    const force = options?.force ?? false
    if (!force && isFresh(key, options?.tag))
      return
    if (!force) {
      const pending = inflight.get(key)
      if (pending)
        return pending
    }
    const task = fetcher()
      .then(() => {
        loaded.add(key)
        if (key === 'credits' && options?.tag != null)
          creditsProductId = options.tag
      })
      .finally(() => {
        if (inflight.get(key) === task)
          inflight.delete(key)
      })
    inflight.set(key, task)
    return task
  }

  return { invalidate, ensure, isFresh }
}
