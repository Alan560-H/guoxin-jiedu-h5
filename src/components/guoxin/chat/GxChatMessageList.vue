<script setup lang="ts">
import type { ChatMessage, FeedbackState } from '@/stores/chatSessionStore'
import { formatChatAnswerHtml } from '@/utils/guoxin/chat'

defineProps<{
  messages: ChatMessage[]
  userSeal: string
}>()

const emit = defineEmits<{
  feedback: [payload: { messageId: string, feedback: FeedbackState }]
}>()

function isThinking(m: ChatMessage) {
  return m.role === 'assistant' && m.streaming === true && !String(m.content || '').trim()
}

/** 已有正文且仍在流式：显示末尾光标（不切开 Markdown） */
function isStreamingAnswer(m: ChatMessage) {
  return m.role === 'assistant' && m.streaming === true && !!String(m.content || '').trim()
}

function answerHtml(m: ChatMessage) {
  return formatChatAnswerHtml(m.content, {
    messageId: m.id,
    streaming: m.streaming === true,
  })
}

function onMarkdownClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target)
    return

  const img = target.closest?.('img') as HTMLImageElement | null
  if (img?.src) {
    uni.previewImage({ urls: [img.src], current: img.src })
    return
  }

  const btn = target.closest?.('.copy-code-btn') as HTMLElement | null
  if (!btn)
    return
  const wrap = btn.closest('.md-code-wrap')
  const pre = wrap?.querySelector('pre')
  const text = pre?.textContent || ''
  if (!text)
    return
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: '已复制', icon: 'none' }),
  })
}
</script>

<template>
  <view class="message-list">
    <view
      v-for="m in messages"
      :id="`msg-${m.id}`"
      :key="m.id"
      class="msg-row"
      :class="m.role"
    >
      <view v-if="m.role === 'assistant'" class="seal assistant-seal">
        知
      </view>
      <view class="bubble" :class="[m.role, { thinking: isThinking(m) }]">
        <text v-if="m.role === 'assistant'" class="bubble-name">
          国心解读
        </text>

        <view v-if="isThinking(m)" class="thinking-skeleton">
          <view class="thinking-bars" aria-hidden="true">
            <view class="bar" />
            <view class="bar short" />
            <view class="bar mid" />
          </view>
          <text class="thinking-text">
            正在思考中......
          </text>
        </view>

        <template v-else>
          <image
            v-if="m.imageUrl"
            class="bubble-image"
            :src="m.imageUrl"
            mode="widthFix"
          />
          <view
            v-if="m.role === 'assistant' && m.content"
            class="answer-wrap"
            :class="{ streaming: isStreamingAnswer(m) }"
          >
            <div
              class="bubble-body message-text markdown-content"
              @click="onMarkdownClick"
              v-html="answerHtml(m)"
            />
            <view
              v-if="isStreamingAnswer(m)"
              :id="`msg-${m.id}-tail`"
              class="stream-caret"
              aria-hidden="true"
            />
          </view>
          <text
            v-else-if="m.content"
            class="bubble-body"
          >
            {{ m.content }}
          </text>
        </template>

        <view v-if="m.role === 'assistant' && m.showFeedback && !m.streaming" class="feedback">
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
  gap: 12rpx;

  &.user {
    justify-content: flex-end;
  }
}

.seal {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
}

.assistant-seal {
  background: linear-gradient(145deg, #f0c15a, #d5a43d);
  color: #fffdf7;
}

.user-seal {
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
}

.bubble {
  max-width: calc(100% - 88rpx);
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  box-sizing: border-box;

  &.assistant {
    background: #fffdf9;
    border: 2rpx solid rgba(236, 205, 187, 0.7);
  }

  &.user {
    position: relative;
    padding-right: 54rpx;
    background: linear-gradient(145deg, #c9484a, #9b2429);
    color: #fffdf7;
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      z-index: 0;
      top: -12rpx;
      right: -4rpx;
      width: 44rpx;
      height: 76rpx;
      background: url("@/static/assets/gx-auspicious-charm.webp") center / contain no-repeat;
      opacity: 0.86;
      pointer-events: none;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  &.thinking {
    min-width: 280rpx;
  }
}

.bubble-name {
  display: block;
  margin-bottom: 8rpx;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 700;
}

.bubble-image {
  display: block;
  width: 100%;
  max-width: 360rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
}

.answer-wrap {
  display: block;
  position: relative;
}

.stream-caret {
  display: block;
  width: 4rpx;
  height: 28rpx;
  margin-top: 6rpx;
  background: var(--gx-chat-red, #b43a3d);
  border-radius: 2rpx;
  animation: gx-stream-caret 1s steps(1, end) infinite;
}

@keyframes gx-stream-caret {
  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0;
  }
}

.bubble-body {
  display: block;
  font-size: 28rpx;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble.assistant .bubble-body {
  color: var(--gx-chat-ink, #2b1712);
}

.markdown-content {
  white-space: normal;

  :deep(p) {
    margin: 0 0 0.7em;
    line-height: 1.65;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 0.75em 0 0.45em;
    color: var(--gx-chat-ink, #2b1712);
    line-height: 1.4;
    font-size: 30rpx;
    font-weight: 700;
  }

  :deep(h3),
  :deep(h4) {
    font-size: 28rpx;
  }

  :deep(ul),
  :deep(ol) {
    display: block;
    margin: 0.5em 0 0.9em;
    padding-left: 1.5em;
    list-style-position: outside;
  }

  :deep(ol) {
    list-style-type: decimal;
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(li) {
    display: list-item;
    margin: 0.35em 0;
    line-height: 1.65;
  }

  :deep(li > p) {
    margin: 0.15em 0;
  }

  :deep(hr) {
    border: none;
    border-top: 1rpx solid rgba(236, 205, 187, 0.7);
    margin: 0.8em 0;
  }

  :deep(strong) {
    font-weight: 800;
    color: var(--gx-chat-ink, #2b1712);
  }

  :deep(blockquote) {
    margin: 0.6em 0;
    padding: 0.35em 0 0.35em 0.8em;
    border-left: 4rpx solid rgba(180, 58, 61, 0.35);
    color: #755d52;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 12rpx;
  }

  :deep(.md-table-wrap) {
    width: 100%;
    overflow-x: auto;
    margin: 0.6em 0;
    -webkit-overflow-scrolling: touch;
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    font-size: 24rpx;
  }

  :deep(th),
  :deep(td) {
    border: 1rpx solid rgba(236, 205, 187, 0.85);
    padding: 8rpx 12rpx;
    text-align: left;
  }

  :deep(th) {
    background: rgba(250, 229, 226, 0.55);
    font-weight: 700;
  }

  :deep(.md-code-wrap) {
    position: relative;
    margin: 0.6em 0;
  }

  :deep(.copy-code-btn) {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    z-index: 1;
    padding: 4rpx 12rpx;
    border: none;
    border-radius: 8rpx;
    background: rgba(43, 23, 18, 0.72);
    color: #fffdf7;
    font-size: 20rpx;
  }

  :deep(pre) {
    margin: 0;
    padding: 20rpx;
    overflow: auto;
    border-radius: 16rpx;
    background: #2b1712;
    color: #fff7ec;
    font-size: 24rpx;
    line-height: 1.5;
  }

  :deep(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  :deep(:not(pre) > code) {
    background: rgba(180, 58, 61, 0.08);
    color: var(--gx-chat-red-deep, #7f1f26);
    padding: 2rpx 8rpx;
    border-radius: 6rpx;
    font-size: 24rpx;
  }

  :deep(.md-error) {
    color: var(--gx-chat-red, #b43a3d);
    margin: 0;
  }
}

.thinking-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 4rpx 0 2rpx;
}

.thinking-bars {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.bar {
  height: 18rpx;
  border-radius: 999rpx;
  background: linear-gradient(
    90deg,
    rgba(236, 205, 187, 0.45) 0%,
    rgba(250, 229, 226, 0.95) 45%,
    rgba(236, 205, 187, 0.45) 100%
  );
  background-size: 200% 100%;
  animation: gx-thinking-shimmer 1.2s ease-in-out infinite;

  &.short {
    width: 56%;
  }

  &.mid {
    width: 78%;
  }
}

.thinking-text {
  font-size: 24rpx;
  color: var(--gx-chat-muted, #755d52);
}

@keyframes gx-thinking-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.feedback {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding-top: 14rpx;
  border-top: 1rpx solid rgba(236, 205, 187, 0.55);
}

.feedback-label {
  width: 100%;
  font-size: 22rpx;
  color: var(--gx-chat-hint, #a28777);
}

.fb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  border: 2rpx solid rgba(236, 205, 187, 0.8);
  font-size: 22rpx;
  color: var(--gx-chat-muted, #755d52);

  &.selected {
    border-color: var(--gx-chat-red, #b43a3d);
    color: var(--gx-chat-red, #b43a3d);
    background: rgba(180, 58, 61, 0.06);
  }
}

.fb-icon {
  font-size: 20rpx;
  font-weight: 800;
}
</style>
