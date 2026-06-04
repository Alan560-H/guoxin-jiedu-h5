<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()

onMounted(() => store.initSeedData())

const record = computed(() => store.getRecordById(store.activeRecordId))

function goDetail() {
  if (!record.value)
    return
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${record.value.id}` })
}
function goRecords() {
  uni.navigateTo({ url: RouterPaths.jieduRecords })
}
</script>

<template>
  <view v-if="record" class="gx-page flex_column">
    <GxNavBar title="解读已完成" />
    <scroll-view scroll-y class="gx-scroll">
      <view style="background: linear-gradient(160deg, #3A6B4A, #2C5040); padding: 48rpx 32rpx; text-align: center; color: #fff;">
        <view style="font-size: 80rpx;">
          🎋
        </view>
        <view style="font-size: calc(40rpx * var(--gx-font-scale)); font-weight: 800;">
          本次专属解读已整理完成
        </view>
        <view style="opacity: 0.75; margin-top: 8rpx; font-size: calc(26rpx * var(--gx-font-scale));">
          心语老师 · {{ record.time }}
        </view>
      </view>

      <GxCard>
        <view class="gx-form-label">
          本次解读概览
        </view>
        <view class="gx-text-sub" style="line-height: 1.8; margin-bottom: 16rpx;">
          心语老师已根据档案信息和关注方向，整理出本次生活与心理参考。
        </view>
        <view
          v-for="(sec, idx) in record.content || []"
          :key="sec.title"
          class="flex_row f_a_center"
          style="gap: 16rpx; margin-bottom: 16rpx;"
        >
          <view class="gx-badge gx-badge-gold">
            {{ idx + 1 }}
          </view>
          <view>{{ sec.title.replace(/^[^、]+、/, '') }}</view>
        </view>
      </GxCard>

      <view class="gx-btn-group">
        <GxButton @click="goDetail">
          查看完整解读
        </GxButton>
        <GxButton type="secondary" @click="store.navigateToSetup()">
          继续和心语老师聊聊
        </GxButton>
        <GxButton type="outline" @click="goRecords">
          查看解读记录
        </GxButton>
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>
