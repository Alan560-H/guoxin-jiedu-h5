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
  position: relative;
  z-index: 3;
  margin: -48rpx 0 24rpx;
  padding: 30rpx 28rpx 26rpx;
  border: 2rpx solid rgba(186, 133, 65, 0.38);
  border-radius: 34rpx;
  background: rgba(255, 250, 239, 0.97);
  box-shadow: 0 12rpx 28rpx rgba(91, 60, 27, 0.11);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    z-index: 0;
    right: 48rpx;
    top: 8rpx;
    width: 360rpx;
    height: 240rpx;
    background: url("@/static/assets/gx-white-clouds.png") center / contain no-repeat;
    opacity: 0.46;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    z-index: 0;
    right: 24rpx;
    top: -8rpx;
    width: 68rpx;
    height: 112rpx;
    background: url("@/static/assets/gx-auspicious-charm.webp") center / contain no-repeat;
    pointer-events: none;
  }

  &.compact {
    padding-top: 28rpx;
    padding-bottom: 24rpx;
    margin-bottom: 24rpx;
  }

}

.avatar-switcher > * {
  position: relative;
  z-index: 1;
}

.avatar-switcher {
  box-shadow:
    inset 0 0 0 8rpx rgba(255, 250, 239, 0.9),
    inset 0 0 0 10rpx rgba(186, 133, 65, 0.22),
    0 12rpx 28rpx rgba(91, 60, 27, 0.11);
}

.switcher-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 20rpx;
  padding-right: 102rpx;
}

.head-label {
  display: block;
  color: #75685b;
  font-size: 20rpx;
}

.head-name {
  display: block;
  margin-top: 4rpx;
  color: #211b16;
  font-family: "Noto Serif SC", STSong, serif;
  font-size: 32rpx;
  font-weight: 800;
}

.invite-btn {
  min-height: 60rpx;
  padding: 0 20rpx;
  border: 2rpx solid rgba(177, 91, 55, 0.42);
  border-radius: 999rpx;
  background: rgba(255, 247, 232, 0.9);
  color: #a3422c;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.switcher-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.user-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.user-list {
  display: inline-flex;
  gap: 12rpx;
  padding: 4rpx 2rpx;
  align-items: flex-start;
}

.user-empty {
  display: inline-flex;
  align-items: center;
  min-height: 82rpx;
  padding: 0 8rpx;
  color: var(--gx-chat-hint, #a28777);
  font-size: 22rpx;
  white-space: normal;
  max-width: 320rpx;
  line-height: 1.4;
}

.user-option {
  width: 78rpx;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.user-avatar {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  border: 2rpx solid rgba(190, 92, 57, 0.34);
  background: rgba(255, 247, 234, 0.86);
  color: #b04b33;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-option.active .user-avatar {
  border-color: #b95b3c;
  background: linear-gradient(145deg, #fff6e7, #f8e8d5);
  color: #a83f29;
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.72);
}

.check-badge {
  position: absolute;
  right: -3rpx;
  bottom: -3rpx;
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  background: #b54b31;
  color: #fff;
  font-size: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.user-name {
  max-width: 78rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18rpx;
  color: var(--gx-chat-muted, #755d52);
  text-align: center;
}

.user-option.active .user-name {
  color: var(--gx-chat-red, #b43a3d);
  font-weight: 700;
}

.add-user {
  width: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  min-height: 58rpx;
  margin-left: auto;
  padding: 0 20rpx;
  border: 2rpx solid rgba(185, 91, 56, 0.38);
  border-radius: 999rpx;
  background: rgba(255, 247, 232, 0.92);
  color: #a9442e;
}

.add-plus {
  width: auto;
  height: auto;
  border: 0;
  color: currentColor;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.add-label {
  font-size: 22rpx;
  color: currentColor;
}
</style>
