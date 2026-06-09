<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()

onMounted(async () => {
  if (!(await store.requireAuthForPage())) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  if (!store.activeProfileId)
    await store.fetchProfiles()
  if (store.activeProfileId)
    await store.fetchRecords(store.activeProfileId)
})

const profile = computed(() => store.activeProfile)
const list = computed(() => store.records)

function goDetail(id: string) {
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${id}` })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="解读记录" />

    <scroll-view scroll-y class="gx-scroll">
      <!-- Active Profile Header Card -->
      <view v-if="profile" class="profile-header-meta flex_row f_j_sb f_a_center">
        <view class="meta-left">
          <view class="profile-name">
            {{ profile.name }}
          </view>
          <view class="profile-sub">
            关系：{{ profile.relationText }} · 性别：{{ profile.genderText }} · {{ profile.birthYear }}年出生
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
      <GxCard v-for="rec in list" :key="rec.id" class="record-item-card">
        <view class="flex_row f_j_sb f_a_center card-header">
          <text class="record-title">{{ rec.title }}</text>
          <view class="gx-badge gx-badge-green">
            已整理
          </view>
        </view>

        <view class="record-meta-details">
          <view class="meta-item">时间：<strong>{{ rec.time }}</strong></view>
          <view class="meta-item">关注：<strong class="highlight-green">{{ rec.directions.join('、') }}</strong></view>
        </view>

        <view class="card-actions">
          <GxButton type="secondary" size="sm" @click="goDetail(rec.id)">
            查看详情
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

.record-item-card {
  border-left: 8rpx solid #153F33; /* Mark as completed with solid green line */

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
