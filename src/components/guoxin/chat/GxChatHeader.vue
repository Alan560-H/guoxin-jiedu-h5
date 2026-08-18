<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  showBack?: boolean
  backLabel?: string
  showMine?: boolean
  /** 快捷查看报告入口（文案：查看报告） */
  showReports?: boolean
  /** 轻舟入口：标题左侧「返回上一页」 */
  showSourceBack?: boolean
  immersive?: boolean
  scrolled?: boolean
}>(), {
  showMine: true,
  showReports: false,
  showSourceBack: false,
})

const emit = defineEmits<{
  back: []
  sourceBack: []
  mine: []
  reports: []
}>()
</script>

<template>
  <view class="gx-chat-header" :class="{ immersive, scrolled }">
    <!-- 仅占位状态栏，与下方同行同色，避免「多出一块」 -->
    <view class="header-safe" aria-hidden="true" />
    <view class="header-row">
      <view class="header-side left">
        <view
          v-if="showSourceBack"
          class="header-source-back"
          @tap="emit('sourceBack')"
        >
          <text class="header-source-back-arrow">
            ‹
          </text>
          <text class="header-source-back-label">
            返回上一页
          </text>
        </view>
        <view
          v-else-if="showBack"
          class="header-back"
          :class="{ 'has-label': backLabel }"
          @tap="emit('back')"
        >
          <text class="header-back-arrow">
            {{ backLabel ? '‹' : '←' }}
          </text>
          <text v-if="backLabel" class="header-back-label">
            {{ backLabel }}
          </text>
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
  position: relative;
  z-index: 30;
  flex-shrink: 0;
  color: #3b2a1d;
  background: rgba(250, 245, 233, 0.96);
  border-bottom: 2rpx solid rgba(183, 142, 85, 0.18);
  transition: background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.gx-chat-header.immersive {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(251, 246, 234, 0.84), rgba(251, 246, 234, 0));
  border-bottom: 0;
}

.gx-chat-header.immersive.scrolled {
  background: rgba(250, 245, 233, 0.96);
  border-bottom: 2rpx solid rgba(183, 142, 85, 0.24);
  box-shadow: 0 6rpx 18rpx rgba(74, 53, 28, 0.08);
  backdrop-filter: blur(14rpx);
  -webkit-backdrop-filter: blur(14rpx);
}

.header-safe {
  height: env(safe-area-inset-top, 0px);
  width: 100%;
}

.header-row {
  min-height: 88rpx;
  padding: 12rpx 24rpx 16rpx;
  display: grid;
  grid-template-columns: minmax(160rpx, 1fr) auto minmax(160rpx, 1fr);
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
  font-family: "Noto Serif SC", STSong, serif;
  font-size: 38rpx;
  font-weight: 900;
  color: #312319;
  line-height: 1.1;
  letter-spacing: 0;
  white-space: nowrap;
}

.header-back {
  width: 76rpx;
  height: 76rpx;
  display: grid;
  place-items: center;
  color: #3b2a1d;

  &.has-label {
    width: auto;
    min-height: 60rpx;
    height: auto;
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
}

.header-back-arrow {
  font-size: 40rpx;
  line-height: 1;
  margin-top: -2rpx;
}

.header-back-label {
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
}

.header-source-back {
  display: flex;
  align-items: center;
  gap: 4rpx;
  min-height: 60rpx;
  max-width: 100%;
  padding: 0 4rpx;
  color: #3b2a1d;
}

.header-source-back-arrow {
  font-size: 36rpx;
  line-height: 1;
  margin-top: -2rpx;
}

.header-source-back-label {
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
}

.header-action {
  min-height: 60rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(185, 126, 51, 0.3);
  background: rgba(248, 235, 211, 0.92);
  color: #963e29;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.72),
    0 4rpx 10rpx rgba(95, 67, 30, 0.08);
}
</style>
