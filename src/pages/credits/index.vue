<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { CREDIT_PACKAGES, CREDITS_PAYWALL_TEXT } from '@/constants/guoxin'
import type { CreditPackageId } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxLoginModal from '@/components/guoxin/GxLoginModal.vue'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { isWeChatBrowser } from '@/utils/weixin/env'
import { GUOXIN_OAUTH_STATE, redirectToWxOAuth } from '@/utils/weixin/oauth'

const store = useGuoxinStore()
const selectedId = ref<CreditPackageId>('standard')
const selectedProductId = ref<number | null>(null)
const purchasing = ref(false)
const showLogin = ref(false)

const displayProducts = computed(() => {
  if (store.useRemoteApi && store.serverProducts.length > 0) {
    return store.serverProducts.map((p: any) => ({
      id: String(p.id),
      productId: p.id,
      name: p.productName,
      amount: p.generateCount,
      price: p.salePrice,
      originPrice: p.originalPrice,
      desc: p.promotionText || `包含 ${p.generateCount} 次解读`,
      hot: p.promotionStatus === 1,
    }))
  }
  return CREDIT_PACKAGES.map(p => ({ ...p, productId: null }))
})

onMounted(async () => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  if (store.useRemoteApi) {
    await store.refreshDisplayCredits()
    await Promise.all([
      store.loadOrders(),
      store.loadConsumeRecords(),
    ])
  }
})

onShow(() => {
  if (store.isLoggedIn && store.useRemoteApi)
    void store.refreshDisplayCredits()
})

function selectPkg(id: string, productId?: number) {
  selectedId.value = id as CreditPackageId
  selectedProductId.value = productId ?? null
  if (productId)
    store.activeProductId = productId
}

function requireWxPurchaseReady(): boolean {
  if (!isWeChatBrowser()) {
    uni.showToast({ title: '请在微信内打开', icon: 'none' })
    return false
  }
  if (!store.openId) {
    uni.showModal({
      title: '需要微信授权',
      content: '微信支付需先完成微信授权登录',
      confirmText: '去授权',
      success: (res) => {
        if (res.confirm)
          redirectToWxOAuth(GUOXIN_OAUTH_STATE)
      },
    })
    return false
  }
  if (store.needsBindMobile()) {
    showLogin.value = true
    return false
  }
  return true
}

async function purchase() {
  if (store.useRemoteApi) {
    if (!selectedProductId.value) {
      uni.showToast({ title: '请选择套餐', icon: 'none' })
      return
    }
    if (!requireWxPurchaseReady())
      return
    if (purchasing.value)
      return
    purchasing.value = true
    try {
      const ok = await store.purchaseRemoteProduct(selectedProductId.value)
      if (ok) {
        setTimeout(() => {
          uni.reLaunch({ url: RouterPaths.home })
        }, 600)
      }
    }
    finally {
      purchasing.value = false
    }
    return
  }
  const ok = await store.purchaseCredits(selectedId.value)
  if (ok) {
    setTimeout(() => {
      uni.reLaunch({ url: RouterPaths.home })
    }, 600)
  }
}

function goBack() {
  navigateBackOrHome(1)
}

async function handleLoginSuccess() {
  await store.refreshDisplayCredits()
}

function freeAdd() {
  store.addCredits(10)
  uni.showToast({ title: '已免费赠送10次', icon: 'success' })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="解读权益" :show-back="true" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="paywall-intro">
        <view class="intro-icon">🌸</view>
        <view class="intro-title">
          {{ store.hasNoCredits() ? '您的解读次数已用完' : '开通更多解读权益' }}
        </view>
        <view class="intro-subtitle">
          继续让心语老师为您整理专属生活与心理建议
        </view>
        <view v-if="store.useRemoteApi" class="intro-credits">
          当前剩余解读次数：<text class="credit-num">{{ store.displayCredits }}</text> 次
        </view>
      </view>

      <view
        v-for="pkg in displayProducts"
        :key="pkg.id"
        class="paywall-card"
        :class="{ selected: selectedId === pkg.id }"
        @tap="selectPkg(pkg.id, pkg.productId)"
      >
        <view v-if="'hot' in pkg && pkg.hot" class="recommended-badge">推荐</view>

        <view class="flex_row f_j_sb f_a_center card-header">
          <text class="package-name">{{ pkg.name }}</text>
          <view class="custom-radio" :class="{ checked: selectedId === pkg.id }">
            <view class="radio-inner" />
          </view>
        </view>

        <view class="package-desc">{{ pkg.desc }}</view>

        <view class="price-row flex_row f_j_sb f_a_end">
          <view class="price-left flex_row f_a_end">
            <text class="price-symbol">¥</text>
            <text class="price-val">{{ pkg.price }}</text>
            <text class="price-original">原价 ¥{{ pkg.originPrice }}</text>
          </view>
          <text class="package-meta">包含 {{ pkg.amount }} 次解读 · 永久有效</text>
        </view>
      </view>

      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" :disabled="purchasing" @click="purchase">
          {{ purchasing ? '支付中...' : '立即开通权益' }}
        </GxButton>
        <GxButton v-if="!store.useRemoteApi" type="secondary" @click="freeAdd">
          【测试演示】免费增加 10 次
        </GxButton>
        <GxButton type="outline" @click="goBack">
          稍后再说
        </GxButton>
      </view>

      <view class="gx-disclaimer paywall-disclaimer">
        {{ CREDITS_PAYWALL_TEXT }}<br>
        购买即代表您已同意《用户使用协议》与《隐私权政策》
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>

    <GxLoginModal
      :show="showLogin"
      mode="bindMobile"
      @close="showLogin = false"
      @success="handleLoginSuccess"
    />
  </view>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.paywall-intro {
  background: linear-gradient(160deg, #87643A, #4E3516);
  padding: 60rpx 40rpx;
  text-align: center;
  color: #FCF5E9;
  flex-shrink: 0;

  .intro-icon {
    font-size: 80rpx;
    margin-bottom: 16rpx;
  }

  .intro-title {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 38rpx;
    font-weight: 900;
  }

  .intro-subtitle {
    font-size: 26rpx;
    opacity: 0.85;
    margin-top: 12rpx;
    line-height: 1.5;
  }

  .intro-credits {
    margin-top: 20rpx;
    font-size: 28rpx;
    opacity: 0.95;

    .credit-num {
      color: #EFD9B5;
      font-weight: 900;
      font-size: 36rpx;
      margin: 0 6rpx;
    }
  }
}

.paywall-card {
  margin: 32rpx 32rpx 24rpx;
  padding: 36rpx 32rpx;
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border-radius: 24rpx;
  border: 4rpx solid #E2DCD3;
  position: relative;
  transition: all 0.25s ease;
  box-shadow: 0 4rpx 12rpx rgba(74, 49, 21, 0.04);
  box-sizing: border-box;
  overflow: hidden;

  &.selected {
    border-color: #B9945F;
    background-color: #FFFDF9;
    box-shadow: 0 8rpx 24rpx rgba(185, 148, 95, 0.15);
  }
}

.recommended-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #B9945F;
  color: #FCF5E9;
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-bottom-left-radius: 16rpx;
  font-weight: 700;
}

.card-header {
  margin-bottom: 8rpx;
}

.package-name {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 32rpx;
  font-weight: 700;
  color: #153F33;
}

.custom-radio {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  border: 4rpx solid #958878;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.2s ease;

  .radio-inner {
    width: 18rpx;
    height: 18rpx;
    border-radius: 50%;
    background-color: transparent;
    transition: all 0.2s ease;
  }

  &.checked {
    border-color: #153F33;

    .radio-inner {
      background-color: #153F33;
    }
  }
}

.package-desc {
  font-size: 24rpx;
  color: #665B4E;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.price-row {
  border-top: 2rpx solid rgba(185, 148, 95, 0.15);
  padding-top: 16rpx;
}

.price-left {
  color: #B7654A;
}

.price-symbol {
  font-size: 28rpx;
  font-weight: 700;
  margin-right: 4rpx;
  line-height: 1;
}

.price-val {
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1;
}

.price-original {
  font-size: 24rpx;
  color: #958878;
  text-decoration: line-through;
  margin-left: 12rpx;
  line-height: 1;
}

.package-meta {
  font-size: 24rpx;
  color: #665B4E;
}

.action-buttons {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}

.paywall-disclaimer {
  font-size: 22rpx;
  color: #958878;
  text-align: center;
  margin: 32rpx;
  line-height: 1.5;
}
</style>
