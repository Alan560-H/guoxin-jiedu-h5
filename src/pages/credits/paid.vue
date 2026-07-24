<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import { formatPlanPaidCopy, formatPlanSummary } from '@/constants/memberPlans'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { peekPendingPaidPlan } from '@/utils/guoxin/pendingPaidPlan'

const store = useGuoxinStore()

const name = ref('会员套餐')
const days = ref(0)
const reports = ref(0)

onLoad((query) => {
  const pending = peekPendingPaidPlan()
  name.value = String(query?.name || pending?.name || '会员套餐')
  days.value = Number(query?.days ?? pending?.days ?? 0) || 0
  reports.value = Number(query?.reports ?? pending?.reports ?? 0) || 0
  void store.ensureCreditsLoaded(true)
})

const summary = computed(() => formatPlanSummary({
  name: name.value,
  days: days.value,
  reports: reports.value,
}))

const copy = computed(() => formatPlanPaidCopy({
  days: days.value,
  reports: reports.value,
}))

function onBack() {
  uni.reLaunch({ url: RouterPaths.home })
}

function goChat() {
  if (store.activeProfileId)
    uni.reLaunch({ url: RouterPaths.jieduChat })
  else
    uni.reLaunch({ url: RouterPaths.home })
}

function goReportConfirm() {
  if (!store.activeProfileId) {
    uni.showToast({ title: '请先选择解读用户', icon: 'none' })
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  uni.navigateTo({ url: RouterPaths.jieduReportConfirm })
}
</script>

<template>
  <view class="gx-chat-page paid-page">
    <GxChatHeader
      title="开通成功"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="paid-scroll" :show-scrollbar="false">
      <view class="paid-inner">
        <view class="success-hero">
          <text class="eyebrow">
            支付成功
          </text>
          <text class="title">
            权益已开通
          </text>
          <text class="summary">
            {{ summary }}
          </text>
        </view>

        <view class="note-card">
          {{ copy }}
        </view>

        <view class="ledger">
          <view class="ledger-item">
            <text class="label">
              报告剩余
            </text>
            <text class="value">
              {{ store.displayCredits }} 次
            </text>
          </view>
          <view class="ledger-item">
            <text class="label">
              问答状态
            </text>
            <text class="value">
              {{ store.chatUnlimited ? '不限次' : `${store.chatRemaining} 次` }}
            </text>
          </view>
        </view>

        <view class="actions">
          <view class="btn primary" @tap="goChat">
            返回问答
          </view>
          <view class="btn secondary" @tap="goReportConfirm">
            继续生成报告
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.paid-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.paid-scroll {
  flex: 1;
  height: 0;
}

.paid-inner {
  padding: 32rpx 28rpx 48rpx;
}

.success-hero {
  padding: 48rpx 36rpx;
  border-radius: var(--gx-chat-radius);
  color: #fffdf7;
  background:
    radial-gradient(circle at 88% 14%, rgba(213, 164, 61, 0.45), transparent 32%),
    linear-gradient(150deg, var(--gx-chat-red), var(--gx-chat-red-deep));
  box-shadow: var(--gx-chat-shadow);
}

.eyebrow {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  color: rgba(255, 253, 247, 0.76);
}

.title {
  display: block;
  margin: 12rpx 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 44rpx;
  font-weight: 800;
}

.summary {
  display: block;
  font-size: 26rpx;
  line-height: 1.5;
  color: rgba(255, 253, 247, 0.9);
}

.note-card {
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: var(--gx-chat-radius-sm);
  background: var(--gx-chat-paper);
  border: 2rpx solid var(--gx-chat-border);
  font-size: 26rpx;
  line-height: 1.65;
  color: var(--gx-chat-muted);
}

.ledger {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.ledger-item {
  flex: 1;
  padding: 24rpx;
  border-radius: var(--gx-chat-radius-sm);
  background: var(--gx-chat-paper-warm);
  border: 2rpx solid var(--gx-chat-border);
}

.label {
  display: block;
  font-size: 22rpx;
  color: var(--gx-chat-hint);
}

.value {
  display: block;
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.actions {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn {
  padding: 28rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 800;

  &.primary {
    background: linear-gradient(135deg, var(--gx-chat-red), var(--gx-chat-red-deep));
    color: #fffdf7;
  }

  &.secondary {
    background: var(--gx-chat-paper);
    border: 2rpx solid var(--gx-chat-border);
    color: var(--gx-chat-brown);
  }
}
</style>
