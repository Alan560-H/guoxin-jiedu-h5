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
  border-radius: 28rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.gx-btn-md {
  min-height: 96rpx;
  font-size: calc(32rpx * var(--gx-font-scale));
}

.gx-btn-sm {
  min-height: 76rpx;
  font-size: calc(28rpx * var(--gx-font-scale));
}

.gx-btn-primary {
  background: linear-gradient(135deg, #C9A84C, #A07830);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(160, 100, 30, 0.25);
}

.gx-btn-secondary {
  background: var(--gx-green-light);
  color: var(--gx-green);
  border: 2rpx solid var(--gx-green);
}

.gx-btn-outline {
  background: transparent;
  color: var(--gx-text-sub);
  border: 2rpx solid var(--gx-border);
}

.gx-btn-wrap.disabled {
  opacity: 0.45;
}
</style>
