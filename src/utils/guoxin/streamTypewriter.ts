/**
 * SSE 累计全文作 target，本地逐步追上（打字机感）。
 *
 * 默认约每 50ms 1 字；积压不加速，避免「一下追完」失去打字感。
 * playLocalTypewriter：整段短文案兜底。
 */
export function createStreamTypewriter(options: {
  onUpdate: (displayed: string) => void
  onScroll?: () => void
  /** 默认 50：约每 50ms 出现一个字符 */
  intervalMs?: number
  /** 每拍追加字数，默认 1 */
  charsPerTick?: number
}) {
  const intervalMs = options.intervalMs ?? 50
  const charsPerTick = Math.max(1, options.charsPerTick ?? 1)
  let displayed = ''
  let target = ''
  let timer: ReturnType<typeof setInterval> | null = null
  let idleResolvers: Array<() => void> = []

  function notifyIdle() {
    const list = idleResolvers
    idleResolvers = []
    for (const resolve of list)
      resolve()
  }

  function tick() {
    if (displayed.length >= target.length) {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      notifyIdle()
      return
    }

    displayed = target.slice(0, displayed.length + charsPerTick)
    options.onUpdate(displayed)
    options.onScroll?.()
  }

  function ensureTimer() {
    if (timer || displayed.length >= target.length)
      return
    timer = setInterval(tick, intervalMs)
  }

  /** 设置当前应展示到的完整文本（SSE 累计全文，建议已 repair） */
  function setTarget(fullText: string) {
    if (fullText.length < displayed.length) {
      displayed = ''
      options.onUpdate('')
    }
    target = fullText
    if (displayed.length < target.length)
      ensureTimer()
    else
      notifyIdle()
  }

  /** 等待打字追平当前 target */
  function flush(): Promise<void> {
    if (displayed.length >= target.length)
      return Promise.resolve()
    return new Promise((resolve) => {
      idleResolvers.push(resolve)
      ensureTimer()
    })
  }

  function clear() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    idleResolvers = []
    displayed = ''
    target = ''
  }

  function getDisplayed() {
    return displayed
  }

  return { setTarget, flush, clear, getDisplayed }
}

/** 整段本地打字机（mock / 空回复兜底短文案） */
export function playLocalTypewriter(
  fullText: string,
  onUpdate: (displayed: string) => void,
  options?: { intervalMs?: number, charsPerTick?: number, onScroll?: () => void, signal?: AbortSignal },
): Promise<string> {
  const tw = createStreamTypewriter({
    onUpdate,
    onScroll: options?.onScroll,
    intervalMs: options?.intervalMs,
    charsPerTick: options?.charsPerTick,
  })
  tw.setTarget(fullText)

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      tw.clear()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (options?.signal?.aborted) {
      onAbort()
      return
    }
    options?.signal?.addEventListener('abort', onAbort, { once: true })
    tw.flush().then(() => {
      options?.signal?.removeEventListener('abort', onAbort)
      resolve(tw.getDisplayed())
    })
  })
}
