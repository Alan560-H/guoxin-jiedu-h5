<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <view class="name_item">
    {{ text }}
    <view class="line diagonal-1" />
    <view class="line diagonal-2" />
    <view class="line horizontal" />
    <view class="line vertical" />
  </view>
</template>

<style scoped lang="scss">
.name_item {
  width: 120rpx;
  height: 120rpx;
  opacity: 1;
  border: 1px solid #492310;
  font-size: 26rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #3d3d3d;
  position: relative;
}

.line {
  position: absolute;
  background-color: #a78e6f;
  opacity: 0.2;
}

.diagonal-1 {
  width: 1px;
  height: 100%;
  transform: rotate(45deg);
  top: 0;
  left: 30rpx;
}

.diagonal-2 {
  width: 1px;
  height: 100%;
  transform: rotate(-45deg);
  top: 0;
  right: 30rpx;
}

.horizontal {
  width: 100%;
  height: 1px;
  top: 30rpx;
  left: 0;
}

.vertical {
  width: 1px;
  height: 100%;
  top: 0;
  left: 30rpx;
}
</style>
