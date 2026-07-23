<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getPageShareUrl } from '@/utils/weixin/env'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  preview: []
}>()

const inviteLink = ref('')

const displayLink = computed(() => inviteLink.value || '生成中…')

watch(
  () => props.show,
  (v) => {
    if (!v)
      return
    inviteLink.value = buildInviteLink()
  },
)

function buildInviteLink() {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    const base = getPageShareUrl() || `${window.location.origin}${window.location.pathname}`
    try {
      const url = new URL(base, window.location.origin)
      url.searchParams.set('scene', 'invite')
      url.searchParams.set('from', 'guoxin')
      return url.toString()
    }
    catch {
      return `${base}${base.includes('?') ? '&' : '?'}scene=invite&from=guoxin`
    }
  }
  // #endif
  return '/pages/index?scene=invite&from=guoxin'
}

function copyLink() {
  const link = inviteLink.value || buildInviteLink()
  if (!link) {
    uni.showToast({ title: '链接生成失败', icon: 'none' })
    return
  }
  uni.setClipboardData({
    data: link,
    success: () => {
      uni.showToast({ title: '邀请链接已复制', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请长按链接复制', icon: 'none' })
    },
  })
}

function onPreview() {
  emit('preview')
  emit('close')
}
</script>

<template>
  <view v-if="props.show" class="modal-root">
    <view class="modal-mask" @tap="emit('close')" />
    <view class="modal-card" @tap.stop>
      <view class="close-x" @tap="emit('close')">
        ×
      </view>
      <text class="eyebrow">
        邀请填写八字
      </text>
      <text class="title">
        让TA自己填写更准确
      </text>
      <text class="copy">
        复制链接发给对方。对方登录、填写并确认授权后，这位八字用户会出现在你的用户列表。
      </text>

      <view class="link-box">
        <text class="link-label">
          邀请链接
        </text>
        <view class="link-input">
          <text class="link-text" user-select>
            {{ displayLink }}
          </text>
        </view>
      </view>

      <view class="btn primary" @tap="copyLink">
        复制邀请链接
      </view>
      <view class="btn secondary" @tap="onPreview">
        预览好友填写页
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(43, 23, 18, 0.48);
}

.modal-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 640rpx;
  padding: 40rpx 36rpx 32rpx;
  border-radius: 32rpx;
  background: #fffbf5;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red, #b43a3d);
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eyebrow {
  display: block;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 26rpx;
  font-weight: 700;
}

.title {
  display: block;
  margin-top: 12rpx;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.25;
}

.copy {
  display: block;
  margin: 16rpx 0 28rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 26rpx;
  line-height: 1.55;
}

.link-box {
  padding: 20rpx;
  border-radius: 20rpx;
  background: #fff1e8;
  margin-bottom: 28rpx;
}

.link-label {
  display: block;
  margin-bottom: 12rpx;
  color: var(--gx-chat-brown, #7c402a);
  font-size: 24rpx;
  font-weight: 700;
}

.link-input {
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  background: #fff;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
}

.link-text {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 24rpx;
  line-height: 1.4;
  word-break: break-all;
}

.btn {
  min-height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 16rpx;

  &.primary {
    background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
    color: #fffdf7;
  }

  &.secondary {
    background: var(--gx-chat-red-soft, #fae5e2);
    color: var(--gx-chat-red-deep, #7f1f26);
    border: 2rpx solid rgba(180, 58, 61, 0.35);
  }
}
</style>
