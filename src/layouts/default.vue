<script setup>
import {
  useTheme,
} from 'uview-pro'
import {
  reactive,
  ref,
} from 'vue'
import { RouterPaths } from '@/routerPaths'
import { isAppEmbeddedWebView } from '@/utils/appWebView'

const inAppWebView = isAppEmbeddedWebView()
const isShowBlack = ref(true)
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const title = ref('易朴工具箱')
const titleDesc = '工具内容信息仅供娱乐，不等于专业测评，不代表价值评判，无任何现实指导意义，供娱乐参考。'
const showButtonPages = [
  RouterPaths.home,
  RouterPaths.shengPing,
]
const isIncludePage = ref(false)
isIncludePage.value = !showButtonPages.includes(currentPage.$page.meta.route)
const customStyle = reactive({
  marginTop: '20px', // 注意驼峰命名，并且值必须用引号包括，因为这是对象
  background: '#d3653d',
  color: '#fff',
  minWidth: '400rpx',
})
// 定义响应式背景数据
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

  isShowBlack.value = currentPage.$page.meta.route !== 'pages/index'
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
      :is-back="isShowBlack"
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
      <!-- <view> -->
      <u-button v-if="isIncludePage" ripple-bg-color="#909399" :custom-style="customStyle">
        <u-link href="https://wcnzvwcua4e6.feishu.cn/share/base/form/shrcnIftb3AvurRJs5i6W1Yzhbb?prefill_SC=yipu&hide_SC=1" color="#fff">
          意见反馈
        </u-link>
      </u-button>
      <!-- </view> -->
    </view>
  </view>
</template>

<style scoped>
/* 主内容区占满「导航栏 — 页脚」之间高度，短页面可把免责声明与意见反馈顶到底部 */
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
