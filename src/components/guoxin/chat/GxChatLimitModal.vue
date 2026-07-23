<script setup lang="ts">
import { DAILY_QUESTION_LIMIT } from '@/constants/chatHome'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  buy: []
}>()
</script>

<template>
  <view v-if="show" class="modal-root">
    <view class="modal-mask" @tap="emit('close')" />
    <view class="modal-card" @tap.stop>
      <view class="close-x" @tap="emit('close')">
        ×
      </view>
      <text class="eyebrow">
        今日问答已完成
      </text>
      <text class="title">
        {{ DAILY_QUESTION_LIMIT }} 次问答已用完
      </text>
      <text class="desc">
        免费用户每天可问 {{ DAILY_QUESTION_LIMIT }} 次，明日 00:00 自动恢复并可继续当前对话。报告额度不受影响。
      </text>
      <view class="btn primary" @tap="emit('buy')">
        查看不限次问答套餐
      </view>
      <view class="btn secondary" @tap="emit('close')">
        我知道了
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(43, 23, 18, 0.48);
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 620rpx;
  padding: 44rpx 36rpx 36rpx;
  border-radius: 28rpx;
  background: #fffdf8;
  box-shadow: 0 20rpx 48rpx rgba(43, 23, 18, 0.22);
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 16rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  color: var(--gx-chat-hint, #a28777);
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eyebrow {
  display: block;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 22rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.title {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16rpx;
}

.desc {
  display: block;
  color: var(--gx-chat-muted, #755d52);
  font-size: 26rpx;
  line-height: 1.55;
  margin-bottom: 32rpx;
}

.btn {
  min-height: 88rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  &.primary {
    background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
    color: #fffdf7;
  }

  &.secondary {
    background: #fff4ec;
    color: var(--gx-chat-brown, #7c402a);
    border: 2rpx solid var(--gx-chat-border, #eccdbb);
  }
}
</style>
