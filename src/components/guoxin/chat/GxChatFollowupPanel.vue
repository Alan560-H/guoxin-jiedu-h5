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
          <view class="refresh-btn" @tap="emit('refresh')">
            ↻ 换一批
          </view>
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
          <view class="refresh-btn" @tap="emit('refresh')">
            ↻ 换一批
          </view>
        </view>
      </view>
      <text class="lead">
        {{ lead }}
      </text>
      <view
        v-for="(item, i) in items"
        :key="`${i}-${item.question}`"
        class="followup-card"
        @tap="emit('pick', item.question)"
      >
        <text class="q">
          {{ item.question }}
        </text>
        <text class="tip">
          {{ item.tip }}
        </text>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.followup-panel {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 253, 248, 0.96);
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
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
  color: var(--gx-chat-ink, #2b1712);
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
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.45;
}

.followup-card {
  padding: 22rpx 20rpx;
  margin-bottom: 12rpx;
  border-radius: 18rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  border: 2rpx solid rgba(180, 58, 61, 0.16);

  &:last-child {
    margin-bottom: 0;
  }
}

.q {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.4;
}

.tip {
  display: block;
  margin-top: 8rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
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
