<script setup lang="ts">
import { ref } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxButton from './GxButton.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const store = useGuoxinStore()

const phone = ref('')
const code = ref('')
const agreed = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function sendCode() {
  if (!phone.value.match(/^1[3-9]\d{9}$/)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
    return
  }
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  uni.showToast({ title: '验证码已发送', icon: 'success' })
}

function handleLogin() {
  if (!phone.value.match(/^1[3-9]\d{9}$/)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
    return
  }
  if (!code.value || code.value.length < 4) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意协议政策', icon: 'none' })
    return
  }

  // Set store state to logged in
  store.isLoggedIn = true
  uni.showToast({ title: '登录成功', icon: 'success' })
  emit('success')
  emit('close')
}

function openServiceAgreement() {
  uni.navigateTo({ url: RouterPaths.legalService })
}

function openPrivacyAgreement() {
  uni.navigateTo({ url: RouterPaths.legalPrivacy })
}
</script>

<template>
  <view v-if="props.show" class="modal-overlay">
    <view class="modal-card">
      <!-- Top Close Button -->
      <view class="close-x" @tap="emit('close')">×</view>

      <view class="login-header">
        <view class="login-logo">国心解读</view>
        <view class="login-welcome">欢迎登录心语小助手</view>
      </view>

      <view class="login-form">
        <!-- Phone Input -->
        <view class="input-item">
          <input
            v-model="phone"
            type="number"
            :maxlength="11"
            class="custom-input"
            placeholder="请输入手机号码"
          />
        </view>

        <!-- SMS Code Input -->
        <view class="input-item code-input-row">
          <input
            v-model="code"
            type="number"
            :maxlength="6"
            class="custom-input flex_1"
            placeholder="请输入短信验证码"
          />
          <button
            class="sms-btn"
            :disabled="countdown > 0"
            @tap="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
          </button>
        </view>

        <!-- Agreement checkbox -->
        <view class="agreement-row flex_row f_a_center" @tap="agreed = !agreed">
          <view class="custom-checkbox" :class="{ checked: agreed }">
            <text v-if="agreed" class="check-mark">✓</text>
          </view>
          <view class="agreement-text">
            我已阅读并同意
            <text class="link-text" @tap.stop="openServiceAgreement">《用户协议》</text>与
            <text class="link-text" @tap.stop="openPrivacyAgreement">《隐私协议》</text>
          </view>
        </view>

        <!-- Submit button -->
        <view class="submit-wrap">
          <GxButton type="primary" @click="handleLogin">
            立即登录
          </GxButton>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(38, 46, 42, 0.6);
  backdrop-filter: blur(4rpx);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background-color: #FCF5E9;
  background-image: url("/static/assets/rice-paper-bg.svg");
  border-radius: 40rpx;
  width: 85%;
  max-width: 600rpx;
  padding: 48rpx 36rpx;
  box-shadow: 0 18rpx 38rpx rgba(55, 38, 20, 0.25);
  border: 4rpx solid #B9945F;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 20rpx;
  right: 30rpx;
  font-size: 56rpx;
  color: #958878;
  cursor: pointer;
  line-height: 1;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 40rpx;

  .login-logo {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 48rpx;
    font-weight: 900;
    color: #153F33;
    letter-spacing: 4rpx;
    margin-bottom: 8rpx;
  }

  .login-welcome {
    font-size: 26rpx;
    color: #665B4E;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  box-sizing: border-box;
}

.input-item {
  box-sizing: border-box;
}

.custom-input {
  width: 100%;
  height: 96rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(185, 148, 95, 0.35);
  background: rgba(255, 253, 247, 0.88);
  color: #241F19;
  font-size: 28rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: #153F33;
  }
}

.code-input-row {
  display: flex;
  gap: 16rpx;
}

.sms-btn {
  height: 96rpx;
  border-radius: 20rpx;
  background-color: #EEF3EA;
  color: #153F33;
  border: 2rpx solid rgba(185, 148, 95, 0.35);
  font-size: 26rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;

  &[disabled] {
    color: #958878;
    background-color: #E2DCD3;
    cursor: not-allowed;
  }
}

.agreement-row {
  gap: 16rpx;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox {
  width: 34rpx;
  height: 34rpx;
  border-radius: 6rpx;
  border: 2rpx solid #958878;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;

  &.checked {
    border-color: #153F33;
    background-color: #153F33;
  }

  .check-mark {
    color: #FCF5E9;
    font-size: 22rpx;
    font-weight: 700;
  }
}

.agreement-text {
  font-size: 24rpx;
  color: #665B4E;
  line-height: 1.4;

  .link-text {
    color: #153F33;
    font-weight: 700;
  }
}

.submit-wrap {
  margin-top: 16rpx;

  :deep(.gx-btn-wrap) {
    width: 100%;
  }
}
</style>
