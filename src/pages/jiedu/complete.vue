<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const { t } = useI18n()
const store = useGuoxinStore()

onMounted(() => store.initSeedData())

const record = computed(() => store.getRecordById(store.activeRecordId))

function goRecords() {
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}

function goHome() {
  uni.reLaunch({ url: RouterPaths.home })
}
</script>

<template>
  <view v-if="record" class="gx-page flex_column page-container">
    <GxNavBar :title="t('jiedu.complete.title')" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="complete-banner">
        <view class="success-mark">✓</view>
        <view class="banner-title">{{ t('jiedu.complete.bannerTitle') }}</view>
        <view class="banner-subtitle">{{ t('jiedu.complete.bannerSubtitle') }}</view>
      </view>

      <GxCard class="content-checklist-card">
        <view class="gx-form-label section-label">
          {{ t('jiedu.complete.checklistLabel') }}
        </view>

        <view class="checklist-items">
          <view
            v-for="(sec, idx) in record.content || []"
            :key="sec.title"
            class="checklist-row flex_row f_a_center"
          >
            <view class="bullet-dot">
              <text class="dot-num">{{ idx + 1 }}</text>
            </view>
            <text class="checklist-title">{{ sec.title.replace(/^[^、]+、/, '') }}</text>
          </view>
        </view>
      </GxCard>

      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" @click="goHome">
          {{ t('jiedu.complete.later') }}
        </GxButton>
        <GxButton type="secondary" @click="store.navigateToSetup()">
          {{ t('jiedu.complete.continueChat') }}
        </GxButton>
        <GxButton type="outline" @click="goRecords">
          {{ t('jiedu.complete.viewRecords') }}
        </GxButton>
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>

  <view v-else class="gx-page flex_column page-container">
    <GxNavBar :title="t('jiedu.complete.title')" />
    <view class="gx-empty-state">
      <view class="empty-icon">📋</view>
      <view class="empty-text">{{ t('jiedu.complete.emptyText') }}</view>
      <GxButton type="primary" @click="goHome">
        {{ t('jiedu.complete.backHome') }}
      </GxButton>
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

.complete-banner {
  background: linear-gradient(160deg, #153F33, #255648);
  padding: 60rpx 40rpx;
  text-align: center;
  color: #FCF5E9;
  flex-shrink: 0;
}

.success-mark {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background-color: #EEF3EA;
  color: #153F33;
  font-size: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx auto;
  border: 4rpx solid #B9945F;
  font-weight: 700;
}

.banner-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 38rpx;
  font-weight: 900;
  color: #FCF5E9;
  margin-bottom: 12rpx;
}

.banner-subtitle {
  font-size: 26rpx;
  line-height: 1.6;
  opacity: 0.85;
}

.content-checklist-card {
  margin-top: 32rpx;

  .section-label {
    font-family: "Noto Serif SC", Georgia, serif;
    color: #153F33;
    font-size: 30rpx;
    font-weight: 700;
    border-left: 6rpx solid #B9945F;
    padding-left: 16rpx;
    line-height: 1;
    margin-bottom: 30rpx;
  }
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checklist-row {
  gap: 24rpx;
}

.bullet-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background-color: rgba(185, 148, 95, 0.16);
  border: 2rpx solid rgba(185, 148, 95, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .dot-num {
    font-size: 22rpx;
    color: #B9945F;
    font-weight: 700;
  }
}

.checklist-title {
  font-size: 28rpx;
  color: #241F19;
  font-weight: 700;
}

.action-buttons {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}

.gx-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 120rpx 48rpx;
  box-sizing: border-box;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 28rpx;
    color: #665B4E;
    margin-bottom: 48rpx;
    line-height: 1.6;
  }
}
</style>
