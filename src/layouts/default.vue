<script setup>
import {
  useTheme,
} from 'uview-pro'
import {
  reactive,
  ref,
} from 'vue'
import { isAppEmbeddedWebView } from '@/utils/appWebView'

const inAppWebView = isAppEmbeddedWebView()
const isShowBack = ref(true)
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const title = ref('国心解读 H5')
const titleDesc = '内容仅供娱乐参考，不构成专业建议。'
const background = reactive({
  backgroundColor: '#001f3f',
})
try {
  const {
    getCurrentTheme,
  } = useTheme()
  // #ifdef H5
  title.value = currentPage.$page.meta.navigationBar.titleText
  background.backgroundColor = getCurrentTheme().color.primary
  isShowBack.value = currentPage.$page.meta.route !== 'pages/index'
  // #endif
  // #ifdef APP-PLUS
  const webView = currentPage.$getAppWebview()
  title.value = webView.getStyle().name
  // #endif
}
catch (e) {
  console.error(e)
}
</script>

<template>
  <view class="layout-default flex_column fill_width">
    <u-navbar
      v-if="!inAppWebView"
      :title="title"
      :is-back="isShowBack"
      :border-bottom="false"
      :background="background"
      title-color="#fff"
      back-icon-color="#fff"
      :safe-area-inset-top="true"
    />
    <view class="layout-default-slot fill_width flex_column flex_1">
      <slot />
    </view>
    <view p-3 class="f_center flex_column layout-default-footer" style="text-align: center;">
      <u-text align="center" :text="titleDesc" />
    </view>
  </view>
</template>

<style scoped>
.layout-default {
  min-height: 100vh;
}

@supports (min-height: 100dvh) {
  .layout-default {
    min-height: 100dvh;
  }
}

.layout-default-slot {
  flex: 1 1 auto;
  min-height: 0;
}

.layout-default-footer {
  flex-shrink: 0;
}
</style>
