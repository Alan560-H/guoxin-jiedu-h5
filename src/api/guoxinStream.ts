import { dev, prod } from '@/api/env'
import { getGuoxinToken } from '@/api/guoxinHttp'
import type { StreamDeltaEvent, StreamDoneEvent, StreamErrorEvent, StreamEventType, StreamStepEvent } from '@/models/guoxin/jiedu'

const baseUrl = import.meta.env.DEV ? dev.baseUrl : prod.baseUrl

export interface GuoxinStreamHandlers {
  onStep?: (data: StreamStepEvent) => void
  onDelta?: (data: StreamDeltaEvent) => void
  onDone?: (data: StreamDoneEvent) => void
  onError?: (data: StreamErrorEvent) => void
}

export function subscribeJieduStream(taskId: string, handlers: GuoxinStreamHandlers, signal?: AbortSignal): Promise<void> {
  const token = getGuoxinToken()
  const headers: Record<string, string> = {}
  if (token)
    headers.Authorization = `Bearer ${token}`

  const url = `${baseUrl}/app/guoxin/jiedu/stream?taskId=${encodeURIComponent(taskId)}`

  return fetch(url, { headers, signal }).then(async (res) => {
    if (!res.ok || !res.body)
      throw new Error('流式连接失败')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        const lines = part.split('\n')
        let event: StreamEventType = 'step'
        let dataStr = ''
        for (const line of lines) {
          if (line.startsWith('event:'))
            event = line.slice(6).trim() as StreamEventType
          if (line.startsWith('data:'))
            dataStr = line.slice(5).trim()
        }
        if (!dataStr)
          continue
        const data = JSON.parse(dataStr)
        if (event === 'step')
          handlers.onStep?.(data)
        else if (event === 'delta')
          handlers.onDelta?.(data)
        else if (event === 'done')
          handlers.onDone?.(data)
        else if (event === 'error')
          handlers.onError?.(data)
      }
    }
  })
}
