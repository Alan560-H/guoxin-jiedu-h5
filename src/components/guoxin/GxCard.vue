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
  background: var(--gx-card);
  border-radius: var(--gx-radius);
  border: 1px solid var(--gx-border);
  box-shadow: 0 4rpx 16rpx rgba(100, 70, 20, 0.08);
}
</style>
