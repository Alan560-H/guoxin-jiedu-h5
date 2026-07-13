<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import ProfileReadingRecordList from '@/components/guoxin/ProfileReadingRecordList.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { getProfileBirthYear } from '@/utils/guoxin/birthDateTime'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const { t } = useI18n()
const store = useGuoxinStore()
const { runLocked } = useActionLock()
const recordsLoading = ref(false)

onShow(async () => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  store.initSeedData()
  await store.loadProfiles()
  void store.ensureCreditsLoaded(true)
  await reloadRecordsForActive()
})

const profiles = computed(() => store.profiles)
const selectedProfile = computed(() => store.activeProfile)
const readingList = computed(() => store.readingRecords.map(r => store.mapServerReportToRecord(r)))

async function reloadRecordsForActive() {
  const profileId = store.activeProfileId
  if (!profileId)
    return
  recordsLoading.value = true
  try {
    await store.loadReadingRecords(profileId)
  }
  finally {
    recordsLoading.value = false
  }
}

function profileAge(p: { birthDaySolar: string, birthDay: string }) {
  return new Date().getFullYear() - getProfileBirthYear(p)
}

function isSelected(id: string) {
  return store.activeProfileId === id
}

async function selectProfile(id: string) {
  if (store.activeProfileId === id)
    return
  store.setActiveProfile(id)
  await reloadRecordsForActive()
}

function goCreate() {
  uni.navigateTo({ url: RouterPaths.profileCreate })
}

function startJiedu(id?: string) {
  store.navigateToSetup(id || store.activeProfileId || undefined)
}

function goEdit(id: string) {
  uni.navigateTo({ url: `${RouterPaths.profileCreate}?id=${id}` })
}

function confirmDelete(id: string) {
  const p = store.getProfileById(id)
  if (!p)
    return
  uni.showModal({
    title: t('profile.list.deleteTitle'),
    content: t('profile.list.deleteContent', { name: p.name }),
    confirmText: t('profile.list.deleteConfirm'),
    cancelText: t('profile.list.deleteCancel'),
    confirmColor: '#B7654A',
    success: (res) => {
      if (res.confirm) {
        void runLocked(async () => {
          try {
            uni.showLoading({ title: '删除中...', mask: true })
            await store.deleteProfile(id)
            uni.showToast({ title: t('profile.list.deleted'), icon: 'success' })
            await reloadRecordsForActive()
          }
          catch {
            // HTTP 拦截器已 toast
          }
          finally {
            uni.hideLoading()
          }
        })
      }
    },
  })
}
</script>

<template>
  <view class="gx-layout-page">
    <GxNavBar :title="t('profile.list.title')" :show-back="true" :right-text="t('profile.list.new')" @right-click="goCreate" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="profile-explain">
        {{ t('profile.list.explain') }}
      </view>

      <view v-if="profiles.length === 0" class="gx-empty-state">
        <view class="empty-icon">
          👤
        </view>
        <view class="empty-text">
          {{ t('profile.list.emptyText') }}
        </view>
        <GxButton type="primary" @click="goCreate">
          {{ t('profile.list.createFirst') }}
        </GxButton>
      </view>

      <template v-else>
        <view class="select-section">
          <view class="select-header flex_row f_j_sb f_a_center">
            <text class="select-title">
              {{ t('profile.list.selectTitle') }}
            </text>
            <text class="select-hint">
              {{ t('profile.list.selectHint') }}
            </text>
          </view>

          <view class="profile-grid">
            <view
              v-for="p in profiles"
              :key="p.id"
              class="profile-grid-item"
              :class="{ selected: isSelected(p.id) }"
              @tap="selectProfile(p.id)"
            >
              <view v-if="isSelected(p.id)" class="current-badge">
                {{ t('profile.list.currentBadge') }}
              </view>
              <view class="grid-name">
                {{ p.name }}
              </view>
              <view class="grid-meta">
                {{ p.relationText }} · {{ p.genderText }} · {{ t('common.age', { n: profileAge(p) }) }}
              </view>
              <view class="grid-count">
                {{ t('profile.list.gridJieduCount', { n: p.jieduCount }) }}
              </view>
            </view>
          </view>
        </view>

        <GxCard v-if="selectedProfile" class="profile-detail-card">
          <view class="flex_row f_j_sb f_a_center card-header">
            <text class="profile-name">
              {{ selectedProfile.name }}
            </text>
            <view class="flex_row f_a_center header-right-actions">
              <text class="profile-action-btn edit-btn" @tap.stop="goEdit(selectedProfile.id)">
                {{ t('profile.list.edit') }}
              </text>
              <text class="profile-action-btn delete-btn" @tap.stop="confirmDelete(selectedProfile.id)">
                {{ t('profile.list.delete') }}
              </text>
              <view class="gx-badge gx-badge-gold">
                {{ selectedProfile.relationText }}
              </view>
            </view>
          </view>

          <view class="profile-card-grid">
            <view class="profile-meta-item">
              {{ t('profile.list.gender') }}<strong>{{ selectedProfile.genderText }}</strong>
            </view>
            <view class="profile-meta-item">
              {{ t('profile.list.age') }}<strong>{{ t('common.age', { n: profileAge(selectedProfile) }) }}</strong>
            </view>
            <view class="profile-meta-item">
              {{ t('profile.list.calendar') }}<strong>{{ selectedProfile.calendarTypeText }}</strong>
            </view>
            <view class="profile-meta-item">
              {{ t('profile.list.trueSolar') }}<strong>{{ selectedProfile.useTrueSolarTime ? t('common.yes') : t('common.no') }}</strong>
            </view>
            <view class="profile-meta-item profile-meta-full">
              {{ t('profile.list.birthPlace') }}<strong>{{ selectedProfile.birthPlace || t('common.notFilled') }}</strong>
            </view>
            <view class="profile-meta-item profile-meta-full">
              {{ t('profile.list.jieduCount') }}<strong>{{ selectedProfile.jieduCount }} {{ t('common.times') }}</strong>
            </view>
            <view class="profile-meta-item profile-meta-full">
              {{ t('profile.list.lastJiedu') }}<strong>{{ selectedProfile.lastJieduTime }}</strong>
            </view>
          </view>

          <view class="profile-detail-action">
            <GxButton type="primary" @click="startJiedu(selectedProfile.id)">
              {{ t('profile.list.startJiedu') }}
            </GxButton>
          </view>
        </GxCard>

        <ProfileReadingRecordList
          v-if="selectedProfile"
          :records="readingList"
          :profile-name="selectedProfile.name"
          :jiedu-count="selectedProfile.jieduCount"
          :profile-id="selectedProfile.id"
          :loading="recordsLoading"
          @start-jiedu="startJiedu(selectedProfile.id)"
        />

        <view class="gx-btn-group add-button-wrap">
          <GxButton type="outline" @click="goCreate">
            {{ t('profile.list.createNew') }}
          </GxButton>
        </view>
      </template>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.profile-explain {
  font-size: 26rpx;
  color: #665B4E;
  margin: 32rpx 32rpx 24rpx;
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.88), rgba(252, 245, 233, 0.88));
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  border-left: 6rpx solid #153F33;
  line-height: 1.6;
}

.select-section {
  margin: 0 32rpx 24rpx;
}

.select-header {
  margin-bottom: 16rpx;
}

.select-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 32rpx;
  font-weight: 700;
  color: #153F33;
}

.select-hint {
  font-size: 24rpx;
  color: #958878;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.profile-grid-item {
  position: relative;
  background: #FFFDF7;
  border: 2rpx solid rgba(185, 148, 95, 0.25);
  border-radius: 20rpx;
  padding: 24rpx 20rpx 20rpx;
  box-sizing: border-box;
  min-height: 160rpx;

  &.selected {
    border-color: #153F33;
    background: linear-gradient(180deg, rgba(238, 243, 234, 0.5), rgba(255, 253, 247, 1));
  }
}

.current-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #153F33;
  background: rgba(238, 243, 234, 0.95);
  border: 1rpx solid rgba(21, 63, 51, 0.2);
  border-radius: 999rpx;
  padding: 4rpx 12rpx;
  line-height: 1.2;
}

.grid-name {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 32rpx;
  font-weight: 700;
  color: #153F33;
  margin-bottom: 8rpx;
  padding-right: 72rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-meta {
  font-size: 22rpx;
  color: #665B4E;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.grid-count {
  font-size: 22rpx;
  color: #87643A;
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
    font-size: 28rpx;
    color: #665B4E;
    margin-bottom: 48rpx;
    line-height: 1.6;
  }
}

.profile-detail-card {
  margin: 0 32rpx 24rpx;

  .card-header {
    border-bottom: 2rpx solid rgba(185, 148, 95, 0.15);
    padding-bottom: 16rpx;
    margin-bottom: 16rpx;
    gap: 16rpx;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .profile-name {
    flex: 1 1 220rpx;
    min-width: 0;
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 34rpx;
    font-weight: 700;
    color: #153F33;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-right-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16rpx;
    flex: 0 1 auto;
    flex-wrap: wrap;
  }

  .profile-action-btn {
    font-size: 24rpx;
    font-weight: 700;
    cursor: pointer;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    transition: all 0.2s ease;
    line-height: 1.2;
  }

  .edit-btn {
    color: #87643A;
    background-color: rgba(185, 148, 95, 0.12);
    border: 1px solid rgba(185, 148, 95, 0.25);
  }

  .delete-btn {
    color: #B7654A;
    background-color: rgba(183, 101, 74, 0.08);
    border: 1px solid rgba(183, 101, 74, 0.2);
  }
}

.profile-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx 24rpx;
  font-size: 26rpx;
  margin-bottom: 24rpx;
}

.profile-meta-item {
  color: #665B4E;

  strong {
    color: #241F19;
    margin-left: 8rpx;
  }
}

.profile-meta-full {
  grid-column: span 2;
}

.profile-detail-action {
  :deep(.gx-btn-wrap) {
    width: 100%;
  }
}

.add-button-wrap {
  margin-top: 8rpx;
  margin-bottom: 40rpx;
}
</style>
