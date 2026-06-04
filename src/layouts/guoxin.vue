<script setup>
import { DISCLAIMER_TEXT } from '@/constants/guoxin'
</script>

<template>
  <view class="gx-layout flex_column fill_width">
    <view class="gx-layout-body flex_1">
      <slot />
    </view>
    <view class="gx-disclaimer">
      {{ DISCLAIMER_TEXT }}
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-layout {
  min-height: 100vh;
  background: var(--gx-bg);
}

.gx-layout-body {
  min-height: 0;
}
</style>
