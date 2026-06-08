<script setup lang="ts">
defineProps<{
  padding?: string
}>()
</script>

<template>
  <view class="gx-card" :style="padding ? { padding } : undefined">
    <slot />
  </view>
</template>

<style scoped lang="scss">
.gx-card {
  margin: 0 32rpx 24rpx;
  padding: 32rpx;
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border-radius: var(--gx-radius, 36rpx);
  border: 2rpx solid rgba(185, 148, 95, 0.34);
  box-shadow: 0 8rpx 20rpx rgba(74, 49, 21, 0.06);
  position: relative;
  overflow: hidden;
}
</style>
