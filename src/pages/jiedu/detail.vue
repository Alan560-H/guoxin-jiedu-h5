<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { RecordVo } from '@/models/guoxin/record'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxFontScaleNav from '@/components/guoxin/GxFontScaleNav.vue'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const store = useGuoxinStore()
const { runLocked } = useActionLock()
const record = ref<RecordVo | null>(null)
const loading = ref(true)

/** uni-app H5 须在 onLoad 读 query 并拉数，onMounted 时 query 可能尚未就绪 */
onLoad(async (query) => {
  const idStr = query?.recordId || query?.reportId
  if (!idStr) {
    loading.value = false
    return
  }

  const recordId = String(idStr)
  store.activeRecordId = recordId
  store.initSeedData()
  store.setFontScale(store.fontScale)

  try {
    if (store.useRemoteApi) {
      const id = Number(recordId)
      if (!Number.isNaN(id)) {
        const detail = await store.loadReportDetail(id)
        if (detail)
          record.value = store.mapServerDetailToRecord(detail)
      }
      if (!record.value && store.activeProfileId) {
        await store.loadReadingRecords(store.activeProfileId)
        const found = store.readingRecords.find(r => String(r.reportId ?? r.id) === recordId)
        if (found)
          record.value = store.mapServerReportToRecord(found)
      }
    }
    else {
      record.value = store.getRecordById(recordId)
    }
  }
  finally {
    loading.value = false
    // eslint-disable-next-line no-console
    console.log('[jiedu/detail] record=', record.value)
    // eslint-disable-next-line no-console
    console.log('[jiedu/detail] profile=', profile.value)
  }
})

const profile = computed(() => {
  if (!record.value)
    return null
  if (store.useRemoteApi)
    return { name: record.value.profileName, relationText: '' }
  return store.getProfileById(record.value.profileId)
})

function goBack() {
  uni.navigateBack()
}

function goHome() {
  uni.reLaunch({ url: RouterPaths.home })
}

function goSetupAgain() {
  void runLocked(async () => {
    const pid = record.value?.profileId
      || (profile.value && 'id' in profile.value && profile.value.id ? profile.value.id : undefined)
    if (pid)
      store.navigateToSetup(pid)
    else
      uni.showToast({ title: '无法确定档案', icon: 'none' })
  })
}
</script>

<template>
  <view v-if="loading" class="gx-page flex_column page-container">
    <GxNavBar title="专属解读详情" :show-back="true">
      <template #right>
        <GxFontScaleNav />
      </template>
    </GxNavBar>
    <view class="gx-empty-state">
      <view class="empty-text">加载中...</view>
    </view>
  </view>

  <view v-else-if="record && profile" class="gx-page flex_column page-container">
    <GxNavBar title="专属解读详情" :show-back="true">
      <template #right>
        <GxFontScaleNav />
      </template>
    </GxNavBar>

    <scroll-view scroll-y class="gx-scroll">
      <view class="report-wrapper">

        <!-- Report Paper Frame Layout -->
        <view class="report-frame">
          <!-- Report Header -->
          <view class="report-header">
            <view class="report-title-main">{{ record.title || '心语生活参考' }}</view>
            <view class="report-meta-text">
              <view class="meta-row-item">档案：<strong>{{ profile.name }}</strong><template v-if="profile.relationText"> ({{ profile.relationText }})</template></view>
              <view class="meta-row-item">生成时间：{{ record.time }}</view>
              <view v-if="record.directions.length" class="meta-row-item highlight">关注：{{ record.directions.join('、') }}</view>
            </view>
          </view>

          <!-- Report Sections -->
          <view class="report-sections">
            <view
              v-for="sec in record.content || []"
              :key="sec.title"
              class="report-section"
            >
              <view class="report-section-title">
                {{ sec.title }}
              </view>
              <view class="report-body-text">
                {{ sec.body }}
              </view>
            </view>
          </view>

          <!-- Disclaimer card inside the frame -->
          <view class="report-disclaimer-card">
            <strong>温馨提示与免责声明：</strong><br>
            本报告基于AI生成，旨在为您在面对日常情绪及家庭交往时提供柔性参考建议。本内容不属于玄学占卜或命运预测，不具备医疗诊断、心理治疗、法律维权或理财投资等专业效力。涉及重大现实决策时，请咨询专业人士。
          </view>
        </view>

      </view>

      <!-- Action buttons -->
      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" @click="goSetupAgain">
          再次解读 / 重新生成
        </GxButton>
        <GxButton type="secondary" @click="goBack">
          返回解读记录
        </GxButton>
        <GxButton type="outline" @click="goHome">
          返回首页
        </GxButton>
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>

  <view v-else class="gx-page flex_column page-container">
    <GxNavBar title="专属解读详情" :show-back="true">
      <template #right>
        <GxFontScaleNav />
      </template>
    </GxNavBar>
    <view class="gx-empty-state">
      <view class="empty-icon">📋</view>
      <view class="empty-text">解读记录不存在或已失效。</view>
      <GxButton type="primary" @click="goHome">
        返回首页
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

.report-wrapper {
  padding: 32rpx;
  box-sizing: border-box;
}

.report-frame {
  background-color: #FFFDF9;
  border: 2rpx solid #E2DCD3;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  position: relative;
  box-shadow: inset 0 0 80rpx rgba(165, 132, 88, 0.05), 0 8rpx 24rpx rgba(74, 49, 21, 0.04);
  box-sizing: border-box;

  /* Double traditional border */
  &::before {
    content: "";
    position: absolute;
    top: 12rpx;
    bottom: 12rpx;
    left: 12rpx;
    right: 12rpx;
    border: 2rpx solid #E8DFD0;
    pointer-events: none;
    border-radius: 16rpx;
  }
}

.report-header {
  text-align: center;
  border-bottom: 4rpx double #D8CDBC;
  padding-bottom: 24rpx;
  margin-bottom: 36rpx;
  position: relative;
  z-index: 10;
}

.report-title-main {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: calc(44rpx * var(--gx-font-scale));
  font-weight: 900;
  color: #153F33;
  letter-spacing: 4rpx;
}

.report-meta-text {
  font-size: calc(24rpx * var(--gx-font-scale));
  color: #665B4E;
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
}

.meta-row-item {
  strong {
    color: #241F19;
  }

  &.highlight {
    color: #153F33;
    font-weight: 700;
  }
}

.report-sections {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.report-section-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: calc(30rpx * var(--gx-font-scale));
  font-weight: 700;
  color: #153F33;
  border-left: 6rpx solid #B9945F;
  padding-left: 16rpx;
  margin-bottom: 16rpx;
  line-height: 1.2;
}

.report-body-text {
  font-size: calc(28rpx * var(--gx-font-scale));
  line-height: 1.85;
  color: #241F19;
  text-align: justify;
  white-space: pre-wrap;
}

.report-disclaimer-card {
  background-color: #EEF3EA;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: calc(22rpx * var(--gx-font-scale));
  color: #665B4E;
  line-height: 1.6;
  margin-top: 48rpx;
  border: 2rpx solid #E7D6B9;
  position: relative;
  z-index: 10;
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
