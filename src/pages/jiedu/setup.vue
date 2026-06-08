<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { DIRECTION_OPTIONS } from '@/constants/guoxin'
import type { DirectionValue } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'

const store = useGuoxinStore()
const selected = ref<DirectionValue[]>(['家庭关系']) // Match the screenshot: '家庭关系' selected by default
const step = ref(1) // 1: Directions selection, 2: Confirmation
const scrollIntoViewId = ref('')
const inputText = ref('')

function handleVoiceInput() {
  uni.showLoading({ title: '正在录音...' })
  setTimeout(() => {
    uni.hideLoading()
    inputText.value = '请帮我解读一下近期的健康作息与家庭关系。'
    uni.showToast({ title: '语音已转换为文字', icon: 'success' })
  }, 1200)
}

function handleSend() {
  if (!inputText.value.trim()) {
    uni.showToast({ title: '请输入提问内容', icon: 'none' })
    return
  }
  uni.showToast({ title: '已接收提问：' + inputText.value, icon: 'none' })
  inputText.value = ''
  handleNextStep()
}

onMounted(() => {
  store.initSeedData()
  if (!store.activeProfile) {
    uni.redirectTo({ url: RouterPaths.profileList })
  }
})

const profile = computed(() => store.activeProfile)

function toggleDirection(dir: DirectionValue) {
  if (selected.value.includes(dir)) {
    selected.value = selected.value.filter(d => d !== dir)
  } else {
    selected.value = [...selected.value, dir]
  }
}

function handleNextStep() {
  if (selected.value.length === 0) {
    uni.showToast({ title: '请至少选择一个关注方向', icon: 'none' })
    return
  }
  step.value = 2
  nextTick(() => {
    scrollIntoViewId.value = 'confirm-card'
  })
}

function handlePrevStep() {
  step.value = 1
}

function handleBack() {
  if (step.value === 2) {
    step.value = 1
  } else {
    uni.navigateBack({ delta: 1 })
  }
}

function confirm() {
  store.confirmJiedu(selected.value)
}

function goProfiles() {
  uni.navigateTo({ url: RouterPaths.profileList })
}

function goCredits() {
  uni.navigateTo({ url: RouterPaths.credits })
}

function getIconName(dir: DirectionValue): string {
  const mapping: Record<string, string> = {
    '家庭关系': 'family',
    '情绪状态': 'mood',
    '健康作息': 'health',
    '事业方向': 'work',
    '财务规划': 'money',
    '子女关系': 'children',
    '近期状态': 'recent',
  }
  return mapping[dir] || 'recent'
}
</script>

<template>
  <view v-if="profile" class="gx-page flex_column page-container">

    <!-- 1. Header Navigation Bar -->
    <view class="screen-header">
      <view class="header-btn" @tap="handleBack">
        <text class="arrow">‹</text>
        <text class="btn-label">返回</text>
      </view>
      <view class="screen-header-title">与心语老师对话</view>
      <view class="header-btn right-btn" @tap="goProfiles">
        <!-- Two human figures icon -->
        <svg class="header-icon" aria-hidden="true">
          <use href="/static/assets/direction-icons.svg#icon-recent"></use>
        </svg>
        <text class="btn-label">档案</text>
      </view>
    </view>

    <!-- 2. Sub-Header Credits Indicator -->
    <view class="sub-header-bar">
      <view>剩余解读次数：<text class="credit-count-val" @tap.stop="goCredits">{{ store.credits }}</text>次</view>
      <view class="consultant-label">专属顾问：心语老师</view>
    </view>

    <!-- 3. Scrollable Conversation/Interactive Flow -->
    <scroll-view
      scroll-y
      class="gx-scroll chat-history-scroll"
      :scroll-into-view="scrollIntoViewId"
      scroll-with-animation
    >
      <view class="chat-history-content">

        <!-- Welcome Speech Bubble -->
        <view class="message-bubble teacher">
          <view class="chat-avatar-wrapper">
            <image class="chat-avatar" src="/static/assets/xinyu-teacher.svg" mode="aspectFill" />
          </view>
          <view class="message-content">
            您好，我是心语老师。接下来我会根据您选择的档案“<text class="text-highlight">{{ profile.name }}（{{ profile.relationText }}）</text>”，通过几个简单问题，为您整理一份生活与心理参考。
          </view>
        </view>

        <!-- Step 1: Select Box -->
        <view v-if="step === 1" class="chat-setup-card">
          <view class="chat-setup-title">
            <svg class="title-icon" aria-hidden="true">
              <use href="/static/assets/direction-icons.svg#icon-cloud"></use>
            </svg>
            <text>请选择本次解读关注方向（可多选）</text>
          </view>

          <view class="direction-grid">
            <view
              v-for="dir in DIRECTION_OPTIONS"
              :key="dir"
              class="direction-chip"
              :class="{ selected: selected.includes(dir) }"
              @tap="toggleDirection(dir)"
            >
              <view class="icon">
                <svg aria-hidden="true" style="width: 100%; height: 100%;">
                  <use :href="`/static/assets/direction-icons.svg#icon-${getIconName(dir)}`"></use>
                </svg>
              </view>
              <text class="label-text">{{ dir }}</text>
            </view>
          </view>

          <!-- Cloud Border Pill Button -->
          <button
            class="btn btn-primary"
            :class="{ 'btn-disabled': selected.length === 0 }"
            @tap="handleNextStep"
          >
            <text class="btn-text">下一步，确认档案信息</text>
          </button>
        </view>

        <!-- Step 2: User Choice Bubble -->
        <view v-if="step === 2" class="message-bubble user">
          <view class="message-content">
            我希望关注：{{ selected.join('、') }}。
          </view>
        </view>

        <!-- Step 2: Teacher Confirm Greeting Bubble -->
        <view v-if="step === 2" class="message-bubble teacher">
          <view class="chat-avatar-wrapper">
            <image class="chat-avatar" src="/static/assets/xinyu-teacher.svg" mode="aspectFill" />
          </view>
          <view class="message-content">
            好的，我已经记录了您的期望。请在开始前确认以下档案信息是否准确无误：
          </view>
        </view>

        <!-- Step 2: Confirmation Table Card -->
        <view v-if="step === 2" id="confirm-card" class="chat-setup-card confirm-card">
          <view class="chat-setup-title">
            <svg class="title-icon" aria-hidden="true">
              <use href="/static/assets/direction-icons.svg#icon-record"></use>
            </svg>
            <text>信息核对确认</text>
          </view>

          <view class="confirm-table">
            <view class="confirm-row">
              <text class="label">档案名称</text>
              <text class="value">{{ profile.name }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">与我关系</text>
              <text class="value">{{ profile.relationText }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">出生日期</text>
              <text class="value">{{ profile.calendarTypeText }} {{ profile.birthYear }}年{{ profile.birthMonth }}月{{ profile.birthDay }}日</text>
            </view>
            <view class="confirm-row">
              <text class="label">出生时间</text>
              <text class="value">{{ profile.birthHour }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">出生地点</text>
              <text class="value">{{ profile.birthPlace }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">真太阳时校对</text>
              <text class="value">{{ profile.useTrueSolarTime ? '已启用' : '未启用' }}</text>
            </view>
            <view class="confirm-row no-border">
              <text class="label">关注方向</text>
              <text class="value highlight-text">{{ selected.join('、') }}</text>
            </view>
          </view>

          <view class="confirm-actions">
            <button class="btn btn-primary" @tap="confirm">
              <text class="btn-text">确认，开始本次解读</text>
            </button>
            <button class="btn btn-secondary" @tap="goProfiles">
              <text class="btn-text">修改档案信息</text>
            </button>
            <button class="btn btn-outline" @tap="handlePrevStep">
              <text class="btn-text">重新点选方向</text>
            </button>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 4. Fixed Input Bar at the Bottom (within layout flow) -->
    <view class="chat-input-row-fixed">
      <view class="voice-btn" @tap="handleVoiceInput">
        <svg aria-hidden="true" style="width: 100%; height: 100%;">
          <use href="/static/assets/direction-icons.svg#icon-mic"></use>
        </svg>
      </view>
      <input
        v-model="inputText"
        class="chat-text-field-input"
        placeholder="输入问题，或点选上方方向"
        confirm-type="send"
        @confirm="handleSend"
      />
      <button class="send-btn" @tap="handleSend">发送</button>
    </view>

  </view>
</template>

<style scoped lang="scss">
/* Design tokens locally matching index.css styles */
:root, .page-container {
  --color-bg-cream: #FCF5E9;
  --color-bg-sand: #EFE2CA;
  --color-bg-sage: #EEF3EA;
  --color-primary-green: #153F33;
  --color-secondary-green: #255648;
  --color-accent-gold: #B9945F;
  --color-light-gold: #E7D6B9;
  --color-dark-gold: #87643A;
  --color-text-primary: #241F19;
  --color-text-secondary: #665B4E;
  --color-text-light: #958878;
}

.page-container {
  display: flex;
  flex-direction: column;
  height: var(--window-height, 100vh); /* Use Uni-App window height variable for safe viewport boundaries */
  width: 100vw;
  background:
    url("/static/assets/rice-paper-bg.svg") center / cover no-repeat,
    linear-gradient(140deg, rgba(255, 252, 244, 0.95), rgba(249, 239, 220, 0.9)),
    #FCF5E9;
  overflow: hidden;
  box-sizing: border-box;
}

/* Custom Header Bar */
.screen-header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1px solid rgba(135, 100, 58, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 250, 239, 0.98), rgba(246, 235, 213, 0.94)),
    #FCF5E9;
  z-index: 100;
  box-sizing: border-box;
  flex-shrink: 0;

  .screen-header-title {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 34rpx;
    color: #153F33;
    font-weight: 900;
    text-align: center;
    flex: 1;
  }

  .header-btn {
    background: none;
    border: none;
    color: #153F33;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    cursor: pointer;

    .arrow {
      font-size: 40rpx;
      line-height: 1;
      margin-top: -4rpx;
    }

    .btn-label {
      font-weight: 500;
    }

    .header-icon {
      width: 36rpx;
      height: 36rpx;
      stroke: currentColor;
      fill: none;
    }
  }
}

/* Sub-Header Credits Bar */
.sub-header-bar {
  background: linear-gradient(90deg, rgba(239, 226, 202, 0.78), rgba(248, 240, 224, 0.88));
  font-size: 26rpx;
  padding: 14rpx 32rpx;
  color: #665B4E;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(185, 148, 95, 0.28);
  font-weight: 700;
  box-sizing: border-box;
  flex-shrink: 0;

  .credit-count-val {
    color: #B7654A;
    text-decoration: underline;
    margin: 0 4rpx;
  }
}

/* Scroll Area & Background Landscape */
.chat-history-scroll {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  min-height: 0; /* Restricts height correctly in flex column */
}

.chat-history-content {
  padding: 32rpx 28rpx 40rpx 28rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  box-sizing: border-box;
  min-height: 100.1%; /* Enable bounce scroll */
  position: relative;

  /* Ink mountain watermark */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 380rpx;
    background: url("/static/assets/chat-landscape.svg") center bottom / 100% auto no-repeat;
    opacity: 0.74;
    pointer-events: none;
    z-index: 0;
  }
}

/* Message bubble */
.message-bubble {
  display: flex;
  gap: 20rpx;
  max-width: 94%;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  &.teacher {
    align-self: flex-start;
  }

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;
    max-width: 80%;

    .message-content {
      background: linear-gradient(180deg, #1E5546, #153F33);
      color: #FCF5E9;
      border-top-right-radius: 8rpx;
      border-top-left-radius: 36rpx;
      border-color: #153F33;
    }
  }
}

.chat-avatar-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background-color: #EEF3EA;
  border: 2rpx solid #B9945F;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.chat-avatar {
  width: 100%;
  height: 100%;
}

.message-content {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border-radius: 36rpx;
  border-top-left-radius: 8rpx;
  padding: 24rpx 30rpx;
  box-shadow: 0 2px 8px rgba(74, 49, 21, 0.06);
  border: 2rpx solid rgba(185, 148, 95, 0.35);
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 29rpx;
  line-height: 1.62;
  font-weight: 700;
  color: #241F19;
  box-sizing: border-box;

  .text-highlight {
    color: #153F33;
    font-weight: 900;
  }
}

/* Card Selection & Confirmation Wrapper */
.chat-setup-card {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border: 4rpx solid rgba(185, 148, 95, 0.46);
  border-radius: 40rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 8px 20px rgba(74, 49, 21, 0.1);
  margin-top: 10rpx;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.chat-setup-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 32rpx;
  font-weight: 900;
  color: #153F33;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;

  .title-icon {
    width: 44rpx;
    height: 44rpx;
    color: #87643A;
    flex-shrink: 0;
  }
}

/* Direction multi-select grid */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.direction-chip {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.98), rgba(250, 243, 230, 0.9));
  border: 4rpx solid rgba(185, 148, 95, 0.3);
  min-height: 110rpx;
  padding: 16rpx 14rpx;
  border-radius: 20rpx;
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 28rpx;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #241F19;
  display: flex;
  flex-direction: row;
  gap: 10rpx;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 49, 21, 0.035);
  box-sizing: border-box;

  .icon {
    width: 60rpx;
    height: 60rpx;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #635845;
    flex-shrink: 0;
  }

  .label-text {
    white-space: nowrap;
  }

  &.selected {
    background: linear-gradient(180deg, rgba(238, 243, 234, 0.96), rgba(248, 246, 237, 0.96));
    border-color: #153F33;
    color: #153F33;
    box-shadow:
      inset 0 0 0 2rpx rgba(21, 63, 51, 0.24),
      0 6px 16px rgba(21, 63, 51, 0.1);

    .icon {
      color: #153F33;
    }
  }
}

/* Premium Buttons & Cloud Decorations */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 96rpx;
  border-radius: 999rpx;
  font-family: "Noto Serif SC", Georgia, serif;
  font-weight: 900;
  font-size: 32rpx;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(74, 49, 21, 0.06);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.btn-primary {
  background: linear-gradient(180deg, #1E5546 0%, #153F33 100%);
  color: #FCF5E9;
  border: 4rpx solid rgba(217, 193, 144, 0.72);
  box-shadow:
    inset 0 2rpx 0 rgba(255, 255, 255, 0.16),
    0 8px 18px rgba(21, 63, 51, 0.22);
  padding: 0 96rpx;

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

  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.btn-secondary {
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  color: #153F33;
  border: 2rpx solid rgba(185, 148, 95, 0.58);
  margin-top: 16rpx;

  &:active {
    background-color: #E7D6B9;
    transform: scale(0.98);
  }
}

.btn-outline {
  background-color: transparent;
  color: #153F33;
  border: 4rpx solid #153F33;
  margin-top: 16rpx;

  &:active {
    background-color: #EEF3EA;
    transform: scale(0.98);
  }
}

.btn-disabled {
  background: linear-gradient(180deg, rgba(239, 226, 202, 0.72), rgba(232, 222, 202, 0.72)) !important;
  color: #958878 !important;
  border: 2rpx solid rgba(185, 148, 95, 0.32) !important;
  cursor: not-allowed;
  box-shadow: none !important;

  &::before,
  &::after {
    opacity: 0.2;
  }
}

/* Step 2 Confirmation Table styles */
.confirm-table {
  width: 100%;
  margin: 16rpx 0 24rpx 0;
  box-sizing: border-box;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 2rpx dashed rgba(185, 148, 95, 0.28);
  font-size: 28rpx;
  box-sizing: border-box;

  .label {
    color: #665B4E;
    font-weight: 500;
  }

  .value {
    color: #241F19;
    font-weight: 700;
    text-align: right;
  }

  .highlight-text {
    color: #153F33;
    font-weight: 900;
  }

  &.no-border {
    border-bottom: none;
  }
}

.confirm-actions {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Fixed Bottom Voice Input Bar (in relative flow) */
.chat-input-row-fixed {
  z-index: 50;
  display: grid;
  grid-template-columns: 88rpx 1fr 130rpx;
  gap: 16rpx;
  align-items: center;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background:
    linear-gradient(180deg, rgba(255, 250, 239, 0.98), rgba(246, 235, 213, 0.98)),
    #FCF5E9;
  border-top: 1px solid rgba(135, 100, 58, 0.28);
  box-sizing: border-box;
  flex-shrink: 0; /* Prevents input bar from shrinking on small/landscape viewports */

  .voice-btn {
    width: 82rpx;
    height: 82rpx;
    border-radius: 50%;
    background: rgba(255, 253, 247, 0.82);
    color: #153F33;
    border: 4rpx solid #153F33;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    cursor: pointer;
  }

  .chat-text-field-input {
    min-width: 0;
    min-height: 82rpx;
    border-radius: 999rpx;
    border: 4rpx solid rgba(185, 148, 95, 0.35);
    background: rgba(255, 253, 247, 0.88);
    color: #241F19;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    font-size: 28rpx;
    outline: none;
    box-sizing: border-box;
  }

  .send-btn {
    min-height: 82rpx;
    border-radius: 999rpx;
    background: linear-gradient(180deg, #1E5546, #153F33);
    color: #FCF5E9;
    font-size: 28rpx;
    font-family: "Noto Serif SC", Georgia, serif;
    font-weight: 900;
    box-shadow: 0 5px 12px rgba(21, 63, 51, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-sizing: border-box;
  }
}
</style>
