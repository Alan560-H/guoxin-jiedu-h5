<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onUnload } from '@dcloudio/uni-app'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const { t } = useI18n()
const store = useGuoxinStore()
const step = ref(1)
const completed = ref(false)
const previewText = ref('')
let abortController: AbortController | null = null
let streamRetry = 0
const MAX_STREAM_RETRY = 2

const steps = computed(() => [
  { title: t('jiedu.processing.steps.s1Title'), desc: t('jiedu.processing.steps.s1Desc') },
  { title: t('jiedu.processing.steps.s2Title'), desc: t('jiedu.processing.steps.s2Desc') },
  { title: t('jiedu.processing.steps.s3Title'), desc: t('jiedu.processing.steps.s3Desc') },
  { title: t('jiedu.processing.steps.s4Title'), desc: t('jiedu.processing.steps.s4Desc') },
])

async function startStream() {
  abortController = new AbortController()
  const recordId = await store.runJieduStream((index) => {
    step.value = index
  }, abortController.signal, (text) => {
    previewText.value += text
  })

  if (recordId) {
    completed.value = true
    uni.redirectTo({ url: RouterPaths.jieduComplete })
    return
  }
  const next = await store.recoverFromStreamFailure()
  if (next === 'complete') {
    completed.value = true
    uni.redirectTo({ url: RouterPaths.jieduComplete })
  }
  else if (next === 'stream' && streamRetry < MAX_STREAM_RETRY) {
    streamRetry += 1
    startStream()
  }
  else {
    uni.redirectTo({ url: RouterPaths.jieduSetup })
  }
}

onMounted(async () => {
  const resume = await store.resumeProcessingTask()
  if (resume === 'setup' || !resume) {
    uni.redirectTo({ url: RouterPaths.jieduSetup })
    return
  }
  if (resume === 'complete') {
    uni.redirectTo({ url: RouterPaths.jieduComplete })
    return
  }
  startStream()
})

function leaveProcessing() {
  abortController?.abort()
  if (!completed.value)
    store.clearPendingTask()
}

onUnload(() => {
  if (!completed.value) {
    leaveProcessing()
    uni.showToast({ title: t('jiedu.processing.interrupted'), icon: 'none' })
  }
})

function completeAndGoHome() {
  leaveProcessing()
  uni.reLaunch({ url: RouterPaths.home })
}

function goRecords() {
  leaveProcessing()
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar :title="t('jiedu.processing.title')" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="loading-banner">
        <view class="loading-circle" />
        <view class="banner-title">{{ t('jiedu.processing.bannerTitle') }}</view>
        <view class="banner-desc">{{ t('jiedu.processing.bannerDesc') }}</view>
      </view>

      <GxCard class="preview-card">
        <view class="gx-form-label section-label">
          {{ t('jiedu.processing.previewLabel') }}
        </view>
        <view class="preview-text">
          <text>{{ previewText || t('jiedu.processing.previewText') }}</text>
          <text class="preview-highlight">{{ t('jiedu.processing.previewHighlight') }}</text>
        </view>
      </GxCard>

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

      <view class="gx-btn-group action-buttons">
        <GxButton type="secondary" @click="completeAndGoHome">
          {{ t('jiedu.processing.later') }}
        </GxButton>
        <GxButton type="outline" @click="goRecords">
          {{ t('jiedu.processing.viewRecords') }}
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
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    font-size: 26rpx;
    color: #665B4E;
    line-height: 1.7;

    .preview-highlight {
      color: #241F19;
      font-weight: 700;
    }
  }
}

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
