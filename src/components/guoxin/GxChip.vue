<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  selected?: boolean
  multi?: boolean
}>(), {
  selected: false,
  multi: false,
})

const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <view
    class="gx-chip"
    :class="{ selected: props.selected }"
    @tap="emit('toggle')"
  >
    <slot>{{ label }}</slot>
  </view>
</template>

<style scoped lang="scss">
.gx-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 24rpx;
  margin: 0 12rpx 12rpx 0;
  border-radius: 16rpx;
  border: 2rpx solid var(--gx-border);
  background: #fff;
  color: var(--gx-text-sub);
  font-size: calc(26rpx * var(--gx-font-scale));
}

.gx-chip.selected {
  border-color: var(--gx-green);
  background: var(--gx-green-light);
  color: var(--gx-green);
  font-weight: 600;
}
</style>
