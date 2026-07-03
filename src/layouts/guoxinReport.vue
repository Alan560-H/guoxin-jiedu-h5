<script setup lang="ts">
import { onMounted } from 'vue'
import { promptOpenInWeChat, shouldPromptOpenInWeChat } from '@/utils/weixin/env'

onMounted(() => {
  if (shouldPromptOpenInWeChat())
    promptOpenInWeChat()
})
</script>

<template>
  <view class="gx-layout flex_column fill_width">
    <view class="gx-layout-body flex_1">
      <slot />
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.gx-layout-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
