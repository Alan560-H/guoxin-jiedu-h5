import type { ChatMessageRequest } from '@/models/guoxin/chat'
import type { ChatStreamHandlers } from '@/utils/guoxin/chatStream'
import { postChatMessagesStream } from '@/utils/guoxin/chatStream'

/** 国心问答流式（H5 fetch SSE）；普通 JSON 接口仍走 guoxin.ts */
export function streamChatMessage(
  data: ChatMessageRequest,
  handlers?: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<string> {
  return postChatMessagesStream(data, handlers, signal)
}
