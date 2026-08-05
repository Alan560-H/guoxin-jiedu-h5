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
    <view class="conversation-hero">
      <view class="hero-copy">
        <text class="hero-title">
          观心见性，
        </text>
        <text class="hero-title">
          顺势而行
        </text>
        <text class="hero-badge">
          国心老师
        </text>
        <text class="hero-desc">
          结合命理 · 看见选择 · 安顿内心
        </text>
      </view>
    </view>

    <GxAvatarSwitcher
      compact
      :profiles="profiles"
      :active-id="activeId"
      @select="emit('select', $event)"
      @add="emit('add')"
      @invite="emit('invite')"
    />

    <view v-if="historyLoadingOlder || historyHasMore" class="history-tip">
      <text v-if="historyLoadingOlder">
        正在加载更早对话…
      </text>
      <text v-else-if="historyHasMore">
        滚到顶部加载更早对话
      </text>
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
  padding: 0 28rpx 24rpx;
  box-sizing: border-box;
}

.history-tip {
  margin-bottom: 16rpx;
  text-align: center;
  font-size: 22rpx;
  color: var(--gx-chat-hint, #a28777);
}

.conversation-hero {
  position: relative;
  height: 500rpx;
  margin: 0 -28rpx;
  background: url("@/static/assets/gx-sage-hero.webp") center top / cover no-repeat;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 112rpx;
    background: linear-gradient(180deg, rgba(247, 240, 224, 0), var(--gx-chat-bg));
    pointer-events: none;
  }
}

.hero-copy {
  position: absolute;
  z-index: 1;
  top: 150rpx;
  left: 51%;
  right: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero-title {
  color: #2d2118;
  font-family: "Noto Serif SC", STSong, serif;
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: 4rpx;
  white-space: nowrap;
  text-shadow: 0 2rpx 8rpx rgba(255, 251, 240, 0.88);
}

.hero-badge {
  margin-top: 18rpx;
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #d99a30, #b86e17);
  color: #fff9ed;
  font-size: 24rpx;
  line-height: 1.3;
  box-shadow: 0 6rpx 14rpx rgba(128, 75, 18, 0.18);
}

.hero-desc {
  margin-top: 16rpx;
  color: #4e4034;
  font-family: "Noto Serif SC", STSong, serif;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
  text-shadow: 0 1rpx 6rpx rgba(255, 251, 240, 0.94);
}

.bottom-anchor {
  height: 2rpx;
}
</style>
