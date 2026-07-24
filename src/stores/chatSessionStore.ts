import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getDifyMessages } from '@/api/dify'
import { DAILY_QUESTION_LIMIT } from '@/constants/chatHome'
import { parseDifyMessagesPayload } from '@/utils/guoxin/parseDifyMessages'

export type ChatRole = 'assistant' | 'user'
export type FeedbackState = '' | 'helpful' | 'improve'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  /** 用户消息本地/远程缩略图（仅本轮展示，历史不依赖） */
  imageUrl?: string
  /** 仅正式助手回答展示反馈 */
  showFeedback?: boolean
  feedback?: FeedbackState
  feedbackReason?: string
  feedbackNote?: string
  /** 流式生成中 */
  streaming?: boolean
  createdAt: number
}

function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const HISTORY_LIMIT = 20

export const useChatSessionStore = defineStore('chatSession', () => {
  /** 内存态：以服务端历史为准，不 persist 消息 */
  const messagesByProfileId = ref<Record<string, ChatMessage[]>>({})
  const conversationIdByProfileId = ref<Record<string, string>>({})
  const historyLoadedAt = ref<Record<string, number>>({})
  const historyLoading = ref<Record<string, boolean>>({})
  const historyHasMore = ref<Record<string, boolean>>({})
  /** 当前列表最早一条 Dify message id，供 firstId 上翻 */
  const historyFirstId = ref<Record<string, string>>({})
  const historyLoadingOlder = ref<Record<string, boolean>>({})
  const quotaDate = ref(todayKey())
  /** 仅本地兜底 / 开发 mock；正式以 guoxinStore.chatRemaining 为准 */
  const dailyRemaining = ref(DAILY_QUESTION_LIMIT)
  const followupBatchIndex = ref(0)

  const localRemaining = computed(() => {
    ensureQuotaDay()
    return dailyRemaining.value
  })

  function ensureQuotaDay() {
    const key = todayKey()
    if (quotaDate.value !== key) {
      quotaDate.value = key
      dailyRemaining.value = DAILY_QUESTION_LIMIT
    }
  }

  function getMessages(profileId: string): ChatMessage[] {
    if (!profileId)
      return []
    return messagesByProfileId.value[profileId] ?? []
  }

  function setMessages(profileId: string, list: ChatMessage[]) {
    messagesByProfileId.value = {
      ...messagesByProfileId.value,
      [profileId]: list,
    }
  }

  function clearMessages(profileId: string) {
    if (!profileId)
      return
    const next = { ...messagesByProfileId.value }
    delete next[profileId]
    messagesByProfileId.value = next
    const more = { ...historyHasMore.value }
    delete more[profileId]
    historyHasMore.value = more
    const first = { ...historyFirstId.value }
    delete first[profileId]
    historyFirstId.value = first
  }

  function getHasMore(profileId: string): boolean {
    return Boolean(historyHasMore.value[profileId])
  }

  function isLoadingOlder(profileId: string): boolean {
    return Boolean(historyLoadingOlder.value[profileId])
  }

  function getConversationId(profileId: string): string {
    if (!profileId)
      return ''
    return conversationIdByProfileId.value[profileId] || ''
  }

  function setConversationId(profileId: string, conversationId: string) {
    if (!profileId || !conversationId)
      return
    conversationIdByProfileId.value = {
      ...conversationIdByProfileId.value,
      [profileId]: conversationId,
    }
  }

  function clearConversationId(profileId: string) {
    if (!profileId)
      return
    const next = { ...conversationIdByProfileId.value }
    delete next[profileId]
    conversationIdByProfileId.value = next
  }

  /**
   * 从服务端拉取历史并覆盖本地该档案会话。
   * 成功空列表 → 清空消息；失败 → throw（不本地兜底）。
   */
  async function loadRemoteHistory(
    profileId: string,
  ): Promise<{ messages: ChatMessage[], conversationId: string }> {
    const id = String(profileId || '').trim()
    if (!id)
      return { messages: [], conversationId: '' }

    if (historyLoading.value[id]) {
      return {
        messages: getMessages(id),
        conversationId: getConversationId(id),
      }
    }

    historyLoading.value = { ...historyLoading.value, [id]: true }
    try {
      const res = await getDifyMessages({
        profileId: id,
        firstId: '',
        limit: HISTORY_LIMIT,
      })
      if (res.code !== 200)
        throw new Error(res.msg || '加载对话历史失败')

      const parsed = parseDifyMessagesPayload(res)
      setMessages(id, parsed.messages as ChatMessage[])
      if (parsed.conversationId)
        setConversationId(id, parsed.conversationId)
      else
        clearConversationId(id)
      historyHasMore.value = { ...historyHasMore.value, [id]: parsed.hasMore }
      historyFirstId.value = {
        ...historyFirstId.value,
        [id]: parsed.firstId || '',
      }
      historyLoadedAt.value = { ...historyLoadedAt.value, [id]: Date.now() }
      return {
        messages: parsed.messages,
        conversationId: parsed.conversationId,
      }
    }
    finally {
      const next = { ...historyLoading.value }
      delete next[id]
      historyLoading.value = next
    }
  }

  /**
   * 上翻更早历史：firstId 用当前页最早 Dify id。
   * 成功则插到列表前面；无更多或失败不本地拼假数据。
   */
  async function loadOlderHistory(profileId: string): Promise<{
    appended: number
    hasMore: boolean
  }> {
    const id = String(profileId || '').trim()
    if (!id)
      return { appended: 0, hasMore: false }
    if (!historyHasMore.value[id])
      return { appended: 0, hasMore: false }
    if (historyLoadingOlder.value[id] || historyLoading.value[id])
      return { appended: 0, hasMore: Boolean(historyHasMore.value[id]) }

    const firstId = String(historyFirstId.value[id] || '').trim()
    if (!firstId)
      return { appended: 0, hasMore: false }

    historyLoadingOlder.value = { ...historyLoadingOlder.value, [id]: true }
    try {
      const res = await getDifyMessages({
        profileId: id,
        firstId,
        limit: HISTORY_LIMIT,
      })
      if (res.code !== 200)
        throw new Error(res.msg || '加载更早对话失败')

      const parsed = parseDifyMessagesPayload(res)
      const existing = getMessages(id)
      const existingIds = new Set(existing.map(m => m.id))
      const older = (parsed.messages as ChatMessage[]).filter(m => !existingIds.has(m.id))
      if (older.length > 0)
        setMessages(id, [...older, ...existing])

      historyHasMore.value = { ...historyHasMore.value, [id]: parsed.hasMore }
      if (parsed.firstId) {
        historyFirstId.value = {
          ...historyFirstId.value,
          [id]: parsed.firstId,
        }
      }
      else if (!parsed.hasMore) {
        historyFirstId.value = { ...historyFirstId.value, [id]: '' }
      }

      if (parsed.conversationId)
        setConversationId(id, parsed.conversationId)

      return { appended: older.length, hasMore: parsed.hasMore }
    }
    finally {
      const next = { ...historyLoadingOlder.value }
      delete next[id]
      historyLoadingOlder.value = next
    }
  }

  /** 仅无真实历史时插入开场白 */
  function ensureIntro(profileId: string, profileName: string) {
    const list = getMessages(profileId)
    if (list.length > 0)
      return
    const intro: ChatMessage = {
      id: `intro_${profileId}`,
      role: 'assistant',
      content: `我会结合${profileName || '当前用户'}的八字与当前问题继续拆解，并更新可追问的方向。`,
      showFeedback: false,
      createdAt: Date.now(),
    }
    setMessages(profileId, [intro])
  }

  function appendUser(
    profileId: string,
    content: string,
    options?: { imageUrl?: string },
  ): ChatMessage {
    const imageUrl = String(options?.imageUrl || '').trim()
    const msg: ChatMessage = {
      id: uid('u'),
      role: 'user',
      content,
      ...(imageUrl ? { imageUrl } : {}),
      createdAt: Date.now(),
    }
    setMessages(profileId, [...getMessages(profileId), msg])
    return msg
  }

  function appendAssistant(
    profileId: string,
    content: string,
    options?: { showFeedback?: boolean, streaming?: boolean },
  ): ChatMessage {
    const msg: ChatMessage = {
      id: uid('a'),
      role: 'assistant',
      content,
      showFeedback: options?.showFeedback === true,
      streaming: options?.streaming === true,
      feedback: '',
      createdAt: Date.now(),
    }
    setMessages(profileId, [...getMessages(profileId), msg])
    return msg
  }

  function patchMessage(
    profileId: string,
    messageId: string,
    patch: Partial<Pick<ChatMessage, 'content' | 'showFeedback' | 'streaming' | 'feedback'>>,
  ) {
    const list = getMessages(profileId).map((m) => {
      if (m.id !== messageId)
        return m
      return { ...m, ...patch }
    })
    setMessages(profileId, list)
  }

  function removeMessage(profileId: string, messageId: string) {
    setMessages(
      profileId,
      getMessages(profileId).filter(m => m.id !== messageId),
    )
  }

  /** 仅本地兜底扣次；服务端权威路径请刷 credits */
  function consumeLocalQuota(): boolean {
    ensureQuotaDay()
    if (dailyRemaining.value <= 0)
      return false
    dailyRemaining.value -= 1
    return true
  }

  function syncLocalRemaining(n: number) {
    ensureQuotaDay()
    dailyRemaining.value = Math.max(0, n)
  }

  function setFeedback(
    profileId: string,
    messageId: string,
    feedback: FeedbackState,
    reason = '',
    note = '',
  ) {
    const list = getMessages(profileId).map((m) => {
      if (m.id !== messageId)
        return m
      return {
        ...m,
        feedback,
        feedbackReason: reason,
        feedbackNote: note,
      }
    })
    setMessages(profileId, list)
  }

  function nextFollowupBatch() {
    followupBatchIndex.value += 1
  }

  return {
    messagesByProfileId,
    conversationIdByProfileId,
    historyLoadedAt,
    historyLoading,
    historyHasMore,
    historyFirstId,
    historyLoadingOlder,
    quotaDate,
    dailyRemaining,
    followupBatchIndex,
    localRemaining,
    DAILY_QUESTION_LIMIT,
    ensureQuotaDay,
    getMessages,
    setMessages,
    clearMessages,
    getHasMore,
    isLoadingOlder,
    loadRemoteHistory,
    loadOlderHistory,
    ensureIntro,
    appendUser,
    appendAssistant,
    patchMessage,
    removeMessage,
    getConversationId,
    setConversationId,
    clearConversationId,
    consumeLocalQuota,
    syncLocalRemaining,
    setFeedback,
    nextFollowupBatch,
  }
}, {
  persist: {
    key: 'guoxin-chat-session',
    /** 消息与 conversationId 以服务端为准，不落盘 */
    pick: [
      'quotaDate',
      'dailyRemaining',
      'followupBatchIndex',
    ],
  },
})
