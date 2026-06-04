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

const steps = [
  { title: '已确认档案信息', desc: '档案与关注方向已记录' },
  { title: '已完成关注方向整理', desc: '重点方向已归纳' },
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
  const record = store.completeJiedu()
  if (!record)
    return
  completed.value = true
  uni.redirectTo({ url: RouterPaths.jieduComplete })
}

function startSimulation() {
  step.value = 1
  timer = setInterval(() => {
    step.value += 1
    if (step.value >= 4) {
      if (timer)
        clearInterval(timer)
      setTimeout(finishAndGoComplete, 800)
    }
  }, 2500)
}

onMounted(() => {
  store.initSeedData()
  if (!store.activeProfile || !store.selectedDirections.length) {
    uni.redirectTo({ url: RouterPaths.jieduSetup })
    return
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
  finishAndGoComplete()
}
function goRecords() {
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}
</script>

<template>
  <view class="gx-page flex_column">
    <GxNavBar title="心语老师正在为您整理" />
    <scroll-view scroll-y class="gx-scroll">
      <view style="background: linear-gradient(160deg, #2C5040, #1E3A30); padding: 48rpx 32rpx; text-align: center; color: #fff;">
        <view style="font-size: 72rpx;">
          🌿
        </view>
        <view style="font-size: calc(36rpx * var(--gx-font-scale)); font-weight: 700; margin-top: 16rpx;">
          心语老师正在深度整理
        </view>
        <view class="gx-text-sub" style="color: rgba(255,255,255,0.75); margin-top: 12rpx;">
          约 10 秒，请稍候
        </view>
      </view>

      <GxCard style="margin-top: 24rpx;">
        <view style="font-weight: 700; color: var(--gx-gold); margin-bottom: 12rpx;">
          初步预览
        </view>
        <view class="gx-text-sub" style="line-height: 1.8;">
          根据您提供的信息，心语老师已经开始整理本次专属解读。初步来看，本次内容会重点围绕阶段状态、家庭关系和生活节奏展开。
        </view>
      </GxCard>

      <view style="padding: 24rpx 32rpx;">
        <view
          v-for="(s, idx) in steps"
          :key="idx"
          class="gx-timeline-step"
        >
          <view
            class="gx-step-dot"
            :class="{
              'gx-step-done': idx + 1 < step,
              'gx-step-active': idx + 1 === step,
              'gx-step-pending': idx + 1 > step,
            }"
          >
            {{ idx + 1 < step ? '✓' : idx + 1 }}
          </view>
          <view>
            <view style="font-weight: 700; color: var(--gx-text);">
              {{ s.title }}
            </view>
            <view v-if="s.desc" class="gx-text-hint">
              {{ s.desc }}
            </view>
          </view>
        </view>
      </view>

      <view class="gx-btn-group">
        <GxButton type="secondary" @click="skipNow">
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
