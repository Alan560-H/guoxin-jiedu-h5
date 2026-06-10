<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FontScale } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxChip from '@/components/guoxin/GxChip.vue'
import GxLoginModal from '@/components/guoxin/GxLoginModal.vue'
import { isWeChatBrowser, getOAuthCodeFromUrl, clearOAuthParamsFromUrl } from '@/utils/weixin/env'
import { redirectToWxOAuth, markOAuthPendingStart, consumeOAuthPendingStart } from '@/utils/weixin/oauth'

const store = useGuoxinStore()

const showLogin = ref(false)
const showWxAuth = ref(false)
const loginMode = ref<'smsLogin' | 'bindMobile'>('smsLogin')
const showProfileSelect = ref(false)
/** 登录完成后是否继续「开始解读」流程 */
const loginIntent = ref<'none' | 'start'>('none')

/** 登录/授权成功后，继续「开始解读」后续步骤 */
function continueJieduAfterLogin() {
  if (store.hasNoCredits()) {
    uni.navigateTo({ url: RouterPaths.credits })
    return
  }
  if (store.profiles.length === 0) {
    uni.navigateTo({ url: RouterPaths.profileCreate })
    return
  }
  showProfileSelect.value = true
}

/** 处理微信 OAuth 回调（仅在有 code 时） */
async function handleOAuthCallback(code: string) {
  try {
    uni.showLoading({ title: '登录中...' })
    const result = await store.doWxLogin(code)
    clearOAuthParamsFromUrl()
    uni.hideLoading()
    if (result.needBindMobile) {
      loginMode.value = 'bindMobile'
      showLogin.value = true
      return
    }
    await store.initRemoteData()
    if (consumeOAuthPendingStart())
      continueJieduAfterLogin()
  }
  catch (e: unknown) {
    uni.hideLoading()
    console.error('微信登录失败', e)
    uni.showToast({ title: '微信授权失败，请重试', icon: 'none' })
  }
}

onMounted(async () => {
  store.initSeedData()

  // 如果已登录且启用远程API，刷新远程数据
  if (store.isLoggedIn && store.useRemoteApi) {
    await store.initRemoteData()
    return
  }

  if (store.useRemoteApi) {
    const code = getOAuthCodeFromUrl()
    if (code) {
      await handleOAuthCallback(code)
    }
  }
})

function promptLoginForStart() {
  loginIntent.value = 'start'
  if (store.useRemoteApi && isWeChatBrowser()) {
    showWxAuth.value = true
    return
  }
  loginMode.value = 'smsLogin'
  showLogin.value = true
}

function confirmWxAuth() {
  showWxAuth.value = false
  markOAuthPendingStart()
  redirectToWxOAuth('GUOXIN_LOGIN')
}

function switchToSmsLogin() {
  showWxAuth.value = false
  loginMode.value = 'smsLogin'
  showLogin.value = true
}

const latestRecord = computed(() => store.latestRecord)
const profiles = computed(() => store.profiles)

function handleStartJiedu() {
  if (!store.isLoggedIn) {
    promptLoginForStart()
    return
  }

  // Directly redirect to paywall/purchase if credits are 0
  if (store.credits <= 0) {
    uni.navigateTo({ url: RouterPaths.credits })
    return
  }

  // Go to profile creation if no profiles exist
  if (profiles.value.length === 0) {
    uni.navigateTo({ url: RouterPaths.profileCreate })
    return
  }

  // Open the custom choose profile modal
  showProfileSelect.value = true
}

function handleSelectProfile(id: string) {
  store.setActiveProfile(id)
  showProfileSelect.value = false
  uni.navigateTo({ url: RouterPaths.jieduSetup })
}

function handleCreateProfileFromModal() {
  showProfileSelect.value = false
  uni.navigateTo({ url: RouterPaths.profileCreate })
}

function goProfiles() {
  if (!store.isLoggedIn) {
    loginIntent.value = 'none'
    loginMode.value = 'smsLogin'
    showLogin.value = true
    return
  }
  uni.navigateTo({ url: RouterPaths.profileList })
}

function goCredits() {
  if (!store.isLoggedIn) {
    loginIntent.value = 'none'
    loginMode.value = 'smsLogin'
    showLogin.value = true
    return
  }
  uni.navigateTo({ url: RouterPaths.credits })
}

function goLatestDetail() {
  if (!latestRecord.value)
    return
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${latestRecord.value.id}` })
}

function setScale(scale: FontScale) {
  store.setFontScale(scale)
}

async function handleLoginSuccess() {
  if (store.useRemoteApi) {
    await store.initRemoteData()
  }

  const shouldContinue = loginIntent.value === 'start' || consumeOAuthPendingStart()
  loginIntent.value = 'none'
  if (shouldContinue)
    continueJieduAfterLogin()
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <!-- Home Banner Section -->
    <view class="home-banner">
      <view class="home-logo">国心解读</view>
      <view class="home-subtitle">东方文化视角下的生活与心理参考</view>
    </view>

    <scroll-view scroll-y class="gx-scroll">

      <!-- Teacher Intro Card -->
      <view class="teacher-intro-card">
        <view class="avatar-wrapper">
          <view class="avatar">
            <image class="avatar-img" src="/static/assets/xinyu-teacher.svg" mode="aspectFill" />
          </view>
        </view>
        <view class="teacher-details">
          <view class="teacher-name">心语老师</view>
          <view class="teacher-desc">我会通过几个简单问题，帮您为自己或家人整理一份生活与心理参考。</view>

          <!-- Remaining credits badge -->
          <view class="credit-badge" @tap.stop="goCredits">
            剩余解读次数：<text class="credit-count">{{ store.credits }}</text>次
          </view>
        </view>
      </view>

      <!-- Action Buttons -->
      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" @click="handleStartJiedu">
          开始我的专属解读
        </GxButton>
        <GxButton type="secondary" @click="goProfiles">
          查看/管理心语档案
        </GxButton>
      </view>

      <!-- Last Interpretation (if exists) -->
      <GxCard v-if="latestRecord" class="latest-record-card">
        <view class="gx-form-label section-label">
          上次解读
        </view>
        <view class="flex_row f_j_sb f_a_center">
          <view class="record-meta">
            <view class="record-title">
              <template v-if="latestRecord.profileName">
                {{ latestRecord.profileName }} · {{ latestRecord.directions.join('、') }}
              </template>
              <template v-else>
                {{ latestRecord.title }}
              </template>
            </view>
            <view class="gx-text-hint record-time">
              {{ latestRecord.time }}
            </view>
          </view>
          <GxButton type="outline" size="sm" @click="goLatestDetail">
            查看
          </GxButton>
        </view>
      </GxCard>

      <!-- Font Size Controller -->
      <GxCard class="font-scale-card">
        <view class="gx-form-label section-label">
          字号调节
        </view>
        <view class="flex_row gap_05rem font-scale-chips">
          <GxChip
            v-for="item in ([['standard', '标准'], ['large', '大字号'], ['xlarge', '特大号']] as const)"
            :key="item[0]"
            :label="item[1]"
            :selected="store.fontScale === item[0]"
            @toggle="setScale(item[0])"
          />
        </view>
      </GxCard>

      <!-- Footer Disclaimer -->
      <view class="home-disclaimer">
        内容仅供传统文化学习与生活参考，<br>不作为医疗、法律、理财等任何现实决策依据。
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>

    <!-- 微信授权登录弹窗（点击「开始解读」时） -->
    <view v-if="showWxAuth" class="modal-overlay">
      <view class="modal-card wx-auth-card">
        <view class="close-x" @tap="showWxAuth = false">×</view>
        <view class="wx-auth-header">
          <view class="wx-auth-icon">微</view>
          <view class="wx-auth-title">微信授权登录</view>
          <view class="wx-auth-desc">使用微信账号登录后，即可开始专属解读</view>
        </view>
        <view class="gx-btn-group wx-auth-actions">
          <GxButton type="primary" @click="confirmWxAuth">
            微信授权登录
          </GxButton>
          <GxButton type="outline" @click="switchToSmsLogin">
            使用短信验证码登录
          </GxButton>
        </view>
      </view>
    </view>

    <!-- 短信 / 绑手机弹窗 -->
    <GxLoginModal
      :show="showLogin"
      :mode="loginMode"
      @close="showLogin = false"
      @success="handleLoginSuccess"
    />

    <!-- Choose Profile Popup Modal (Removable) -->
    <view v-if="showProfileSelect" class="modal-overlay select-modal-overlay">
      <view class="modal-card select-modal-card">
        <!-- Close button X -->
        <view class="close-x" @tap="showProfileSelect = false">×</view>

        <view class="modal-header">
          <view class="modal-title">选择心语档案</view>
          <view class="modal-subtitle">请选择要进行本次解读的家人档案：</view>
        </view>

        <scroll-view scroll-y class="modal-scroll-area">
          <view class="profile-items-list">
            <view
              v-for="p in profiles"
              :key="p.id"
              class="profile-select-item"
              @tap="handleSelectProfile(p.id)"
            >
              <view class="profile-item-left">
                <view class="profile-item-name">{{ p.name }}</view>
                <view class="profile-item-sub">{{ p.genderText }} · {{ p.birthYear }}年 · {{ p.birthPlace }}</view>
              </view>
              <view class="profile-item-right">
                <view class="gx-badge gx-badge-gold">{{ p.relationText }}</view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- Create new profile button -->
        <view class="create-profile-btn-wrap">
          <GxButton type="outline" @click="handleCreateProfileFromModal">
            ＋ 创建新档案
          </GxButton>
        </view>
      </view>
    </view>

  </view>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.home-banner {
  text-align: center;
  padding: 60rpx 32rpx 40rpx;
  background:
    radial-gradient(ellipse at 50% 100%, rgba(21, 63, 51, 0.08), transparent 58%),
    radial-gradient(ellipse at 20% 16%, rgba(185, 148, 95, 0.22), transparent 42%),
    linear-gradient(180deg, rgba(255, 249, 235, 0.96), rgba(247, 236, 214, 0.72));
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  border-bottom: 2rpx solid rgba(185, 148, 95, 0.34);
  flex-shrink: 0;
}

.home-logo {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 56rpx;
  font-weight: 900;
  color: #153F33;
  letter-spacing: 4rpx;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 0 rgba(255, 255, 255, 0.72);
}

.home-subtitle {
  font-size: 26rpx;
  letter-spacing: 2rpx;
  color: #665B4E;
  font-weight: 500;
}

.teacher-intro-card {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border: 2rpx solid rgba(185, 148, 95, 0.38);
  border-radius: 36rpx;
  padding: 40rpx 32rpx;
  margin: 40rpx 32rpx;
  display: flex;
  gap: 32rpx;
  box-shadow: 0 8rpx 20rpx rgba(74, 49, 21, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 10rpx;
    height: 100%;
    background: linear-gradient(180deg, #B9945F, #153F33);
  }
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 25%, #FFFFFF, #EEF3EA);
  border: 4rpx solid #B9945F;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.teacher-details {
  display: flex;
  flex-direction: column;
  flex: 1;

  .teacher-name {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 38rpx;
    font-weight: 700;
    color: #153F33;
    margin-bottom: 8rpx;
  }

  .teacher-desc {
    font-size: 26rpx;
    line-height: 1.5;
    color: #665B4E;
    margin-bottom: 16rpx;
  }
}

.credit-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  background-color: rgba(239, 226, 202, 0.72);
  border: 2rpx solid rgba(185, 148, 95, 0.62);
  padding: 10rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #153F33;

  .credit-count {
    color: #B7654A;
    margin: 0 4rpx;
  }
}

.action-buttons {
  margin-top: 10rpx;
  margin-bottom: 40rpx;
}

.latest-record-card, .font-scale-card {
  .section-label {
    font-family: "Noto Serif SC", Georgia, serif;
    color: #153F33;
    font-size: 30rpx;
    font-weight: 700;
    border-left: 6rpx solid #B9945F;
    padding-left: 16rpx;
    line-height: 1;
    margin-bottom: 24rpx;
  }
}

.record-meta {
  flex: 1;
  margin-right: 20rpx;
}

.record-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #241F19;
}

.record-time {
  font-size: 24rpx;
  color: #958878;
  margin-top: 8rpx;
}

.font-scale-chips {
  flex-wrap: wrap;
}

.home-disclaimer {
  font-size: 24rpx;
  color: #958878;
  text-align: center;
  margin: 48rpx 32rpx 32rpx;
  line-height: 1.5;
}

/* Modals styles */
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

.wx-auth-card {
  text-align: center;
}

.wx-auth-header {
  margin-bottom: 40rpx;
}

.wx-auth-icon {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  background: #07C160;
  color: #fff;
  font-size: 44rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wx-auth-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 36rpx;
  font-weight: 900;
  color: #153F33;
  margin-bottom: 12rpx;
}

.wx-auth-desc {
  font-size: 26rpx;
  color: #665B4E;
  line-height: 1.6;
}

.wx-auth-actions {
  gap: 20rpx;
}

/* Custom Profile Select Dialog styles */
.select-modal-overlay {
  z-index: 900;
}

.select-modal-card {
  height: 80vh;
  max-height: 1000rpx;
}

.modal-header {
  text-align: center;
  border-bottom: 2rpx solid rgba(185, 148, 95, 0.28);
  padding-bottom: 24rpx;
  margin-bottom: 24rpx;

  .modal-title {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 36rpx;
    font-weight: 900;
    color: #153F33;
    margin-bottom: 8rpx;
  }

  .modal-subtitle {
    font-size: 24rpx;
    color: #665B4E;
  }
}

.modal-scroll-area {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.profile-items-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 8rpx 0;
  box-sizing: border-box;
}

.profile-select-item {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border: 2rpx solid rgba(185, 148, 95, 0.35);
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(74, 49, 21, 0.04);
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:active {
    border-color: #153F33;
    background-color: #EEF3EA;
  }
}

.profile-item-left {
  flex: 1;
  margin-right: 20rpx;

  .profile-item-name {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 30rpx;
    font-weight: 700;
    color: #153F33;
    margin-bottom: 6rpx;
  }

  .profile-item-sub {
    font-size: 24rpx;
    color: #665B4E;
  }
}

.create-profile-btn-wrap {
  margin-top: 24rpx;
  box-sizing: border-box;
  flex-shrink: 0;

  :deep(.gx-btn-wrap) {
    width: 100%;
  }
}
</style>
