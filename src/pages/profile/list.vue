<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import { getProfileBirthYear } from '@/utils/guoxin/birthDateTime'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const { t } = useI18n()
const store = useGuoxinStore()
const { runLocked } = useActionLock()

onMounted(async () => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  store.initSeedData()
  if (store.useRemoteApi)
    await store.ensureProfilesLoaded()
})

const profiles = computed(() => store.profiles)

function profileAge(p: { birthDaySolar: string, birthDay: string }) {
  return new Date().getFullYear() - getProfileBirthYear(p)
}

function goCreate() {
  uni.navigateTo({ url: RouterPaths.profileCreate })
}

function startJiedu(id: string) {
  store.navigateToSetup(id)
}

function goRecords(id: string) {
  store.setActiveProfile(id)
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}

function goEdit(id: string) {
  uni.navigateTo({ url: `${RouterPaths.profileCreate}?id=${id}` })
}

function confirmDelete(id: string) {
  const p = store.getProfileById(id)
  if (!p) return
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
  <view class="gx-page flex_column page-container">
    <GxNavBar :title="t('profile.list.title')" :show-back="true" :right-text="t('profile.list.new')" @right-click="goCreate" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="profile-explain">
        {{ t('profile.list.explain') }}
      </view>

      <view v-if="profiles.length === 0" class="gx-empty-state">
        <view class="empty-icon">👤</view>
        <view class="empty-text">{{ t('profile.list.emptyText') }}</view>
        <GxButton type="primary" @click="goCreate">
          {{ t('profile.list.createFirst') }}
        </GxButton>
      </view>

      <GxCard v-for="p in profiles" :key="p.id" class="profile-card">
        <view class="flex_row f_j_sb f_a_center card-header">
          <text class="profile-name">{{ p.name }}</text>
          <view class="flex_row f_a_center header-right-actions">
            <text class="profile-action-btn edit-btn" @tap.stop="goEdit(p.id)">{{ t('profile.list.edit') }}</text>
            <text class="profile-action-btn delete-btn" @tap.stop="confirmDelete(p.id)">{{ t('profile.list.delete') }}</text>
            <view class="gx-badge gx-badge-gold">
              {{ p.relationText }}
            </view>
          </view>
        </view>

        <view class="profile-card-grid">
          <view class="profile-meta-item">{{ t('profile.list.gender') }}<strong>{{ p.genderText }}</strong></view>
          <view class="profile-meta-item">{{ t('profile.list.age') }}<strong>{{ t('common.age', { n: profileAge(p) }) }}</strong></view>
          <view class="profile-meta-item">{{ t('profile.list.calendar') }}<strong>{{ p.calendarTypeText }}</strong></view>
          <view class="profile-meta-item">{{ t('profile.list.trueSolar') }}<strong>{{ p.useTrueSolarTime ? t('common.yes') : t('common.no') }}</strong></view>
          <view class="profile-meta-item profile-meta-full">{{ t('profile.list.birthPlace') }}<strong>{{ p.birthPlace || t('common.notFilled') }}</strong></view>
          <view class="profile-meta-item profile-meta-full">{{ t('profile.list.jieduCount') }}<strong>{{ p.jieduCount }} {{ t('common.times') }}</strong></view>
          <view class="profile-meta-item profile-meta-full">{{ t('profile.list.lastJiedu') }}<strong>{{ p.lastJieduTime }}</strong></view>
        </view>

        <view class="profile-card-actions">
          <GxButton type="primary" size="sm" @click="startJiedu(p.id)">
            {{ t('profile.list.startJiedu') }}
          </GxButton>
          <GxButton type="secondary" size="sm" @click="goRecords(p.id)">
            {{ t('profile.list.viewRecords') }}
          </GxButton>
        </view>
      </GxCard>

      <view v-if="profiles.length" class="gx-btn-group add-button-wrap">
        <GxButton type="outline" @click="goCreate">
          {{ t('profile.list.createNew') }}
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

.profile-card {
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

.profile-card-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16rpx;

  :deep(.gx-btn-wrap) {
    width: 100%;
    min-width: 0;
  }
}

.add-button-wrap {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}
</style>
