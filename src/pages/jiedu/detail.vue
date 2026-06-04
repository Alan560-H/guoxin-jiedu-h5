<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'

const store = useGuoxinStore()
const recordId = ref('')

onLoad((query) => {
  if (query?.recordId)
    recordId.value = String(query.recordId)
})

onMounted(() => {
  store.initSeedData()
  if (recordId.value)
    store.activeRecordId = recordId.value
})

const record = computed(() => {
  const id = recordId.value || store.activeRecordId
  return id ? store.getRecordById(id) : null
})

const profile = computed(() => {
  if (!record.value)
    return null
  return store.getProfileById(record.value.profileId)
})
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view v-if="record && profile" class="gx-page flex_column">
    <GxNavBar title="专属解读详情" />
    <scroll-view scroll-y class="gx-scroll">
      <view style="background: var(--gx-green); padding: 28rpx 32rpx; color: #fff;">
        <view style="font-size: calc(34rpx * var(--gx-font-scale)); font-weight: 700;">
          {{ profile.name }}
        </view>
        <view style="opacity: 0.8; font-size: calc(26rpx * var(--gx-font-scale));">
          {{ record.time }} 整理完成
        </view>
        <view class="gx-badge" style="margin-top: 12rpx; background: rgba(255,255,255,0.2); color: #fff; border: none;">
          {{ record.directions.join(' · ') }}
        </view>
      </view>

      <view
        v-for="sec in record.content || []"
        :key="sec.title"
        class="gx-report-section"
      >
        <view class="gx-report-title">
          {{ sec.title }}
        </view>
        <view class="gx-report-body">
          {{ sec.body }}
        </view>
      </view>

      <view class="gx-btn-group">
        <GxButton type="secondary" @click="store.navigateToSetup(profile.id)">
          再次解读
        </GxButton>
        <GxButton type="outline" @click="goBack">
          返回
        </GxButton>
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>
