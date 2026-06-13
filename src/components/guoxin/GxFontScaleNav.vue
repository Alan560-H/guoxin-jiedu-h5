<script setup lang="ts">
import type { FontScale } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'

const store = useGuoxinStore()

const options: { value: FontScale, label: string }[] = [
  { value: 'standard', label: '小' },
  { value: 'large', label: '中' },
  { value: 'xlarge', label: '大' },
]

function pick(scale: FontScale) {
  store.setFontScale(scale)
}
</script>

<template>
  <view class="gx-font-scale-nav">
    <text
      v-for="opt in options"
      :key="opt.value"
      class="scale-item"
      :class="{ active: store.fontScale === opt.value }"
      @tap.stop="pick(opt.value)"
    >
      {{ opt.label }}
    </text>
  </view>
</template>

<style scoped lang="scss">
.gx-font-scale-nav {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.scale-item {
  min-width: 40rpx;
  padding: 6rpx 10rpx;
  font-size: 24rpx;
  color: #665b4e;
  text-align: center;
  border-radius: 8rpx;
  line-height: 1.2;

  &.active {
    color: #153f33;
    font-weight: 700;
    background: rgba(21, 63, 51, 0.1);
  }
}
</style>
