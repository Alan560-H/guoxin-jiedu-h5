<script setup lang="ts">
import type { RecordVo } from '@/models/guoxin/record'
import { useI18n } from 'vue-i18n'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import { RouterPaths } from '@/routerPaths'
import { isReportRecordPending, isReportRecordReady, isReportTaskFailed } from '@/utils/guoxin/reportGenerate'

defineProps<{
  records: RecordVo[]
  profileName: string
  jieduCount: number
  profileId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  startJiedu: []
}>()

const { t } = useI18n()

function formatRecordDirectionTitle(directions: string[]) {
  return directions.length
    ? `${directions.join('、')}解读`
    : t('profile.list.recordDefaultTitle')
}

function recordStatusText(rec: { status?: string }) {
  if (isReportRecordPending(rec.status))
    return t('profile.list.recordStatusPending')
  if (isReportTaskFailed(rec.status))
    return t('profile.list.recordStatusFailed')
  return t('profile.list.recordStatusReady')
}

function recordStatusClass(rec: { status?: string }) {
  if (isReportRecordPending(rec.status))
    return 'gx-badge-gold'
  if (isReportTaskFailed(rec.status))
    return 'gx-badge-muted'
  return 'gx-badge-green'
}

function goDetail(rec: { id: string, status?: string }) {
  if (!isReportRecordReady(rec.status) && rec.status) {
    uni.showToast({ title: t('profile.list.recordStatusPending'), icon: 'none' })
    return
  }
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${rec.id}` })
}
</script>

<template>
  <view class="records-section">
    <view class="records-section-header flex_row f_j_sb f_a_center">
      <view class="records-section-title">
        {{ t('profile.list.recordsSectionTitle', { name: profileName }) }}
      </view>
      <view class="gx-badge gx-badge-gold">
        {{ t('profile.list.recordsCountBadge', { n: jieduCount }) }}
      </view>
    </view>

    <view v-if="loading" class="records-loading">
      加载中...
    </view>

    <view v-else-if="!records.length" class="records-empty">
      <view class="records-empty-text">
        {{ t('profile.list.recordsEmpty') }}
      </view>
      <GxButton type="primary" size="sm" @click="emit('startJiedu')">
        {{ t('profile.list.startJiedu') }}
      </GxButton>
    </view>

    <view v-else class="records-list">
      <GxCard
        v-for="rec in records"
        :key="rec.id"
        class="record-item-card"
        :class="{ pending: isReportRecordPending(rec.status) }"
      >
        <view class="flex_row f_j_sb f_a_center card-header">
          <text class="record-title">
            {{ formatRecordDirectionTitle(rec.directions) }}
          </text>
          <view class="gx-badge" :class="recordStatusClass(rec)">
            {{ recordStatusText(rec) }}
          </view>
        </view>

        <view class="record-meta-details">
          <view class="meta-item">
            {{ t('profile.list.recordTimeLabel') }}<strong>{{ rec.time || '—' }}</strong>
          </view>
        </view>

        <view class="card-actions">
          <GxButton
            type="secondary"
            size="sm"
            :disabled="!!rec.status && !isReportRecordReady(rec.status)"
            @click="goDetail(rec)"
          >
            {{ isReportRecordPending(rec.status) ? t('profile.list.recordStatusPending') : t('profile.list.recordViewDetail') }}
          </GxButton>
        </view>
      </GxCard>
    </view>
  </view>
</template>

<style scoped lang="scss">
.records-section {
  margin: 0 24rpx 24rpx;
  padding: 24rpx 16rpx 8rpx;
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.88), rgba(252, 245, 233, 0.88));
  border-radius: 24rpx;
  border-left: 6rpx solid #153F33;
  border-top: 2rpx solid rgba(185, 148, 95, 0.15);
  border-right: 2rpx solid rgba(185, 148, 95, 0.15);
  border-bottom: 2rpx solid rgba(185, 148, 95, 0.15);
  box-sizing: border-box;
}

.records-section-header {
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.records-section-title {
  flex: 1;
  min-width: 0;
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 30rpx;
  font-weight: 700;
  color: #153F33;
}

.records-loading,
.records-empty {
  padding: 32rpx 0 24rpx;
  text-align: center;
}

.records-empty-text {
  font-size: 26rpx;
  color: #665B4E;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 16rpx;

  :deep(.gx-card) {
    margin: 0;
    padding: 24rpx 20rpx;
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
    gap: 16rpx;
  }

  .record-title {
    flex: 1;
    min-width: 0;
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 30rpx;
    font-weight: 700;
    color: #153F33;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.record-meta-details {
  font-size: 26rpx;
  color: #665B4E;
  margin-bottom: 24rpx;

  strong {
    color: #241F19;
    margin-left: 8rpx;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
