/**
 * 流式打字机（对齐 ai-im playLocalTypewriter 节奏）。
 * SSE 推送全文目标，本地按字符揭示，避免整包一下子刷上屏。
 */
export function createStreamTypewriter(options: {
  onUpdate: (displayed: string) => void
  onScroll?: () => void
  intervalMs?: number
}) {
  const intervalMs = options.intervalMs ?? 16
  let displayed = ''
  let target = ''
  let timer: ReturnType<typeof setInterval> | null = null
  let lastScrollAt = 0
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

    displayed = target.slice(0, displayed.length + 1)
    options.onUpdate(displayed)

    const now = Date.now()
    if (options.onScroll && now - lastScrollAt > 80) {
      lastScrollAt = now
      options.onScroll()
    }
  }

  function ensureTimer() {
    if (timer || displayed.length >= target.length)
      return
    timer = setInterval(tick, intervalMs)
  }

  /** 设置当前应展示到的完整文本（SSE 累计全文） */
  function setTarget(fullText: string) {
    if (fullText.length < displayed.length) {
      // 异常回退：以新全文为准重来
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

/** 整段本地打字机（兜底文案等），对齐 ai-im playLocalTypewriter */
export function playLocalTypewriter(
  fullText: string,
  onUpdate: (displayed: string) => void,
  options?: { intervalMs?: number, onScroll?: () => void, signal?: AbortSignal },
): Promise<string> {
  const tw = createStreamTypewriter({
    onUpdate,
    onScroll: options?.onScroll,
    intervalMs: options?.intervalMs,
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
