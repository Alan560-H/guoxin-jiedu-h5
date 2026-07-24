<script setup lang="ts">
defineProps<{
  questions: string[]
}>()

const emit = defineEmits<{
  refresh: []
  pick: [question: string]
}>()
</script>

<template>
  <view class="question-board">
    <view class="board-head">
      <text class="board-title">
        试试这样问
      </text>
      <view class="refresh-btn" @tap="emit('refresh')">
        ↻ 换一批
      </view>
    </view>
    <view class="question-grid">
      <view
        v-for="(q, i) in questions"
        :key="`${i}-${q}`"
        class="question-chip"
        :class="{ wide: i === 2 }"
        @tap="emit('pick', q)"
      >
        {{ q }}
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.question-board {
  margin-top: 8rpx;
  padding: 28rpx 24rpx;
  border-radius: var(--gx-chat-radius, 32rpx);
  background: rgba(255, 253, 248, 0.96);
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  box-shadow: var(--gx-chat-shadow, 0 8rpx 24rpx rgba(121, 38, 32, 0.08));
}

.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.board-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--gx-chat-ink, #2b1712);
}

.refresh-btn {
  min-height: 56rpx;
  padding: 0 18rpx;
  border-radius: 16rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.question-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.question-chip {
  width: calc(50% - 8rpx);
  box-sizing: border-box;
  padding: 22rpx 20rpx;
  border-radius: 20rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  border: 2rpx solid rgba(180, 58, 61, 0.16);
  color: var(--gx-chat-ink, #2b1712);
  font-size: 24rpx;
  line-height: 1.45;

  &.wide {
    width: 100%;
  }
}
</style>
