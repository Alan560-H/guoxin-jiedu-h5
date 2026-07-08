<script setup lang="ts">
/**
 * 轻舟发现页（?isShowBack=1）进入时，首页顶部白底「返回上一页」栏。
 */
import { SHOW_BACK_ENTRY_URL } from '@/constants/guoxin'

const props = withDefaults(defineProps<{
  backUrl?: string
}>(), {
  backUrl: SHOW_BACK_ENTRY_URL,
})

function goBack() {
  if (typeof window === 'undefined')
    return
  window.location.href = props.backUrl
}
</script>

<template>
  <view class="gx-source-back-bar" @tap="goBack">
    <text class="gx-source-back-arrow">‹</text>
    <text class="gx-source-back-label">返回上一页</text>
  </view>
</template>

<style scoped lang="scss">
.gx-source-back-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-left: 24rpx;
  padding-right: 24rpx;
  min-height: calc(88rpx + env(safe-area-inset-top));
  box-sizing: border-box;
  background: #fff;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.gx-source-back-arrow {
  font-size: 40rpx;
  line-height: 1;
  color: #333;
  margin-top: -4rpx;
}

.gx-source-back-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
