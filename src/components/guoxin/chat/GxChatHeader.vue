<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  showBack?: boolean
  showMine?: boolean
  /** 快捷查看报告入口（文案：查看报告） */
  showReports?: boolean
}>(), {
  showMine: true,
  showReports: false,
})

const emit = defineEmits<{
  back: []
  mine: []
  reports: []
}>()
</script>

<template>
  <view class="gx-chat-header">
    <!-- 仅占位状态栏，与下方同行同色，避免「多出一块」 -->
    <view class="header-safe" aria-hidden="true" />
    <view class="header-row">
      <view class="header-side left">
        <view
          v-if="showBack"
          class="header-back"
          @tap="emit('back')"
        >
          ←
        </view>
      </view>
      <text class="header-title">
        {{ title || '国心解读' }}
      </text>
      <view class="header-side right">
        <view
          v-if="showReports"
          class="header-action"
          @tap="emit('reports')"
        >
          查看报告
        </view>
        <view
          v-if="showMine"
          class="header-action"
          @tap="emit('mine')"
        >
          我的
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.gx-chat-header {
  flex-shrink: 0;
  background:
    radial-gradient(circle at 88% 0%, rgba(201, 168, 76, 0.34), transparent 32%),
    linear-gradient(154deg, var(--gx-chat-red, #b43a3d) 0%, var(--gx-chat-red-deep, #7f1f26) 100%);
  color: #fffdf7;
}

.header-safe {
  height: env(safe-area-inset-top, 0px);
  width: 100%;
}

.header-row {
  min-height: 88rpx;
  padding: 12rpx 24rpx 20rpx;
  display: grid;
  grid-template-columns: minmax(48rpx, 1fr) auto minmax(48rpx, 1fr);
  align-items: center;
  gap: 12rpx;
  box-sizing: border-box;
}

.header-side {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-height: 76rpx;

  &.left {
    justify-content: flex-start;
  }

  &.right {
    justify-content: flex-end;
  }
}

.header-title {
  text-align: center;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0;
  white-space: nowrap;
}

.header-back {
  width: 76rpx;
  height: 76rpx;
  display: grid;
  place-items: center;
  font-size: 40rpx;
  color: #fffdf7;
}

.header-action {
  min-height: 60rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(255, 253, 247, 0.35);
  background: rgba(255, 253, 247, 0.14);
  color: #fffdf7;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
</style>
