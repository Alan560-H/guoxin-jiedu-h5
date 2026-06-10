<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()
const step = ref(1)
let timer: ReturnType<typeof setInterval> | null = null
const completed = ref(false)
const remoteTaskId = ref<number | null>(null)
const remoteReportId = ref<number | null>(null)

const steps = [
  { title: '已确认档案信息', desc: '档案与关注方向已记录' },
  { title: '正在整理关注方向', desc: '重点方向已归纳' },
  { title: '正在生成完整解读', desc: '结合性格与阶段状态深度整理中…' },
  { title: '完成后通知您查看', desc: '' },
]

function finishAndGoComplete() {
  if (completed.value)
    return
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  // 本地模式
  if (!store.useRemoteApi) {
    const record = store.completeJiedu()
    if (!record)
      return
  }
  completed.value = true
  uni.redirectTo({ url: `${RouterPaths.jieduComplete}?reportId=${remoteReportId.value || ''}` })
}

function startSimulation() {
  step.value = 1
  timer = setInterval(() => {
    step.value += 1
    if (step.value >= 4) {
      if (timer)
        clearInterval(timer)
      // 远程模式下，等待后端任务完成
      if (store.useRemoteApi) {
        if (remoteTaskId.value)
          pollRemoteTask()
        else
          uni.showToast({ title: '报告提交失败，请重试', icon: 'none' })
      } else {
        setTimeout(finishAndGoComplete, 800)
      }
    }
  }, 2500)
}

async function pollRemoteTask() {
  if (!remoteTaskId.value) return
  const result = await store.pollTaskStatus(remoteTaskId.value, 60, 3000)
  if (result && result.status === 'success') {
    remoteReportId.value = result.reportId
    // 刷新报告列表
    await store.loadReports()
    await store.refreshAvailableCount()
    finishAndGoComplete()
  } else {
    uni.showToast({ title: '报告生成超时，请稍后查看', icon: 'none' })
    uni.redirectTo({ url: RouterPaths.jieduRecords })
  }
}

onMounted(async () => {
  store.initSeedData()
  if (!store.activeProfile || !store.selectedDirections.length) {
    uni.redirectTo({ url: RouterPaths.jieduSetup })
    return
  }
  // 远程模式：进入整理页即提交 report/generate（userId 由后端从 JWT 解析，不依赖 store.userId）
  if (store.useRemoteApi) {
    if (!store.isLoggedIn) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      uni.redirectTo({ url: RouterPaths.home })
      return
    }
    if (store.serverProducts.length === 0)
      await store.loadProducts()
    if (store.serverProducts.length === 0) {
      uni.showToast({ title: '商品加载失败，请稍后重试', icon: 'none' })
      uni.navigateBack()
      return
    }
    const productId = store.activeProductId || store.serverProducts[0].id
    const inputJson = JSON.stringify({
      profileId: store.activeProfileId,
      directions: store.selectedDirections,
      profileName: store.activeProfile?.name,
      userQuestion: store.userQuestion || undefined,
    })
    const result = await store.doGenerateReport(productId, inputJson)
    if (result?.taskId) {
      remoteTaskId.value = result.taskId
      remoteReportId.value = result.reportId ?? null
    } else {
      uni.showToast({ title: '提交失败，请重试', icon: 'none' })
      uni.navigateBack()
      return
    }
  }
  startSimulation()
})

onUnload(() => {
  if (!completed.value) {
    uni.showToast({ title: '整理已中断，可重新解读', icon: 'none' })
  }
  if (timer)
    clearInterval(timer)
})

function skipNow() {
  if (store.useRemoteApi) {
    uni.showToast({ title: '报告生成中，请稍候', icon: 'none' })
    return
  }
  finishAndGoComplete()
}
function goRecords() {
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="正在为您整理" />

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

      <!-- Action buttons -->
      <view class="gx-btn-group action-buttons">
        <GxButton v-if="!store.useRemoteApi" type="secondary" @click="skipNow">
          解读完成，立即查看
        </GxButton>
        <GxButton type="outline" @click="goRecords">
          查看解读记录
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
  line-height: 52rpx; /* Align with center of icon */
}

.step-desc {
  font-size: 24rpx;
  color: #958878;
  margin-top: 8rpx;
}

/* Timeline Active / Completed status */
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
