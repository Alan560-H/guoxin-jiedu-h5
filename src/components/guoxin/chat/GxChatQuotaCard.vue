<script setup lang="ts">
import { DAILY_QUESTION_LIMIT } from '@/constants/chatHome'

defineProps<{
  remaining: number
  progressRatio: number
}>()

const emit = defineEmits<{
  buy: []
}>()
</script>

<template>
  <view class="qa-status">
    <view class="qa-status-copy">
      <view>
        <text class="qa-label">
          今日问答
        </text>
        <text class="qa-remain">
          还可问
          <text class="qa-num">
            {{ remaining }}
          </text>
          次
        </text>
      </view>
      <view class="buy-btn" @tap="emit('buy')">
        购买套餐
      </view>
    </view>
    <view class="qa-meter">
      <view class="qa-meter-fill" :style="{ width: `${Math.round(progressRatio * 100)}%` }" />
    </view>
    <text class="qa-foot">
      每日可问 {{ DAILY_QUESTION_LIMIT }} 次 · 明日 00:00 恢复
    </text>
  </view>
</template>

<style scoped lang="scss">
.qa-status {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  box-shadow: 0 10rpx 24rpx rgba(127, 31, 38, 0.22);
}

.qa-status-copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.qa-label {
  display: block;
  font-size: 22rpx;
  opacity: 0.9;
}

.qa-remain {
  display: block;
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 800;
}

.qa-num {
  color: var(--gx-chat-gold, #d5a43d);
}

.buy-btn {
  flex-shrink: 0;
  min-height: 60rpx;
  padding: 0 22rpx;
  border-radius: 14rpx;
  background: var(--gx-chat-gold, #d5a43d);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 24rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
}

.qa-meter {
  margin-top: 18rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 253, 247, 0.22);
  overflow: hidden;
}

.qa-meter-fill {
  height: 100%;
  border-radius: 999rpx;
  background: var(--gx-chat-gold, #d5a43d);
}

.qa-foot {
  display: block;
  margin-top: 14rpx;
  padding-top: 14rpx;
  border-top: 2rpx solid rgba(255, 253, 247, 0.18);
  font-size: 22rpx;
  opacity: 0.88;
}
</style>
