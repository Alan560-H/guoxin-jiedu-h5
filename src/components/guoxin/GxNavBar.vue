<script setup lang="ts">
defineProps<{
  title?: string
  showBack?: boolean
  backDelta?: number
  dark?: boolean
  rightText?: string
}>()

const emit = defineEmits<{
  rightClick: []
}>()

function goBack(delta = 1) {
  uni.navigateBack({ delta })
}
</script>

<template>
  <view class="gx-nav" :class="{ dark }">
    <view class="gx-nav-inner">
      <view v-if="showBack !== false" class="gx-nav-back" @tap="goBack(backDelta || 1)">
        ‹
      </view>
      <view v-else class="gx-nav-back gx-nav-placeholder" />
      <view class="gx-nav-title">
        {{ title }}
      </view>
      <view v-if="rightText" class="gx-nav-right" @tap="emit('rightClick')">
        {{ rightText }}
      </view>
      <view v-else class="gx-nav-back gx-nav-placeholder" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-nav {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: var(--gx-bg);
  border-bottom: 1px solid var(--gx-border);
  flex-shrink: 0;
}

.gx-nav.dark {
  background: var(--gx-green);
  border-bottom-color: var(--gx-green);
  .gx-nav-title,
  .gx-nav-back,
  .gx-nav-right {
    color: #fff;
  }
  .gx-nav-back {
    background: rgba(255, 255, 255, 0.15);
  }
}

.gx-nav-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.gx-nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #F5EFE6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: var(--gx-text);
  line-height: 1;
}

.gx-nav-placeholder {
  opacity: 0;
  pointer-events: none;
}

.gx-nav-title {
  flex: 1;
  text-align: center;
  font-size: calc(34rpx * var(--gx-font-scale));
  font-weight: 700;
  color: var(--gx-text);
}

.gx-nav-right {
  min-width: 64rpx;
  text-align: right;
  font-size: calc(28rpx * var(--gx-font-scale));
  color: var(--gx-green);
  font-weight: 600;
}
</style>
