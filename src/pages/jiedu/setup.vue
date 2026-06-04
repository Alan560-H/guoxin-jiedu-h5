<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DIRECTION_OPTIONS } from '@/constants/guoxin'
import type { DirectionValue } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxChip from '@/components/guoxin/GxChip.vue'

const store = useGuoxinStore()
const selected = ref<DirectionValue[]>([])

onMounted(() => {
  store.initSeedData()
  if (!store.activeProfile) {
    uni.redirectTo({ url: RouterPaths.profileList })
  }
})

const profile = computed(() => store.activeProfile)

function toggleDirection(dir: DirectionValue) {
  if (selected.value.includes(dir))
    selected.value = selected.value.filter(d => d !== dir)
  else
    selected.value = [...selected.value, dir]
}

function resetDirections() {
  selected.value = []
}

function confirm() {
  store.confirmJiedu(selected.value)
}

function goProfiles() {
  uni.navigateTo({ url: RouterPaths.profileList })
}

function goCredits() {
  uni.navigateTo({ url: RouterPaths.credits })
}
</script>

<template>
  <view v-if="profile" class="gx-page flex_column">
    <GxNavBar dark title="心语老师" right-text="档案" @right-click="goProfiles" />
    <scroll-view scroll-y class="gx-scroll">
      <view class="gx-setup-meta">
        <view>
          剩余解读次数：
          <text class="gx-setup-credits" @tap.stop="goCredits">{{ store.credits }}</text>
          次
        </view>
        <view class="gx-text-hint">
          专属顾问：心语老师
        </view>
      </view>

      <view style="margin: 0 32rpx 24rpx; padding: 24rpx; background: var(--gx-green-light); border-radius: 16rpx; border: 1px solid var(--gx-green);">
        <view style="font-weight: 700; color: var(--gx-green); font-size: calc(32rpx * var(--gx-font-scale));">
          {{ profile.name }}
        </view>
        <view class="gx-text-sub">
          {{ profile.genderText }} · {{ profile.birthYear }}年 · {{ profile.birthPlace }} · {{ profile.calendarTypeText }}
        </view>
        <view style="margin-top: 12rpx; color: var(--gx-green); font-size: calc(26rpx * var(--gx-font-scale));" @tap="goProfiles">
          切换档案 ›
        </view>
      </view>

      <view style="padding: 0 32rpx;">
        <view class="gx-chat-bubble">
          您好，我是心语老师。接下来我会根据您选择的心语档案，通过几个简单问题，为您整理一份生活与心理参考。请先选择您这次最想了解的方向：
        </view>
      </view>

      <view style="padding: 24rpx 32rpx 0;">
        <view class="gx-form-label">
          本次关注方向（可多选）*
        </view>
        <view class="flex_row" style="flex-wrap: wrap;">
          <GxChip
            v-for="d in DIRECTION_OPTIONS"
            :key="d"
            :label="d"
            multi
            :selected="selected.includes(d)"
            @toggle="toggleDirection(d)"
          />
        </view>
      </view>

      <GxCard>
        <view class="gx-form-label">
          请确认本次解读信息
        </view>
        <view class="gx-info-row">
          <text class="gx-info-label">档案</text>
          <text class="gx-info-value">{{ profile.name }}</text>
        </view>
        <view class="gx-info-row">
          <text class="gx-info-label">关系</text>
          <text class="gx-info-value">{{ profile.relationText }}</text>
        </view>
        <view class="gx-info-row">
          <text class="gx-info-label">出生日期</text>
          <text class="gx-info-value">{{ profile.calendarTypeText }} {{ profile.birthYear }}年{{ profile.birthMonth }}月{{ profile.birthDay }}日</text>
        </view>
        <view class="gx-info-row">
          <text class="gx-info-label">出生时辰</text>
          <text class="gx-info-value">{{ profile.birthHour }}</text>
        </view>
        <view class="gx-info-row">
          <text class="gx-info-label">出生地</text>
          <text class="gx-info-value">{{ profile.birthPlace }}</text>
        </view>
        <view class="gx-info-row" style="border-bottom: none;">
          <text class="gx-info-label">关注方向</text>
          <text class="gx-info-value" style="color: var(--gx-green);">
            {{ selected.length ? selected.join('、') : '未选择' }}
          </text>
        </view>
      </GxCard>

      <view class="gx-btn-group">
        <GxButton :disabled="!selected.length" @click="confirm">
          确认开始解读
        </GxButton>
        <GxButton type="outline" size="sm" @click="resetDirections">
          重新点选方向
        </GxButton>
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.gx-setup-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16rpx 32rpx 24rpx;
  padding: 16rpx 24rpx;
  background: var(--gx-bg-sand, #f5efe6);
  border-bottom: 1px solid var(--gx-border);
  font-size: calc(26rpx * var(--gx-font-scale));
  color: var(--gx-text-sub);
}

.gx-setup-credits {
  color: var(--gx-green);
  font-weight: 700;
  text-decoration: underline;
}
</style>
