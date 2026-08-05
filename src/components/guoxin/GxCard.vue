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
  background: linear-gradient(180deg, rgba(255, 251, 242, 0.97), rgba(249, 240, 224, 0.94)), #fff9ed;
  border-radius: var(--gx-radius, 36rpx);
  border: 2rpx solid rgba(181, 122, 35, 0.28);
  box-shadow: 0 8rpx 20rpx rgba(74, 49, 21, 0.07);
  position: relative;
  overflow: hidden;
}
</style>
