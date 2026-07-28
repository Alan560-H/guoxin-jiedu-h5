<script setup lang="ts">
import type { ProfileVo } from '@/models/guoxin/profile'
import type { ChatMessage, FeedbackState } from '@/stores/chatSessionStore'
import GxAvatarSwitcher from '@/components/guoxin/chat/GxAvatarSwitcher.vue'
import GxChatFollowupPanel from '@/components/guoxin/chat/GxChatFollowupPanel.vue'
import GxChatMessageList from '@/components/guoxin/chat/GxChatMessageList.vue'
import GxChatQuotaCard from '@/components/guoxin/chat/GxChatQuotaCard.vue'
import GxChatReportAd from '@/components/guoxin/chat/GxChatReportAd.vue'

defineProps<{
  profiles: ProfileVo[]
  activeId: string
  messages: ChatMessage[]
  userSeal: string
  remaining: number
  progressRatio: number
  chatUnlimited: boolean
  hasConversation: boolean
  quotaUsedUp: boolean
  followupHeading: string
  followupLead: string
  followupMeta: string
  followupItems: Array<{ question: string, tip: string }>
  historyHasMore?: boolean
  historyLoadingOlder?: boolean
  /** 流式输出中：隐藏消息下方小部件，避免「贴底」滚到追问/报告区 */
  streamingOutput?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  add: []
  invite: []
  feedback: [payload: { messageId: string, feedback: FeedbackState }]
  buy: []
  refreshFollowup: []
  pickFollowup: [q: string]
  generateReport: []
}>()
</script>

<template>
  <view class="chat-inner">
    <view v-if="historyLoadingOlder || historyHasMore" class="history-tip">
      <text v-if="historyLoadingOlder">
        正在加载更早对话…
      </text>
      <text v-else-if="historyHasMore">
        滚到顶部加载更早对话
      </text>
    </view>

    <GxAvatarSwitcher
      compact
      :profiles="profiles"
      :active-id="activeId"
      @select="emit('select', $event)"
      @add="emit('add')"
      @invite="emit('invite')"
    />

    <view class="conversation-cover compact">
      <view class="cover-copy">
        <text class="cover-eyebrow">
          正在解读
        </text>
        <text class="cover-title">
          继续说下去
        </text>
        <text class="cover-desc">
          你可以沿着当前问题继续问，我会把关键点拆得更清楚。
        </text>
      </view>
      <view class="cover-token" aria-hidden="true">
        聊
      </view>
    </view>

    <GxChatMessageList
      :messages="messages"
      :user-seal="userSeal"
      @feedback="emit('feedback', $event)"
    />

    <template v-if="!streamingOutput">
      <GxChatQuotaCard
        :remaining="remaining"
        :progress-ratio="progressRatio"
        :unlimited="chatUnlimited"
        @buy="emit('buy')"
      />

      <GxChatFollowupPanel
        v-if="hasConversation || quotaUsedUp"
        :heading="followupHeading"
        :lead="followupLead"
        :meta="followupMeta"
        :items="followupItems"
        :empty="quotaUsedUp"
        @refresh="emit('refreshFollowup')"
        @pick="emit('pickFollowup', $event)"
        @buy="emit('buy')"
      />

      <GxChatReportAd @generate="emit('generateReport')" />
    </template>

    <view id="chat-bottom-anchor" class="bottom-anchor" />
  </view>
</template>

<style scoped lang="scss">
.chat-inner {
  padding: 20rpx 28rpx 24rpx;
  box-sizing: border-box;
}

.history-tip {
  margin-bottom: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: var(--gx-chat-hint, #a28777);
}

.conversation-cover {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx 22rpx;
  border-radius: var(--gx-chat-radius, 32rpx);
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background:
    linear-gradient(135deg, rgba(255, 253, 248, 0.98), rgba(255, 241, 232, 0.92));
  box-shadow: var(--gx-chat-shadow, 0 8rpx 24rpx rgba(121, 38, 32, 0.08));
  overflow: hidden;

  &.compact {
    padding-top: 20rpx;
    padding-bottom: 18rpx;
  }
}

.cover-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.cover-eyebrow {
  color: var(--gx-chat-red, #b43a3d);
  font-size: 22rpx;
  font-weight: 700;
}

.cover-title {
  color: var(--gx-chat-ink, #2b1712);
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.25;
}

.cover-desc {
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.5;
}

.cover-token {
  flex-shrink: 0;
  width: 96rpx;
  height: 128rpx;
  border-radius: 48rpx 48rpx 24rpx 24rpx;
  border: 6rpx solid var(--gx-chat-gold-soft, #fff0c7);
  background: linear-gradient(180deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 44rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(127, 31, 38, 0.28);
  align-self: center;
}

.bottom-anchor {
  height: 2rpx;
}
</style>
