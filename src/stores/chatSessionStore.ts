import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DAILY_QUESTION_LIMIT } from '@/constants/chatHome'

export type ChatRole = 'assistant' | 'user'
export type FeedbackState = '' | 'helpful' | 'improve'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
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

export const useChatSessionStore = defineStore('chatSession', () => {
  const messagesByProfileId = ref<Record<string, ChatMessage[]>>({})
  const conversationIdByProfileId = ref<Record<string, string>>({})
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

  function ensureIntro(profileId: string, profileName: string) {
    const list = getMessages(profileId)
    if (list.some(m => m.id.startsWith('intro_')))
      return
    const intro: ChatMessage = {
      id: `intro_${profileId}`,
      role: 'assistant',
      content: `我会结合${profileName || '当前用户'}的八字与当前问题继续拆解，并更新可追问的方向。`,
      showFeedback: false,
      createdAt: Date.now(),
    }
    setMessages(profileId, [intro, ...list])
  }

  function appendUser(profileId: string, content: string): ChatMessage {
    const msg: ChatMessage = {
      id: uid('u'),
      role: 'user',
      content,
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
    quotaDate,
    dailyRemaining,
    followupBatchIndex,
    localRemaining,
    DAILY_QUESTION_LIMIT,
    ensureQuotaDay,
    getMessages,
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
    pick: [
      'messagesByProfileId',
      'conversationIdByProfileId',
      'quotaDate',
      'dailyRemaining',
      'followupBatchIndex',
    ],
  },
})
