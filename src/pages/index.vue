<script setup lang="ts">
import { computed } from 'vue'
import { userInfoStore } from '@/stores/userInfoStore'
import { RouterPaths } from '@/routerPaths'
import { redirectToWxOAuth } from '@/utils/weixin/oauth'
import { wxChoosePay } from '@/utils/weixin/pay'
import { isWeChatBrowser } from '@/utils/weixin/env'

defineOptions({
  layout: 'default',
  style: {
    navigationBarTitleText: '国心解读 H5',
  },
})

const store = userInfoStore()
const inWeChat = computed(() => isWeChatBrowser())
const loginStatusText = computed(() => {
  if (store.isLogin)
    return `已登录：${store.userInfo.nickName || store.userInfo.userName || store.userInfo.userId}`
  return '未登录'
})

function handleWxLogin() {
  redirectToWxOAuth()
}

async function handleTestPay() {
  try {
    await wxChoosePay({ orderId: 'test' })
  }
  catch {
    /* toast 已在 pay 模块处理 */
  }
}

function goHttpTest() {
  uni.navigateTo({ url: RouterPaths.http })
}
</script>

<template>
  <view p-3 class="flex_column gap_1rem f_center home-page">
    <view class="home-title u-font-xl">
      国心解读 H5
    </view>
    <view class="home-desc">
      基础框架 + 微信公众号 JSSDK（OAuth / 支付）
    </view>
    <view class="status-card fill_width padding_20rpx">
      <view>环境：{{ inWeChat ? '微信内置浏览器' : '非微信浏览器' }}</view>
      <view>登录状态：{{ loginStatusText }}</view>
    </view>
    <u-button type="primary" :custom-style="{ width: '100%' }" @click="handleWxLogin">
      微信授权登录
    </u-button>
    <u-button type="warning" :custom-style="{ width: '100%' }" @click="handleTestPay">
      测试支付
    </u-button>
    <u-button plain :custom-style="{ width: '100%' }" @click="goHttpTest">
      HTTP 测试页
    </u-button>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 60vh;
  text-align: center;
}

.home-title {
  font-weight: 600;
  color: #1E3F35;
}

.home-desc {
  color: #666;
  font-size: 28rpx;
}

.status-card {
  border: 1px solid #e5e5e5;
  border-radius: 12rpx;
  text-align: left;
  font-size: 28rpx;
  line-height: 1.8;
  background: #fafafa;
}
</style>
