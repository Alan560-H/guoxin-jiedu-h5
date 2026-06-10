<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { DIRECTION_OPTIONS } from '@/constants/guoxin'
import type { DirectionValue } from '@/constants/guoxin'
import { ImageConfig } from '@/config/assets'
import GxButton from '@/components/guoxin/GxButton.vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'

const { t } = useI18n()
const store = useGuoxinStore()
const selected = ref<DirectionValue[]>(['家庭关系'])
const step = ref(1)
const scrollIntoViewId = ref('')
const inputText = ref('')
const userQuestion = ref('')
const ricePaperBg = ImageConfig.ricePaperBg
const chatLandscape = ImageConfig.chatLandscape

/** 将输入框未发送的自定义问题并入 userQuestion */
function absorbPendingInput() {
  const text = inputText.value.trim()
  if (!text)
    return
  const existing = userQuestion.value.trim()
  userQuestion.value = existing && !existing.includes(text)
    ? `${existing}、${text}`
    : text
  inputText.value = ''
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text) {
    uni.showToast({ title: t('jiedu.setup.toast.inputRequired'), icon: 'none' })
    return
  }
  userQuestion.value = text
  inputText.value = ''
  if (step.value === 1 && selected.value.length > 0)
    handleNextStep()
}

onMounted(() => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  store.initSeedData()
  if (!store.activeProfile) {
    uni.redirectTo({ url: RouterPaths.profileList })
  }
})

const profile = computed(() => store.activeProfile)

/** 点选方向 + 输入框自定义问题，用于气泡与确认卡片展示 */
const displayFocusSummary = computed(() => {
  const dirs = selected.value.join('、')
  const question = userQuestion.value.trim()
  if (dirs && question)
    return `${dirs}、${question}`
  if (question)
    return question
  return dirs
})

function toggleDirection(dir: DirectionValue) {
  if (selected.value.includes(dir)) {
    selected.value = selected.value.filter(d => d !== dir)
  } else {
    selected.value = [...selected.value, dir]
  }
}

function handleNextStep() {
  if (selected.value.length === 0) {
    uni.showToast({ title: t('jiedu.setup.toast.directionRequired'), icon: 'none' })
    return
  }
  absorbPendingInput()
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

async function confirm() {
  absorbPendingInput()
  await store.confirmJiedu(selected.value, userQuestion.value || undefined)
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
  <view v-if="profile" class="gx-chat-page flex_column page-container">

    <!-- 1. Header Navigation Bar -->
    <view class="screen-header">
      <view class="header-btn" @tap="handleBack">
        <text class="arrow">‹</text>
        <text class="btn-label">{{ t('jiedu.setup.back') }}</text>
      </view>
      <view class="screen-header-title">{{ t('jiedu.setup.title') }}</view>
      <view class="header-btn right-btn" @tap="goProfiles">
        <svg class="header-icon" aria-hidden="true">
          <use :href="ImageConfig.icon('recent')"></use>
        </svg>
        <text class="btn-label">{{ t('jiedu.setup.profiles') }}</text>
      </view>
    </view>

    <!-- 2. Sub-Header Credits Indicator -->
    <view class="sub-header-bar">
      <view>{{ t('jiedu.setup.creditsRemain') }}<text class="credit-count-val" @tap.stop="goCredits">{{ store.credits }}</text>{{ t('jiedu.setup.creditsUnit') }}</view>
      <view class="consultant-label">{{ t('jiedu.setup.consultant') }}</view>
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
            <image class="chat-avatar" :src="ImageConfig.xinyuTeacher" mode="aspectFill" />
          </view>
          <view class="message-content">
            <text>{{ t('jiedu.setup.welcomePrefix') }}</text>
            <text class="text-highlight">{{ profile.name }}（{{ profile.relationText }}）</text>
            <text>{{ t('jiedu.setup.welcomeSuffix') }}</text>
          </view>
        </view>

        <!-- 选方向阶段单独展示输入；进入确认步后合并进「我希望关注」气泡 -->
        <view v-if="userQuestion && step === 1" class="message-bubble user">
          <view class="message-content">
            {{ userQuestion }}
          </view>
        </view>

        <!-- Step 1: Select Box -->
        <view v-if="step === 1" class="chat-setup-card">
          <view class="chat-setup-title">
            <svg class="title-icon" aria-hidden="true">
              <use :href="ImageConfig.icon('cloud')"></use>
            </svg>
            <text>{{ t('jiedu.setup.selectDirections') }}</text>
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
                  <use :href="ImageConfig.icon(getIconName(dir))"></use>
                </svg>
              </view>
              <text class="label-text">{{ dir }}</text>
            </view>
          </view>

          <GxButton
            type="primary"
            :disabled="selected.length === 0"
            @click="handleNextStep"
          >
            {{ t('jiedu.setup.nextConfirm') }}
          </GxButton>
        </view>

        <!-- Step 2: User Choice Bubble -->
        <view v-if="step === 2" class="message-bubble user">
          <view class="message-content">
            {{ t('jiedu.setup.userDirections', { directions: displayFocusSummary }) }}
          </view>
        </view>

        <!-- Step 2: Teacher Confirm Greeting Bubble -->
        <view v-if="step === 2" class="message-bubble teacher">
          <view class="chat-avatar-wrapper">
            <image class="chat-avatar" :src="ImageConfig.xinyuTeacher" mode="aspectFill" />
          </view>
          <view class="message-content">
            {{ t('jiedu.setup.teacherConfirm') }}
          </view>
        </view>

        <!-- Step 2: Confirmation Table Card -->
        <view v-if="step === 2" id="confirm-card" class="chat-setup-card confirm-card">
          <view class="chat-setup-title">
            <svg class="title-icon" aria-hidden="true">
              <use :href="ImageConfig.icon('record')"></use>
            </svg>
            <text>{{ t('jiedu.setup.confirmTitle') }}</text>
          </view>

          <view class="confirm-table">
            <view class="confirm-row">
              <text class="label">{{ t('jiedu.setup.labelName') }}</text>
              <text class="value">{{ profile.name }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">{{ t('jiedu.setup.labelRelation') }}</text>
              <text class="value">{{ profile.relationText }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">{{ t('jiedu.setup.labelBirthDate') }}</text>
              <text class="value">{{ t('jiedu.setup.birthDateFmt', { calendar: profile.calendarTypeText, year: profile.birthYear, month: profile.birthMonth, day: profile.birthDay }) }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">{{ t('jiedu.setup.labelBirthHour') }}</text>
              <text class="value">{{ profile.birthHour }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">{{ t('jiedu.setup.labelBirthPlace') }}</text>
              <text class="value">{{ profile.birthPlace }}</text>
            </view>
            <view class="confirm-row">
              <text class="label">{{ t('jiedu.setup.labelTrueSolar') }}</text>
              <text class="value">{{ profile.useTrueSolarTime ? t('common.enabled') : t('common.disabled') }}</text>
            </view>
            <view class="confirm-row no-border">
              <text class="label">{{ t('jiedu.setup.labelDirections') }}</text>
              <text class="value highlight-text">{{ displayFocusSummary }}</text>
            </view>
          </view>

          <view class="confirm-actions">
            <GxButton type="primary" @click="confirm">
              {{ t('jiedu.setup.confirmStart') }}
            </GxButton>
            <GxButton type="secondary" @click="goProfiles">
              {{ t('jiedu.setup.editProfile') }}
            </GxButton>
            <GxButton type="outline" @click="handlePrevStep">
              {{ t('jiedu.setup.reselectDirections') }}
            </GxButton>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 4. Fixed Input Bar at the Bottom (within layout flow) -->
    <view class="chat-input-row-fixed">
      <input
        v-model="inputText"
        class="chat-text-field-input"
        :placeholder="t('jiedu.setup.inputPlaceholder')"
        confirm-type="send"
        @confirm="handleSend"
      />
      <button class="send-btn" @tap="handleSend">{{ t('jiedu.setup.send') }}</button>
    </view>

  </view>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 414px;
  margin: 0 auto;
  background:
    url(v-bind(ricePaperBg)) center / cover no-repeat,
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
    font-size: 32rpx;
    color: #153F33;
    font-weight: 900;
    text-align: center;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-btn {
    flex: 0 0 112rpx;
    background: none;
    border: none;
    color: #153F33;
    font-size: 26rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 0;
    border-radius: 8rpx;
    cursor: pointer;

    .arrow {
      font-size: 40rpx;
      line-height: 1;
      margin-top: -4rpx;
    }

    .btn-label {
      font-weight: 500;
      white-space: nowrap;
    }

    .header-icon {
      width: 36rpx;
      height: 36rpx;
      stroke: currentColor;
      fill: none;
    }
  }

  .right-btn {
    justify-content: flex-end;
  }
}

/* Sub-Header Credits Bar */
.sub-header-bar {
  background: linear-gradient(90deg, rgba(239, 226, 202, 0.78), rgba(248, 240, 224, 0.88));
  font-size: 24rpx;
  padding: 14rpx 32rpx;
  color: #665B4E;
  display: flex;
  gap: 16rpx;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(185, 148, 95, 0.28);
  font-weight: 700;
  box-sizing: border-box;
  flex-shrink: 0;

  > view {
    min-width: 0;
    white-space: nowrap;
  }

  .consultant-label {
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .credit-count-val {
    color: #B7654A;
    text-decoration: underline;
    margin: 0 4rpx;
  }
}

/* Scroll Area & Background Landscape */
/* uni-app H5 的 scroll-view 必须在 flex 列里配合 height:0 才能正确滚动 */
.chat-history-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
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
    background: url(v-bind(chatLandscape)) center bottom / 100% auto no-repeat;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.direction-chip {
  min-width: 0;
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
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 49, 21, 0.035);
  box-sizing: border-box;

  .icon {
    width: 52rpx;
    height: 52rpx;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #635845;
    flex-shrink: 0;
  }

  .label-text {
    white-space: nowrap;
    line-height: 1.2;
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

.confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  box-sizing: border-box;
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

/* Fixed Bottom Input Bar (in relative flow) */
.chat-input-row-fixed {
  z-index: 50;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130rpx;
  gap: 16rpx;
  align-items: center;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background:
    linear-gradient(180deg, rgba(255, 250, 239, 0.98), rgba(246, 235, 213, 0.98)),
    #FCF5E9;
  border-top: 1px solid rgba(135, 100, 58, 0.28);
  box-sizing: border-box;
  flex-shrink: 0; /* Prevents input bar from shrinking on small/landscape viewports */

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
    min-width: 0;
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
