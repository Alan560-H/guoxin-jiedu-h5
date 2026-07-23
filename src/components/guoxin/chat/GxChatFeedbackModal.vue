<script setup lang="ts">
import { ref, watch } from 'vue'
import { FEEDBACK_REASONS } from '@/constants/chatHome'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: { reason: string, note: string }]
}>()

const reason = ref('')
const note = ref('')

watch(
  () => props.show,
  (v) => {
    if (v) {
      reason.value = ''
      note.value = ''
    }
  },
)

function onSubmit() {
  if (!reason.value) {
    uni.showToast({ title: '请选择改进原因', icon: 'none' })
    return
  }
  emit('submit', { reason: reason.value, note: note.value.trim() })
}

function onNoteInput(e: { detail?: { value?: string } }) {
  note.value = e.detail?.value ?? ''
}
</script>

<template>
  <view v-if="show" class="modal-root">
    <view class="modal-mask" @tap="emit('close')" />
    <view class="modal-card" @tap.stop>
      <view class="close-x" @tap="emit('close')">
        ×
      </view>
      <text class="eyebrow">
        回答反馈
      </text>
      <text class="title">
        这次回答哪里需要改进？
      </text>
      <view class="reason-list">
        <view
          v-for="item in FEEDBACK_REASONS"
          :key="item"
          class="reason-btn"
          :class="{ selected: reason === item }"
          @tap="reason = item"
        >
          {{ item }}
        </view>
      </view>
      <text class="note-label">
        补充说明
      </text>
      <textarea
        class="note-input"
        :value="note"
        maxlength="120"
        placeholder="可选，告诉我们你的真实感受"
        @input="onNoteInput"
      />
      <view class="btn primary" @tap="onSubmit">
        提交反馈
      </view>
      <view class="btn secondary" @tap="emit('close')">
        取消
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 10020;
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
  width: 100%;
  max-width: 620rpx;
  padding: 44rpx 36rpx 36rpx;
  border-radius: 28rpx;
  background: #fffdf8;
  box-shadow: 0 20rpx 48rpx rgba(43, 23, 18, 0.22);
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 16rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  color: var(--gx-chat-hint, #a28777);
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eyebrow {
  display: block;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 22rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.title {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 24rpx;
}

.reason-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.reason-btn {
  min-height: 72rpx;
  padding: 0 16rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #fffaf2;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &.selected {
    border-color: var(--gx-chat-red, #b43a3d);
    background: var(--gx-chat-red-soft, #fae5e2);
    color: var(--gx-chat-red-deep, #7f1f26);
  }
}

.note-label {
  display: block;
  margin-bottom: 10rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
}

.note-input {
  width: 100%;
  min-height: 140rpx;
  margin-bottom: 28rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #fff;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 26rpx;
  line-height: 1.45;
  box-sizing: border-box;
}

.btn {
  min-height: 88rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  &.primary {
    background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
    color: #fffdf7;
  }

  &.secondary {
    background: #fff4ec;
    color: var(--gx-chat-brown, #7c402a);
    border: 2rpx solid var(--gx-chat-border, #eccdbb);
  }
}
</style>
