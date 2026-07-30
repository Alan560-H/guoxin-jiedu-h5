<script setup lang="ts">
/**
 * 联系客服：弹窗展示企业微信二维码
 */
import { CUSTOMER_SERVICE_QR_URL } from '@/utils/guoxin/customerService'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <view v-if="props.show" class="modal-root">
    <view class="modal-mask" @tap="emit('close')" />
    <view class="modal-card" @tap.stop>
      <view class="close-x" @tap="emit('close')">
        ×
      </view>
      <text class="eyebrow">
        联系客服
      </text>
      <text class="title">
        扫码添加专属顾问
      </text>
      <text class="copy">
        截屏使用微信扫一扫图中二维码，咨询开通、支付与权益问题。也可长按二维码保存到相册。
      </text>

      <view class="qr-wrap">
        <image
          class="qr-img"
          :src="CUSTOMER_SERVICE_QR_URL"
          mode="aspectFit"
          show-menu-by-longpress
        />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 10060;
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
  padding: 40rpx 36rpx 36rpx;
  border-radius: 32rpx;
  background: #fffdf8;
  border: 2rpx solid #eccdbb;
  box-shadow: 0 16rpx 40rpx rgba(121, 38, 32, 0.16);
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #a28777;
}

.eyebrow {
  display: block;
  font-size: 22rpx;
  font-weight: 800;
  color: #b43a3d;
}

.title {
  display: block;
  margin-top: 10rpx;
  font-size: 36rpx;
  font-weight: 800;
  color: #2b1712;
}

.copy {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.55;
  color: #755d52;
}

.qr-wrap {
  margin: 28rpx auto 8rpx;
  width: 360rpx;
  height: 360rpx;
  padding: 16rpx;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: #fff;
  border: 2rpx solid rgba(236, 205, 187, 0.9);
}

.qr-img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
