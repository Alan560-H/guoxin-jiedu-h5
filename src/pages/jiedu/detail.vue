<script setup lang="ts">
import type { RecordVo } from '@/models/guoxin/record'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxFontScaleNav from '@/components/guoxin/GxFontScaleNav.vue'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import ReportView from '@/components/guoxin/report/ReportView.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateToProfileList } from '@/utils/guoxin/navigation'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const store = useGuoxinStore()
const { runLocked } = useActionLock()
const { t } = useI18n()
const record = ref<RecordVo | null>(null)
const loading = ref(true)

const hasReport = computed(() => !!record.value?.reportDocument?.chapters?.length)

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
    if (record.value?.profileId)
      store.setActiveProfile(record.value.profileId)
  }
  finally {
    loading.value = false
  }
})

function goBack() {
  navigateToProfileList(record.value?.profileId || store.activeProfileId || undefined)
}

function goHome() {
  uni.reLaunch({ url: RouterPaths.home })
}

function goSetupAgain() {
  void runLocked(async () => {
    const pid = record.value?.profileId || store.activeProfileId || undefined
    if (pid)
      store.navigateToReportConfirm(pid)
    else
      uni.showToast({ title: '无法确定档案', icon: 'none' })
  })
}
</script>

<template>
  <view v-if="loading" class="detail-page flex_column">
    <GxNavBar title="专属解读详情" :show-back="true" report>
      <template #right>
        <GxFontScaleNav />
      </template>
    </GxNavBar>
    <view class="detail-empty">
      <view class="detail-empty-text">
        加载中...
      </view>
    </view>
  </view>

  <view v-else-if="record" class="detail-page flex_column">
    <GxNavBar title="专属解读详情" :show-back="true" report>
      <template #right>
        <GxFontScaleNav />
      </template>
    </GxNavBar>

    <scroll-view scroll-y class="detail-scroll">
      <ReportView
        v-if="hasReport && record.reportDocument"
        :document="record.reportDocument"
        :report-title="record.title"
      />

      <view v-else class="detail-fallback">
        <view class="detail-fallback-title">
          {{ record.title || '心语生活参考' }}
        </view>
        <view class="detail-fallback-meta">
          档案：{{ record.profileName }} · {{ record.time }}
        </view>
        <view
          v-for="sec in record.content || []"
          :key="sec.title"
          class="detail-fallback-section"
        >
          <view class="detail-fallback-sec-title">
            {{ sec.title }}
          </view>
          <view class="detail-fallback-body">
            {{ sec.body }}
          </view>
        </view>
      </view>

      <view class="detail-actions">
        <GxButton type="primary" @click="goSetupAgain">
          再次解读 / 重新生成
        </GxButton>
        <GxButton type="secondary" @click="goBack">
          {{ t('profile.list.backToProfileList') }}
        </GxButton>
        <GxButton type="outline" @click="goHome">
          返回首页
        </GxButton>
      </view>

      <view class="detail-safe-bottom" />
    </scroll-view>
  </view>

  <view v-else class="detail-page flex_column">
    <GxNavBar title="专属解读详情" :show-back="true" report>
      <template #right>
        <GxFontScaleNav />
      </template>
    </GxNavBar>
    <view class="detail-empty">
      <view class="detail-empty-icon">
        📋
      </view>
      <view class="detail-empty-text">
        解读记录不存在或已失效。
      </view>
      <GxButton type="primary" @click="goHome">
        返回首页
      </GxButton>
    </view>
  </view>
</template>

<style scoped lang="scss">
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: transparent;
  box-sizing: border-box;
}

.detail-scroll {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.detail-fallback {
  padding: 16px;
  color: var(--gx-chat-muted, var(--gx-text-sub, #755d52));
  font-size: calc(14px * var(--gx-font-scale, 1));
}

.detail-fallback-title {
  font-size: calc(26px * var(--gx-font-scale, 1));
  font-weight: 700;
  color: var(--gx-chat-red, var(--gx-green, #b43a3d));
  text-align: center;
  margin-bottom: 12px;
}

.detail-fallback-meta {
  font-size: calc(13px * var(--gx-font-scale, 1));
  color: var(--gx-chat-hint, var(--gx-text-hint, #a28777));
  text-align: center;
  margin-bottom: 24px;
}

.detail-fallback-section {
  margin-bottom: 24px;
}

.detail-fallback-sec-title {
  font-size: calc(16px * var(--gx-font-scale, 1));
  font-weight: 600;
  color: var(--gx-chat-gold, var(--gx-gold, #d5a43d));
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid var(--gx-chat-gold, var(--gx-gold, #d5a43d));
}

.detail-fallback-body {
  font-size: calc(14px * var(--gx-font-scale, 1));
  line-height: 2;
  white-space: pre-wrap;
  text-align: justify;
  color: var(--gx-chat-muted, var(--gx-text-sub, #755d52));
}

.detail-actions {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-safe-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 32rpx;
}

.detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 120rpx 48rpx;
  flex: 1;

  .detail-empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
    opacity: 0.3;
  }

  .detail-empty-text {
    font-size: 28rpx;
    color: var(--gx-chat-hint, var(--gx-text-hint, #a28777));
    margin-bottom: 48rpx;
    line-height: 1.6;
  }
}
</style>
