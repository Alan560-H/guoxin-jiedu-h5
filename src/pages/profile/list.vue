<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()

onMounted(() => store.initSeedData())

const profiles = computed(() => store.profiles)

function profileAge(p: { birthYear: number }) {
  return new Date().getFullYear() - p.birthYear
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
</script>

<template>
  <view class="gx-page flex_column">
    <GxNavBar title="我的心语档案" right-text="+ 新建" @right-click="goCreate" />
    <scroll-view scroll-y class="gx-scroll">
      <view class="gx-text-sub" style="padding: 24rpx 32rpx 8rpx;">
        心语档案用于保存每位家人独立的基础信息和解读记录。
      </view>

      <view v-if="profiles.length === 0" class="gx-empty">
        <view style="font-size: 64rpx;">
          👤
        </view>
        <view style="margin: 24rpx 0;">
          您还没有创建心语档案
        </view>
        <GxButton @click="goCreate">
          创建第一个档案
        </GxButton>
      </view>

      <GxCard v-for="p in profiles" :key="p.id">
        <view class="flex_between f_a_center" style="margin-bottom: 12rpx;">
          <view style="font-size: calc(34rpx * var(--gx-font-scale)); font-weight: 700;">
            {{ p.name }}
          </view>
          <view class="gx-badge gx-badge-gold">
            {{ p.relationText }}
          </view>
        </view>
        <view class="gx-profile-meta">
          {{ p.genderText }} · {{ profileAge(p) }}岁 · {{ p.calendarTypeText }} · {{ p.birthPlace }}
        </view>
        <view class="gx-stat-row">
          <view class="gx-stat-item">
            <view class="gx-stat-num">
              {{ p.jieduCount }}
            </view>
            <view class="gx-stat-label">
              已完成解读
            </view>
          </view>
          <view class="gx-stat-item" style="flex: 2;">
            <view class="gx-stat-label">
              最近解读
            </view>
            <view class="gx-stat-num" style="font-size: calc(28rpx * var(--gx-font-scale));">
              {{ p.lastJieduTime }}
            </view>
          </view>
        </view>
        <view class="gx-btn-row" style="margin-top: 20rpx;">
          <GxButton size="sm" @click="startJiedu(p.id)">
            开始解读
          </GxButton>
          <GxButton type="secondary" size="sm" @click="goRecords(p.id)">
            查看记录
          </GxButton>
        </view>
      </GxCard>

      <view v-if="profiles.length" class="gx-btn-group">
        <GxButton type="outline" @click="goCreate">
          ＋ 创建新的心语档案
        </GxButton>
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>
