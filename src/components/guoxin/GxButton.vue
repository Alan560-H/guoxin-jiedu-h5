<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'primary' | 'secondary' | 'outline'
  size?: 'md' | 'sm'
  disabled?: boolean
}>(), {
  type: 'primary',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (!props.disabled)
    emit('click')
}
</script>

<template>
  <view
    class="gx-btn-wrap"
    :class="[`gx-btn-${props.type}`, `gx-btn-${props.size}`, { disabled: props.disabled }]"
    @tap="handleClick"
  >
    <slot />
  </view>
</template>

<style scoped lang="scss">
.gx-btn-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  font-family: "Noto Serif SC", Georgia, serif;
  font-weight: 900;
  letter-spacing: 2rpx;
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(74, 49, 21, 0.06);

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.gx-btn-md {
  min-height: 96rpx;
  font-size: calc(32rpx * var(--gx-font-scale));
}

.gx-btn-sm {
  min-height: 76rpx;
  font-size: calc(26rpx * var(--gx-font-scale));
}

.gx-btn-primary {
  background: linear-gradient(180deg, #1E5546 0%, #153F33 100%);
  color: #FCF5E9;
  border: 4rpx solid rgba(217, 193, 144, 0.72);
  box-shadow:
    inset 0 2rpx 0 rgba(255, 255, 255, 0.16),
    0 8rpx 18rpx rgba(21, 63, 51, 0.22);
  padding: 0 96rpx;
  position: relative;
  overflow: hidden;

  /* Left/Right Cloud Vectors decoration */
  &::before,
  &::after {
    content: "";
    position: absolute;
    bottom: -10rpx;
    width: 130rpx;
    height: 70rpx;
    background: url("/static/assets/button-cloud.svg") center / contain no-repeat;
    opacity: 0.85;
    pointer-events: none;
  }

  &::before {
    left: 10rpx;
  }

  &::after {
    right: 10rpx;
    transform: scaleX(-1);
  }
}

.gx-btn-secondary {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  color: #153F33;
  border: 2rpx solid rgba(185, 148, 95, 0.58);
}

.gx-btn-outline {
  background: transparent;
  color: #153F33;
  border: 4rpx solid #153F33;
}

.gx-btn-wrap.disabled {
  background: linear-gradient(180deg, rgba(239, 226, 202, 0.72), rgba(232, 222, 202, 0.72)) !important;
  color: #958878 !important;
  border: 2rpx solid rgba(185, 148, 95, 0.32) !important;
  cursor: not-allowed;
  box-shadow: none !important;
  opacity: 1;

  &::before,
  &::after {
    opacity: 0.2;
  }
}
</style>
