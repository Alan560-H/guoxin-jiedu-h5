<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()

onMounted(async () => {
  store.initSeedData()
  // 从后端加载档案（后端从JWT解析userId）
  if (store.useRemoteApi) {
    await store.loadProfiles()
  }
})

const profiles = computed(() => store.profiles)

function profileAge(p: { birthYear: number }) {
  return new Date().getFullYear() - p.birthYear
}

// Fixed compile target warning by naming parameters
function goCreate() {
  uni.navigateTo({ url: RouterPaths.profileCreate })
}

function startJiedu(id: string) {
  store.navigateToSetup(id)
}

// Fixed goRecords implementation
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
    }
  })
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar title="我的心语档案" right-text="+ 新建" @right-click="goCreate" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="profile-explain">
        心语档案用于保存每位家人独立的基础信息和历史解读记录，方便心语老师给出更有针对性的参考建议。
      </view>

      <!-- Empty State -->
      <view v-if="profiles.length === 0" class="gx-empty-state">
        <view class="empty-icon">👤</view>
        <view class="empty-text">您还没有创建心语档案，可以先为自己或家人创建一个档案。</view>
        <GxButton type="primary" @click="goCreate">
          创建第一个档案
        </GxButton>
      </view>

      <!-- Profile Cards -->
      <GxCard v-for="p in profiles" :key="p.id" class="profile-card">
        <view class="flex_row f_j_sb f_a_center card-header">
          <text class="profile-name">{{ p.name }}</text>
          <view class="flex_row f_a_center header-right-actions">
            <text class="profile-action-btn edit-btn" @tap.stop="goEdit(p.id)">编辑</text>
            <text class="profile-action-btn delete-btn" @tap.stop="confirmDelete(p.id)">删除</text>
            <view class="gx-badge gx-badge-gold">
              {{ p.relationText }}
            </view>
          </view>
        </view>

        <view class="profile-card-grid">
          <view class="profile-meta-item">性别：<strong>{{ p.genderText }}</strong></view>
          <view class="profile-meta-item">年龄：<strong>{{ profileAge(p) }}岁</strong></view>
          <view class="profile-meta-item">历法：<strong>{{ p.calendarTypeText }}</strong></view>
          <view class="profile-meta-item">真太阳时：<strong>{{ p.useTrueSolarTime ? '是' : '否' }}</strong></view>
          <view class="profile-meta-item" style="grid-column: span 2;">出生地：<strong>{{ p.birthPlace || '未填写' }}</strong></view>
          <view class="profile-meta-item" style="grid-column: span 2;">已完成解读：<strong>{{ p.jieduCount }} 次</strong></view>
          <view class="profile-meta-item" style="grid-column: span 2;">最近解读：<strong>{{ p.lastJieduTime }}</strong></view>
        </view>

        <view class="gx-btn-row profile-card-actions">
          <view class="gx-btn-wrap">
            <GxButton type="primary" size="sm" @click="startJiedu(p.id)">
              开始解读
            </GxButton>
          </view>
          <view class="gx-btn-wrap">
            <GxButton type="secondary" size="sm" @click="goRecords(p.id)">
              查看记录
            </GxButton>
          </view>
        </view>
      </GxCard>

      <!-- Bottom Add Button -->
      <view v-if="profiles.length" class="gx-btn-group add-button-wrap">
        <GxButton type="outline" @click="goCreate">
          ＋ 创建新的心语档案
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
  }

  .profile-name {
    font-family: "Noto Serif SC", Georgia, serif;
    font-size: 34rpx;
    font-weight: 700;
    color: #153F33;
  }

  .header-right-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
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

.profile-card-actions {
  display: flex;
  gap: 16rpx;

  .gx-btn-wrap {
    flex: 1;
  }
}

.add-button-wrap {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}
</style>
