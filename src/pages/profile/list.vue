<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import type { ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'

const store = useGuoxinStore()

onMounted(() => store.initSeedData())

const profiles = computed(() => store.profiles)
const currentProfile = computed(() => store.activeProfile ?? profiles.value[0] ?? null)
const currentRecords = computed(() => {
  if (!currentProfile.value)
    return []
  return store.getRecordsByProfileId(currentProfile.value.id)
})

function profileAge(p: { birthYear: number }) {
  return new Date().getFullYear() - p.birthYear
}

function profileSummary(p: ProfileVo) {
  return `${p.relationText} · ${p.genderText} · ${profileAge(p)}岁`
}

function recordTitle(record: RecordVo) {
  return record.directions.length ? `${record.directions.join('、')}解读` : record.title
}

function goCreate() {
  uni.navigateTo({ url: RouterPaths.profileCreate })
}

function selectProfile(id: string) {
  store.setActiveProfile(id)
}

function startJiedu(id?: string) {
  if (id)
    store.navigateToSetup(id)
}

function goDetail(id: string) {
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${id}` })
}

function goEdit(id: string) {
  uni.navigateTo({ url: `${RouterPaths.profileCreate}?id=${id}` })
}

function confirmDelete(id: string) {
  const p = store.getProfileById(id)
  if (!p)
    return

  uni.showModal({
    title: '删除确认',
    content: `您确定要删除“${p.name}”的档案吗？删除后其历史解读记录也将一并清除。`,
    confirmText: '确定删除',
    cancelText: '取消',
    confirmColor: '#B7654A',
    success: (res) => {
      if (res.confirm) {
        store.deleteProfile(id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    },
  })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="我的心语档案" right-text="+ 新建" @right-click="goCreate" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="profile-explain">
        先选择一个心语档案，下面只展示该档案对应的基础信息和解读记录。
      </view>

      <view v-if="profiles.length === 0" class="gx-empty-state">
        <view class="empty-icon">👤</view>
        <view class="empty-text">您还没有创建心语档案，可以先为自己或家人创建一个档案。</view>
        <GxButton type="primary" @click="goCreate">
          创建第一个档案
        </GxButton>
      </view>

      <template v-else>
        <view class="selector-title flex_row f_j_sb f_a_center">
          <text class="selector-title-main">选择档案</text>
          <text class="selector-title-tip">点选切换</text>
        </view>

        <view class="profile-switch-grid">
          <view
            v-for="p in profiles"
            :key="p.id"
            class="profile-switch-card"
            :class="{ active: currentProfile?.id === p.id }"
            @tap="selectProfile(p.id)"
          >
            <text class="switch-name">{{ p.name }}</text>
            <text v-if="currentProfile?.id === p.id" class="switch-current">当前</text>
            <view class="switch-meta">{{ profileSummary(p) }}</view>
            <view class="switch-count">{{ p.jieduCount }}次解读</view>
          </view>
        </view>

        <view v-if="currentProfile" class="profile-main-card">
          <view class="flex_row f_j_sb f_a_start card-header">
            <text class="profile-name">{{ currentProfile.name }}</text>
            <view class="flex_row f_a_center header-right-actions">
              <text class="profile-action-btn edit-btn" @tap.stop="goEdit(currentProfile.id)">编辑</text>
              <text class="profile-action-btn delete-btn" @tap.stop="confirmDelete(currentProfile.id)">删除</text>
              <view class="gx-badge gx-badge-gold">
                {{ currentProfile.relationText }}
              </view>
            </view>
          </view>

          <view class="profile-card-grid">
            <view class="profile-meta-item">性别：<strong>{{ currentProfile.genderText }}</strong></view>
            <view class="profile-meta-item">年龄：<strong>{{ profileAge(currentProfile) }}岁</strong></view>
            <view class="profile-meta-item">历法：<strong>{{ currentProfile.calendarTypeText }}</strong></view>
            <view class="profile-meta-item">真太阳时：<strong>{{ currentProfile.useTrueSolarTime ? '是' : '否' }}</strong></view>
            <view class="profile-meta-item full">出生地：<strong>{{ currentProfile.birthPlace || '未填写' }}</strong></view>
            <view class="profile-meta-item full">已完成解读：<strong>{{ currentProfile.jieduCount }} 次</strong></view>
            <view class="profile-meta-item full">最近解读：<strong>{{ currentProfile.lastJieduTime || '无' }}</strong></view>
          </view>

          <GxButton type="primary" @click="startJiedu(currentProfile.id)">
            开始解读
          </GxButton>
        </view>

        <view v-if="currentProfile" class="records-card">
          <view class="records-header flex_row f_j_sb f_a_center">
            <text class="records-title">{{ currentProfile.name }}解读记录</text>
            <view class="record-count-badge">{{ currentRecords.length }}次解读</view>
          </view>

          <view v-if="currentRecords.length === 0" class="records-empty">
            <view class="records-empty-text">当前档案还没有解读记录。</view>
            <GxButton type="secondary" size="sm" @click="startJiedu(currentProfile.id)">
              开始第一次解读
            </GxButton>
          </view>

          <template v-else>
            <view
              v-for="record in currentRecords"
              :key="record.id"
              class="record-item"
            >
              <view class="flex_row f_j_sb f_a_start record-item-header">
                <text class="record-title">{{ recordTitle(record) }}</text>
                <view class="gx-badge gx-badge-green">
                  已整理
                </view>
              </view>
              <view class="record-time">时间：<strong>{{ record.time }}</strong></view>
              <view class="record-action">
                <GxButton type="secondary" size="sm" @click="goDetail(record.id)">
                  查看详情
                </GxButton>
              </view>
            </view>
          </template>
        </view>

        <view class="gx-btn-group add-button-wrap">
          <GxButton type="outline" @click="goCreate">
            ＋ 创建新的心语档案
          </GxButton>
        </view>
      </template>

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

.profile-explain {
  font-size: calc(30rpx * var(--gx-font-scale));
  color: #665B4E;
  margin: 32rpx 32rpx 28rpx;
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.88), rgba(252, 245, 233, 0.88));
  padding: 30rpx 34rpx;
  border-radius: 0 28rpx 28rpx 0;
  border-left: 8rpx solid #153F33;
  line-height: 1.65;
}

.gx-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 100rpx 48rpx;
  box-sizing: border-box;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
    opacity: 0.3;
  }

  .empty-text {
    font-size: calc(30rpx * var(--gx-font-scale));
    color: #665B4E;
    margin-bottom: 48rpx;
    line-height: 1.6;
  }
}

.selector-title {
  margin: 0 32rpx 20rpx;
}

.selector-title-main {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: calc(38rpx * var(--gx-font-scale));
  font-weight: 900;
  color: #153F33;
  line-height: 1.15;
}

.selector-title-tip {
  font-size: calc(24rpx * var(--gx-font-scale));
  color: #87643A;
  font-weight: 800;
}

.profile-switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin: 0 32rpx 28rpx;
}

.profile-switch-card {
  position: relative;
  min-height: 156rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(185, 148, 95, 0.34);
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  box-shadow: 0 8rpx 18rpx rgba(74, 49, 21, 0.06);
  box-sizing: border-box;

  &.active {
    border: 4rpx solid #153F33;
    background: linear-gradient(180deg, rgba(255, 253, 247, 0.98), rgba(252, 246, 235, 0.96));
  }
}

.switch-name {
  display: block;
  max-width: calc(100% - 78rpx);
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: calc(40rpx * var(--gx-font-scale));
  line-height: 1.15;
  font-weight: 900;
  color: #153F33;
  word-break: break-word;
}

.switch-current {
  position: absolute;
  right: 18rpx;
  top: 20rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #E6F1EA;
  color: #153F33;
  font-size: calc(22rpx * var(--gx-font-scale));
  line-height: 1;
  font-weight: 900;
}

.switch-meta {
  margin-top: 16rpx;
  font-size: calc(24rpx * var(--gx-font-scale));
  color: #665B4E;
  line-height: 1.35;
  font-weight: 700;
}

.switch-count {
  margin-top: 10rpx;
  font-size: calc(24rpx * var(--gx-font-scale));
  color: #B58A4C;
  line-height: 1.2;
  font-weight: 900;
}

.profile-main-card,
.records-card {
  margin: 0 32rpx 28rpx;
  padding: 32rpx;
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(251, 244, 231, 0.9)), #FFF9ED;
  border-radius: 36rpx;
  border: 2rpx solid rgba(185, 148, 95, 0.34);
  border-left: 8rpx solid #153F33;
  box-shadow: 0 8rpx 20rpx rgba(74, 49, 21, 0.06);
  box-sizing: border-box;
  overflow: hidden;
}

.card-header,
.records-header,
.record-item-header {
  gap: 16rpx;
}

.card-header,
.records-header {
  border-bottom: 2rpx solid rgba(185, 148, 95, 0.15);
  padding-bottom: 18rpx;
  margin-bottom: 20rpx;
}

.profile-name,
.records-title,
.record-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-weight: 900;
  color: #153F33;
  line-height: 1.25;
  word-break: break-word;
}

.profile-name {
  flex: 1 1 180rpx;
  min-width: 0;
  font-size: calc(42rpx * var(--gx-font-scale));
}

.header-right-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  flex: 0 1 auto;
  flex-wrap: wrap;
}

.profile-action-btn {
  font-size: calc(26rpx * var(--gx-font-scale));
  font-weight: 800;
  cursor: pointer;
  padding: 8rpx 18rpx;
  border-radius: 10rpx;
  transition: all 0.2s ease;
  line-height: 1.2;
}

.edit-btn {
  color: #87643A;
  background-color: rgba(185, 148, 95, 0.12);
  border: 1px solid rgba(185, 148, 95, 0.25);

  &:active {
    background-color: rgba(185, 148, 95, 0.25);
  }
}

.delete-btn {
  color: #B7654A;
  background-color: rgba(183, 101, 74, 0.08);
  border: 1px solid rgba(183, 101, 74, 0.2);

  &:active {
    background-color: rgba(183, 101, 74, 0.18);
  }
}

.profile-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx 28rpx;
  font-size: calc(30rpx * var(--gx-font-scale));
  margin-bottom: 28rpx;
}

.profile-meta-item {
  color: #665B4E;
  line-height: 1.45;
  font-weight: 650;

  &.full {
    grid-column: span 2;
  }

  strong {
    color: #241F19;
    margin-left: 8rpx;
    font-size: calc(32rpx * var(--gx-font-scale));
    font-weight: 900;
    word-break: break-word;
  }
}

.records-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: calc(38rpx * var(--gx-font-scale));
}

.record-count-badge {
  flex: 0 0 auto;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(185, 148, 95, 0.14);
  border: 2rpx solid rgba(185, 148, 95, 0.24);
  color: #B58A4C;
  font-size: calc(24rpx * var(--gx-font-scale));
  line-height: 1;
  font-weight: 900;
}

.records-empty {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 20rpx 0 4rpx;
}

.records-empty-text {
  color: #665B4E;
  font-size: calc(30rpx * var(--gx-font-scale));
  line-height: 1.5;
  text-align: center;
}

.record-item {
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
  border-radius: 28rpx;
  border: 2rpx solid rgba(185, 148, 95, 0.26);
  background: rgba(255, 250, 239, 0.94);
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }
}

.record-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: calc(34rpx * var(--gx-font-scale));
}

.record-time {
  margin-top: 20rpx;
  color: #665B4E;
  font-size: calc(30rpx * var(--gx-font-scale));
  line-height: 1.45;
  font-weight: 650;

  strong {
    color: #241F19;
    margin-left: 8rpx;
    font-size: calc(31rpx * var(--gx-font-scale));
    font-weight: 900;
  }
}

.record-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 22rpx;

  :deep(.gx-btn-wrap) {
    width: 240rpx;
    min-width: 0;
  }
}

.add-button-wrap {
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}
</style>
