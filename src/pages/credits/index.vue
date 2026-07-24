<script setup lang="ts">
import type { DisplayMemberPlan } from '@/constants/memberPlans'
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxLoginModal from '@/components/guoxin/GxLoginModal.vue'
import { mapProductsToPlans } from '@/constants/memberPlans'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { ensureH5RouterBasePath } from '@/utils/guoxin/h5RouterBase'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { savePendingPaidPlan, takePendingPaidPlan } from '@/utils/guoxin/pendingPaidPlan'

const store = useGuoxinStore()
const purchasingId = ref('')
const showLogin = ref(false)
const showCount = ref(0)
const productsReady = ref(false)
const countdownText = ref('00:00:00')
let countdownTimer: ReturnType<typeof setInterval> | null = null

const plans = computed(() => mapProductsToPlans(store.serverProducts))
const featured = computed(() => plans.value.find(p => p.showCountdown) ?? null)
const listPlans = computed(() => {
  const f = featured.value
  if (!f)
    return plans.value
  return plans.value.filter(p => p.id !== f.id)
})
const isMember = computed(() => store.chatUnlimited)

onMounted(async () => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  startCountdown()
  await Promise.all([
    store.ensureProductsLoaded(true),
    store.ensureCreditsLoaded(),
    store.ensureOrdersLoaded(),
  ])
  productsReady.value = true
})

onUnmounted(() => {
  if (countdownTimer)
    clearInterval(countdownTimer)
})

onShow(() => {
  // #ifdef H5
  if (ensureH5RouterBasePath())
    return
  // #endif
  if (!store.isLoggedIn)
    return
  // #ifdef H5
  void handlePayReturnIfNeeded()
  // #endif
  showCount.value++
  const force = showCount.value > 1
  void store.ensureProductsLoaded(force)
  void store.ensureCreditsLoaded(force)
  void store.ensureOrdersLoaded(force)
})

function onBack() {
  navigateBackOrHome()
}

function goMember() {
  uni.navigateTo({ url: RouterPaths.creditsMember })
}

function startCountdown() {
  const tick = () => {
    const now = new Date()
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    const ms = Math.max(0, end.getTime() - now.getTime())
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    countdownText.value = [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
  }
  tick()
  countdownTimer = setInterval(tick, 1000)
}

function requirePurchaseReady(): boolean {
  if (store.needsBindMobile()) {
    showLogin.value = true
    return false
  }
  return true
}

function goPaid(plan: DisplayMemberPlan) {
  const q = [
    `sku=${encodeURIComponent(plan.sku)}`,
    `name=${encodeURIComponent(plan.name)}`,
    `days=${plan.days}`,
    `reports=${plan.reports}`,
  ].join('&')
  uni.redirectTo({ url: `${RouterPaths.creditsPaid}?${q}` })
}

async function handlePayReturnIfNeeded() {
  if (typeof window === 'undefined')
    return
  const url = new URL(window.location.href)
  if (url.searchParams.get('payReturn') !== '1')
    return
  url.searchParams.delete('payReturn')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next)

  await store.ensureCreditsLoaded(true)
  const pending = takePendingPaidPlan()
  if (pending) {
    const q = [
      `sku=${encodeURIComponent(pending.sku)}`,
      `name=${encodeURIComponent(pending.name)}`,
      `days=${pending.days}`,
      `reports=${pending.reports}`,
    ].join('&')
    uni.redirectTo({ url: `${RouterPaths.creditsPaid}?${q}` })
    return
  }
  uni.showToast({ title: '支付处理中，请稍候', icon: 'none' })
}

async function purchasePlan(plan: DisplayMemberPlan) {
  if (plan.memberExclusive && !isMember.value) {
    uni.showToast({ title: '该套餐仅限有效会员购买', icon: 'none' })
    return
  }
  if (!requirePurchaseReady())
    return
  if (purchasingId.value)
    return

  purchasingId.value = plan.id
  savePendingPaidPlan({
    sku: plan.sku,
    name: plan.name,
    days: plan.days,
    reports: plan.reports,
    price: plan.price,
  })
  try {
    const result = await store.purchaseRemoteProduct(plan.productId, { silentSuccess: true })
    if (result === true)
      goPaid(plan)
    else if (result === 'mweb_redirect')
      uni.showToast({ title: '正在跳转微信支付', icon: 'none' })
    else
      takePendingPaidPlan()
  }
  finally {
    purchasingId.value = ''
  }
}

function buyLabel(plan: DisplayMemberPlan) {
  if (purchasingId.value === plan.id)
    return '支付中...'
  if (plan.memberExclusive && !isMember.value)
    return '会员可购'
  return '购买'
}

async function handleLoginSuccess() {
  await store.ensureCreditsLoaded(true)
}
</script>

<template>
  <view class="gx-chat-page paywall-page">
    <GxChatHeader
      title="解读权益"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="paywall-scroll" :show-scrollbar="false">
      <view class="paywall-inner">
        <view class="paywall-hero" @tap="goMember">
          <text class="hero-eyebrow">
            国心解读
          </text>
          <text class="hero-title">
            多项会员权益
          </text>
          <text class="hero-link">
            点击跳转详情页
          </text>
        </view>

        <view v-if="featured" class="featured-offer">
          <text class="featured-badge">
            限时优惠
          </text>
          <view class="featured-head">
            <view class="featured-copy">
              <text class="featured-name">
                {{ featured.name }}
              </text>
              <text class="featured-title">
                {{ featured.chatBenefit }}
              </text>
            </view>
            <view class="featured-price">
              <text v-if="featured.showOrigin" class="price-del">
                ¥{{ featured.originalPrice }}
              </text>
              <text class="price-now">
                <text class="yen">
                  ¥
                </text>{{ featured.price }}
              </text>
            </view>
          </view>
          <view class="featured-benefits">
            <text>{{ featured.reportBenefit }}</text>
            <text v-if="featured.desc">
              {{ featured.desc }}
            </text>
          </view>
          <view class="featured-foot">
            <view class="countdown">
              <text>专享价剩余</text>
              <text class="countdown-time">
                {{ countdownText }}
              </text>
            </view>
            <view
              class="featured-buy"
              :class="{ disabled: purchasingId === featured.id }"
              @tap.stop="purchasePlan(featured)"
            >
              {{ buyLabel(featured) }}
            </view>
          </view>
        </view>

        <view v-if="productsReady && plans.length === 0" class="products-empty">
          暂无可购买的套餐，请稍后再试。
        </view>

        <view class="package-section">
          <view
            v-for="pkg in listPlans"
            :key="pkg.id"
            class="package-card"
            :class="{ exclusive: pkg.memberExclusive }"
          >
            <view class="package-main">
              <text v-if="pkg.memberExclusive" class="exclusive-status">
                {{ isMember ? '会员专享加购价' : '仅限有效会员购买' }}
              </text>
              <text class="package-name">
                {{ pkg.name }}
              </text>
              <text class="package-line">
                <text class="em">
                  问答
                </text> {{ pkg.chatBenefit }}
              </text>
              <text class="package-line">
                <text class="em">
                  报告
                </text> {{ pkg.reportBenefit }}
              </text>
              <text v-if="pkg.footnote" class="package-note">
                {{ pkg.footnote }}
              </text>
            </view>
            <view class="package-buy">
              <text v-if="pkg.memberExclusive" class="member-badge">
                会员专属
              </text>
              <text v-if="pkg.showOrigin" class="price-del">
                ¥{{ pkg.originalPrice }}
              </text>
              <text v-if="pkg.showOrigin" class="sale-label">
                折后价
              </text>
              <text class="sale-price">
                ¥{{ pkg.price }}
              </text>
              <view
                class="buy-btn"
                :class="{ disabled: purchasingId === pkg.id }"
                @tap="purchasePlan(pkg)"
              >
                {{ buyLabel(pkg) }}
              </view>
            </view>
          </view>
        </view>

        <view v-if="productsReady" class="paywall-tip">
          当前剩余报告次数 {{ store.displayCredits }}；问答与报告额度独立计算。
        </view>
        <view class="paywall-tip muted">
          购买即表示同意《用户服务协议》与《隐私权政策》；支付走微信网页支付。
        </view>
        <view class="safe-bottom" />
      </view>
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
.paywall-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: transparent;
}

.paywall-scroll {
  flex: 1;
  height: 0;
}

.paywall-inner {
  padding: 24rpx 28rpx 48rpx;
  box-sizing: border-box;
}

.paywall-hero {
  padding: 40rpx 36rpx;
  margin-bottom: 24rpx;
  border-radius: var(--gx-chat-radius);
  color: #fffdf7;
  background:
    radial-gradient(circle at 88% 14%, rgba(213, 164, 61, 0.45), transparent 32%),
    linear-gradient(150deg, var(--gx-chat-red), var(--gx-chat-red-deep));
  box-shadow: var(--gx-chat-shadow);
}

.hero-eyebrow {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  color: rgba(255, 253, 247, 0.76);
}

.hero-title {
  display: block;
  margin: 12rpx 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 44rpx;
  font-weight: 800;
  color: #fffdf7;
}

.hero-link {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 253, 247, 0.82);
}

.featured-offer {
  position: relative;
  margin-bottom: 24rpx;
  padding: 32rpx 28rpx 28rpx;
  border-radius: var(--gx-chat-radius);
  background: linear-gradient(180deg, #fffdf8, #fff1e8);
  border: 2rpx solid var(--gx-chat-border);
  box-shadow: var(--gx-chat-shadow);
  overflow: hidden;
}

.featured-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 8rpx 20rpx;
  border-bottom-right-radius: 16rpx;
  background: var(--gx-chat-gold);
  color: #5a3a12;
  font-size: 22rpx;
  font-weight: 800;
}

.featured-head {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 28rpx;
}

.featured-name {
  display: block;
  font-size: 24rpx;
  color: var(--gx-chat-muted);
  font-weight: 700;
}

.featured-title {
  display: block;
  margin-top: 8rpx;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 36rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.featured-price {
  text-align: right;
  flex-shrink: 0;
}

.price-del {
  display: block;
  font-size: 22rpx;
  color: var(--gx-chat-hint);
  text-decoration: line-through;
}

.price-now {
  display: block;
  margin-top: 4rpx;
  font-size: 48rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
  line-height: 1;
}

.yen {
  font-size: 28rpx;
  margin-right: 4rpx;
}

.featured-benefits {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin: 24rpx 0;
  font-size: 24rpx;
  color: var(--gx-chat-muted);
}

.featured-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.countdown {
  font-size: 22rpx;
  color: var(--gx-chat-brown);
}

.countdown-time {
  display: block;
  margin-top: 6rpx;
  font-size: 30rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
  letter-spacing: 2rpx;
}

.featured-buy,
.buy-btn {
  flex-shrink: 0;
  padding: 16rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--gx-chat-red), var(--gx-chat-red-deep));
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 800;
  text-align: center;

  &.disabled {
    opacity: 0.55;
  }
}

.products-empty {
  padding: 64rpx 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: var(--gx-chat-muted);
}

.package-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.package-card {
  display: flex;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: var(--gx-chat-radius-sm);
  background: var(--gx-chat-paper);
  border: 2rpx solid var(--gx-chat-border);

  &.exclusive {
    background: #fff8f0;
    border-style: dashed;
  }
}

.package-main {
  flex: 1;
  min-width: 0;
}

.exclusive-status {
  display: block;
  margin-bottom: 8rpx;
  font-size: 22rpx;
  color: var(--gx-chat-brown);
  font-weight: 700;
}

.package-name {
  display: block;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 30rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
  margin-bottom: 10rpx;
}

.package-line {
  display: block;
  font-size: 24rpx;
  color: var(--gx-chat-muted);
  line-height: 1.5;
}

.em {
  font-weight: 800;
  color: var(--gx-chat-brown);
  margin-right: 8rpx;
}

.package-note {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--gx-chat-hint);
}

.package-buy {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  min-width: 140rpx;
}

.member-badge {
  margin-bottom: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: var(--gx-chat-gold-soft);
  color: var(--gx-chat-brown);
  font-size: 20rpx;
  font-weight: 800;
}

.sale-label {
  font-size: 20rpx;
  color: var(--gx-chat-hint);
  margin: 4rpx 0;
}

.sale-price {
  font-size: 34rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
  margin-bottom: 12rpx;
}

.paywall-tip {
  margin-top: 28rpx;
  font-size: 22rpx;
  color: var(--gx-chat-muted);
  line-height: 1.6;
  text-align: center;

  &.muted {
    color: var(--gx-chat-hint);
  }
}

.safe-bottom {
  height: calc(24rpx + env(safe-area-inset-bottom));
}
</style>
