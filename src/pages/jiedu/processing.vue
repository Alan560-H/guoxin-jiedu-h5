<script setup lang="ts">
import { onHide, onUnload } from '@dcloudio/uni-app'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import { FEEDBACK_FORM_URL } from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateToHome, navigateToProfileList } from '@/utils/guoxin/navigation'

const store = useGuoxinStore()
const { t } = useI18n()

const step = ref(1)
let timer: ReturnType<typeof setInterval> | null = null
const completed = ref(false)
const remoteTaskId = ref<number | null>(null)
const remoteReportId = ref<number | null>(null)
const animationComplete = ref(false)
const pollDone = ref(false)
const pollSuccess = ref(false)
const pollErrorMsg = ref('')
/** 页面仍在前台时继续轮询；离开整理页则取消轮询（后端任务继续，报告进列表） */
const pageActive = ref(true)

const steps = computed(() => [
  { title: t('jiedu.processing.steps.s1Title') },
  { title: t('jiedu.processing.steps.s2Title') },
  { title: t('jiedu.processing.steps.s3Title') },
  { title: t('jiedu.processing.steps.s4Title') },
])

function clearSimulationTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/** 轮询先完成时快进动画，避免空等 */
function fastForwardAnimation() {
  if (animationComplete.value)
    return
  clearSimulationTimer()
  step.value = 4
  animationComplete.value = true
}

function finishAndGoComplete() {
  if (completed.value)
    return
  clearSimulationTimer()
  completed.value = true
  store.clearJieduSession()
  uni.redirectTo({ url: `${RouterPaths.jieduComplete}?reportId=${remoteReportId.value || ''}` })
}

function handlePollFailure(msg: string) {
  if (!pageActive.value)
    return
  pollErrorMsg.value = msg
  if (animationComplete.value) {
    uni.showToast({ title: msg, icon: 'none' })
    navigateToProfileList(store.activeProfileId || undefined, { replace: true })
  }
}

/** 动画与轮询都结束后：成功进完成页，失败进记录页 */
function tryFinishWhenReady() {
  if (!pageActive.value || !animationComplete.value || !pollDone.value || completed.value)
    return
  if (pollSuccess.value)
    finishAndGoComplete()
  else
    handlePollFailure(pollErrorMsg.value || '报告生成失败，请稍后查看')
}

function deactivatePage() {
  pageActive.value = false
  clearSimulationTimer()
}

async function pollRemoteTask() {
  if (!remoteTaskId.value)
    return
  const result = await store.pollTaskStatus(
    remoteTaskId.value,
    60,
    3000,
    () => !pageActive.value,
  )
  if (!pageActive.value || result?.cancelled)
    return
  pollDone.value = true
  if (!result) {
    pollSuccess.value = false
    pollErrorMsg.value = t('jiedu.processing.pollPendingTip')
    clearSimulationTimer()
    step.value = 4
    animationComplete.value = true
    tryFinishWhenReady()
    return
  }
  if (result?.success) {
    pollSuccess.value = true
    if (result.reportId)
      remoteReportId.value = result.reportId
    store.invalidateRemoteCache(['credits'])
    await Promise.all([
      store.ensureCreditsLoaded(true),
      store.loadHomeLatestRecord(),
    ])
    fastForwardAnimation()
  }
  else {
    pollSuccess.value = false
    pollErrorMsg.value = result?.msg || result?.message || '报告生成失败，请稍后查看'
    if (result?.failed) {
      clearSimulationTimer()
      step.value = 4
      animationComplete.value = true
    }
  }
  tryFinishWhenReady()
}

function startSimulation() {
  step.value = 1
  timer = setInterval(() => {
    if (!pageActive.value) {
      clearSimulationTimer()
      return
    }
    step.value += 1
    if (step.value >= 4) {
      clearSimulationTimer()
      animationComplete.value = true
      tryFinishWhenReady()
    }
  }, 2500)
}

onMounted(async () => {
  store.initSeedData()
  if (!store.activeProfile || !store.selectedDirections.length) {
    uni.redirectTo({ url: RouterPaths.jieduReportConfirm })
    return
  }
  const pending = store.takePendingGenerateTask()
  if (!pending?.taskId) {
    uni.redirectTo({ url: RouterPaths.jieduReportConfirm })
    return
  }
  remoteTaskId.value = pending.taskId
  remoteReportId.value = pending.reportId
  void pollRemoteTask()
  startSimulation()
})

onHide(() => {
  deactivatePage()
})

onUnload(() => {
  deactivatePage()
})

onBeforeUnmount(() => {
  deactivatePage()
})

function goLater() {
  deactivatePage()
  store.invalidateRemoteCache(['credits'])
  void store.ensureCreditsLoaded(true)
  if (store.activeProfileId)
    uni.reLaunch({ url: RouterPaths.jieduChat })
  else
    navigateToHome()
}

function goRecords() {
  deactivatePage()
  store.invalidateRemoteCache(['credits'])
  void store.ensureCreditsLoaded(true)
  uni.redirectTo({ url: RouterPaths.mine })
}

function onBack() {
  goLater()
}

function onMine() {
  goRecords()
}

function openContactUs() {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.location.href = FEEDBACK_FORM_URL
    return
  }
  // #endif
  uni.showToast({ title: t('jiedu.processing.contactUs'), icon: 'none' })
}
</script>

<template>
  <view class="gx-chat-page processing-page">
    <GxChatHeader
      :title="t('jiedu.processing.title')"
      show-back
      @back="onBack"
      @mine="onMine"
    />

    <scroll-view scroll-y class="processing-scroll" :show-scrollbar="false">
      <view class="processing-inner">
        <view class="loading-banner">
          <text class="banner-title">
            {{ t('jiedu.processing.bannerTitle') }}
          </text>
          <text class="banner-desc">
            {{ t('jiedu.processing.bannerDesc') }}
          </text>
        </view>

        <view class="timeline-card">
          <view class="progress-timeline">
            <view
              v-for="(s, idx) in steps"
              :key="idx"
              class="timeline-step"
              :class="{
                completed: idx + 1 < step,
                active: idx + 1 === step,
              }"
            >
              <view class="timeline-icon">
                <view v-if="idx + 1 === step" class="dot-spinner" />
                <view v-else class="dot-core" />
              </view>
              <view class="step-content">
                <text class="step-title">
                  {{ s.title }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view class="wait-card">
          <text class="wait-title">
            {{ t('jiedu.processing.waitTitle') }}
          </text>
          <text class="wait-desc">
            {{ t('jiedu.processing.waitDesc') }}
          </text>
          <view class="wait-actions">
            <view class="btn secondary" @tap="goLater">
              {{ t('jiedu.processing.later') }}
            </view>
            <view class="btn primary" @tap="goRecords">
              我的报告
            </view>
          </view>
          <view class="timeout-hint">
            {{ t('jiedu.processing.timeoutHintPrefix') }}
            <text class="contact-link" @tap.stop="openContactUs">
              {{ t('jiedu.processing.contactUs') }}
            </text>
            {{ t('jiedu.processing.timeoutHintSuffix') }}
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.processing-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.processing-scroll {
  flex: 1;
  height: 0;
}

.processing-inner {
  padding: 24rpx 28rpx 48rpx;
}

.loading-banner {
  padding: 48rpx 36rpx;
  border-radius: var(--gx-chat-radius);
  color: #fffdf7;
  background:
    radial-gradient(circle at 88% 14%, rgba(213, 164, 61, 0.45), transparent 32%),
    linear-gradient(150deg, var(--gx-chat-red), var(--gx-chat-red-deep));
  box-shadow: var(--gx-chat-shadow);
}

.banner-title {
  display: block;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 16rpx;
}

.banner-desc {
  display: block;
  font-size: 24rpx;
  line-height: 1.65;
  opacity: 0.9;
}

.timeline-card,
.wait-card {
  margin-top: 24rpx;
  padding: 32rpx 28rpx;
  border-radius: var(--gx-chat-radius);
  background: var(--gx-chat-paper);
  border: 2rpx solid var(--gx-chat-border);
  box-shadow: var(--gx-chat-shadow);
}

.wait-title {
  display: block;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 30rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
  margin-bottom: 12rpx;
}

.wait-desc {
  display: block;
  font-size: 26rpx;
  color: var(--gx-chat-muted);
  line-height: 1.65;
  margin-bottom: 28rpx;
}

.wait-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.btn {
  padding: 24rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 800;

  &.primary {
    background: linear-gradient(135deg, var(--gx-chat-red), var(--gx-chat-red-deep));
    color: #fffdf7;
  }

  &.secondary {
    background: var(--gx-chat-paper-warm);
    border: 2rpx solid var(--gx-chat-border);
    color: var(--gx-chat-brown);
  }
}

.timeout-hint {
  font-size: 22rpx;
  color: var(--gx-chat-hint);
  text-align: center;
  line-height: 1.5;
}

.contact-link {
  color: var(--gx-chat-red);
  font-weight: 700;
  text-decoration: underline;
}

.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
  padding: 8rpx 8rpx 8rpx 4rpx;
}

.timeline-step {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 18rpx;
    top: 40rpx;
    bottom: -48rpx;
    width: 4rpx;
    background-color: var(--gx-chat-border);
    z-index: 1;
  }

  &:last-child::before {
    display: none;
  }

  &.completed::before,
  &.active::before {
    background-color: rgba(180, 58, 61, 0.28);
  }
}

.timeline-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.dot-core {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background-color: #d5cdc2;
}

.timeline-step.completed .dot-core {
  background-color: var(--gx-chat-red);
}

.dot-spinner {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(180, 58, 61, 0.2);
  border-top-color: var(--gx-chat-red);
  border-right-color: var(--gx-chat-red);
  box-sizing: border-box;
  animation: dot-spin-bounce 1.1s linear infinite;
}

.step-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.step-title {
  font-size: 28rpx;
  color: var(--gx-chat-hint);
  font-weight: 500;
  line-height: 1.45;
  padding-top: 4rpx;
}

.timeline-step.completed .step-title {
  color: var(--gx-chat-ink);
  font-weight: 700;
}

.timeline-step.active .step-title {
  color: var(--gx-chat-red);
  font-weight: 700;
}

@keyframes dot-spin-bounce {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-6rpx) rotate(90deg);
  }
  50% {
    transform: translateY(0) rotate(180deg);
  }
  75% {
    transform: translateY(-4rpx) rotate(270deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}
</style>
