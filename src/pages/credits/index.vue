<script setup lang="ts">
import { ref } from 'vue'
import { CREDIT_PACKAGES, CREDITS_PAYWALL_TEXT } from '@/constants/guoxin'
import type { CreditPackageId } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'

const store = useGuoxinStore()
const selectedId = ref<CreditPackageId>('standard')

function selectPkg(id: CreditPackageId) {
  selectedId.value = id
}

async function purchase() {
  const ok = await store.purchaseCredits(selectedId.value)
  if (ok) {
    setTimeout(() => {
      uni.reLaunch({ url: RouterPaths.home })
    }, 600)
  }
}
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="gx-page flex_column">
    <GxNavBar title="解读权益" />
    <scroll-view scroll-y class="gx-scroll">
      <view style="background: linear-gradient(160deg, #5A3A1A, #3A2210); padding: 48rpx 32rpx; text-align: center; color: #fff;">
        <view style="font-size: 72rpx;">
          📭
        </view>
        <view style="font-size: calc(40rpx * var(--gx-font-scale)); font-weight: 800;">
          {{ store.credits <= 0 ? '您的解读次数已用完' : '开通更多解读权益' }}
        </view>
        <view style="opacity: 0.8; line-height: 1.7; margin-top: 12rpx; font-size: calc(28rpx * var(--gx-font-scale));">
          继续让心语老师为您整理专属解读
        </view>
      </view>

      <view
        v-for="pkg in CREDIT_PACKAGES"
        :key="pkg.id"
        class="gx-goods-card"
        :class="{ selected: selectedId === pkg.id }"
        @tap="selectPkg(pkg.id)"
      >
        <view class="gx-goods-head">
          <view class="flex_between f_a_center">
            <text style="font-weight: 700;">{{ pkg.name }}</text>
            <text v-if="'hot' in pkg && pkg.hot" class="gx-badge gx-badge-gold">推荐</text>
          </view>
        </view>
        <view class="gx-goods-body">
          <view>
            <text class="gx-price">¥{{ pkg.price }}</text>
            <text class="gx-origin-price">¥{{ pkg.originPrice }}</text>
          </view>
          <view class="gx-text-sub" style="margin-top: 12rpx; line-height: 1.7;">
            可使用 {{ pkg.amount }} 次解读 · {{ pkg.desc }}
          </view>
        </view>
      </view>

      <view class="gx-btn-group">
        <GxButton @click="purchase">
          立即开通权益
        </GxButton>
        <GxButton type="outline" @click="goBack">
          稍后再说
        </GxButton>
      </view>

      <view class="gx-disclaimer">
        {{ CREDITS_PAYWALL_TEXT }}
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.gx-goods-card.hot {
  transform: scale(1.01);
}
</style>
