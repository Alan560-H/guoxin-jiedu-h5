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
  const quotaDate = ref(todayKey())
  const dailyRemaining = ref(DAILY_QUESTION_LIMIT)
  const followupBatchIndex = ref(0)

  const remaining = computed(() => {
    ensureQuotaDay()
    return dailyRemaining.value
  })

  const quotaUsedUp = computed(() => remaining.value <= 0)

  const progressRatio = computed(() => {
    const used = DAILY_QUESTION_LIMIT - remaining.value
    return Math.min(1, Math.max(0, used / DAILY_QUESTION_LIMIT))
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
    options?: { showFeedback?: boolean },
  ): ChatMessage {
    const msg: ChatMessage = {
      id: uid('a'),
      role: 'assistant',
      content,
      showFeedback: options?.showFeedback !== false,
      feedback: '',
      createdAt: Date.now(),
    }
    setMessages(profileId, [...getMessages(profileId), msg])
    return msg
  }

  /** mock 一轮成功后扣次；失败勿调用 */
  function consumeOneQuota(): boolean {
    ensureQuotaDay()
    if (dailyRemaining.value <= 0)
      return false
    dailyRemaining.value -= 1
    return true
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

  function buildMockAnswer(profileName: string, question: string): string {
    const name = profileName || '你'
    return `先把「${question}」拆成事实、担心和期待三部分来看。结合${name}的八字节奏，眼下更适合先确认关键条件，再决定推进还是暂缓；下面给你几个可继续追问的方向。`
  }

  return {
    messagesByProfileId,
    quotaDate,
    dailyRemaining,
    followupBatchIndex,
    remaining,
    quotaUsedUp,
    progressRatio,
    DAILY_QUESTION_LIMIT,
    ensureQuotaDay,
    getMessages,
    ensureIntro,
    appendUser,
    appendAssistant,
    consumeOneQuota,
    setFeedback,
    nextFollowupBatch,
    buildMockAnswer,
  }
}, {
  persist: {
    key: 'guoxin-chat-session',
    pick: ['messagesByProfileId', 'quotaDate', 'dailyRemaining', 'followupBatchIndex'],
  },
})
