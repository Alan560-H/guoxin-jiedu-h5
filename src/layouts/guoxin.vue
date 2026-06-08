<script setup lang="ts">
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
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--gx-bg);
}

.gx-layout-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
