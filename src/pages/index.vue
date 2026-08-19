<script setup lang="ts">
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
import GxSourceBackBar from '@/components/guoxin/GxSourceBackBar.vue'
import { ImageConfig } from '@/config/assets'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { createDailyGuidance } from '@/utils/guoxin/dailyGuidance'
import { captureProjectCodeFromUrl } from '@/utils/guoxin/projectCode'
import { isShowBackEntry } from '@/utils/guoxin/sourceEntry'

const PROFESSIONAL_CHART_URL = 'https://paipan.yipuwh.com/'

const store = useGuoxinStore()
const showSourceBackBar = ref(isShowBackEntry())
const guidance = ref(createDailyGuidance())
let guidanceTimer: ReturnType<typeof setInterval> | null = null

onLoad((query) => {
  const q = query as Record<string, string | undefined>
  captureProjectCodeFromUrl(q)
  showSourceBackBar.value = isShowBackEntry()
  if (q.scene === 'invite') {
    const token = String(q.token || '').trim()
    const url = token
      ? `${RouterPaths.inviteAccept}?token=${encodeURIComponent(token)}`
      : RouterPaths.inviteAccept
    uni.redirectTo({ url })
    return
  }
  void store.tryRestoreSession()
  guidanceTimer = setInterval(refreshDailyGuidance, 60_000)
})

onShow(() => {
  captureProjectCodeFromUrl()
  showSourceBackBar.value = isShowBackEntry()
  refreshDailyGuidance()
})

onUnload(() => {
  if (guidanceTimer)
    clearInterval(guidanceTimer)
  guidanceTimer = null
})

function refreshDailyGuidance() {
  const next = createDailyGuidance()
  if (next.dateKey !== guidance.value.dateKey)
    guidance.value = next
}

function openProfessionalChart() {
  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.location.href = PROFESSIONAL_CHART_URL
    return
  }
  // #endif
  uni.showToast({ title: '请在 H5 中打开专业排盘', icon: 'none' })
}

function openChat() {
  uni.navigateTo({ url: RouterPaths.jieduChat })
}
</script>

<template>
  <view class="consult-page gx-chat-page">
    <GxSourceBackBar v-if="showSourceBackBar" />

    <view class="consult-content">
      <view class="consult-hero">
        <image
          class="consult-hero-image"
          :src="ImageConfig.static('daily-guidance-hero.webp')"
          mode="aspectFill"
        />
        <view class="consult-login-badge">
          限时免费
        </view>

        <view class="consult-guidance">
          <view class="consult-guidance-heading">
            <view class="consult-guidance-title">
              <text class="i-carbon-partly-cloudy consult-weather-icon" />
              <text>今日指引</text>
            </view>
            <text class="consult-lunar-date">
              {{ guidance.lunarDate }}
            </text>
          </view>
          <text class="consult-guidance-summary">
            {{ guidance.summary }}
          </text>
          <view class="consult-guidance-tags">
            <view class="consult-guidance-tag">
              <text class="consult-guidance-mark good">
                宜
              </text>
              <text>{{ guidance.suitable }}</text>
            </view>
            <view class="consult-tag-divider" />
            <view class="consult-guidance-tag">
              <text class="consult-guidance-mark avoid">
                忌
              </text>
              <text>{{ guidance.avoid }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="consult-entry-list">
        <view class="consult-entry-card" @tap="openProfessionalChart">
          <image
            class="consult-entry-icon"
            :src="ImageConfig.static('professional-chart-icon.png')"
            mode="aspectFit"
          />
          <view class="consult-entry-copy">
            <text class="consult-entry-title">
              专业排盘
            </text>
            <text class="consult-entry-description">
              精准排盘，洞察命局
            </text>
          </view>
          <text class="i-carbon-chevron-right consult-entry-chevron" />
        </view>

        <view class="consult-entry-card" @tap="openChat">
          <image
            class="consult-entry-icon"
            :src="ImageConfig.static('guoxin-interpretation-icon.png')"
            mode="aspectFit"
          />
          <view class="consult-entry-copy">
            <text class="consult-entry-title">
              国心解读
            </text>
            <text class="consult-entry-description">
              解你疑惑，指点迷津
            </text>
          </view>
          <text class="i-carbon-chevron-right consult-entry-chevron" />
        </view>
      </view>

      <scroll-view class="consult-conversation" scroll-y>
        <view class="consult-user-row">
          <text class="consult-user-message">
            老师，你能解答什么问题？
          </text>
        </view>

        <view class="consult-teacher-meta">
          <image
            class="consult-teacher-avatar"
            :src="ImageConfig.static('teacher-avatar.png')"
            mode="aspectFill"
          />
          <text>国学老师</text>
        </view>
        <view class="consult-teacher-message">
          <text>
            你可以问我关于
            <text class="consult-emphasis">
              八字命盘、事业财运、感情婚姻、流年运势、环境布局、人生选择
            </text>
            等问题，也可以随时问我课程中不懂的国学知识。
          </text>
          <text class="consult-example-lead">
            比如你可以这样问我：
          </text>
          <text>我今年的事业运怎么样？</text>
        </view>
      </scroll-view>

      <view
        class="consult-question-entry"
        role="button"
        aria-label="进入国心解读"
        @tap="openChat"
      >
        <view class="consult-question-field">
          <text class="i-carbon-image consult-image-icon" />
          <text class="consult-question-input">
            请输入问题
          </text>
        </view>
        <view class="consult-send-button">
          <text class="i-carbon-arrow-up" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.consult-page {
  --consult-ink: #17233a;
  --consult-orange: #c96728;
  --consult-paper: #fbefdf;
  --consult-card: #fffaf5;
  display: flex;
  flex-direction: column;
  background: var(--consult-paper);
  color: var(--consult-ink);
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
}

.consult-content {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 750rpx;
  min-height: 0;
  flex: 1;
  margin: 0 auto;
  overflow: hidden;
  flex-direction: column;
}

.consult-hero {
  position: relative;
  flex: 0 0 398rpx;
  height: 398rpx;
  overflow: hidden;
}

.consult-hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.consult-login-badge {
  position: absolute;
  z-index: 2;
  top: 16rpx;
  right: 28rpx;
  display: flex;
  min-width: 142rpx;
  max-width: 190rpx;
  height: 50rpx;
  padding: 0 18rpx;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2rpx solid #f5cfaa;
  border-radius: 999rpx;
  background: #fbe7cf;
  box-sizing: border-box;
  color: #5a3927;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 4rpx 12rpx rgba(193, 116, 56, 0.08);
}

.consult-guidance {
  position: absolute;
  z-index: 1;
  top: 108rpx;
  right: 30rpx;
  left: 266rpx;
}

.consult-guidance-heading {
  position: relative;
  display: flex;
  min-height: 50rpx;
  align-items: center;
}

.consult-guidance-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #19263d;
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  white-space: nowrap;
}

.consult-weather-icon {
  color: #ef9a5b;
  font-size: 42rpx;
}

.consult-lunar-date {
  position: absolute;
  top: 2rpx;
  right: 0;
  display: flex;
  height: 44rpx;
  align-items: center;
  padding: 0 18rpx;
  border: 2rpx solid #f2d7bb;
  border-radius: 999rpx;
  background: rgba(255, 248, 238, 0.78);
  box-sizing: border-box;
  color: #4e3a2b;
  font-size: 20rpx;
  font-weight: 700;
  white-space: nowrap;
}

.consult-guidance-summary {
  display: block;
  margin-top: 12rpx;
  color: #18253b;
  font-size: 25rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  line-height: 1.65;
}

.consult-guidance-tags {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 12rpx;
  color: #263249;
  font-size: 20rpx;
  font-weight: 700;
  white-space: nowrap;
}

.consult-guidance-tag {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.consult-guidance-mark {
  display: flex;
  width: 40rpx;
  height: 40rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-size: 22rpx;
  font-weight: 500;
}

.consult-guidance-mark.good {
  background: #ce6b1d;
}

.consult-guidance-mark.avoid {
  background: #35a6d4;
}

.consult-tag-divider {
  width: 2rpx;
  height: 22rpx;
  background: #d8cfc4;
}

.consult-entry-list {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  gap: 14rpx;
  padding: 0 44rpx 12rpx;
}

.consult-entry-card {
  display: flex;
  height: 120rpx;
  align-items: center;
  padding: 0 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.84);
  border-radius: 22rpx;
  background: var(--consult-card);
  box-sizing: border-box;
  box-shadow: 0 12rpx 40rpx rgba(151, 103, 59, 0.04);
}

.consult-entry-card:active {
  transform: scale(0.99);
}

.consult-entry-icon {
  width: 62rpx;
  height: 62rpx;
  flex-shrink: 0;
}

.consult-entry-copy {
  display: flex;
  min-width: 0;
  align-items: baseline;
  margin-left: 18rpx;
  gap: 18rpx;
}

.consult-entry-title {
  flex-shrink: 0;
  font-size: 29rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.consult-entry-description {
  overflow: hidden;
  color: #657084;
  font-size: 17rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.consult-entry-chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: #ca8a55;
  font-size: 34rpx;
}

.consult-conversation {
  min-height: 0;
  flex: 1;
  width: auto;
  padding: 18rpx 44rpx calc(150rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.consult-user-row {
  display: flex;
  justify-content: flex-end;
}

.consult-user-message {
  margin-bottom: 16rpx;
  padding: 22rpx 26rpx;
  border: 2rpx solid #f2c58f;
  border-radius: 32rpx 32rpx 10rpx 32rpx;
  background: #f7d8b1;
  color: #493425;
  font-size: 27rpx;
  line-height: 1.4;
  box-shadow: 0 14rpx 36rpx rgba(174, 102, 44, 0.07);
}

.consult-teacher-meta {
  display: flex;
  align-items: center;
  gap: 14rpx;
  color: #8c8a86;
  font-size: 20rpx;
}

.consult-teacher-avatar {
  width: 68rpx;
  height: 68rpx;
  border: 2rpx solid #e8d8c4;
  border-radius: 50%;
  box-shadow: 0 8rpx 20rpx rgba(113, 70, 33, 0.08);
}

.consult-teacher-message {
  display: flex;
  flex-direction: column;
  margin: -34rpx 0 0 86rpx;
  padding: 18rpx 22rpx 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.88);
  border-radius: 10rpx 24rpx 24rpx;
  background: #fffaf5;
  color: #29364c;
  font-size: 25rpx;
  line-height: 1.65;
  box-shadow: 0 14rpx 44rpx rgba(155, 101, 52, 0.04);
}

.consult-emphasis,
.consult-example-lead {
  color: #a44f25;
  font-weight: 700;
}

.consult-example-lead {
  display: block;
}

.consult-question-entry {
  position: absolute;
  z-index: 5;
  right: 32rpx;
  bottom: max(14rpx, env(safe-area-inset-bottom));
  left: 32rpx;
  display: flex;
  height: 108rpx;
  align-items: center;
  gap: 14rpx;
  padding: 14rpx 18rpx 14rpx 26rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.88);
  border-radius: 54rpx;
  background: #fffdf9;
  box-sizing: border-box;
  box-shadow: 0 16rpx 54rpx rgba(140, 91, 49, 0.07);
  cursor: pointer;
}

.consult-question-field {
  display: flex;
  min-width: 0;
  height: 72rpx;
  flex: 1;
  align-items: center;
  gap: 20rpx;
  padding: 0 22rpx;
  border: 2rpx solid #f5e3d0;
  border-radius: 40rpx;
  background: #fcf6ee;
  box-sizing: border-box;
}

.consult-image-icon {
  flex-shrink: 0;
  color: #b57645;
  font-size: 32rpx;
}

.consult-question-input {
  display: flex;
  min-width: 0;
  height: 68rpx;
  flex: 1;
  align-items: center;
  color: #8c8985;
  font-size: 24rpx;
}

.consult-send-button {
  display: flex;
  width: 54rpx;
  height: 54rpx;
  flex: 0 0 54rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eea66f;
  color: #fff;
  font-size: 32rpx;
}

@media (max-width: 390px) {
  .consult-guidance {
    right: 24rpx;
    left: 248rpx;
  }

  .consult-guidance-title {
    gap: 8rpx;
    font-size: 33rpx;
  }

  .consult-lunar-date {
    padding: 0 18rpx;
    font-size: 18rpx;
  }

  .consult-guidance-summary {
    font-size: 24rpx;
  }

  .consult-guidance-tags {
    gap: 12rpx;
    font-size: 18rpx;
  }

  .consult-entry-list,
  .consult-conversation {
    padding-right: 34rpx;
    padding-left: 34rpx;
  }
}

@media (max-height: 690px) {
  .consult-hero {
    flex-basis: 370rpx;
    height: 370rpx;
  }

  .consult-guidance {
    top: 94rpx;
  }

  .consult-entry-card {
    height: 108rpx;
  }

  .consult-conversation {
    padding-top: 12rpx;
  }
}
</style>
