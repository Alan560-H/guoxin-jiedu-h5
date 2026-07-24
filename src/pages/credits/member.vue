<script setup lang="ts">
import type { DisplayMemberPlan } from '@/constants/memberPlans'
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxLoginModal from '@/components/guoxin/GxLoginModal.vue'
import { mapProductsToPlans } from '@/constants/memberPlans'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { savePendingPaidPlan, takePendingPaidPlan } from '@/utils/guoxin/pendingPaidPlan'

const store = useGuoxinStore()
const purchasingId = ref('')
const showLogin = ref(false)

const plans = computed(() => mapProductsToPlans(store.serverProducts))

const comparisonRows = [
  { item: '日常八字问答', free: '每日限 3 次', vip: '7×24 无限次，不限频次' },
  { item: '深度八字报告', free: '按次购买', vip: '私人定制专属报告' },
  { item: '多八字用户', free: '支持切换', vip: '支持切换与管理' },
  { item: '报告内容留存', free: '生成后可查', vip: '会员期内完整留存' },
]

onMounted(async () => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  await Promise.all([
    store.ensureProductsLoaded(true),
    store.ensureCreditsLoaded(),
  ])
})

onShow(() => {
  if (store.isLoggedIn)
    void store.ensureProductsLoaded()
})

function onBack() {
  navigateBackOrHome()
}

function goPaywall() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.redirectTo({ url: RouterPaths.credits })
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

async function purchasePlan(plan: DisplayMemberPlan) {
  if (plan.memberExclusive && !store.chatUnlimited) {
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

async function handleLoginSuccess() {
  await store.ensureCreditsLoaded(true)
}
</script>

<template>
  <view class="gx-chat-page member-page">
    <GxChatHeader
      title="会员详情"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="member-scroll" :show-scrollbar="false">
      <view class="member-inner">
        <view class="member-head">
          <view class="member-mark">
            享
          </view>
          <text class="eyebrow">
            国心解读会员
          </text>
          <text class="title">
            会员优势对比
          </text>
          <text class="sub">
            开通后立即解锁完整权益
          </text>
        </view>

        <view class="comparison">
          <view class="cmp-row cmp-head">
            <text class="col-item">
              权益项目
            </text>
            <text class="col">
              免费用户
            </text>
            <text class="col vip">
              会员用户
            </text>
          </view>
          <view
            v-for="row in comparisonRows"
            :key="row.item"
            class="cmp-row"
          >
            <text class="col-item">
              {{ row.item }}
            </text>
            <text class="col">
              {{ row.free }}
            </text>
            <text class="col vip">
              {{ row.vip }}
            </text>
          </view>
        </view>

        <view class="plan-block">
          <text class="block-title">
            选择套餐购买
          </text>
          <text class="block-sub">
            以下商品来自服务端，支付走微信网页支付。
          </text>

          <view v-if="plans.length === 0" class="empty">
            暂无可购买套餐
          </view>

          <view
            v-for="plan in plans"
            :key="plan.id"
            class="plan-option"
            @tap="purchasePlan(plan)"
          >
            <view class="plan-copy">
              <text class="plan-name">
                {{ plan.name }}
              </text>
              <text class="plan-desc">
                {{ plan.reportBenefit }}
                <text v-if="plan.days > 0">
                  · {{ plan.days }} 天
                </text>
              </text>
            </view>
            <view class="plan-price">
              <text v-if="plan.showOrigin" class="del">
                ¥{{ plan.originalPrice }}
              </text>
              <text class="now">
                ¥{{ plan.price }}
              </text>
              <text class="cta">
                {{ purchasingId === plan.id ? '支付中...' : '购买' }}
              </text>
            </view>
          </view>
        </view>

        <view class="back-paywall" @tap="goPaywall">
          返回套餐页
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
.member-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.member-scroll {
  flex: 1;
  height: 0;
}

.member-inner {
  padding: 24rpx 28rpx 48rpx;
}

.member-head {
  text-align: center;
  padding: 24rpx 16rpx 32rpx;
}

.member-mark {
  width: 88rpx;
  height: 88rpx;
  margin: 0 auto 16rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--gx-chat-gold), #c4842a);
  color: #fffdf7;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 40rpx;
  font-weight: 800;
}

.eyebrow {
  display: block;
  font-size: 24rpx;
  color: var(--gx-chat-muted);
  font-weight: 700;
}

.title {
  display: block;
  margin: 10rpx 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 40rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.sub {
  display: block;
  font-size: 24rpx;
  color: var(--gx-chat-hint);
}

.comparison {
  border-radius: var(--gx-chat-radius-sm);
  overflow: hidden;
  border: 2rpx solid var(--gx-chat-border);
  background: var(--gx-chat-paper);
}

.cmp-row {
  display: flex;
  align-items: stretch;
  border-bottom: 2rpx solid var(--gx-chat-border);

  &:last-child {
    border-bottom: none;
  }
}

.cmp-head {
  background: var(--gx-chat-red-soft);
  font-weight: 800;
}

.col-item,
.col {
  padding: 20rpx 12rpx;
  font-size: 22rpx;
  line-height: 1.45;
  color: var(--gx-chat-muted);
  box-sizing: border-box;
}

.col-item {
  width: 28%;
  font-weight: 700;
  color: var(--gx-chat-ink);
}

.col {
  width: 36%;
  text-align: center;
}

.col.vip {
  color: var(--gx-chat-red);
  font-weight: 700;
  background: rgba(180, 58, 61, 0.04);
}

.plan-block {
  margin-top: 36rpx;
}

.block-title {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.block-sub {
  display: block;
  margin: 8rpx 0 20rpx;
  font-size: 22rpx;
  color: var(--gx-chat-hint);
}

.empty {
  padding: 40rpx;
  text-align: center;
  color: var(--gx-chat-muted);
  font-size: 26rpx;
}

.plan-option {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: var(--gx-chat-radius-sm);
  background: var(--gx-chat-paper);
  border: 2rpx solid var(--gx-chat-border);
}

.plan-copy {
  flex: 1;
  min-width: 0;
}

.plan-name {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.plan-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--gx-chat-muted);
}

.plan-price {
  text-align: right;
  flex-shrink: 0;
}

.del {
  display: block;
  font-size: 20rpx;
  color: var(--gx-chat-hint);
  text-decoration: line-through;
}

.now {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
}

.cta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  font-weight: 800;
  color: var(--gx-chat-brown);
}

.back-paywall {
  margin-top: 12rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--gx-chat-red);
  padding: 20rpx;
}

.safe-bottom {
  height: calc(24rpx + env(safe-area-inset-bottom));
}
</style>
