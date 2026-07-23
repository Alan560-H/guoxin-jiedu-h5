<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const store = useGuoxinStore()
const { locking: submitting, runLocked: runSubmitLocked } = useActionLock()
const { locking: sendingCode, runLocked: runSendCodeLocked } = useActionLock()

const phone = ref('')
const code = ref('')
const agreed = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

watch(
  () => props.show,
  (v) => {
    if (!v)
      return
    phone.value = ''
    code.value = ''
    agreed.value = false
  },
)

async function sendCode() {
  if (!phone.value.match(/^1[3-9]\d{9}$/)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' })
    return
  }
  await runSendCodeLocked(async () => {
    uni.showLoading({ title: '发送中...' })
    const ok = await store.doSendSmsCode(phone.value)
    uni.hideLoading()
    if (!ok)
      return
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
    uni.showToast({ title: '验证码已发送', icon: 'success' })
  })
}

async function handleSubmit() {
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

  await runSubmitLocked(async () => {
    uni.showLoading({ title: '登录中...', mask: true })
    try {
      await store.doLoginBySms(phone.value, code.value)
      uni.hideLoading()
      uni.showToast({ title: '登录成功', icon: 'success' })
      emit('success')
      emit('close')
    }
    catch (e: any) {
      uni.hideLoading()
      console.error('登录失败', e)
      uni.showToast({ title: e?.message || '登录失败，请重试', icon: 'none' })
    }
  })
}

function openServiceAgreement() {
  uni.navigateTo({ url: RouterPaths.legalService })
}

function openPrivacyAgreement() {
  uni.navigateTo({ url: RouterPaths.legalPrivacy })
}
</script>

<template>
  <view v-if="props.show" class="modal-overlay" @tap="emit('close')">
    <view class="modal-card" @tap.stop>
      <view class="close-x" @tap="emit('close')">
        ×
      </view>
      <text class="eyebrow">
        登录后开始
      </text>
      <text class="title">
        还差一步即可和 AI 对话聊天
      </text>
      <text class="copy">
        登录后保存八字用户、问答记录和报告，每天可免费问 3 次，第二天自动恢复。
      </text>

      <view class="field">
        <text class="label">
          手机号
        </text>
        <input
          v-model="phone"
          type="number"
          :maxlength="11"
          class="input"
          placeholder="请输入手机号"
        >
      </view>

      <view class="field">
        <text class="label">
          验证码
        </text>
        <view class="code-row">
          <input
            v-model="code"
            type="number"
            :maxlength="6"
            class="input flex-1"
            placeholder="请输入验证码"
          >
          <view
            class="sms-btn"
            :class="{ disabled: countdown > 0 || sendingCode }"
            @tap="countdown > 0 || sendingCode ? undefined : sendCode()"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </view>
        </view>
      </view>

      <view class="agreement" @tap="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed">
            ✓
          </text>
        </view>
        <view class="agreement-text">
          我已阅读并同意
          <text class="link" @tap.stop="openServiceAgreement">
            《用户协议》
          </text>
          与
          <text class="link" @tap.stop="openPrivacyAgreement">
            《隐私政策》
          </text>
        </view>
      </view>

      <view
        class="btn primary"
        :class="{ disabled: submitting }"
        @tap="submitting ? undefined : handleSubmit()"
      >
        登录并继续
      </view>
      <view class="btn secondary" @tap="emit('close')">
        暂不登录
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(43, 23, 18, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 640rpx;
  max-height: 90vh;
  overflow-y: auto;
  padding: 40rpx 36rpx 32rpx;
  border-radius: 32rpx;
  background: var(--gx-chat-paper, #fffdf8);
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 16rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eyebrow {
  display: block;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 700;
}

.title {
  display: block;
  margin-top: 12rpx;
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.25;
}

.copy {
  display: block;
  margin: 16rpx 0 28rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.55;
}

.field {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 24rpx;
  font-weight: 700;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #f9ebe8;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.flex-1 {
  flex: 1;
  min-width: 0;
}

.sms-btn {
  flex-shrink: 0;
  min-width: 180rpx;
  height: 88rpx;
  padding: 0 20rpx;
  border-radius: 20rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;

  &.disabled {
    opacity: 0.5;
  }
}

.agreement {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  margin: 8rpx 0 28rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  margin-top: 4rpx;
  border-radius: 8rpx;
  border: 2rpx solid var(--gx-chat-hint, #a28777);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20rpx;
  color: #fff;

  &.checked {
    background: var(--gx-chat-red, #b43a3d);
    border-color: var(--gx-chat-red, #b43a3d);
  }
}

.agreement-text {
  font-size: 22rpx;
  color: var(--gx-chat-muted, #755d52);
  line-height: 1.45;
}

.link {
  color: var(--gx-chat-red, #b43a3d);
  font-weight: 700;
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
    background: transparent;
    color: var(--gx-chat-muted, #755d52);
    border: 2rpx solid var(--gx-chat-border, #eccdbb);
  }

  &.disabled {
    opacity: 0.55;
  }
}
</style>
