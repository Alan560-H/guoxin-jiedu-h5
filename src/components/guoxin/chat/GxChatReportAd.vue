<script setup lang="ts">
import { computed } from 'vue'
import { isShowPayEnabled } from '@/utils/guoxin/showPay'

const emit = defineEmits<{
  generate: []
}>()

/** 接口 value=1 显示报告入口；value=0 隐藏 */
const visible = computed(() => isShowPayEnabled())
</script>

<template>
  <view
    v-if="visible"
    class="report-ad"
  >
    <view class="ad-mark">
      报告<br>入口
    </view>
    <view class="ad-copy">
      <text class="ad-title">
        生成完整命理解读报告
      </text>
      <text class="ad-desc">
        结合八字与问答内容系统整理，报告额度独立计算。
      </text>
    </view>
    <view class="ad-btn" @tap="emit('generate')">
      去生成
    </view>
  </view>
</template>

<style scoped lang="scss">
.report-ad {
  position: relative;
  margin: 8rpx 0 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  border: 3rpx solid rgba(201, 168, 76, 0.46);
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.96), rgba(247, 237, 207, 0.78));
  display: flex;
  align-items: center;
  gap: 16rpx;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    right: 72rpx;
    bottom: -4rpx;
    width: 180rpx;
    height: 70rpx;
    background: url("@/static/assets/gx-cloud.png") center / contain no-repeat;
    opacity: 0.58;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    z-index: 0;
    right: -8rpx;
    top: -18rpx;
    width: 58rpx;
    height: 102rpx;
    background: url("@/static/assets/gx-auspicious-charm.webp") center / contain no-repeat;
    opacity: 0.9;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

.ad-mark {
  width: 84rpx;
  min-height: 84rpx;
  padding: 10rpx 8rpx;
  border-radius: 16rpx;
  background: var(--gx-chat-red-deep, #7f1f26);
  color: #fffdf7;
  font-size: 22rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.ad-copy {
  flex: 1;
  min-width: 0;
}

.ad-title {
  display: block;
  color: var(--gx-chat-brown, #7c402a);
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.25;
}

.ad-desc {
  display: block;
  margin-top: 6rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
  line-height: 1.35;
}

.ad-btn {
  flex-shrink: 0;
  width: 120rpx;
  height: 72rpx;
  border-radius: 14rpx;
  background: var(--gx-chat-gold, #d5a43d);
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
