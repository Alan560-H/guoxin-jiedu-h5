<script setup lang="ts">
import type { RecordVo } from '@/models/guoxin/record'
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateToProfileList } from '@/utils/guoxin/navigation'

const store = useGuoxinStore()
const { t } = useI18n()
const reportIdParam = ref('')
const record = ref<RecordVo | null>(null)
const loading = ref(true)

onLoad((query) => {
  if (query?.reportId)
    reportIdParam.value = String(query.reportId)
})

onMounted(async () => {
  store.initSeedData()
  try {
    if (reportIdParam.value) {
      const id = Number(reportIdParam.value)
      if (!isNaN(id)) {
        const detail = await store.loadReportDetail(id)
        if (detail)
          record.value = store.mapServerDetailToRecord(detail)
      }
      if (!record.value && store.activeProfileId) {
        await store.loadReadingRecords(store.activeProfileId)
        const found = store.readingRecords.find((r: { reportId?: number, id?: number }) => String(r.reportId ?? r.id) === reportIdParam.value)
        if (found)
          record.value = store.mapServerReportToRecord(found)
      }
    }
    if (record.value?.profileId)
      store.setActiveProfile(record.value.profileId)
  }
  finally {
    loading.value = false
  }
})

function goDetail() {
  if (!record.value)
    return
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${record.value.id}` })
}

function goRecords() {
  navigateToProfileList(record.value?.profileId || store.activeProfileId || undefined)
}

function goHome() {
  uni.reLaunch({ url: RouterPaths.home })
}
</script>

<template>
  <view v-if="loading" class="gx-layout-page">
    <GxNavBar title="解读已完成" :show-back="true" />
    <view class="gx-empty-state">
      <view class="empty-text">
        加载中...
      </view>
    </view>
  </view>

  <view v-else-if="record" class="gx-layout-page">
    <GxNavBar title="解读已完成" :show-back="true" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="complete-banner">
        <view class="success-mark">
          ✓
        </view>
        <view class="banner-title">
          本次专属解读已整理完成
        </view>
        <view class="banner-subtitle">
          心语老师已根据您的档案信息和关注方向，为您整理了本次专属解读建议。
        </view>
      </view>

      <GxCard class="content-checklist-card">
        <view class="gx-form-label section-label">
          解读报告包含以下内容：
        </view>

        <view class="checklist-items">
          <view
            v-for="(sec, idx) in record.content || []"
            :key="sec.title"
            class="checklist-row flex_row f_a_center"
          >
            <view class="bullet-dot">
              <text class="dot-num">
                {{ idx + 1 }}
              </text>
            </view>
            <text class="checklist-title">
              {{ sec.title.replace(/^[^、]+、/, '') }}
            </text>
          </view>
        </view>
      </GxCard>

      <view class="gx-btn-group action-buttons">
        <GxButton type="primary" @click="goDetail">
          查看完整解读
        </GxButton>
        <GxButton type="secondary" @click="store.navigateToSetup()">
          继续和心语老师聊聊
        </GxButton>
        <GxButton type="outline" @click="goRecords">
          {{ t('jiedu.complete.viewProfileRecords') }}
        </GxButton>
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>

  <view v-else class="gx-layout-page">
    <GxNavBar title="解读已完成" :show-back="true" />
    <view class="gx-empty-state">
      <view class="empty-icon">
        📋
      </view>
      <view class="empty-text">
        未找到本次解读记录，您可以返回首页重新发起。
      </view>
      <GxButton type="primary" @click="goHome">
        返回首页
      </GxButton>
    </view>
  </view>
</template>

<style scoped lang="scss">
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
