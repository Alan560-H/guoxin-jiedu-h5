<script setup lang="ts">
defineProps<{
  heading: string
  lead: string
  meta: string
  items: Array<{ question: string, tip: string }>
  empty: boolean
}>()

const emit = defineEmits<{
  refresh: []
  pick: [question: string]
  buy: []
}>()
</script>

<template>
  <view class="followup-panel">
    <view v-if="empty" class="followup-empty">
      <view class="empty-head">
        <text class="empty-title">
          今天先聊到这里
        </text>
        <view class="empty-actions">
          <text class="empty-meta">
            明日恢复
          </text>
        </view>
      </view>
      <text class="empty-strong">
        今天的 3 次问答已用完
      </text>
      <text class="empty-copy">
        明日 00:00 自动恢复，也可以查看不限次问答套餐。
      </text>
      <view class="empty-buy" @tap="emit('buy')">
        查看套餐
      </view>
    </view>

    <template v-else>
      <view class="board-head">
        <text class="board-title">
          {{ heading }}
        </text>
        <view class="board-actions">
          <text class="meta">
            {{ meta }}
          </text>
        </view>
      </view>
      <text class="lead">
        {{ lead }}
      </text>
      <scroll-view
        scroll-x
        class="followup-scroll"
        :show-scrollbar="false"
        enable-flex
      >
        <view class="followup-row">
          <view
            v-for="(item, i) in items"
            :key="`${i}-${item.question}`"
            class="followup-card"
            @tap="emit('pick', item.question)"
          >
            <text class="q">
              {{ item.question }}
            </text>
            <text v-if="item.tip" class="tip">
              {{ item.tip }}
            </text>
          </view>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.followup-panel {
  position: relative;
  isolation: isolate;
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 250, 239, 0.97);
  border: 2rpx solid rgba(181, 122, 35, 0.25);
  box-shadow: 0 6rpx 18rpx rgba(78, 57, 31, 0.06);
  overflow: hidden;

  &::after {
    position: absolute;
    z-index: 0;
    inset: 0;
    background: url("@/static/assets/gx-followup-bamboo-bg.jpg") center / 100% 100% no-repeat;
    content: "";
    opacity: 0.72;
    pointer-events: none;
  }
}

.board-head,
.lead,
.followup-scroll,
.followup-empty {
  position: relative;
  z-index: 1;
}

.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.board-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #211b16;
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta {
  font-size: 22rpx;
  color: var(--gx-chat-muted, #755d52);
}

.refresh-btn {
  min-height: 52rpx;
  padding: 0 16rpx;
  border-radius: 14rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.lead {
  display: block;
  margin-bottom: 16rpx;
  color: #544a41;
  font-size: 24rpx;
  line-height: 1.45;
}

.followup-scroll {
  width: 100%;
  white-space: nowrap;
}

.followup-row {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12rpx;
  padding-bottom: 4rpx;
}

.followup-card {
  flex-shrink: 0;
  width: 280rpx;
  box-sizing: border-box;
  padding: 20rpx 18rpx;
  border-radius: 18rpx;
  background: #fff8eb;
  border: 2rpx solid rgba(181, 122, 35, 0.22);
  white-space: normal;
}

.q {
  display: block;
  color: #211b16;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.4;
}

.tip {
  display: block;
  margin-top: 8rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
  line-height: 1.35;
}

.followup-empty {
  padding: 4rpx 0;
}

.empty-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid var(--gx-chat-border, #eccdbb);
}

.empty-title {
  color: var(--gx-chat-red, #b43a3d);
  font-size: 28rpx;
  font-weight: 800;
}

.empty-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.empty-meta {
  font-size: 22rpx;
  color: var(--gx-chat-hint, #a28777);
}

.empty-strong {
  display: block;
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 34rpx;
  font-weight: 800;
  margin-bottom: 10rpx;
}

.empty-copy {
  display: block;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.empty-buy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  padding: 0 28rpx;
  border-radius: 16rpx;
  background: var(--gx-chat-red-deep, #7f1f26);
  color: #fffdf7;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
