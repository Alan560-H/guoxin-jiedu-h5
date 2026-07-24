<script setup lang="ts">
/**
 * 旧选方向页已下线：保留路由兼容深链 / 书签，进入后转到对话版确认页。
 */
import { onLoad } from '@dcloudio/uni-app'
import { RouterPaths } from '@/routerPaths'

onLoad(() => {
  uni.redirectTo({ url: RouterPaths.jieduReportConfirm })
})
</script>

<template>
  <view class="gx-chat-page setup-redirect" />
</template>
