<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import { isReportRecordPending, isReportRecordReady, isReportTaskFailed } from '@/utils/guoxin/reportGenerate'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import { getBirthYearFromBirthDay } from '@/utils/guoxin/birthDateTime'

const store = useGuoxinStore()
const showCount = ref(0)

async function refreshRemoteRecords(force = false) {
  if (!store.useRemoteApi)
    return
  await Promise.all([
    store.ensureReportsLoaded(force),
    store.ensureReadingRecordsLoaded(force),
  ])
  if (store.activeProfile?.id)
    await store.loadJieduRecords(store.activeProfile.id)
}

onMounted(() => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  store.initSeedData()
})

/** 首次用缓存；从其他页返回时强制刷新 */
onShow(() => {
  if (!store.isLoggedIn)
    return
  showCount.value++
  void refreshRemoteRecords(showCount.value > 1)
})

const profile = computed(() => store.activeProfile)
const list = computed(() => {
  if (store.useRemoteApi) {
    const profileId = profile.value?.id
    const merged = new Map<string, ReturnType<typeof store.mapServerReportToRecord>>()
    for (const r of store.serverReports) {
      const item = store.mapServerReportToRecord(r)
      if (profileId && item.profileId !== profileId && item.profileId !== 'server')
        continue
      merged.set(item.id, item)
    }
    for (const r of store.jieduRecords) {
      if (profileId && r.profileId !== profileId)
        continue
      merged.set(r.id, r)
    }
    return Array.from(merged.values())
  }
  if (!profile.value)
    return []
  return store.getRecordsByProfileId(profile.value.id)
})

function recordStatusText(rec: { status?: string }) {
  if (isReportRecordPending(rec.status))
    return '生成中'
  if (isReportTaskFailed(rec.status))
    return '生成失败'
  return '已整理'
}

function recordStatusClass(rec: { status?: string }) {
  if (isReportRecordPending(rec.status))
    return 'gx-badge-gold'
  if (isReportTaskFailed(rec.status))
    return 'gx-badge-muted'
  return 'gx-badge-green'
}

function goDetail(rec: { id: string; status?: string }) {
  if (!isReportRecordReady(rec.status) && rec.status) {
    uni.showToast({ title: '报告生成中，请稍后再查看', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${rec.id}` })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="解读记录" :show-back="true" />

    <scroll-view scroll-y class="gx-scroll">
      <!-- Active Profile Header Card -->
      <view v-if="profile" class="profile-header-meta flex_row f_j_sb f_a_center">
        <view class="meta-left">
          <view class="profile-name">
            {{ profile.name }}
          </view>
          <view class="profile-sub">
            关系：{{ profile.relationText }} · 性别：{{ profile.genderText }} · {{ getBirthYearFromBirthDay(profile.birthDay) }}年出生
          </view>
        </view>
        <view class="meta-right">
          <view class="gx-badge gx-badge-gold">
            {{ list.length }}次解读
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="!list.length" class="gx-empty-state">
        <view class="empty-icon">📋</view>
        <view class="empty-text">当前档案还没有解读记录，快来发起第一次解读吧。</view>
        <GxButton type="primary" @click="store.navigateToSetup(profile?.id)">
          开始第一次解读
        </GxButton>
      </view>

      <!-- Record Cards -->
      <GxCard v-slot v-for="rec in list" :key="rec.id" class="record-item-card" :class="{ pending: isReportRecordPending(rec.status) }">
        <view class="flex_row f_j_sb f_a_center card-header">
          <text class="record-title">{{ rec.title }}</text>
          <view class="gx-badge" :class="recordStatusClass(rec)">
            {{ recordStatusText(rec) }}
          </view>
        </view>

        <view class="record-meta-details">
          <view class="meta-item">时间：<strong>{{ rec.time || '—' }}</strong></view>
          <view class="meta-item">关注：<strong class="highlight-green">{{ rec.directions.length ? rec.directions.join('、') : '—' }}</strong></view>
        </view>

        <view class="card-actions">
          <GxButton
            type="secondary"
            size="sm"
            :disabled="!!rec.status && !isReportRecordReady(rec.status)"
            @click="goDetail(rec)"
          >
            {{ isReportRecordPending(rec.status) ? '生成中' : '查看详情' }}
          </GxButton>
        </view>
      </GxCard>

      <!-- Action Button at Bottom -->
      <view v-if="list.length" class="gx-btn-group action-buttons">
        <GxButton type="primary" @click="store.navigateToSetup(profile?.id)">
          为当前档案再次解读
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

.profile-header-meta {
  margin: 32rpx 32rpx 24rpx;
  padding: 30rpx 32rpx;
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.88), rgba(252, 245, 233, 0.88));
  border-radius: 24rpx;
  border-left: 6rpx solid #153F33;
  border-top: 2rpx solid rgba(185, 148, 95, 0.15);
  border-right: 2rpx solid rgba(185, 148, 95, 0.15);
  border-bottom: 2rpx solid rgba(185, 148, 95, 0.15);
  box-shadow: 0 4rpx 16rpx rgba(100, 70, 20, 0.04);
  box-sizing: border-box;

  .profile-name {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 34rpx;
    font-weight: 700;
    color: #153F33;
    margin-bottom: 8rpx;
  }

  .profile-sub {
    font-size: 24rpx;
    color: #665B4E;
  }
}

.gx-badge-muted {
  background: rgba(149, 136, 120, 0.2);
  color: #665B4E;
}

.record-item-card {
  border-left: 8rpx solid #153F33;

  &.pending {
    border-left-color: #B9945F;
  }

  .card-header {
    border-bottom: 2rpx solid rgba(185, 148, 95, 0.15);
    padding-bottom: 16rpx;
    margin-bottom: 16rpx;
  }

  .record-title {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 30rpx;
    font-weight: 700;
    color: #153F33;
  }
}

.record-meta-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  font-size: 26rpx;
  color: #665B4E;
  margin-bottom: 24rpx;

  strong {
    color: #241F19;
    margin-left: 8rpx;
  }

  .highlight-green {
    color: #153F33;
    font-weight: 700;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
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
