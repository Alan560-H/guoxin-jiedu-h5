<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  nickname: string
  avatarUrl?: string
  statusLabel?: string
  subtitle?: string
}>(), {
  avatarUrl: '',
  statusLabel: '',
  subtitle: '',
})

const avatarFailed = ref(false)

watch(() => props.avatarUrl, () => {
  avatarFailed.value = false
})

const avatarChar = computed(() => {
  const n = (props.nickname || '').trim()
  return n ? n.slice(0, 1) : '游'
})

const showImage = computed(() => {
  const url = (props.avatarUrl || '').trim()
  return Boolean(url) && !avatarFailed.value
})

function onAvatarError() {
  avatarFailed.value = true
}
</script>

<template>
  <view class="user-brief">
    <view class="avatar-wrap">
      <image
        v-if="showImage"
        class="avatar-img"
        :src="props.avatarUrl"
        mode="aspectFill"
        @error="onAvatarError"
      />
      <view v-else class="avatar-fallback">
        {{ avatarChar }}
      </view>
    </view>
    <view class="copy">
      <text class="name">
        {{ props.nickname }}
      </text>
      <text v-if="props.subtitle" class="subtitle">
        {{ props.subtitle }}
      </text>
    </view>
    <text v-if="props.statusLabel" class="status-tag">
      {{ props.statusLabel }}
    </text>
  </view>
</template>

<style scoped lang="scss">
/* 嵌入红色会员权益卡内的用户行，无独立卡片底 */
.user-brief {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.avatar-wrap {
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(240, 193, 90, 0.95);
  overflow: hidden;
  box-sizing: border-box;
  background: rgba(255, 253, 247, 0.14);
}

.avatar-img {
  width: 100%;
  height: 100%;
  display: block;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 253, 247, 0.18);
  color: #fffdf7;
  font-size: 36rpx;
  font-weight: 800;
}

.copy {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  color: #fffdf7;
  font-size: 32rpx;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  display: block;
  margin-top: 6rpx;
  color: rgba(255, 253, 247, 0.78);
  font-size: 22rpx;
  line-height: 1.4;
}

.status-tag {
  flex-shrink: 0;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f0c15a, var(--gx-chat-gold, #d5a43d));
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 22rpx;
  font-weight: 800;
}
</style>
