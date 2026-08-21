<script setup lang="ts">
import type { DisplayMemberPlan } from '@/constants/memberPlans'
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLoginModal from '@/components/guoxin/chat/GxChatLoginModal.vue'
import GxUserBrief from '@/components/guoxin/GxUserBrief.vue'
import { mapProductsToPlans, splitPlansByPromotion } from '@/constants/memberPlans'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { openCustomerServiceLink } from '@/utils/guoxin/customerService'
import { ensureH5RouterBasePath } from '@/utils/guoxin/h5RouterBase'
import { savePendingPaidPlan, takePendingPaidPlan } from '@/utils/guoxin/pendingPaidPlan'
import { isShowPayEnabled } from '@/utils/guoxin/showPay'

const store = useGuoxinStore()
const purchasingId = ref('')
const showLogin = ref(false)
/** 未登录走短信登录；已登录未绑手机走绑定 */
const loginMode = ref<'smsLogin' | 'bindMobile'>('smsLogin')
const showCount = ref(0)
const productsReady = ref(false)
const countdownText = ref('00:00:00')
let countdownTimer: ReturnType<typeof setInterval> | null = null

const plans = computed(() => mapProductsToPlans(store.serverProducts))
const split = computed(() => splitPlansByPromotion(plans.value))
const trial = computed(() => split.value.trial)
const regular = computed(() => split.value.regular)
const boost = computed(() => split.value.boost)
const isMember = computed(() => store.chatUnlimited)
/** 接口 value=1 时开放在线支付。 */
const payEnabled = computed(() => isShowPayEnabled())

const displayNickname = computed(() => {
  if (!store.isLoggedIn)
    return '未登录'
  return store.nickname || maskMobile(store.mobile) || '国心用户'
})
const userSubtitle = computed(() => {
  if (!store.isLoggedIn)
    return '登录后同步权益与报告、问答次数'
  const chatText = store.chatUnlimited
    ? '不限次'
    : `${store.chatRemaining} 次`
  return `剩余报告 ${store.displayCredits} 次 · 剩余问答 ${chatText}`
})
const memberEntryLabel = '会员权益'

function maskMobile(mobile: string) {
  const m = (mobile || '').trim()
  if (m.length < 7)
    return m
  return `${m.slice(0, 3)}****${m.slice(-4)}`
}

async function loadCreditsPageData(force = false) {
  await Promise.all([
    store.loadUserInfo({ skipSessionClear: true }),
    store.ensureProductsLoaded(force),
    store.ensureCreditsLoaded(force),
    store.ensureOrdersLoaded(force),
  ])
  productsReady.value = true
}

onMounted(async () => {
  startCountdown()
  // 未登录也可看套餐；登录弹窗挡住购买，登录后留在本页
  if (!store.isLoggedIn) {
    loginMode.value = 'smsLogin'
    showLogin.value = true
    await store.ensureProductsLoaded(true)
    productsReady.value = true
    return
  }
  if (store.needsBindMobile()) {
    loginMode.value = 'bindMobile'
    showLogin.value = true
  }
  await loadCreditsPageData(true)
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

function openLoginForPurchase(): void {
  if (!store.isLoggedIn) {
    loginMode.value = 'smsLogin'
    showLogin.value = true
    return
  }
  if (store.needsBindMobile()) {
    loginMode.value = 'bindMobile'
    showLogin.value = true
  }
}

function requirePurchaseReady(): boolean {
  if (!store.isLoggedIn || store.needsBindMobile()) {
    openLoginForPurchase()
    return false
  }
  return true
}

async function showPurchaseSuccess() {
  store.invalidateRemoteCache(['credits', 'orders', 'consumeRecords'])
  await Promise.allSettled([
    store.loadUserInfo({ skipSessionClear: true }),
    store.ensureCreditsLoaded(true),
    store.ensureOrdersLoaded(true),
    store.ensureConsumeRecordsLoaded(true),
  ])
  uni.showModal({
    title: '购买成功',
    content: '购买成功，为了让轻舟云课堂同步最新权益，请退出轻舟云课堂后重新进入。如需帮助，可随时联系客服。',
    showCancel: false,
    confirmText: '我知道了',
  })
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

  const pending = takePendingPaidPlan()
  if (pending) {
    await showPurchaseSuccess()
    return
  }
  uni.showToast({ title: '支付处理中，请稍候', icon: 'none' })
}

/**
 * value=1 → 跳转第三方收银台；
 * value=0 → 动态获取客服链接。
 */
async function purchasePlan(plan: DisplayMemberPlan) {
  if (plan.memberExclusive && !isMember.value) {
    uni.showToast({ title: '该套餐仅限有效会员购买', icon: 'none' })
    return
  }
  if (!requirePurchaseReady())
    return

  if (!isShowPayEnabled()) {
    await openCustomerServiceLink()
    return
  }

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
    if (result === true) {
      takePendingPaidPlan()
      await showPurchaseSuccess()
    }
    else if (result === 'pay_redirect') {
      uni.showToast({ title: '正在跳转支付页面', icon: 'none' })
    }
    else {
      takePendingPaidPlan()
    }
  }
  finally {
    purchasingId.value = ''
  }
}

function buyLabel(plan: DisplayMemberPlan) {
  if (purchasingId.value === plan.id)
    return '支付中...'
  if (plan.promotionSort === 1) {
    if (plan.memberExclusive && !isMember.value)
      return '会员可购'
    return payEnabled.value ? '购买' : '咨询'
  }
  if (plan.memberExclusive && !isMember.value)
    return '会员可购'
  if (plan.promotionSort === 2)
    return payEnabled.value ? `¥${plan.price} 立即购买` : `¥${plan.price} 咨询购买`
  return payEnabled.value ? '购买' : '咨询'
}

async function handleLoginSuccess() {
  await loadCreditsPageData(true)
}
</script>

<template>
  <view class="gx-chat-page paywall-page">
    <GxChatHeader
      title="解读权益"
      :show-mine="false"
    />

    <scroll-view scroll-y class="paywall-scroll" :show-scrollbar="false">
      <view class="paywall-inner">
        <!-- 1. 会员权益入口（含登录用户信息；未登录也展示） -->
        <view class="paywall-hero" @tap="goMember">
          <GxUserBrief
            :nickname="displayNickname"
            :avatar-url="store.isLoggedIn ? store.avatarUrl : ''"
            :status-label="memberEntryLabel"
            :subtitle="userSubtitle"
          />
        </view>

        <!-- 2. 新人体验包 promotionSort=2 -->
        <view v-if="trial" class="trial-card">
          <text class="trial-badge">
            今日新客专享
          </text>
          <view class="trial-head">
            <view class="trial-copy">
              <text class="trial-name">
                {{ trial.name }}
              </text>
              <text class="trial-title">
                {{ trial.chatBenefit }}
              </text>
            </view>
            <view class="trial-price">
              <text v-if="trial.showOrigin" class="price-del">
                ¥{{ trial.originalPrice }}
              </text>
              <text class="price-now">
                <text class="yen">
                  ¥
                </text>{{ trial.price }}
              </text>
            </view>
          </view>
          <view v-if="trial.benefitChips.length" class="trial-chips">
            <text
              v-for="(chip, idx) in trial.benefitChips"
              :key="idx"
              class="trial-chip"
            >
              {{ chip }}
            </text>
          </view>
          <view class="trial-foot">
            <view class="countdown">
              <text>专享价剩余</text>
              <text class="countdown-time">
                {{ countdownText }}
              </text>
            </view>
            <view
              class="trial-buy"
              :class="{ disabled: purchasingId === trial.id }"
              @tap.stop="purchasePlan(trial)"
            >
              {{ buyLabel(trial) }}
            </view>
          </view>
        </view>

        <view v-if="productsReady && plans.length === 0" class="products-empty">
          暂无可购买的套餐，请稍后再试。
        </view>

        <!-- 3. 普通权益包：同一外框，行间分隔（对齐 demo/体验包/权益包.png） -->
        <view v-if="regular.length" class="package-section">
          <view
            v-for="pkg in regular"
            :key="pkg.id"
            class="package-row"
          >
            <view class="package-main">
              <text class="package-name">
                {{ pkg.name }}
              </text>
              <text class="package-line">
                <text class="em">问答</text>{{ pkg.chatBenefit }}
              </text>
              <text class="package-line">
                <text class="em">报告</text>{{ pkg.reportBenefit }}
              </text>
              <text v-if="pkg.footnote" class="package-note">
                {{ pkg.footnote }}
              </text>
            </view>
            <view class="package-side">
              <view class="package-price-block">
                <text v-if="pkg.showOrigin" class="price-del">
                  ¥{{ pkg.originalPrice }}
                </text>
                <text v-if="pkg.showOrigin" class="sale-label">
                  折后价
                </text>
                <text class="sale-price">
                  ¥{{ pkg.price }}
                </text>
              </view>
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

        <!-- 4. 单次报告加油包 promotionSort=1，置底（对齐 demo/体验包/单次报告加油包.png） -->
        <view
          v-if="boost"
          class="boost-card"
        >
          <view class="boost-badge">
            <text class="boost-badge-text">
              会员专属
            </text>
          </view>
          <view class="boost-body">
            <view class="boost-main">
              <text class="boost-status">
                仅限有效会员购买
              </text>
              <text class="boost-name">
                {{ boost.name }}
              </text>
              <text class="boost-desc">
                增加 {{ boost.reports > 0 ? boost.reports : 1 }} 次完整报告额度，不改变每日问答次数。
              </text>
            </view>
            <view class="boost-side">
              <view class="boost-price-block">
                <text v-if="boost.showOrigin" class="boost-price-del">
                  ¥{{ boost.originalPrice }}
                </text>
                <text v-if="boost.showOrigin" class="boost-sale-label">
                  折后价
                </text>
                <text class="boost-sale-price">
                  ¥{{ boost.price }}
                </text>
              </view>
              <view
                class="boost-btn"
                :class="{
                  locked: boost.memberExclusive && !isMember,
                  disabled: purchasingId === boost.id,
                }"
                @tap="purchasePlan(boost)"
              >
                <text class="boost-btn-text" :lines="1">
                  {{ buyLabel(boost) }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="productsReady" class="paywall-tip">
          当前剩余报告次数 {{ store.displayCredits }}；问答与报告额度独立计算。
        </view>
        <view class="paywall-tip muted">
          购买即表示同意《用户服务协议》与《隐私权政策》；{{ payEnabled ? '支付将跳转至安全收银台。' : '当前请联系客服开通。' }}
        </view>
        <view class="safe-bottom" />
      </view>
    </scroll-view>

    <GxChatLoginModal
      :show="showLogin"
      :mode="loginMode"
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
  position: relative;
  padding: 28rpx 28rpx;
  margin-bottom: 24rpx;
  border-radius: var(--gx-chat-radius);
  color: #fffdf7;
  background:
    radial-gradient(circle at 88% 14%, rgba(213, 164, 61, 0.45), transparent 32%),
    linear-gradient(150deg, var(--gx-chat-red), var(--gx-chat-red-deep));
  box-shadow: var(--gx-chat-shadow);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    right: 36rpx;
    bottom: -4rpx;
    width: 190rpx;
    height: 76rpx;
    background: url("@/static/assets/gx-cloud.png") center / contain no-repeat;
    opacity: 0.34;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    z-index: 0;
    right: -8rpx;
    top: -22rpx;
    width: 64rpx;
    height: 110rpx;
    background: url("@/static/assets/gx-auspicious-charm.webp") center / contain no-repeat;
    opacity: 0.88;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

.trial-card {
  position: relative;
  margin-bottom: 24rpx;
  padding: 36rpx 28rpx 28rpx;
  border-radius: var(--gx-chat-radius);
  color: #fffdf7;
  background:
    radial-gradient(circle at 90% 10%, rgba(255, 214, 140, 0.35), transparent 36%),
    linear-gradient(145deg, #c9484a 0%, #9b2429 55%, #7f1f26 100%);
  box-shadow: var(--gx-chat-shadow);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    right: 30rpx;
    top: 112rpx;
    width: 220rpx;
    height: 86rpx;
    background: url("@/static/assets/gx-cloud.png") center / contain no-repeat;
    opacity: 0.2;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

.trial-badge {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  padding: 10rpx 22rpx;
  border-bottom-left-radius: 20rpx;
  background: linear-gradient(135deg, #f0c15a, #d5a43d);
  color: #5a3a12;
  font-size: 22rpx;
  font-weight: 800;
}

.trial-head {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding-right: 8rpx;
}

.trial-name {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 253, 247, 0.78);
  font-weight: 700;
}

.trial-title {
  display: block;
  margin-top: 10rpx;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 40rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1.2;
}

.trial-price {
  text-align: right;
  flex-shrink: 0;
  padding-top: 8rpx;
}

.price-del {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 253, 247, 0.55);
  text-decoration: line-through;
}

.trial-price .price-del {
  color: rgba(255, 253, 247, 0.55);
}

.price-now {
  display: block;
  margin-top: 4rpx;
  font-size: 52rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1;
}

.yen {
  font-size: 28rpx;
  margin-right: 4rpx;
}

.trial-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 24rpx 0 28rpx;
}

.trial-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 253, 247, 0.14);
  border: 2rpx solid rgba(255, 253, 247, 0.22);
  color: #fffdf7;
  font-size: 22rpx;
  font-weight: 700;
}

.trial-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.countdown {
  font-size: 22rpx;
  color: rgba(255, 253, 247, 0.78);
}

.countdown-time {
  display: block;
  margin-top: 6rpx;
  font-size: 34rpx;
  font-weight: 800;
  color: #ffe08a;
  letter-spacing: 2rpx;
}

.trial-buy {
  flex-shrink: 0;
  min-width: 220rpx;
  padding: 20rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f6d27a, #e2b24a);
  color: #6a4012;
  font-size: 26rpx;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 8rpx 18rpx rgba(90, 40, 20, 0.22);

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
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 32rpx;
  background:
    linear-gradient(90deg, rgba(251, 244, 228, 0.99) 0%, rgba(251, 244, 228, 0.92) 62%, rgba(251, 244, 228, 0.28) 100%),
    url("@/static/assets/gx-bamboo-card.webp") right bottom / auto 94% no-repeat,
    #fbf4e4;
  border: 1rpx solid rgba(218, 188, 146, 0.52);
  box-shadow: 0 8rpx 24rpx rgba(127, 31, 38, 0.06);
  overflow: hidden;
}

.package-row {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 12rpx;
  padding: 32rpx 28rpx;

  & + .package-row {
    border-top: 1rpx solid rgba(232, 200, 178, 0.45);
  }
}

.package-main {
  flex: 1;
  min-width: 0;
}

.package-name {
  display: block;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 34rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
  margin-bottom: 14rpx;
  line-height: 1.2;
}

.package-line {
  display: block;
  font-size: 24rpx;
  color: #8a6a5a;
  line-height: 1.6;
}

.em {
  font-weight: 800;
  color: #6b3f32;
  margin-right: 4rpx;
}

.package-note {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #b09a8c;
  line-height: 1.45;
}

.package-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  flex-shrink: 0;
  min-width: 156rpx;
  padding-top: 4rpx;
}

.package-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.package-side .price-del {
  color: #c4b0a4;
  font-size: 22rpx;
  text-decoration: line-through;
  line-height: 1.2;
}

.sale-label {
  font-size: 20rpx;
  color: #b09a8c;
  margin: 2rpx 0 6rpx;
  line-height: 1;
}

.sale-price {
  font-size: 44rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
  line-height: 1;
  margin-bottom: 0;
  letter-spacing: -1rpx;
}

.boost-card {
  position: relative;
  margin-top: 28rpx;
  padding: 32rpx 28rpx 30rpx;
  border-radius: 28rpx;
  background: #fff8ef;
  border: 2rpx dashed #d4ae82;
  box-sizing: border-box;
  overflow: hidden;
}

.boost-badge {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  padding: 10rpx 22rpx;
  border-radius: 0;
  border-bottom-left-radius: 20rpx;
  background: #b43a3d;
  white-space: nowrap;
}

.boost-badge-text {
  font-size: 22rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1.3;
  white-space: nowrap;
}

.boost-body {
  display: flex;
  align-items: stretch;
  gap: 16rpx;
}

.boost-main {
  flex: 1;
  min-width: 0;
}

.boost-status {
  display: block;
  margin-bottom: 8rpx;
  font-size: 22rpx;
  color: #9a673a;
  font-weight: 600;
  line-height: 1.35;
}

.boost-name {
  display: block;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 34rpx;
  font-weight: 800;
  color: #2b1a14;
  margin-bottom: 10rpx;
  line-height: 1.25;
}

.boost-desc {
  display: block;
  font-size: 24rpx;
  color: #9a7b68;
  line-height: 1.55;
}

.boost-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  flex-shrink: 0;
  width: 168rpx;
  padding-top: 28rpx;
}

.boost-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.boost-price-del {
  font-size: 22rpx;
  color: #c2aea2;
  text-decoration: line-through;
  line-height: 1.2;
}

.boost-sale-label {
  margin: 2rpx 0 4rpx;
  font-size: 20rpx;
  color: #b39a8c;
  line-height: 1;
}

.boost-sale-price {
  font-size: 44rpx;
  font-weight: 800;
  color: #b43a3d;
  line-height: 1;
  letter-spacing: -1rpx;
}

.boost-btn {
  margin-top: 16rpx;
  width: 168rpx;
  height: 64rpx;
  padding: 0;
  border-radius: 999rpx;
  background: #b43a3d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* 非会员：设计稿浅金「会员可购」，单行 */
  &.locked {
    background: #f2d6a3;
  }

  &.disabled {
    opacity: 0.55;
  }
}

.boost-btn-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 64rpx;
  white-space: nowrap;
}

.boost-btn.locked .boost-btn-text {
  color: #8d5a2b;
}

.buy-btn {
  flex-shrink: 0;
  margin-top: 20rpx;
  min-width: 120rpx;
  height: 68rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  background: var(--gx-chat-red);
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 800;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 14rpx rgba(167, 36, 41, 0.28);

  &.disabled {
    opacity: 0.55;
  }
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
