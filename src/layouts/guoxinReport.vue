<script setup lang="ts">
import { onMounted } from 'vue'
import { promptOpenInWeChat, shouldPromptOpenInWeChat } from '@/utils/weixin/env'

/** 报告详情：与对话版同款丙火红底，无底部免责（报告内自带 disclaimer） */
onMounted(() => {
  if (shouldPromptOpenInWeChat())
    promptOpenInWeChat()
})
</script>

<template>
  <view class="gx-report-layout gx-chat-root flex_column fill_width">
    <view class="gx-report-layout-body flex_1">
      <slot />
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-report-layout {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gx-report-layout-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
