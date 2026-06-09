<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RecordVo } from '@/models/guoxin/record'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const { t } = useI18n()
const store = useGuoxinStore()
const record = ref<RecordVo | null>(null)

onMounted(async () => {
  if (!store.activeRecordId)
    return
  record.value = await store.fetchReport(store.activeRecordId)
})

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
        <view
          v-for="(section, idx) in record.content"
          :key="idx"
          class="checklist-item"
        >
          <view class="item-title">{{ section.title }}</view>
          <view class="item-body">{{ section.body }}</view>
        </view>
      </GxCard>

      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" @click="goRecords">
          {{ t('jiedu.complete.viewRecords') }}
        </GxButton>
        <GxButton type="secondary" @click="goHome">
          {{ t('jiedu.complete.backHome') }}
        </GxButton>
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>
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
  padding: 60rpx 40rpx 48rpx;
  text-align: center;
  color: #FCF5E9;
}

.success-mark {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #B9945F;
  color: #241F19;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 80rpx;
  margin: 0 auto 24rpx;
}

.banner-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.banner-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
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
    margin-bottom: 24rpx;
  }
}

.checklist-item {
  margin-bottom: 28rpx;

  .item-title {
    font-size: 28rpx;
    font-weight: 700;
    color: #153F33;
    margin-bottom: 12rpx;
  }

  .item-body {
    font-size: 26rpx;
    color: #665B4E;
    line-height: 1.7;
    white-space: pre-wrap;
  }
}

.action-buttons {
  margin: 32rpx 0 40rpx;
}
</style>
