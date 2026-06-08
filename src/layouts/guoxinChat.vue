<script setup lang="ts">
/** 对话类全屏页：无底部免责声明，避免与固定输入栏争抢高度 */
</script>

<template>
  <view class="gx-chat-layout flex_column fill_width">
    <view class="gx-chat-layout-body flex_1">
      <slot />
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-chat-layout {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.gx-chat-layout-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
