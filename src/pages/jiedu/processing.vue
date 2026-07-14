<script setup lang="ts">
import { onHide, onUnload } from '@dcloudio/uni-app'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
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
    uni.redirectTo({ url: RouterPaths.jieduSetup })
    return
  }
  const pending = store.takePendingGenerateTask()
  if (!pending?.taskId) {
    uni.redirectTo({ url: RouterPaths.jieduSetup })
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
  navigateToHome()
}

function goRecords() {
  deactivatePage()
  store.invalidateRemoteCache(['credits'])
  void store.ensureCreditsLoaded(true)
  navigateToProfileList(store.activeProfileId || undefined, { replace: true })
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
  <view class="gx-layout-page">
    <GxNavBar :title="t('jiedu.processing.title')" :show-back="true" back-home />

    <scroll-view scroll-y class="gx-scroll">
      <view class="loading-banner">
        <view class="banner-title">
          {{ t('jiedu.processing.bannerTitle') }}
        </view>
        <view class="banner-desc">
          {{ t('jiedu.processing.bannerDesc') }}
        </view>
      </view>

      <GxCard class="timeline-card">
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
              <view class="step-title">
                {{ s.title }}
              </view>
            </view>
          </view>
        </view>
      </GxCard>

      <GxCard class="wait-card">
        <view class="wait-title">
          {{ t('jiedu.processing.waitTitle') }}
        </view>
        <view class="wait-desc">
          {{ t('jiedu.processing.waitDesc') }}
        </view>
        <view class="gx-btn-row wait-actions">
          <GxButton type="secondary" @click="goLater">
            {{ t('jiedu.processing.later') }}
          </GxButton>
          <GxButton type="primary" @click="goRecords">
            {{ t('jiedu.processing.viewRecords') }}
          </GxButton>
        </view>
        <view class="timeout-hint">
          {{ t('jiedu.processing.timeoutHintPrefix') }}
          <text class="contact-link" @tap.stop="openContactUs">
            {{ t('jiedu.processing.contactUs') }}
          </text>
          {{ t('jiedu.processing.timeoutHintSuffix') }}
        </view>
      </GxCard>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.loading-banner {
  background: linear-gradient(160deg, #153F33, #255648);
  margin: 24rpx 32rpx 0;
  padding: 48rpx 36rpx;
  border-radius: 24rpx;
  text-align: center;
  color: #FCF5E9;
  flex-shrink: 0;
  box-sizing: border-box;
}

.banner-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.banner-desc {
  font-size: 24rpx;
  line-height: 1.65;
  opacity: 0.9;
  text-align: left;
}

.timeline-card {
  margin-top: 24rpx;
}

.wait-card {
  margin-top: 24rpx;
}

.wait-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 30rpx;
  font-weight: 700;
  color: #153F33;
  margin-bottom: 12rpx;
}

.wait-desc {
  font-size: 26rpx;
  color: #665B4E;
  line-height: 1.65;
  margin-bottom: 28rpx;
}

.wait-actions {
  margin: 0 0 20rpx;
  padding: 0;
}

.timeout-hint {
  font-size: 22rpx;
  color: #958878;
  text-align: center;
  line-height: 1.5;
}

.contact-link {
  color: #153F33;
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
    background-color: #E2DCD3;
    z-index: 1;
  }

  &:last-child::before {
    display: none;
  }

  &.completed::before,
  &.active::before {
    background-color: rgba(21, 63, 51, 0.28);
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
  background-color: #D5CDC2;
}

.timeline-step.completed .dot-core {
  background-color: #153F33;
}

.timeline-step:not(.completed):not(.active) .dot-core {
  background-color: #D5CDC2;
}

/** 缺角圆环 + 跳动：实心圆旋转不可见 */
.dot-spinner {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(21, 63, 51, 0.2);
  border-top-color: #153F33;
  border-right-color: #153F33;
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
  color: #958878;
  font-weight: 500;
  line-height: 1.45;
  padding-top: 4rpx;
}

.timeline-step.completed .step-title {
  color: #241F19;
  font-weight: 700;
}

.timeline-step.active .step-title {
  color: #153F33;
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
