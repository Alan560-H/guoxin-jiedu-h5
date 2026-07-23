<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
}>()

const draft = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (v) => {
    if (v !== draft.value)
      draft.value = v || ''
  },
)

function onInput(e: { detail?: { value?: string } }) {
  const v = e.detail?.value ?? ''
  draft.value = v
  emit('update:modelValue', v)
}

function onSubmit() {
  if (props.disabled)
    return
  emit('submit')
}
</script>

<template>
  <view class="composer">
    <input
      class="composer-input"
      :value="draft"
      :disabled="disabled"
      :placeholder="placeholder || '输入你的问题'"
      confirm-type="send"
      @input="onInput"
      @confirm="onSubmit"
    >
    <view
      class="composer-send"
      :class="{ disabled }"
      @tap="onSubmit"
    >
      发送
    </view>
  </view>
</template>

<style scoped lang="scss">
.composer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 246, 238, 0.96);
  border-top: 2rpx solid rgba(236, 205, 187, 0.8);
}

.composer-input {
  flex: 1;
  min-width: 0;
  height: 84rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
}

.composer-send {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 20rpx rgba(127, 31, 38, 0.28);

  &.disabled {
    opacity: 0.45;
  }
}
</style>
