<script setup lang="ts">
const emit = defineEmits<{
  generate: []
}>()
</script>

<template>
  <view class="report-ad">
    <view class="ad-mark">
      报告<br>入口
    </view>
    <view class="ad-copy">
      <text class="ad-title">
        生成完整命理解读报告
      </text>
      <text class="ad-desc">
        结合八字与问答内容系统整理，报告额度独立计算。
      </text>
    </view>
    <view class="ad-btn" @tap="emit('generate')">
      去生成
    </view>
  </view>
</template>

<style scoped lang="scss">
.report-ad {
  margin: 8rpx 0 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  border: 3rpx solid rgba(201, 168, 76, 0.46);
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.96), rgba(247, 237, 207, 0.78));
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ad-mark {
  width: 84rpx;
  min-height: 84rpx;
  padding: 10rpx 8rpx;
  border-radius: 16rpx;
  background: var(--gx-chat-red-deep, #7f1f26);
  color: #fffdf7;
  font-size: 22rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.ad-copy {
  flex: 1;
  min-width: 0;
}

.ad-title {
  display: block;
  color: var(--gx-chat-brown, #7c402a);
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.25;
}

.ad-desc {
  display: block;
  margin-top: 6rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
  line-height: 1.35;
}

.ad-btn {
  flex-shrink: 0;
  width: 120rpx;
  height: 72rpx;
  border-radius: 14rpx;
  background: var(--gx-chat-gold, #d5a43d);
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
