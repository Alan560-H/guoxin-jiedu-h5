import type { ChatMessageRequest } from '@/models/guoxin/chat'
import type { ChatStreamHandlers } from '@/utils/guoxin/chatStream'
import { postChatMessagesStream, postChatMessageStop } from '@/utils/guoxin/chatStream'

/** 国心问答流式（H5 fetch SSE）；普通 JSON 接口仍走 guoxin.ts */
export function streamChatMessage(
  data: ChatMessageRequest,
  handlers?: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<string> {
  return postChatMessagesStream(data, handlers, signal)
}

/** 停止国心流式问答；服务端负责转发 Dify stop API */
export function stopChatMessage(
  taskId: string,
  profileId: number | string,
): Promise<void> {
  return postChatMessageStop(taskId, profileId)
}
