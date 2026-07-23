<script setup lang="ts">
import type { FeedbackState } from '@/stores/chatSessionStore'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, nextTick, ref, watch } from 'vue'
import { streamChatMessage } from '@/api/chat'
import GxAvatarSwitcher from '@/components/guoxin/chat/GxAvatarSwitcher.vue'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatComposer from '@/components/guoxin/chat/GxChatComposer.vue'
import GxChatFeedbackModal from '@/components/guoxin/chat/GxChatFeedbackModal.vue'
import GxChatFollowupPanel from '@/components/guoxin/chat/GxChatFollowupPanel.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLimitModal from '@/components/guoxin/chat/GxChatLimitModal.vue'
import GxChatMessageList from '@/components/guoxin/chat/GxChatMessageList.vue'
import GxChatQuotaCard from '@/components/guoxin/chat/GxChatQuotaCard.vue'
import GxChatReportAd from '@/components/guoxin/chat/GxChatReportAd.vue'
import GxInviteModal from '@/components/guoxin/chat/GxInviteModal.vue'
import {
  CHAT_BIZ_SOURCE,
  CHAT_CREDITS_LOCAL_FALLBACK,
  CHAT_PENDING_QUESTION_KEY,
  DAILY_QUESTION_LIMIT,
  FOLLOWUP_BANKS,
} from '@/constants/chatHome'
import { isChatStreamQuotaError } from '@/models/guoxin/chat'
import { RouterPaths } from '@/routerPaths'
import { useChatSessionStore } from '@/stores/chatSessionStore'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { createStreamTypewriter } from '@/utils/guoxin/streamTypewriter'

const store = useGuoxinStore()
const chatStore = useChatSessionStore()

const draft = ref('')
const asking = ref(false)
const showBazi = ref(false)
const showInvite = ref(false)
const showLimit = ref(false)
const showFeedback = ref(false)
const feedbackMessageId = ref('')
const scrollIntoView = ref('')
const bootstrapped = ref(false)
const abortController = ref<AbortController | null>(null)
const clearActiveTypewriter = ref<(() => void) | null>(null)

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

const followupItems = computed(() =>
  (followupBank.value?.items ?? []).map(([question, tip]) => ({ question, tip })),
)

const followupMeta = computed(() => {
  if (chatUnlimited.value)
    return '不限次'
  return quotaUsedUp.value ? '明日恢复' : `还可问 ${remaining.value} 次`
})

const composerPlaceholder = computed(() =>
  quotaUsedUp.value ? '今日问答已用完' : '继续追问',
)

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
  if (!id)
    return
  chatStore.ensureIntro(id, profileName.value)
  scrollToBottom()
})

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
    await store.loadProfiles()
  if (store.profiles.length === 0) {
    uni.redirectTo({ url: RouterPaths.home })
    return
  }
  if (!store.activeProfileId || !store.profiles.some(p => p.id === store.activeProfileId))
    store.setActiveProfile(store.profiles[0].id)

  await refreshCreditsQuiet()
  chatStore.ensureIntro(store.activeProfileId, profileName.value)
  bootstrapped.value = true
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
  navigateBackOrHome()
}

function onMine() {
  uni.showToast({ title: '「我的」下一步开放', icon: 'none' })
}

function onSelectProfile(id: string) {
  store.setActiveProfile(id)
}

function onAdd() {
  showBazi.value = true
}

function onInvite() {
  showInvite.value = true
}

function onInvitePreview() {
  uni.showToast({ title: '好友填写页下一步开放', icon: 'none' })
}

function onBuy() {
  showLimit.value = false
  uni.navigateTo({ url: RouterPaths.credits })
}

function onGenerateReport() {
  store.navigateToSetup(activeId.value || undefined)
}

function onRefreshFollowup() {
  chatStore.nextFollowupBatch()
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

function buildChatInputs(profileId: string) {
  const p = activeProfile.value
  const baziInfo = [
    p?.name,
    p?.genderText,
    p?.calendarTypeText,
    p?.birthDaySolar || p?.birthDay,
    p?.birthPlace,
  ].filter(Boolean).join(' · ')

  return {
    reportTime: 0,
    bizSource: CHAT_BIZ_SOURCE,
    baziUserId: profileId,
    baziInfo: baziInfo || profileName.value,
    relation: p?.relationText || p?.relation || '',
    profileName: profileName.value,
  }
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
  chatStore.ensureIntro(profileId, profileName.value)
  chatStore.appendUser(profileId, q)
  const assistant = chatStore.appendAssistant(profileId, '', {
    showFeedback: false,
    streaming: true,
  })
  scrollToBottom()

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
    onScroll: scrollToBottom,
  })
  clearActiveTypewriter.value = () => typewriter.clear()

  try {
    const text = await streamChatMessage(
      {
        query: q,
        conversationId: chatStore.getConversationId(profileId),
        baziUserId: profileId,
        inputs: buildChatInputs(profileId),
      },
      {
        onDelta: (full) => {
          typewriter.setTarget(full)
        },
        onSession: (session) => {
          chatStore.setConversationId(profileId, session.conversationId)
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
      uni.showToast({ title: '当前回复失败，请重试', icon: 'none' })
    }
  }
  finally {
    clearActiveTypewriter.value = null
    abortController.value = null
    asking.value = false
    await refreshCreditsQuiet()
    scrollToBottom()
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

function scrollToBottom() {
  nextTick(() => {
    scrollIntoView.value = ''
    nextTick(() => {
      scrollIntoView.value = 'chat-bottom-anchor'
    })
  })
}
</script>

<template>
  <view class="gx-chat-page chat-page">
    <GxChatHeader
      show-back
      @back="onBack"
      @mine="onMine"
    />

    <scroll-view
      scroll-y
      class="chat-scroll"
      :show-scrollbar="false"
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
    >
      <view class="chat-inner">
        <GxAvatarSwitcher
          compact
          :profiles="profiles"
          :active-id="activeId"
          @select="onSelectProfile"
          @add="onAdd"
          @invite="onInvite"
        />

        <view class="conversation-cover compact">
          <view class="cover-copy">
            <text class="cover-eyebrow">
              正在解读
            </text>
            <text class="cover-title">
              继续说下去
            </text>
            <text class="cover-desc">
              你可以沿着当前问题继续问，我会把关键点拆得更清楚。
            </text>
          </view>
          <view class="cover-token" aria-hidden="true">
            聊
          </view>
        </view>

        <GxChatMessageList
          :messages="messages"
          :user-seal="userSeal"
          @feedback="onFeedback"
        />

        <GxChatQuotaCard
          :remaining="remaining"
          :progress-ratio="progressRatio"
          :unlimited="chatUnlimited"
          @buy="onBuy"
        />

        <GxChatFollowupPanel
          v-if="hasConversation || quotaUsedUp"
          :heading="followupBank.heading"
          :lead="followupBank.lead"
          :meta="followupMeta"
          :items="followupItems"
          :empty="quotaUsedUp"
          @refresh="onRefreshFollowup"
          @pick="onPickFollowup"
          @buy="onBuy"
        />

        <GxChatReportAd @generate="onGenerateReport" />

        <view id="chat-bottom-anchor" class="bottom-anchor" />
      </view>
    </scroll-view>

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
  height: 100%;
}

.chat-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.chat-inner {
  padding: 20rpx 28rpx 24rpx;
  box-sizing: border-box;
}

.conversation-cover {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx 22rpx;
  border-radius: var(--gx-chat-radius, 32rpx);
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background:
    linear-gradient(135deg, rgba(255, 253, 248, 0.98), rgba(255, 241, 232, 0.92));
  box-shadow: var(--gx-chat-shadow, 0 8rpx 24rpx rgba(121, 38, 32, 0.08));
  overflow: hidden;

  &.compact {
    padding-top: 20rpx;
    padding-bottom: 18rpx;
  }
}

.cover-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.cover-eyebrow {
  color: var(--gx-chat-red, #b43a3d);
  font-size: 22rpx;
  font-weight: 700;
}

.cover-title {
  color: var(--gx-chat-ink, #2b1712);
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.25;
}

.cover-desc {
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.5;
}

.cover-token {
  flex-shrink: 0;
  width: 96rpx;
  height: 128rpx;
  border-radius: 48rpx 48rpx 24rpx 24rpx;
  border: 6rpx solid var(--gx-chat-gold-soft, #fff0c7);
  background: linear-gradient(180deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 44rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(127, 31, 38, 0.28);
  align-self: center;
}

.bottom-anchor {
  height: 2rpx;
}
</style>
