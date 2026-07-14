<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCreditsIcon from '@/components/guoxin/GxCreditsIcon.vue'
import GxLoginModal from '@/components/guoxin/GxLoginModal.vue'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import {
  CREDITS_INSUFFICIENT_HINT,
  CREDITS_PACKAGE_ICON_BY_AMOUNT,
  CREDITS_PACKAGE_ICON_FALLBACK,
  CREDITS_PAY_HINT,
  CREDITS_PAYWALL_TEXT,
  CREDITS_TRUST_BADGES,
} from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { ensureH5RouterBasePath } from '@/utils/guoxin/h5RouterBase'

const store = useGuoxinStore()
const selectedId = ref('')
const selectedProductId = ref<number | null>(null)
const purchasing = ref(false)
const showLogin = ref(false)
const showCount = ref(0)
const productsReady = ref(false)

const displayProducts = computed(() => {
  const list = store.serverProducts.map((p: any, index: number) => {
    const amount = Number(p.generateCount) || 0
    const priceNum = Number(p.salePrice)
    const price = Number.isFinite(priceNum) ? priceNum : 0
    const originPrice = Number(p.originalPrice)
    const showOrigin = Number.isFinite(originPrice) && originPrice > price
    const unitPrice = amount > 0 && price >= 0
      ? (price / amount).toFixed(2)
      : null
    const promotionText = typeof p.promotionText === 'string' ? p.promotionText.trim() : ''
    const icon = CREDITS_PACKAGE_ICON_BY_AMOUNT[amount]
      ?? CREDITS_PACKAGE_ICON_FALLBACK[index % CREDITS_PACKAGE_ICON_FALLBACK.length]
    return {
      id: String(p.id),
      productId: p.id as number,
      name: p.productName as string,
      amount,
      price,
      originPrice: Number.isFinite(originPrice) ? originPrice : p.originalPrice,
      showOrigin,
      unitPrice,
      desc: promotionText,
      icon,
    }
  })

  // 「推荐」落在优惠价（salePrice）最高的套餐；并列取第一个
  let maxPrice = Number.NEGATIVE_INFINITY
  let recommendedId = ''
  for (const item of list) {
    if (item.price > maxPrice) {
      maxPrice = item.price
      recommendedId = item.id
    }
  }

  return list.map(item => ({
    ...item,
    hot: !!recommendedId && item.id === recommendedId,
  }))
})

onMounted(async () => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  await Promise.all([
    store.ensureProductsLoaded(),
    store.ensureCreditsLoaded(),
    store.ensureOrdersLoaded(),
    store.ensureConsumeRecordsLoaded(),
  ])
  productsReady.value = true
  syncDefaultProductSelection()
})

function syncDefaultProductSelection() {
  const products = displayProducts.value
  if (products.length === 0)
    return
  const matched = products.find(p => p.productId === store.activeProductId)
    ?? products.find(p => p.id === selectedId.value)
    ?? products.find(p => p.hot)
    ?? products[0]
  selectPkg(matched.id, matched.productId ?? undefined)
}

/** 首次用缓存；支付回跳再次展示时强制刷新 */
onShow(() => {
  // #ifdef H5
  if (ensureH5RouterBasePath())
    return
  // #endif
  if (!store.isLoggedIn)
    return
  // #ifdef H5
  clearPayReturnQueryIfNeeded()
  // #endif
  showCount.value++
  const force = showCount.value > 1
  void store.ensureProductsLoaded(force)
  void store.ensureCreditsLoaded(force)
  void store.ensureOrdersLoaded(force)
  if (force)
    syncDefaultProductSelection()
})

/** MWEB redirect_url 回跳时去掉 payReturn 并提示刷新 */
function clearPayReturnQueryIfNeeded() {
  if (typeof window === 'undefined')
    return
  const url = new URL(window.location.href)
  if (url.searchParams.get('payReturn') !== '1')
    return
  url.searchParams.delete('payReturn')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next)
  uni.showToast({ title: '支付处理中，请稍候', icon: 'none' })
}

function selectPkg(id: string, productId?: number) {
  selectedId.value = id
  selectedProductId.value = productId ?? null
  if (productId)
    store.activeProductId = productId
}

function requirePurchaseReady(): boolean {
  if (store.needsBindMobile()) {
    showLogin.value = true
    return false
  }
  return true
}

async function purchase() {
  const productId = selectedProductId.value ?? store.activeProductId
  if (!productId) {
    uni.showToast({ title: '请选择套餐', icon: 'none' })
    return
  }
  if (!requirePurchaseReady())
    return
  if (purchasing.value)
    return
  purchasing.value = true
  try {
    const result = await store.purchaseRemoteProduct(productId)
    if (result === true) {
      setTimeout(() => {
        uni.reLaunch({ url: RouterPaths.home })
      }, 600)
    }
    else if (result === 'mweb_redirect') {
      uni.showToast({ title: '正在跳转微信支付', icon: 'none' })
    }
  }
  finally {
    purchasing.value = false
  }
}

async function handleLoginSuccess() {
  await store.ensureCreditsLoaded(true)
}
</script>

<template>
  <view class="gx-layout-page">
    <GxNavBar title="解读权益" :show-back="true" />

    <scroll-view scroll-y class="gx-scroll">
      <!-- 次数不足：警示条；仍有次数：弱提示 -->
      <view
        class="status-banner flex_row f_a_start"
        :class="store.hasNoCredits() ? 'status-banner--warn' : 'status-banner--info'"
      >
        <view class="status-icon-wrap">
          <GxCreditsIcon name="shield-check" size="40rpx" />
        </view>
        <view class="status-copy">
          <view class="status-title">
            {{ store.hasNoCredits() ? '剩余解读次数不足' : '开通更多解读权益' }}
          </view>
          <view class="status-desc">
            {{ store.hasNoCredits() ? CREDITS_INSUFFICIENT_HINT : `当前剩余解读次数：${store.displayCredits} 次` }}
          </view>
        </view>
      </view>

      <view v-if="productsReady && displayProducts.length === 0" class="products-empty">
        <view class="empty-text">
          暂无可购买的解读套餐，请稍后再试或联系客服。
        </view>
      </view>

      <view
        v-for="pkg in displayProducts"
        :key="pkg.id"
        class="paywall-card"
        :class="{ selected: selectedId === pkg.id }"
        @tap="selectPkg(pkg.id, pkg.productId)"
      >
        <view v-if="pkg.hot" class="recommended-badge">
          推荐
        </view>

        <view class="flex_row f_j_sb f_a_center card-header">
          <view class="flex_row f_a_center card-title-row">
            <view class="pkg-icon-wrap" :class="{ 'pkg-icon-wrap--active': selectedId === pkg.id }">
              <GxCreditsIcon :name="pkg.icon" size="40rpx" />
            </view>
            <text class="package-name">
              {{ pkg.name }}
            </text>
          </view>
          <view class="custom-radio" :class="{ checked: selectedId === pkg.id }">
            <view class="radio-inner" />
          </view>
        </view>

        <view class="package-benefit">
          {{ pkg.amount }} 次解读权益
        </view>
        <view v-if="pkg.desc" class="package-desc">
          {{ pkg.desc }}
        </view>

        <view class="price-row flex_row f_j_sb f_a_end">
          <view class="price-left">
            <view class="price-main flex_row f_a_end">
              <text v-if="pkg.showOrigin" class="price-tag">
                优惠价
              </text>
              <text class="price-symbol">
                ¥
              </text>
              <text class="price-val">
                {{ pkg.price }}
              </text>
              <text v-if="pkg.showOrigin" class="price-original">
                原价 ¥{{ pkg.originPrice }}
              </text>
            </view>
          </view>
          <text v-if="pkg.unitPrice" class="package-meta">
            约 ¥{{ pkg.unitPrice }} / 次
          </text>
        </view>
      </view>

      <view class="trust-row flex_row f_j_sa">
        <view
          v-for="badge in CREDITS_TRUST_BADGES"
          :key="badge.title"
          class="trust-item"
        >
          <view class="trust-icon-wrap">
            <GxCreditsIcon :name="badge.icon" size="40rpx" />
          </view>
          <view class="trust-title">
            {{ badge.title }}
          </view>
          <view class="trust-desc">
            {{ badge.desc }}
          </view>
        </view>
      </view>

      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" :disabled="purchasing || !selectedProductId" @click="purchase">
          <view class="cta-inner flex_row f_a_center">
            <GxCreditsIcon v-if="!purchasing" name="wallet" size="36rpx" />
            <text>{{ purchasing ? '支付中...' : '开通解读权益' }}</text>
          </view>
        </GxButton>
      </view>

      <view class="gx-disclaimer paywall-disclaimer">
        {{ CREDITS_PAY_HINT }}<br>
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
.products-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80rpx 48rpx 40rpx;
  box-sizing: border-box;

  .empty-text {
    font-size: 28rpx;
    color: #665b4e;
    line-height: 1.7;
  }
}

.status-banner {
  margin: 24rpx 32rpx 8rpx;
  padding: 28rpx 28rpx;
  border-radius: 20rpx;
  box-sizing: border-box;
  gap: 20rpx;

  &--warn {
    background: rgba(183, 101, 74, 0.08);
    border: 2rpx dashed rgba(183, 101, 74, 0.55);
  }

  &--info {
    background: rgba(21, 63, 51, 0.06);
    border: 2rpx solid rgba(21, 63, 51, 0.12);
  }
}

.status-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(21, 63, 51, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #153F33;
}

.status-banner--warn .status-icon-wrap {
  background: rgba(21, 63, 51, 0.12);
  color: #153F33;
}

.status-copy {
  flex: 1;
  min-width: 0;
}

.status-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 32rpx;
  font-weight: 700;
  color: #153F33;
  margin-bottom: 10rpx;
}

.status-banner--warn .status-title {
  color: #8B4A38;
}

.status-desc {
  font-size: 24rpx;
  color: #665B4E;
  line-height: 1.55;
}

.paywall-card {
  margin: 24rpx 32rpx;
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
    border-color: #153F33;
    background-color: #FFFDF9;
    box-shadow: 0 8rpx 24rpx rgba(21, 63, 51, 0.12);
  }
}

.recommended-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #153F33;
  color: #FCF5E9;
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-bottom-left-radius: 16rpx;
  font-weight: 700;
}

.card-header {
  margin-bottom: 8rpx;
  padding-right: 72rpx;
}

.card-title-row {
  gap: 16rpx;
  min-width: 0;
  flex: 1;
}

.pkg-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(21, 63, 51, 0.08);
  color: #153F33;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pkg-icon-wrap--active {
  background: #153F33;
  color: #FCF5E9;
}

.package-name {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 30rpx;
  font-weight: 700;
  color: #153F33;
  line-height: 1.3;
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
  flex-shrink: 0;

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

.package-benefit {
  font-size: 26rpx;
  font-weight: 600;
  color: #153F33;
  margin-bottom: 20rpx;
}

.package-desc {
  font-size: 24rpx;
  color: #665B4E;
  margin-top: -12rpx;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.price-row {
  border-top: 2rpx solid rgba(185, 148, 95, 0.15);
  padding-top: 16rpx;
}

.price-left {
  color: #B7654A;
  min-width: 0;
}

.price-tag {
  font-size: 22rpx;
  font-weight: 600;
  color: #B7654A;
  margin-right: 10rpx;
  line-height: 1;
  padding-bottom: 4rpx;
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
  padding-bottom: 4rpx;
}

.package-meta {
  font-size: 24rpx;
  color: #665B4E;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.trust-row {
  margin: 16rpx 32rpx 8rpx;
  padding: 20rpx 8rpx;
}

.trust-item {
  flex: 1;
  text-align: center;
  padding: 0 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.trust-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: rgba(21, 63, 51, 0.08);
  color: #153F33;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}

.trust-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #153F33;
  margin-bottom: 4rpx;
}

.trust-desc {
  font-size: 20rpx;
  color: #958878;
}

.action-buttons {
  margin-top: 8rpx;
  margin-bottom: 24rpx;
}

.cta-inner {
  gap: 12rpx;
  color: inherit;
}

.paywall-disclaimer {
  font-size: 22rpx;
  color: #958878;
  text-align: center;
  margin: 16rpx 32rpx 32rpx;
  line-height: 1.5;
}
</style>
