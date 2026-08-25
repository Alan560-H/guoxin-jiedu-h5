<script setup lang="ts">
import type { ChatComposerAttachment, StreamChatFile } from '@/models/guoxin/chat'
import type { FeedbackState } from '@/stores/chatSessionStore'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { stopChatMessage, streamChatMessage } from '@/api/chat'
import { getDifyQuestionBank, getDifySuggested } from '@/api/dify'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatComposer from '@/components/guoxin/chat/GxChatComposer.vue'
import GxChatFeedbackModal from '@/components/guoxin/chat/GxChatFeedbackModal.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLimitModal from '@/components/guoxin/chat/GxChatLimitModal.vue'
import GxChatLoginModal from '@/components/guoxin/chat/GxChatLoginModal.vue'
import GxChatThread from '@/components/guoxin/chat/GxChatThread.vue'
import GxInviteModal from '@/components/guoxin/chat/GxInviteModal.vue'
import {
  CHAT_CREDITS_LOCAL_FALLBACK,
  CHAT_PENDING_QUESTION_KEY,
  DAILY_QUESTION_LIMIT,
  FOLLOWUP_BANKS,
  HOME_QUESTION_BANKS,
} from '@/constants/chatHome'
import { isChatStreamQuotaError } from '@/models/guoxin/chat'
import { RouterPaths } from '@/routerPaths'
import { useChatSessionStore } from '@/stores/chatSessionStore'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { clearChatMarkdownCache } from '@/utils/guoxin/chat'
import { openCustomerServiceLink } from '@/utils/guoxin/customerService'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { isUnlimitedChatRemaining } from '@/utils/guoxin/parseCredits'
import {
  parseQuestionBankPayload,
  parseSuggestedPayload,
  pickRandomQuestions,
  unwrapBizPayload,
} from '@/utils/guoxin/parseDifyLists'
import { buildShowBackEntryUrl, captureProjectCodeFromUrl } from '@/utils/guoxin/projectCode'
import { isShowPayEnabled } from '@/utils/guoxin/showPay'
import { isShowBackEntry } from '@/utils/guoxin/sourceEntry'
import { createStreamTypewriter } from '@/utils/guoxin/streamTypewriter'

const store = useGuoxinStore()
const chatStore = useChatSessionStore()

const draft = ref('')
const asking = ref(false)
const pendingAttachment = ref<ChatComposerAttachment | null>(null)
const composerRef = ref<{ resetAttachment?: () => void } | null>(null)
const historyLoading = ref(false)
const loadingOlder = ref(false)
const headerScrolled = ref(false)
const showLogin = ref(false)
const showBazi = ref(false)
const showInvite = ref(false)
const showLimit = ref(false)
const showFeedback = ref(false)
const feedbackMessageId = ref('')
const scrollIntoView = ref('')
const bootstrapped = ref(false)
/** 登录成功后打开邀请弹窗 */
const pendingInvite = ref(false)
const abortController = ref<AbortController | null>(null)
const clearActiveTypewriter = ref<(() => void) | null>(null)
const activeStreamTaskId = ref('')
const activeStreamQuestion = ref('')
const stopRequested = ref(false)
let stopApiRequestedTaskId = ''
const lastStreamMessageId = ref('')
const remoteFollowups = ref<Array<{ question: string, tip: string }> | null>(null)
/** 无历史时：question/bank 随机推荐 */
const bankFollowups = ref<Array<{ question: string, tip: string }> | null>(null)
/** bank 全量扁平池（缓存，换一批时复用） */
const questionBankPool = ref<string[]>([])
/** 发送时是否贴底（非流式场景）；流式输出时强制贴底，不依赖此标记 */
const stickToBottom = ref(true)
const showSourceBackBar = ref(isShowBackEntry())
/** 顶栏「查看报告」与购买入口一致：接口 value=1 才显示 */
const showReportsEntry = computed(() => isShowPayEnabled())
/** 程序滚动中：忽略 scroll 事件，避免误改 stickToBottom */
let programmaticScroll = false

const profiles = computed(() => store.profiles)
const activeId = computed(() => store.activeProfileId)
const activeProfile = computed(() => store.activeProfile)
const profileName = computed(() => activeProfile.value?.name || '你')
const userSeal = computed(() => {
  const n = (activeProfile.value?.name || '').trim()
  return n ? n.slice(0, 1) : '我'
})

/** 可真正开聊：已登录且有当前档案 */
const canChat = computed(() =>
  store.isLoggedIn && profiles.value.length > 0 && Boolean(activeId.value),
)

const gateTitle = computed(() => {
  if (!store.isLoggedIn)
    return '登录后开始解读'
  return '先添加一位解读用户'
})

const gateDesc = computed(() => {
  if (!store.isLoggedIn)
    return '登录后可结合八字档案提问，并保留你的对话记录。'
  return '添加解读用户后，即可开始提问与追问。'
})

const gateActionText = computed(() => {
  if (!store.isLoggedIn)
    return '去登录'
  return '添加解读用户'
})

const messages = computed(() => chatStore.getMessages(activeId.value))
const hasConversation = computed(() =>
  messages.value.some(m => m.role === 'user'),
)

const chatUnlimited = computed(() =>
  store.chatUnlimited || isUnlimitedChatRemaining(store.chatRemaining),
)
const remaining = computed(() => {
  // 服务端已声明不限次时，绝不以本地日额度覆盖
  if (chatUnlimited.value)
    return isUnlimitedChatRemaining(store.chatRemaining) ? -1 : Math.max(store.chatRemaining, 1)
  if (store.chatCreditsFromServer || !CHAT_CREDITS_LOCAL_FALLBACK)
    return store.chatRemaining
  return chatStore.localRemaining
})
/**
 * 跳过前端次数拦截：
 * - questionRemaining=-1 / chatUnlimited
 * - 接口 value=0（客服入口，文案为限时不限次）
 */
const skipChatQuotaGate = computed(() =>
  chatUnlimited.value
  || isUnlimitedChatRemaining(remaining.value)
  || !isShowPayEnabled(),
)
/** 用尽态：仅「剩余正好为 0」；负数(-1)永不视为用尽 */
const quotaUsedUp = computed(() => {
  if (skipChatQuotaGate.value)
    return false
  return remaining.value === 0
})
const progressRatio = computed(() => {
  if (skipChatQuotaGate.value || remaining.value < 0)
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
  if (bankFollowups.value && bankFollowups.value.length > 0)
    return bankFollowups.value
  return (followupBank.value?.items ?? []).map(([question, tip]) => ({ question, tip }))
})

const followupMeta = computed(() => {
  if (skipChatQuotaGate.value)
    return '不限次'
  return quotaUsedUp.value ? '明日恢复' : `还可问 ${remaining.value} 次`
})

const followupHeading = computed(() => {
  if (remoteFollowups.value?.length)
    return '可以继续追问'
  if (bankFollowups.value?.length)
    return '试试这样问'
  return followupBank.value?.heading || '可以继续追问'
})

const followupLead = computed(() => {
  if (remoteFollowups.value?.length)
    return '根据刚才的回答，可以试试下面这些问题。'
  if (bankFollowups.value?.length)
    return '还没有开始聊，可以从这些问题开始。'
  return followupBank.value?.lead || ''
})

const composerPlaceholder = computed(() => {
  if (!canChat.value) {
    if (!store.isLoggedIn)
      return '登录后开始提问'
    return '添加解读用户后开始提问'
  }
  if (quotaUsedUp.value)
    return '今日问答已用完'
  return hasConversation.value ? '继续追问' : '问我想了解的问题'
})

const composerDisabled = computed(() => asking.value || !canChat.value)

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
  headerScrolled.value = Boolean(nativeScrollEl && nativeScrollEl.scrollTop > 12)
}

function unbindNativeScroll() {
  nativeScrollEl?.removeEventListener('scroll', onNativeScroll)
  nativeScrollEl = null
}

function onNativeScroll(ev: Event) {
  const el = ev.target as HTMLElement | null
  if (!el)
    return
  headerScrolled.value = el.scrollTop > 12
  // 流式输出中强制贴底，忽略用户滚动意图（下方小部件已隐藏）
  if (asking.value || programmaticScroll)
    return
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  stickToBottom.value = distance <= 140
  if (el.scrollTop > 72)
    return
  void loadOlderMessages()
}

function isNearBottom(threshold = 140): boolean {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    const root = document.getElementById('chat-scroll-root')
    if (root) {
      return root.scrollHeight - root.scrollTop - root.clientHeight <= threshold
    }
  }
  // #endif
  return stickToBottom.value
}

/**
 * 流式输出：下方小部件已隐藏，直接滚到容器最底即可看到最新字。
 */
function pinScrollToBottom() {
  const run = () => {
    // #ifdef H5
    if (typeof document !== 'undefined') {
      const root = document.getElementById('chat-scroll-root')
      if (root) {
        programmaticScroll = true
        root.scrollTop = root.scrollHeight
        requestAnimationFrame(() => {
          programmaticScroll = false
        })
        return
      }
    }
    // #endif
    scrollIntoView.value = ''
    nextTick(() => {
      scrollIntoView.value = 'chat-bottom-anchor'
    })
  }

  nextTick(() => {
    requestAnimationFrame(run)
  })
}

function onScrollToUpper() {
  void loadOlderMessages()
}

function onChatScroll(e: { detail?: { scrollTop?: number } }) {
  headerScrolled.value = Number(e.detail?.scrollTop || 0) > 12
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

onLoad((query) => {
  const q = query as Record<string, string | undefined>
  captureProjectCodeFromUrl(q)
  showSourceBackBar.value = isShowBackEntry()
  void bootstrapChat()
})

onShow(() => {
  showSourceBackBar.value = isShowBackEntry()
  chatStore.ensureQuotaDay()
  if (bootstrapped.value && canChat.value) {
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
  if (!id || !bootstrapped.value || !canChat.value)
    return
  remoteFollowups.value = null
  bankFollowups.value = null
  lastStreamMessageId.value = ''
  clearChatMarkdownCache()
  void loadHistoryForProfile(id)
})

/** 历史气泡 id 为 `${difyMessageId}-a`，suggested 需要原始 messageId */
function resolveLatestDifyMessageId(
  list: Array<{ id: string, role: string }>,
): string {
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i]
    if (!m || m.role !== 'assistant')
      continue
    const mid = String(m.id || '').trim()
    if (!mid || mid.startsWith('intro_'))
      continue
    if (mid.endsWith('-a'))
      return mid.slice(0, -2)
  }
  return ''
}

function applyBankFollowups(pool: string[], forProfileId: string) {
  if (store.activeProfileId !== forProfileId)
    return
  const list = pickRandomQuestions(pool, 3)
  questionBankPool.value = pool
  bankFollowups.value = list.map(question => ({ question, tip: '' }))
  remoteFollowups.value = null
  lastStreamMessageId.value = ''
}

/** 无聊天记录：拉 question/bank，随机 3 条 */
async function loadQuestionBankFollowups(forProfileId: string) {
  const profileId = String(forProfileId || '').trim()
  if (!profileId)
    return

  if (questionBankPool.value.length > 0) {
    applyBankFollowups(questionBankPool.value, profileId)
    return
  }

  try {
    const res = await getDifyQuestionBank()
    const banks = parseQuestionBankPayload(unwrapBizPayload(res))
    const pool = banks.flat().map(q => String(q || '').trim()).filter(Boolean)
    if (pool.length > 0) {
      applyBankFollowups(pool, profileId)
      return
    }
  }
  catch {
    // 回退本地 HOME_QUESTION_BANKS
  }
  applyBankFollowups(HOME_QUESTION_BANKS.flat(), profileId)
}

async function loadHistoryForProfile(profileId: string) {
  const id = String(profileId || '').trim()
  if (!id)
    return
  historyLoading.value = true
  remoteFollowups.value = null
  bankFollowups.value = null
  lastStreamMessageId.value = ''
  const introName = store.profiles.find(p => p.id === id)?.name || '你'
  try {
    const { messages } = await chatStore.loadRemoteHistory(id)
    if (id !== store.activeProfileId)
      return
    if (messages.length === 0) {
      chatStore.ensureIntro(id, introName)
      void loadQuestionBankFollowups(id)
      return
    }
    scrollToLatestAssistant()
    const difyMsgId = resolveLatestDifyMessageId(messages)
    if (!difyMsgId)
      return
    lastStreamMessageId.value = difyMsgId
    void loadSuggestedFollowups(difyMsgId, id)
  }
  catch (e) {
    if (id !== store.activeProfileId)
      return
    console.error('加载对话历史失败', e)
    chatStore.clearMessages(id)
    uni.showToast({ title: '对话历史加载失败', icon: 'none' })
  }
  finally {
    if (id === store.activeProfileId)
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
  // 先拉最新权益，再判断 -1（避免用过期的 remaining=0 误拦）
  const ok = await store.ensureCreditsLoaded(true)
  if (skipChatQuotaGate.value)
    return 'ok'

  if (!ok) {
    if (CHAT_CREDITS_LOCAL_FALLBACK) {
      chatStore.ensureQuotaDay()
      return (isUnlimitedChatRemaining(chatStore.localRemaining) || chatStore.localRemaining > 0)
        ? 'ok'
        : 'empty'
    }
    return 'fail'
  }

  if (!store.chatCreditsFromServer) {
    if (!CHAT_CREDITS_LOCAL_FALLBACK)
      return 'fail'
    chatStore.ensureQuotaDay()
    return (isUnlimitedChatRemaining(chatStore.localRemaining) || chatStore.localRemaining > 0)
      ? 'ok'
      : 'empty'
  }

  if (store.chatUnlimited || isUnlimitedChatRemaining(store.chatRemaining))
    return 'ok'
  if (store.chatRemaining > 0) {
    chatStore.syncLocalRemaining(store.chatRemaining)
    return 'ok'
  }
  return 'empty'
}

async function bootstrapChat() {
  chatStore.ensureQuotaDay()
  bootstrapped.value = true

  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }

  await continueAfterAuth()
}

/** 登录或建档通过后：拉档案、权益与历史 */
async function continueAfterAuth() {
  if (!store.isLoggedIn)
    return

  if (store.profiles.length === 0)
    await store.ensureProfilesLoaded()

  if (store.profiles.length === 0) {
    showBazi.value = true
    return
  }

  if (!store.activeProfileId || !store.profiles.some(p => p.id === store.activeProfileId))
    store.setActiveProfile(store.profiles[0].id)

  await refreshCreditsQuiet()
  await loadHistoryForProfile(store.activeProfileId)
  // #ifdef H5
  nextTick(() => bindNativeScroll())
  // #endif
  consumePendingQuestion()
}

async function afterLoginSuccess() {
  showLogin.value = false
  await store.bootstrapAfterLogin()
  if (store.profiles.length > 0 && !store.activeProfileId)
    store.setActiveProfile(store.profiles[0].id)
  await continueAfterAuth()
  if (pendingInvite.value) {
    pendingInvite.value = false
    showInvite.value = true
  }
}

function onBaziSuccess() {
  showBazi.value = false
  void continueAfterAuth()
}

function onGateAction() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  showBazi.value = true
}

/** 首页带入的问题只预填输入框，绝不自动 streamChat；须用户主动点发送 */
function consumePendingQuestion() {
  if (!canChat.value)
    return
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
    draft.value = pending
}

function onSourceBack() {
  if (typeof window === 'undefined')
    return
  window.location.href = buildShowBackEntryUrl()
}

function onBack() {
  navigateBackOrHome()
}

function onMine() {
  uni.navigateTo({ url: RouterPaths.mine })
}

/** 快捷进「我的」报告列表 */
function onViewReports() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  uni.navigateTo({ url: RouterPaths.mine })
}

function onSelectProfile(id: string) {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  if (id === store.activeProfileId)
    return
  abortController.value?.abort()
  abortController.value = null
  clearActiveTypewriter.value?.()
  clearActiveTypewriter.value = null
  remoteFollowups.value = null
  lastStreamMessageId.value = ''
  store.setActiveProfile(id)
}

function onAdd() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  showBazi.value = true
}

function onInvite() {
  if (!store.isLoggedIn) {
    pendingInvite.value = true
    showLogin.value = true
    return
  }
  showInvite.value = true
}

function onInvitePreview() {
  showInvite.value = false
  uni.navigateTo({ url: RouterPaths.inviteAccept })
}

async function onBuy() {
  showLimit.value = false
  await openCustomerServiceLink()
}

function onGenerateReport() {
  store.navigateToReportConfirm(activeId.value || undefined)
}

function onRefreshFollowup() {
  if (!hasConversation.value) {
    const pool = questionBankPool.value.length > 0
      ? questionBankPool.value
      : HOME_QUESTION_BANKS.flat()
    applyBankFollowups(pool, activeId.value)
    return
  }
  if (lastStreamMessageId.value) {
    void loadSuggestedFollowups(lastStreamMessageId.value, activeId.value)
    return
  }
  remoteFollowups.value = null
  bankFollowups.value = null
  chatStore.nextFollowupBatch()
}

async function loadSuggestedFollowups(messageId: string, forProfileId: string) {
  const id = messageId.trim()
  const profileId = String(forProfileId || '').trim()
  if (!id || !profileId)
    return
  try {
    const res = await getDifySuggested(id)
    const items = parseSuggestedPayload(unwrapBizPayload(res))
    if (
      items.length > 0
      && store.activeProfileId === profileId
      && lastStreamMessageId.value === id
    ) {
      remoteFollowups.value = items
      bankFollowups.value = null
    }
  }
  catch {
    // 回退本地 FOLLOWUP_BANKS
  }
}

function onPickFollowup(question: string) {
  const q = String(question || '').trim()
  if (!q || asking.value)
    return
  draft.value = q
}

function onComposerAttachment(payload: ChatComposerAttachment | null) {
  pendingAttachment.value = payload
}

function onSubmitComposer() {
  if (!canChat.value) {
    onGateAction()
    return
  }
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

function requestServerStop(taskId: string, profileId: string) {
  const id = String(taskId || '').trim()
  if (!id || stopApiRequestedTaskId === id)
    return
  stopApiRequestedTaskId = id
  void stopChatMessage(id, profileId).catch((e) => {
    console.error('停止服务端响应失败', e)
    uni.showToast({ title: '已停止接收，服务端停止失败', icon: 'none' })
  })
}

/** 点击停止：先回填问题并立即中断前端流，再通知服务端终止 Dify 任务。 */
function onStopResponse() {
  if (!asking.value || stopRequested.value)
    return

  stopRequested.value = true
  const question = activeStreamQuestion.value.trim()
  if (question)
    draft.value = question

  const profileId = activeId.value
  if (profileId && activeStreamTaskId.value)
    requestServerStop(activeStreamTaskId.value, profileId)

  clearActiveTypewriter.value?.()
  clearActiveTypewriter.value = null
  abortController.value?.abort()
}

async function askQuestion(question: string, options?: { files?: StreamChatFile[], imageUrl?: string }) {
  const q = question.trim()
  if (!q || asking.value)
    return

  if (!canChat.value) {
    onGateAction()
    return
  }

  const profileId = activeId.value
  if (!profileId) {
    uni.showToast({ title: '请先选择解读用户', icon: 'none' })
    return
  }

  const profile = store.profiles.find(p => p.id === profileId) ?? store.activeProfile
  if (!profile) {
    uni.showToast({ title: '请先选择解读用户', icon: 'none' })
    return
  }
  let userinput_bazi = store.getStreamChatBazi(profileId)
  if (!userinput_bazi && !Number.isNaN(Number(profileId))) {
    await store.loadProfileDetail(Number(profileId))
    userinput_bazi = store.getStreamChatBazi(profileId)
  }
  if (!userinput_bazi) {
    uni.showToast({ title: '档案信息缺失，请稍后重试', icon: 'none' })
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

  const attach = pendingAttachment.value
  const files = options?.files
    ?? (attach?.file ? [attach.file] : undefined)
  const imageUrl = options?.imageUrl
    ?? attach?.localPath
    ?? ''

  asking.value = true
  activeStreamQuestion.value = q
  activeStreamTaskId.value = ''
  stopRequested.value = false
  stopApiRequestedTaskId = ''
  draft.value = ''
  pendingAttachment.value = null
  composerRef.value?.resetAttachment?.()
  lastStreamMessageId.value = ''
  bankFollowups.value = null
  remoteFollowups.value = null
  stickToBottom.value = isNearBottom(160)
  chatStore.ensureIntro(profileId, profileName.value)
  const userMsg = chatStore.appendUser(profileId, q, imageUrl ? { imageUrl } : undefined)
  const assistant = chatStore.appendAssistant(profileId, '', {
    showFeedback: false,
    streaming: true,
  })
  // loading 阶段不强制拉到底部，避免屏幕闪一下；仅在贴底时轻跟用户气泡
  if (stickToBottom.value)
    scrollToMessage(userMsg.id)

  const controller = new AbortController()
  abortController.value = controller

  // SSE 累计全文（已 repair）作 target；本地打字机追上，整包到达时仍有逐字感
  // 展示层 displayMarkdownPrep 会软闭合半截 **，减轻切开闪烁；流式光标仍显示
  const typewriter = createStreamTypewriter({
    intervalMs: 50,
    charsPerTick: 1,
    onUpdate: (displayed) => {
      chatStore.patchMessage(profileId, assistant.id, {
        content: displayed,
        streaming: true,
      })
      pinScrollToBottom()
    },
  })
  clearActiveTypewriter.value = () => typewriter.clear()
  // 隐藏下方小部件后立刻贴底一次
  pinScrollToBottom()

  try {
    const conversationId = chatStore.getConversationId(profileId)
    const text = await streamChatMessage(
      {
        profileId,
        query: q,
        userinput_bazi,
        ...(conversationId ? { conversationId } : {}),
        ...(files?.length ? { files } : {}),
      },
      {
        onDelta: (full) => {
          typewriter.setTarget(full)
        },
        onSession: (session) => {
          if (session.taskId) {
            activeStreamTaskId.value = session.taskId
            if (stopRequested.value)
              requestServerStop(session.taskId, profileId)
          }
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

    clearChatMarkdownCache(assistant.id)
    chatStore.patchMessage(profileId, assistant.id, {
      content: finalText,
      streaming: false,
      showFeedback: true,
    })

    if (lastStreamMessageId.value)
      void loadSuggestedFollowups(lastStreamMessageId.value, profileId)
  }
  catch (e) {
    typewriter.clear()
    if (e instanceof DOMException && e.name === 'AbortError') {
      // 用户 abort 与超时共用 AbortError：仅用户信号 aborted 时视为「已停止」
      if (controller.signal.aborted) {
        const kept = chatStore.getMessages(profileId).find(m => m.id === assistant.id)?.content?.trim()
        if (kept) {
          chatStore.patchMessage(profileId, assistant.id, {
            content: kept,
            streaming: false,
            showFeedback: false,
          })
        }
        else {
          chatStore.removeMessage(profileId, assistant.id)
        }
      }
      else {
        chatStore.patchMessage(profileId, assistant.id, {
          content: '回复超时，请重试',
          streaming: false,
          showFeedback: false,
        })
        uni.showToast({ title: '回复超时，请重试', icon: 'none' })
      }
    }
    else if (isChatStreamQuotaError(e)) {
      chatStore.removeMessage(profileId, assistant.id)
      if (skipChatQuotaGate.value) {
        uni.showToast({ title: e.message || '问答暂时不可用，请稍后重试', icon: 'none' })
      }
      else {
        showLimit.value = true
        uni.showToast({ title: e.message || '今日问答已用完', icon: 'none' })
      }
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
    activeStreamTaskId.value = ''
    activeStreamQuestion.value = ''
    stopRequested.value = false
    stopApiRequestedTaskId = ''
    asking.value = false
    await refreshCreditsQuiet()
    // 小部件在消息下方重新出现；不要 pin 到底部，否则会把刚打完的回复顶出视口
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
      immersive
      :scrolled="headerScrolled"
      show-back
      back-label="返回上一页"
      :show-source-back="showSourceBackBar"
      :show-reports="showReportsEntry"
      @back="onBack"
      @source-back="onSourceBack"
      @mine="onMine"
      @reports="onViewReports"
    />

    <view v-if="!canChat" class="chat-gate">
      <view class="gate-hero" aria-hidden="true" />
      <view class="gate-card">
        <text class="gate-title">
          {{ gateTitle }}
        </text>
        <text class="gate-desc">
          {{ gateDesc }}
        </text>
        <view class="gate-btn" @tap="onGateAction">
          {{ gateActionText }}
        </view>
      </view>
    </view>

    <template v-else>
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
          :quota-used-up="quotaUsedUp"
          :followup-heading="followupHeading"
          :followup-lead="followupLead"
          :followup-meta="followupMeta"
          :followup-items="followupItems"
          :history-has-more="historyHasMore"
          :history-loading-older="historyLoadingOlder"
          :streaming-output="asking"
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
        @scroll="onChatScroll"
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
          :quota-used-up="quotaUsedUp"
          :followup-heading="followupHeading"
          :followup-lead="followupLead"
          :followup-meta="followupMeta"
          :followup-items="followupItems"
          :history-has-more="historyHasMore"
          :history-loading-older="historyLoadingOlder"
          :streaming-output="asking"
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
    </template>

    <GxChatComposer
      ref="composerRef"
      v-model="draft"
      :allow-attach="canChat"
      :placeholder="composerPlaceholder"
      :disabled="composerDisabled"
      :streaming="asking"
      @attachment="onComposerAttachment"
      @stop="onStopResponse"
      @submit="onSubmitComposer"
    />

    <GxChatLoginModal
      :show="showLogin"
      @close="showLogin = false"
      @success="afterLoginSuccess"
    />
    <GxBaziProfileModal
      :show="showBazi"
      @close="showBazi = false"
      @success="onBaziSuccess"
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
  position: relative;
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

.chat-gate {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 0;
  box-sizing: border-box;
  background: var(--gx-chat-bg, #f4eddd);
}

.gate-hero {
  flex: 1 1 0%;
  min-height: 360rpx;
  width: 100%;
  background:
    linear-gradient(180deg, rgba(244, 237, 221, 0) 62%, var(--gx-chat-bg, #f4eddd) 100%),
    url("@/static/assets/gx-sage-hero.webp") center top / 100% auto no-repeat;
}

.gate-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  width: auto;
  margin: -48rpx 40rpx 28rpx;
  padding: 40rpx 36rpx 36rpx;
  box-sizing: border-box;
  border: 2rpx solid rgba(181, 122, 35, 0.28);
  border-radius: 30rpx;
  background: rgba(255, 250, 239, 0.96);
  box-shadow: 0 10rpx 28rpx rgba(80, 57, 29, 0.08);
  position: relative;
  z-index: 1;
}

.gate-title {
  color: #211b16;
  font-size: 36rpx;
  font-weight: 800;
  text-align: center;
  line-height: 1.35;
}

.gate-desc {
  color: #544a41;
  font-size: 26rpx;
  line-height: 1.55;
  text-align: center;
}

.gate-btn {
  margin-top: 4rpx;
  min-height: 72rpx;
  padding: 0 48rpx;
  border-radius: 999rpx;
  background: var(--gx-chat-red, #b43a3d);
  color: #fffdf7;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
