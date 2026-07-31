<script setup lang="ts">
import type { ProfileVo } from '@/models/guoxin/profile'
import { computed } from 'vue'
import { INVITE_BAZI_FEATURE_ENABLED } from '@/constants/chatHome'

const props = withDefaults(defineProps<{
  profiles: ProfileVo[]
  activeId: string
  compact?: boolean
}>(), {
  compact: false,
})

const emit = defineEmits<{
  select: [id: string]
  add: []
  invite: []
}>()

const showInviteEntry = INVITE_BAZI_FEATURE_ENABLED

const activeName = computed(() => {
  const hit = props.profiles.find(p => p.id === props.activeId)
  return hit?.name || '暂未添加'
})

function sealChar(name: string) {
  const t = name.trim()
  return t ? t.slice(0, 1) : '?'
}
</script>

<template>
  <view class="avatar-switcher" :class="{ compact: props.compact }">
    <view class="switcher-head">
      <view>
        <text class="head-label">
          当前解读用户
        </text>
        <text class="head-name">
          {{ activeName }}
        </text>
      </view>
      <view
        v-if="showInviteEntry"
        class="invite-btn"
        @tap="emit('invite')"
      >
        邀请好友
      </view>
    </view>

    <view class="switcher-row">
      <scroll-view scroll-x class="user-scroll" :show-scrollbar="false">
        <view class="user-list">
          <text v-if="!profiles.length" class="user-empty">
            暂无用户，点击右侧添加
          </text>
          <view
            v-for="p in profiles"
            :key="p.id"
            class="user-option"
            :class="{ active: p.id === activeId }"
            @tap="emit('select', p.id)"
          >
            <view class="user-avatar">
              <text>{{ sealChar(p.name) }}</text>
              <view v-if="p.id === activeId" class="check-badge">
                ✓
              </view>
            </view>
            <text class="user-name">
              {{ p.name }}
            </text>
          </view>
        </view>
      </scroll-view>
      <view class="add-user" @tap="emit('add')">
        <text class="add-plus">
          ＋
        </text>
        <text class="add-label">
          添加
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.avatar-switcher {
  margin-bottom: 24rpx;
  padding: 22rpx 24rpx 20rpx;
  border: 3rpx solid rgba(180, 58, 61, 0.22);
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 94% 0%, rgba(180, 58, 61, 0.12), transparent 34%),
    rgba(255, 253, 248, 0.97);
  box-shadow: var(--gx-chat-shadow, 0 8rpx 24rpx rgba(121, 38, 32, 0.1));

  &.compact {
    padding-top: 18rpx;
    padding-bottom: 16rpx;
    margin-bottom: 20rpx;
  }
}

.switcher-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.head-label {
  display: block;
  color: var(--gx-chat-hint, #a28777);
  font-size: 20rpx;
}

.head-name {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 26rpx;
  font-weight: 700;
}

.invite-btn {
  min-height: 60rpx;
  padding: 0 20rpx;
  border: 2rpx solid rgba(180, 58, 61, 0.25);
  border-radius: 999rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.switcher-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  min-width: 0;
}

.user-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.user-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 2rpx;
  align-items: flex-start;
}

.user-empty {
  display: inline-flex;
  align-items: center;
  min-height: 108rpx;
  padding: 0 8rpx;
  color: var(--gx-chat-hint, #a28777);
  font-size: 22rpx;
  white-space: normal;
  max-width: 320rpx;
  line-height: 1.4;
}

.user-option {
  width: 108rpx;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.user-avatar {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 36rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-option.active .user-avatar {
  border-color: var(--gx-chat-red, #b43a3d);
  background: linear-gradient(135deg, var(--gx-chat-red, #b43a3d), #d96a6c);
  color: #fffdf7;
}

.check-badge {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: var(--gx-chat-red, #b43a3d);
  color: #fff;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.user-name {
  max-width: 108rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 22rpx;
  color: var(--gx-chat-muted, #755d52);
  text-align: center;
}

.user-option.active .user-name {
  color: var(--gx-chat-red, #b43a3d);
  font-weight: 700;
}

.add-user {
  width: 108rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.add-plus {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 3rpx dashed rgba(162, 135, 119, 0.55);
  color: var(--gx-chat-muted, #755d52);
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.add-label {
  font-size: 22rpx;
  color: var(--gx-chat-hint, #a28777);
}
</style>
