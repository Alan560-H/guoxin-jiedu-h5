<script setup lang="ts">
import type { ChatMessage, FeedbackState } from '@/stores/chatSessionStore'

defineProps<{
  messages: ChatMessage[]
  userSeal: string
}>()

const emit = defineEmits<{
  feedback: [payload: { messageId: string, feedback: FeedbackState }]
}>()
</script>

<template>
  <view class="message-list">
    <view
      v-for="m in messages"
      :key="m.id"
      class="msg-row"
      :class="m.role"
    >
      <view v-if="m.role === 'assistant'" class="seal assistant-seal">
        知
      </view>
      <view class="bubble" :class="m.role">
        <text v-if="m.role === 'assistant'" class="bubble-name">
          国心解读
        </text>
        <text class="bubble-body">
          {{ m.content }}
        </text>
        <view v-if="m.role === 'assistant' && m.showFeedback" class="feedback">
          <text class="feedback-label">
            {{ m.feedback ? '感谢反馈，我们会继续优化' : '这条回答对你有帮助吗？' }}
          </text>
          <view
            class="fb-btn"
            :class="{ selected: m.feedback === 'helpful' }"
            @tap="emit('feedback', { messageId: m.id, feedback: 'helpful' })"
          >
            <text class="fb-icon">
              ✓
            </text>
            有帮助
          </view>
          <view
            class="fb-btn"
            :class="{ selected: m.feedback === 'improve' }"
            @tap="emit('feedback', { messageId: m.id, feedback: 'improve' })"
          >
            <text class="fb-icon">
              !
            </text>
            需改进
          </view>
        </view>
      </view>
      <view v-if="m.role === 'user'" class="seal user-seal">
        {{ userSeal }}
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.message-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;

  &.user {
    justify-content: flex-end;
  }
}

.seal {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 800;
}

.assistant-seal {
  border: 3rpx solid rgba(124, 64, 42, 0.35);
  background: var(--gx-chat-red, #b43a3d);
  color: #fff;
}

.user-seal {
  border: 3rpx solid var(--gx-chat-red, #b43a3d);
  background: linear-gradient(135deg, var(--gx-chat-gold, #d5a43d), #f0d48a);
  color: var(--gx-chat-red-deep, #7f1f26);
}

.bubble {
  max-width: 78%;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  box-sizing: border-box;

  &.assistant {
    background: #fff;
    border: 2rpx solid var(--gx-chat-border, #eccdbb);
  }

  &.user {
    background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
    color: #fffdf7;
  }
}

.bubble-name {
  display: block;
  margin-bottom: 8rpx;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 700;
}

.bubble-body {
  display: block;
  font-size: 28rpx;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble.assistant .bubble-body {
  color: var(--gx-chat-ink, #2b1712);
}

.feedback {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12rpx;
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 2rpx solid rgba(180, 58, 61, 0.14);
}

.feedback-label {
  min-width: 0;
  color: var(--gx-chat-hint, #a28777);
  font-size: 20rpx;
  line-height: 1.3;
}

.fb-btn {
  min-height: 54rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(180, 58, 61, 0.22);
  background: #fffaf2;
  color: var(--gx-chat-muted, #755d52);
  font-size: 20rpx;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  white-space: nowrap;

  &.selected {
    border-color: var(--gx-chat-red, #b43a3d);
    background: var(--gx-chat-red-soft, #fae5e2);
    color: var(--gx-chat-red-deep, #7f1f26);
  }
}

.fb-icon {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red, #b43a3d);
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
