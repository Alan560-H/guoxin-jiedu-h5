<script setup lang="ts">
import { ref } from 'vue'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLoginModal from '@/components/guoxin/chat/GxChatLoginModal.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'

const store = useGuoxinStore()

const showLogin = ref(false)
const showBazi = ref(false)

function onBack() {
  navigateBackOrHome()
}

function onStartFill() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  showBazi.value = true
}

async function afterLogin() {
  await store.bootstrapAfterLogin()
  showBazi.value = true
}

function afterBaziSuccess() {
  // 产品确认不做独立邀请接口：提交即落在当前登录账号建档
  uni.showToast({ title: '已提交', icon: 'success' })
  setTimeout(() => {
    uni.reLaunch({ url: RouterPaths.home })
  }, 400)
}
</script>

<template>
  <view class="gx-chat-page invite-page">
    <GxChatHeader
      title="好友邀请"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="invite-scroll" :show-scrollbar="false">
      <view class="invite-inner">
        <view class="invite-hero-card">
          <view class="invite-seal">
            八
          </view>
          <text class="hero-p">
            好友邀请你完善八字
          </text>
          <text class="hero-h2">
            填写出生信息
          </text>
          <text class="hero-h2">
            让解读更贴近你
          </text>
          <text class="hero-span">
            登录后填写性别、历法、出生时间与地点，并授权给邀请人用于国心解读。
          </text>
        </view>

        <view class="invite-steps">
          <view class="step">
            <text class="step-num">
              1
            </text>
            <view class="step-copy">
              <text class="step-strong">
                登录确认身份
              </text>
              <text class="step-small">
                信息与授权记录更安全
              </text>
            </view>
          </view>
          <view class="step">
            <text class="step-num">
              2
            </text>
            <view class="step-copy">
              <text class="step-strong">
                填写八字信息
              </text>
              <text class="step-small">
                支持农历与真太阳时
              </text>
            </view>
          </view>
          <view class="step">
            <text class="step-num">
              3
            </text>
            <view class="step-copy">
              <text class="step-strong">
                确认授权提交
              </text>
              <text class="step-small">
                提交后可联系邀请人修改
              </text>
            </view>
          </view>
        </view>

        <view class="invite-start-button" @tap="onStartFill">
          登录后填写八字
        </view>
        <text class="privacy-note">
          填写即代表你确认将八字信息授权给邀请人用于问答和报告。
        </text>
      </view>
    </scroll-view>

    <GxChatLoginModal
      :show="showLogin"
      @close="showLogin = false"
      @success="afterLogin"
    />
    <GxBaziProfileModal
      :show="showBazi"
      invite-mode
      @close="showBazi = false"
      @success="afterBaziSuccess"
    />
  </view>
</template>

<style scoped lang="scss">
.invite-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.invite-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.invite-inner {
  padding: 24rpx 28rpx calc(40rpx + env(safe-area-inset-bottom));
}

.invite-hero-card {
  position: relative;
  margin-bottom: 28rpx;
  padding: 36rpx 28rpx;
  border-radius: 28rpx;
  border: 3rpx solid rgba(213, 164, 61, 0.5);
  background:
    radial-gradient(circle at 94% 8%, rgba(240, 194, 78, 0.32), transparent 28%),
    linear-gradient(145deg, var(--gx-chat-red-deep, #7f1f26), var(--gx-chat-red, #b43a3d));
  color: #fffdf7;
  overflow: hidden;
}

.invite-seal {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 240, 199, 0.55);
  background: rgba(255, 253, 247, 0.12);
  color: #ffe394;
  font-size: 40rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-p {
  display: block;
  color: #ffe394;
  font-size: 24rpx;
  font-weight: 800;
}

.hero-h2 {
  display: block;
  margin-top: 8rpx;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1.2;
}

.hero-span {
  display: block;
  margin-top: 16rpx;
  padding-right: 100rpx;
  font-size: 24rpx;
  line-height: 1.55;
  opacity: 0.88;
}

.invite-steps {
  margin-bottom: 32rpx;
  padding: 8rpx 0;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.step-num {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 28rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-copy {
  flex: 1;
  min-width: 0;
  padding-top: 4rpx;
}

.step-strong {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.step-small {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
}

.invite-start-button {
  min-height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.privacy-note {
  display: block;
  text-align: center;
  color: var(--gx-chat-hint, #a28777);
  font-size: 22rpx;
  line-height: 1.5;
}
</style>
