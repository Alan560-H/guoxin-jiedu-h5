<script setup lang="ts">
import type { FeedbackState } from '@/stores/chatSessionStore'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { streamChatMessage } from '@/api/chat'
import { getDifySuggested } from '@/api/dify'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatComposer from '@/components/guoxin/chat/GxChatComposer.vue'
import GxChatFeedbackModal from '@/components/guoxin/chat/GxChatFeedbackModal.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLimitModal from '@/components/guoxin/chat/GxChatLimitModal.vue'
import GxChatThread from '@/components/guoxin/chat/GxChatThread.vue'
import GxInviteModal from '@/components/guoxin/chat/GxInviteModal.vue'
import {
  CHAT_CREDITS_LOCAL_FALLBACK,
  CHAT_PENDING_QUESTION_KEY,
  DAILY_QUESTION_LIMIT,
  FOLLOWUP_BANKS,
} from '@/constants/chatHome'
import { isChatStreamQuotaError } from '@/models/guoxin/chat'
import { RouterPaths } from '@/routerPaths'
import { useChatSessionStore } from '@/stores/chatSessionStore'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { setSkipAutoEnterChat } from '@/utils/guoxin/chatHistoryNav'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { parseSuggestedPayload, unwrapBizPayload } from '@/utils/guoxin/parseDifyLists'
import { createStreamTypewriter } from '@/utils/guoxin/streamTypewriter'

const store = useGuoxinStore()
const chatStore = useChatSessionStore()

const draft = ref('')
const asking = ref(false)
const historyLoading = ref(false)
const loadingOlder = ref(false)
const showBazi = ref(false)
const showInvite = ref(false)
const showLimit = ref(false)
const showFeedback = ref(false)
const feedbackMessageId = ref('')
const scrollIntoView = ref('')
const bootstrapped = ref(false)
const abortController = ref<AbortController | null>(null)
const clearActiveTypewriter = ref<(() => void) | null>(null)
const lastStreamMessageId = ref('')
const remoteFollowups = ref<Array<{ question: string, tip: string }> | null>(null)

const profiles = computed(() => store.profiles)
const activeId = computed(() => store.activeProfileId)
const activeProfile = computed(() => store.activeProfile)
const profileName = computed(() => activeProfile.value?.name || '你')
const userSeal = computed(() => {
  const n = (activeProfile.value?.name || '').trim()
  return n ? n.slice(0, 1) : '我'
})

const messages = computed(() => chatStore.getMessages(activeId.value))
const hasConversation = computed(() =>
  messages.value.some(m => m.role === 'user'),
)

const chatUnlimited = computed(() => store.chatUnlimited)
const remaining = computed(() => {
  if (store.chatCreditsFromServer || !CHAT_CREDITS_LOCAL_FALLBACK)
    return store.chatRemaining
  return chatStore.localRemaining
})
const quotaUsedUp = computed(() => !chatUnlimited.value && remaining.value <= 0)
const progressRatio = computed(() => {
  if (chatUnlimited.value)
    return 0
  const used = DAILY_QUESTION_LIMIT - remaining.value
  return Math.min(1, Math.max(0, used / DAILY_QUESTION_LIMIT))
})

const followupBank = computed(() => {
  const banks = FOLLOWUP_BANKS
  const idx = chatStore.followupBatchIndex % banks.length
  return banks[idx] ?? banks[0]
})

const followupItems = computed(() => {
  if (remoteFollowups.value && remoteFollowups.value.length > 0)
    return remoteFollowups.value
  return (followupBank.value?.items ?? []).map(([question, tip]) => ({ question, tip }))
})

const followupMeta = computed(() => {
  if (chatUnlimited.value)
    return '不限次'
  return quotaUsedUp.value ? '明日恢复' : `还可问 ${remaining.value} 次`
})

const followupHeading = computed(() =>
  remoteFollowups.value?.length
    ? '可以继续追问'
    : (followupBank.value?.heading || '可以继续追问'),
)

const followupLead = computed(() =>
  remoteFollowups.value?.length
    ? '根据刚才的回答，可以试试下面这些问题。'
    : (followupBank.value?.lead || ''),
)

const composerPlaceholder = computed(() =>
  quotaUsedUp.value ? '今日问答已用完' : '继续追问',
)

const historyHasMore = computed(() => chatStore.getHasMore(activeId.value))
const historyLoadingOlder = computed(() =>
  loadingOlder.value || chatStore.isLoadingOlder(activeId.value),
)

let nativeScrollEl: HTMLElement | null = null

onMounted(() => {
  // #ifdef H5
  bindNativeScroll()
  // #endif
})

onBeforeUnmount(() => {
  // #ifdef H5
  unbindNativeScroll()
  // #endif
})

function bindNativeScroll() {
  if (typeof document === 'undefined')
    return
  unbindNativeScroll()
  nativeScrollEl = document.getElementById('chat-scroll-root')
  nativeScrollEl?.addEventListener('scroll', onNativeScroll, { passive: true })
}

function unbindNativeScroll() {
  nativeScrollEl?.removeEventListener('scroll', onNativeScroll)
  nativeScrollEl = null
}

function onNativeScroll(ev: Event) {
  const el = ev.target as HTMLElement | null
  if (!el || el.scrollTop > 72)
    return
  void loadOlderMessages()
}

function onScrollToUpper() {
  void loadOlderMessages()
}

async function loadOlderMessages() {
  const id = activeId.value
  if (!id || !chatStore.getHasMore(id) || chatStore.isLoadingOlder(id) || loadingOlder.value)
    return

  const anchorId = messages.value[0]?.id || ''
  loadingOlder.value = true
  try {
    const { appended } = await chatStore.loadOlderHistory(id)
    if (appended > 0 && anchorId) {
      await nextTick()
      // #ifdef H5
      if (typeof document !== 'undefined') {
        const root = document.getElementById('chat-scroll-root')
        const el = document.getElementById(`msg-${anchorId}`)
        if (root && el) {
          const rootRect = root.getBoundingClientRect()
          const elRect = el.getBoundingClientRect()
          root.scrollTop += elRect.top - rootRect.top
        }
      }
      // #endif
    }
  }
  catch (e) {
    console.error('加载更早对话失败', e)
    uni.showToast({ title: '加载更早对话失败', icon: 'none' })
  }
  finally {
    loadingOlder.value = false
  }
}

onLoad(() => {
  void bootstrapChat()
})

onShow(() => {
  chatStore.ensureQuotaDay()
  if (bootstrapped.value) {
    void refreshCreditsQuiet()
    consumePendingQuestion()
  }
})

onUnload(() => {
  abortController.value?.abort()
  abortController.value = null
  clearActiveTypewriter.value?.()
  clearActiveTypewriter.value = null
})

watch(activeId, (id) => {
  if (!id || !bootstrapped.value)
    return
  void loadHistoryForProfile(id)
})

async function loadHistoryForProfile(profileId: string) {
  const id = String(profileId || '').trim()
  if (!id)
    return
  historyLoading.value = true
  try {
    const { messages } = await chatStore.loadRemoteHistory(id)
    if (messages.length === 0)
      chatStore.ensureIntro(id, profileName.value)
    else
      scrollToLatestAssistant()
  }
  catch (e) {
    console.error('加载对话历史失败', e)
    chatStore.clearMessages(id)
    uni.showToast({ title: '对话历史加载失败', icon: 'none' })
  }
  finally {
    historyLoading.value = false
  }
}

async function refreshCreditsQuiet() {
  try {
    await store.ensureCreditsLoaded(true)
    if (store.chatCreditsFromServer)
      chatStore.syncLocalRemaining(store.chatRemaining)
  }
  catch {
    // ignore
  }
}

/** 发送前强制拉权益；失败则拒绝发送 */
async function precheckChatQuota(): Promise<'ok' | 'empty' | 'fail'> {
  const ok = await store.ensureCreditsLoaded(true)
  if (!ok) {
    if (CHAT_CREDITS_LOCAL_FALLBACK) {
      chatStore.ensureQuotaDay()
      return chatStore.localRemaining > 0 ? 'ok' : 'empty'
    }
    return 'fail'
  }

  if (!store.chatCreditsFromServer) {
    if (!CHAT_CREDITS_LOCAL_FALLBACK)
      return 'fail'
    chatStore.ensureQuotaDay()
    return chatStore.localRemaining > 0 ? 'ok' : 'empty'
  }

  if (store.chatUnlimited)
    return 'ok'
  if (store.chatRemaining > 0) {
    chatStore.syncLocalRemaining(store.chatRemaining)
    return 'ok'
  }
  return 'empty'
}

async function bootstrapChat() {
  chatStore.ensureQuotaDay()
  if (!store.isLoggedIn) {
    uni.redirectTo({ url: RouterPaths.home })
    return
  }
  if (store.profiles.length === 0)
    await store.ensureProfilesLoaded()
  if (store.profiles.length === 0) {
    uni.redirectTo({ url: RouterPaths.home })
    return
  }
  if (!store.activeProfileId || !store.profiles.some(p => p.id === store.activeProfileId))
    store.setActiveProfile(store.profiles[0].id)

  await refreshCreditsQuiet()
  await loadHistoryForProfile(store.activeProfileId)
  bootstrapped.value = true
  // #ifdef H5
  nextTick(() => bindNativeScroll())
  // #endif
  consumePendingQuestion()
}

function consumePendingQuestion() {
  let pending = ''
  try {
    pending = String(uni.getStorageSync(CHAT_PENDING_QUESTION_KEY) || '').trim()
    if (pending)
      uni.removeStorageSync(CHAT_PENDING_QUESTION_KEY)
  }
  catch {
    // ignore
  }
  if (pending)
    void askQuestion(pending)
}

function onBack() {
  setSkipAutoEnterChat(true)
  navigateBackOrHome()
}

function onMine() {
  uni.navigateTo({ url: RouterPaths.mine })
}

function onSelectProfile(id: string) {
  if (id === store.activeProfileId)
    return
  abortController.value?.abort()
  abortController.value = null
  clearActiveTypewriter.value?.()
  clearActiveTypewriter.value = null
  store.setActiveProfile(id)
}

function onAdd() {
  showBazi.value = true
}

function onInvite() {
  showInvite.value = true
}

function onInvitePreview() {
  showInvite.value = false
  uni.navigateTo({ url: RouterPaths.inviteAccept })
}

function onBuy() {
  showLimit.value = false
  uni.navigateTo({ url: RouterPaths.credits })
}

function onGenerateReport() {
  store.navigateToReportConfirm(activeId.value || undefined)
}

function onRefreshFollowup() {
  if (remoteFollowups.value?.length) {
    remoteFollowups.value = null
    lastStreamMessageId.value = ''
  }
  chatStore.nextFollowupBatch()
}

async function loadSuggestedFollowups(messageId: string) {
  const id = messageId.trim()
  if (!id)
    return
  try {
    const res = await getDifySuggested(id)
    const items = parseSuggestedPayload(unwrapBizPayload(res))
    if (items.length > 0)
      remoteFollowups.value = items
  }
  catch {
    // 回退本地 FOLLOWUP_BANKS
  }
}

function onPickFollowup(question: string) {
  void askQuestion(question)
}

function onSubmitComposer() {
  const q = draft.value.trim()
  if (!q) {
    if (quotaUsedUp.value) {
      showLimit.value = true
      return
    }
    uni.showToast({ title: '请输入你的问题', icon: 'none' })
    return
  }
  void askQuestion(q)
}

async function askQuestion(question: string) {
  const q = question.trim()
  if (!q || asking.value)
    return

  const profileId = activeId.value
  if (!profileId) {
    uni.showToast({ title: '请先选择解读用户', icon: 'none' })
    return
  }

  if (typeof fetch !== 'function') {
    uni.showToast({ title: '当前环境不支持流式问答，请使用浏览器打开', icon: 'none' })
    return
  }

  const gate = await precheckChatQuota()
  if (gate === 'fail') {
    uni.showToast({ title: '权益校验失败，请稍后重试', icon: 'none' })
    return
  }
  if (gate === 'empty') {
    showLimit.value = true
    return
  }

  asking.value = true
  draft.value = ''
  lastStreamMessageId.value = ''
  chatStore.ensureIntro(profileId, profileName.value)
  chatStore.appendUser(profileId, q)
  const assistant = chatStore.appendAssistant(profileId, '', {
    showFeedback: false,
    streaming: true,
  })
  scrollToMessage(assistant.id)

  const controller = new AbortController()
  abortController.value = controller

  const typewriter = createStreamTypewriter({
    intervalMs: 16,
    onUpdate: (displayed) => {
      chatStore.patchMessage(profileId, assistant.id, {
        content: displayed,
        streaming: true,
      })
    },
    // 跟住 AI 气泡，不要滚到页面最底（否则追问区会把回复顶出视野）
    onScroll: () => scrollToMessage(assistant.id),
  })
  clearActiveTypewriter.value = () => typewriter.clear()

  try {
    const text = await streamChatMessage(
      {
        profileId,
        query: q,
      },
      {
        onDelta: (full) => {
          typewriter.setTarget(full)
        },
        onSession: (session) => {
          if (session.conversationId)
            chatStore.setConversationId(profileId, session.conversationId)
          if (session.messageId)
            lastStreamMessageId.value = session.messageId
        },
      },
      controller.signal,
    )

    if (controller.signal.aborted)
      throw new DOMException('Aborted', 'AbortError')

    const buffered = (text || '').trim()
    if (buffered)
      typewriter.setTarget(buffered)
    await typewriter.flush()

    if (controller.signal.aborted)
      throw new DOMException('Aborted', 'AbortError')

    const finalText = (typewriter.getDisplayed() || buffered).trim()
    if (!finalText)
      throw new Error('当前回复失败，请重试')

    chatStore.patchMessage(profileId, assistant.id, {
      content: finalText,
      streaming: false,
      showFeedback: true,
    })

    if (lastStreamMessageId.value)
      void loadSuggestedFollowups(lastStreamMessageId.value)
  }
  catch (e) {
    typewriter.clear()
    if (e instanceof DOMException && e.name === 'AbortError') {
      const kept = chatStore.getMessages(profileId).find(m => m.id === assistant.id)?.content?.trim()
      chatStore.patchMessage(profileId, assistant.id, {
        content: kept || '已停止生成',
        streaming: false,
        showFeedback: false,
      })
    }
    else if (isChatStreamQuotaError(e)) {
      chatStore.removeMessage(profileId, assistant.id)
      showLimit.value = true
      uni.showToast({ title: e.message || '今日问答已用完', icon: 'none' })
    }
    else {
      const msg = e instanceof Error ? e.message : '当前回复失败，请重试'
      chatStore.patchMessage(profileId, assistant.id, {
        content: msg || '当前回复失败，请重试',
        streaming: false,
        showFeedback: false,
      })
      uni.showToast({
        title: /暂不可用|404|502|503/.test(msg) ? msg : '当前回复失败，请重试',
        icon: 'none',
        duration: 2800,
      })
    }
  }
  finally {
    clearActiveTypewriter.value = null
    abortController.value = null
    asking.value = false
    await refreshCreditsQuiet()
    scrollToMessage(assistant.id)
  }
}

function onFeedback(payload: { messageId: string, feedback: FeedbackState }) {
  const profileId = activeId.value
  if (!profileId || !payload.feedback)
    return
  const msg = chatStore.getMessages(profileId).find(m => m.id === payload.messageId)
  if (!msg || msg.feedback)
    return

  if (payload.feedback === 'helpful') {
    chatStore.setFeedback(profileId, payload.messageId, 'helpful')
    return
  }

  feedbackMessageId.value = payload.messageId
  showFeedback.value = true
}

function onFeedbackSubmit(payload: { reason: string, note: string }) {
  const profileId = activeId.value
  if (!profileId || !feedbackMessageId.value)
    return
  chatStore.setFeedback(
    profileId,
    feedbackMessageId.value,
    'improve',
    payload.reason,
    payload.note,
  )
  showFeedback.value = false
  feedbackMessageId.value = ''
  uni.showToast({ title: '感谢反馈', icon: 'none' })
}

function scrollToMessage(messageId: string) {
  const id = String(messageId || '').trim()
  if (!id)
    return
  const anchor = `msg-${id}`
  nextTick(() => {
    // #ifdef H5
    if (typeof document !== 'undefined') {
      const root = document.getElementById('chat-scroll-root')
      const el = document.getElementById(anchor)
      if (root && el) {
        const rootRect = root.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const nextTop = root.scrollTop + (elRect.top - rootRect.top) - 16
        root.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
        return
      }
    }
    // #endif
    scrollIntoView.value = ''
    nextTick(() => {
      scrollIntoView.value = anchor
    })
  })
}

/** 滚到最近一条 AI 回复，避免滚到最底把回复顶出视口 */
function scrollToLatestAssistant() {
  const list = messages.value
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i]?.role === 'assistant') {
      scrollToMessage(list[i].id)
      return
    }
  }
  if (list.length > 0)
    scrollToMessage(list[list.length - 1].id)
}
</script>

<template>
  <view class="gx-chat-page chat-page">
    <GxChatHeader
      show-back
      @back="onBack"
      @mine="onMine"
    />

    <!-- H5：原生 overflow 滚动（uni scroll-view 在 flex 高度链下常无法滚） -->
    <!-- #ifdef H5 -->
    <view id="chat-scroll-root" class="chat-scroll chat-scroll--native">
      <GxChatThread
        :profiles="profiles"
        :active-id="activeId"
        :messages="messages"
        :user-seal="userSeal"
        :remaining="remaining"
        :progress-ratio="progressRatio"
        :chat-unlimited="chatUnlimited"
        :has-conversation="hasConversation"
        :quota-used-up="quotaUsedUp"
        :followup-heading="followupHeading"
        :followup-lead="followupLead"
        :followup-meta="followupMeta"
        :followup-items="followupItems"
        :history-has-more="historyHasMore"
        :history-loading-older="historyLoadingOlder"
        @select="onSelectProfile"
        @add="onAdd"
        @invite="onInvite"
        @feedback="onFeedback"
        @buy="onBuy"
        @refresh-followup="onRefreshFollowup"
        @pick-followup="onPickFollowup"
        @generate-report="onGenerateReport"
      />
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <scroll-view
      scroll-y
      class="chat-scroll"
      :show-scrollbar="false"
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
      enable-flex
      @scrolltoupper="onScrollToUpper"
    >
      <GxChatThread
        :profiles="profiles"
        :active-id="activeId"
        :messages="messages"
        :user-seal="userSeal"
        :remaining="remaining"
        :progress-ratio="progressRatio"
        :chat-unlimited="chatUnlimited"
        :has-conversation="hasConversation"
        :quota-used-up="quotaUsedUp"
        :followup-heading="followupHeading"
        :followup-lead="followupLead"
        :followup-meta="followupMeta"
        :followup-items="followupItems"
        :history-has-more="historyHasMore"
        :history-loading-older="historyLoadingOlder"
        @select="onSelectProfile"
        @add="onAdd"
        @invite="onInvite"
        @feedback="onFeedback"
        @buy="onBuy"
        @refresh-followup="onRefreshFollowup"
        @pick-followup="onPickFollowup"
        @generate-report="onGenerateReport"
      />
    </scroll-view>
    <!-- #endif -->

    <GxChatComposer
      v-model="draft"
      :placeholder="composerPlaceholder"
      :disabled="asking"
      @submit="onSubmitComposer"
    />

    <GxBaziProfileModal
      :show="showBazi"
      @close="showBazi = false"
    />
    <GxInviteModal
      :show="showInvite"
      @close="showInvite = false"
      @preview="onInvitePreview"
    />
    <GxChatLimitModal
      :show="showLimit"
      @close="showLimit = false"
      @buy="onBuy"
    />
    <GxChatFeedbackModal
      :show="showFeedback"
      @close="showFeedback = false"
      @submit="onFeedbackSubmit"
    />
  </view>
</template>

<style scoped lang="scss">
.chat-page {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  min-height: 0;
  overflow: hidden;
}

.chat-scroll {
  flex: 1 1 0%;
  min-height: 0;
  height: 0;
}

.chat-scroll--native {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
</style>
