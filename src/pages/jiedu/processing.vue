<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { onHide, onUnload } from '@dcloudio/uni-app'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import { toTaskIdNumber } from '@/utils/guoxin/reportGenerate'

const store = useGuoxinStore()
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

const steps = [
  { title: '已确认档案信息', desc: '档案与关注方向已记录' },
  { title: '正在整理关注方向', desc: '重点方向已归纳' },
  { title: '正在生成完整解读', desc: '结合性格与阶段状态深度整理中…' },
  { title: '完成后通知您查看', desc: '' },
]

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
  if (!store.useRemoteApi) {
    const record = store.completeJiedu()
    if (!record)
      return
  }
  completed.value = true
  if (store.useRemoteApi)
    store.clearJieduSession()
  uni.redirectTo({ url: `${RouterPaths.jieduComplete}?reportId=${remoteReportId.value || ''}` })
}

function handlePollFailure(msg: string) {
  if (!pageActive.value)
    return
  pollErrorMsg.value = msg
  if (animationComplete.value) {
    uni.showToast({ title: msg, icon: 'none' })
    uni.redirectTo({ url: RouterPaths.jieduRecords })
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
    pollErrorMsg.value = '报告仍在生成中，请稍后在解读记录查看'
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

async function submitGenerateRequest(): Promise<boolean> {
  if (!store.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.redirectTo({ url: RouterPaths.home })
    return false
  }
  const productId = await store.resolveActiveProductId()
  if (!productId) {
    uni.showToast({ title: '暂无法获取体验包，请前往权益页', icon: 'none' })
    return false
  }
  const inputJson = store.buildActiveReportInputJson()
  if (!inputJson) {
    uni.showToast({ title: '档案或关注方向缺失', icon: 'none' })
    return false
  }
  const result = await store.doGenerateReport(productId, inputJson)
  if (!result?.taskId) {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
    return false
  }
  remoteTaskId.value = toTaskIdNumber(result.taskId)
  const initialReportId = result.reportId != null ? Number(result.reportId) : null
  remoteReportId.value = initialReportId != null && !Number.isNaN(initialReportId) ? initialReportId : null
  return true
}

onMounted(async () => {
  store.initSeedData()
  if (!store.activeProfile || !store.selectedDirections.length) {
    uni.redirectTo({ url: RouterPaths.jieduSetup })
    return
  }
  if (store.useRemoteApi) {
    const ok = await submitGenerateRequest()
    if (!ok) {
      uni.navigateBack()
      return
    }
    void pollRemoteTask()
  }
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

function skipNow() {
  if (store.useRemoteApi) {
    goRecords()
    return
  }
  animationComplete.value = true
  pollDone.value = true
  pollSuccess.value = true
  finishAndGoComplete()
}
function goRecords() {
  deactivatePage()
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="正在为您整理" :show-back="true" />

    <scroll-view scroll-y class="gx-scroll">
      <!-- Loading Banner -->
      <view class="loading-banner">
        <view class="loading-circle"></view>
        <view class="banner-title">心语老师正在深度整理</view>
        <view class="banner-desc">我正在调阅东方传统哲学观点，结合心理学模型为您整理更完整的内容。预计需要一些时间，完成后会通知您查看完整解读。</view>
      </view>

      <!-- Preview card -->
      <GxCard class="preview-card">
        <view class="gx-form-label section-label">
          初步预览
        </view>
        <view class="preview-text">
          根据您提供的信息，心语老师已经开始整理本次专属解读。<strong>初步来看，本次内容会重点围绕您的阶段状态、家庭关系和生活节奏展开。</strong>
        </view>
      </GxCard>

      <!-- Vertical timeline checklist -->
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
            <text v-if="idx + 1 < step">✓</text>
            <text v-else>{{ idx + 1 }}</text>
          </view>
          <view class="step-content">
            <view class="step-title">
              {{ s.title }}
            </view>
            <view v-if="s.desc && (idx + 1 === step || idx + 1 < step)" class="step-desc">
              {{ s.desc }}
            </view>
          </view>
        </view>
      </view>

      <view v-if="store.useRemoteApi && animationComplete && !pollDone" class="polling-hint">
        报告仍在生成中，请稍候…
      </view>

      <!-- Action buttons -->
      <view class="gx-btn-group action-buttons">
        <GxButton v-if="!store.useRemoteApi" type="secondary" @click="skipNow">
          解读完成，立即查看
        </GxButton>
        <GxButton :type="store.useRemoteApi ? 'secondary' : 'outline'" @click="goRecords">
          {{ store.useRemoteApi ? '先去解读记录，稍后查看' : '查看解读记录' }}
        </GxButton>
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.loading-banner {
  background: linear-gradient(160deg, #153F33, #255648);
  padding: 60rpx 40rpx 48rpx;
  text-align: center;
  color: #FCF5E9;
  flex-shrink: 0;
}

.loading-circle {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  border: 8rpx solid rgba(239, 226, 202, 0.3);
  border-top-color: #B9945F;
  margin: 0 auto 24rpx auto;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.banner-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.banner-desc {
  font-size: 24rpx;
  line-height: 1.6;
  opacity: 0.85;
}

.preview-card {
  margin-top: 32rpx;

  .section-label {
    font-family: "Noto Serif SC", Georgia, serif;
    color: #153F33;
    font-size: 30rpx;
    font-weight: 700;
    border-left: 6rpx solid #B9945F;
    padding-left: 16rpx;
    line-height: 1;
    margin-bottom: 16rpx;
  }

  .preview-text {
    font-size: 26rpx;
    color: #665B4E;
    line-height: 1.7;

    strong {
      color: #241F19;
    }
  }
}

.polling-hint {
  margin: 0 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #153F33;
  font-weight: 700;
}

/* Timeline vertical checklists */
.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin: 40rpx 32rpx;
  padding-left: 16rpx;
}

.timeline-step {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 24rpx;
    top: 52rpx;
    bottom: -52rpx;
    width: 4rpx;
    background-color: #E2DCD3;
    z-index: 1;
  }

  &:last-child::before {
    display: none;
  }
}

.timeline-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background-color: #E2DCD3;
  color: #958878;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
  z-index: 5;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 28rpx;
  color: #958878;
  font-weight: 500;
  line-height: 52rpx;
}

.step-desc {
  font-size: 24rpx;
  color: #958878;
  margin-top: 8rpx;
}

.timeline-step.completed {
  .timeline-icon {
    background-color: #153F33;
    color: #FCF5E9;
  }

  .step-title {
    color: #241F19;
    font-weight: 700;
  }

  .step-desc {
    color: #665B4E;
  }
}

.timeline-step.active {
  .timeline-icon {
    background-color: #B9945F;
    color: #241F19;
    animation: pulse 1.5s infinite;
  }

  .step-title {
    color: #153F33;
    font-weight: 700;
  }

  .step-desc {
    color: #153F33;
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(185, 148, 95, 0.4); }
  70% { box-shadow: 0 0 0 16rpx rgba(185, 148, 95, 0); }
  100% { box-shadow: 0 0 0 0 rgba(185, 148, 95, 0); }
}

.action-buttons {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}
</style>
