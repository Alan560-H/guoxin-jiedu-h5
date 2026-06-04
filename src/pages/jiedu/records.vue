<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()

onMounted(() => store.initSeedData())

const profile = computed(() => store.activeProfile)
const list = computed(() => {
  if (!profile.value)
    return []
  return store.getRecordsByProfileId(profile.value.id)
})

function goDetail(id: string) {
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${id}` })
}
</script>

<template>
  <view class="gx-page flex_column">
    <GxNavBar title="解读记录" />
    <scroll-view scroll-y class="gx-scroll">
      <view v-if="profile" style="margin: 24rpx 32rpx; padding: 24rpx; background: var(--gx-green-light); border-radius: 16rpx; border: 1px solid var(--gx-green);">
        <view style="font-weight: 700; color: var(--gx-green); font-size: calc(34rpx * var(--gx-font-scale));">
          {{ profile.name }}
        </view>
        <view class="gx-text-sub">
          {{ profile.relationText }} · {{ profile.genderText }} · {{ profile.birthYear }}年
        </view>
        <view class="gx-badge gx-badge-gold" style="margin-top: 12rpx;">
          {{ list.length }} 次解读
        </view>
      </view>

      <view v-if="!list.length" class="gx-empty">
        <view style="font-size: 64rpx;">
          📋
        </view>
        <view style="margin: 24rpx 0;">
          当前档案还没有解读记录
        </view>
        <GxButton @click="store.navigateToSetup(profile?.id)">
          开始第一次解读
        </GxButton>
      </view>

      <GxCard v-for="rec in list" :key="rec.id">
        <view class="flex_between f_a_center" style="margin-bottom: 8rpx;">
          <view style="font-weight: 700;">
            {{ rec.title }}
          </view>
          <view class="gx-badge gx-badge-green">
            已完成
          </view>
        </view>
        <view class="gx-text-sub">
          {{ rec.time }} · {{ rec.directions.join('、') }}
        </view>
        <view style="margin-top: 16rpx;">
          <GxButton size="sm" @click="goDetail(rec.id)">
            查看详情
          </GxButton>
        </view>
      </GxCard>

      <view v-if="list.length" class="gx-btn-group">
        <GxButton @click="store.navigateToSetup(profile?.id)">
          开始新的解读
        </GxButton>
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>
