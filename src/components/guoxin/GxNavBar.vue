<script setup lang="ts">
import { RouterPaths } from '@/routerPaths'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'

const props = defineProps<{
  title?: string
  showBack?: boolean
  backDelta?: number
  /** 无法 navigateBack 时的 fallback，默认首页 */
  fallbackUrl?: string
  dark?: boolean
  rightText?: string
}>()

const emit = defineEmits<{
  rightClick: []
}>()

function goBack() {
  navigateBackOrHome(props.backDelta || 1, props.fallbackUrl || RouterPaths.home)
}
</script>

<template>
  <view class="gx-nav" :class="{ dark }">
    <view class="gx-nav-inner">
      <!-- Standard text-based back button `< 返回` -->
      <view v-if="showBack !== false" class="gx-nav-back-text" @tap="goBack">
        <text class="arrow">‹</text>
        <text class="label-text">返回</text>
      </view>
      <view v-else class="gx-nav-back-text gx-nav-placeholder" />

      <view class="gx-nav-title">
        {{ title }}
      </view>

      <view v-if="rightText" class="gx-nav-right" @tap="emit('rightClick')">
        {{ rightText }}
      </view>
      <view v-else class="gx-nav-back-text gx-nav-placeholder" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-nav {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background:
    linear-gradient(180deg, rgba(255, 250, 239, 0.98), rgba(246, 235, 213, 0.94)),
    #FCF5E9;
  border-bottom: 1px solid rgba(135, 100, 58, 0.28);
  flex-shrink: 0;
  z-index: 100;
}

.gx-nav.dark {
  background: var(--gx-green);
  border-bottom-color: var(--gx-green);
  .gx-nav-title,
  .gx-nav-back-text,
  .gx-nav-right {
    color: #fff !important;
  }
}

.gx-nav-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.gx-nav-back-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #153F33;
  font-weight: 500;
  cursor: pointer;
  padding: 8rpx 16rpx 8rpx 0;
  box-sizing: border-box;

  .arrow {
    font-size: 40rpx;
    line-height: 1;
    margin-top: -4rpx;
  }
}

.gx-nav-placeholder {
  opacity: 0;
  pointer-events: none;
  min-width: 90rpx;
}

.gx-nav-title {
  flex: 1;
  text-align: center;
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: calc(34rpx * var(--gx-font-scale));
  font-weight: 900;
  color: #153F33;
}

.gx-nav-right {
  min-width: 64rpx;
  text-align: right;
  font-size: calc(28rpx * var(--gx-font-scale));
  color: #153F33;
  font-weight: 600;
  padding: 8rpx 0 8rpx 16rpx;
}
</style>
