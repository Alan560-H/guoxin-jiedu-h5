<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { FontScale } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxChip from '@/components/guoxin/GxChip.vue'

const store = useGuoxinStore()

onMounted(() => {
  store.initSeedData()
})

const latestRecord = computed(() => store.latestRecord)

function goProfiles() {
  uni.navigateTo({ url: RouterPaths.profileList })
}

function goCredits() {
  uni.navigateTo({ url: RouterPaths.credits })
}

function goLatestDetail() {
  if (!latestRecord.value)
    return
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${latestRecord.value.id}` })
}

function setScale(scale: FontScale) {
  store.setFontScale(scale)
}
</script>

<template>
  <view class="gx-page flex_column">
    <view class="gx-hero">
      <view class="gx-hero-title">
        国心解读
      </view>
      <view class="gx-hero-sub">
        东方文化视角下的个人解读服务
      </view>
      <view class="gx-quota-badge">
        剩余解读次数：{{ store.credits }} 次
        <text class="gx-link" @tap.stop="goCredits"> · 充值</text>
      </view>
    </view>

    <scroll-view scroll-y class="gx-scroll">
      <view style="height: 24rpx;" />
      <view class="gx-btn-group">
        <GxButton @click="store.startJieduFromHome()">
          ✨ 开始我的专属解读
        </GxButton>
        <GxButton type="secondary" @click="goProfiles">
          📋 查看心语档案
        </GxButton>
      </view>

      <GxCard v-if="latestRecord">
        <view class="gx-form-label">
          上次解读
        </view>
        <view class="flex_between f_a_center">
          <view>
            <view style="font-weight: 600;">
              {{ latestRecord.profileName }} · {{ latestRecord.directions.join('、') }}
            </view>
            <view class="gx-text-hint" style="margin-top: 8rpx;">
              {{ latestRecord.time }}
            </view>
          </view>
          <GxButton type="outline" size="sm" @click="goLatestDetail">
            查看
          </GxButton>
        </view>
      </GxCard>

      <GxCard>
        <view class="gx-form-label">
          关于国心解读
        </view>
        <view class="gx-text-sub" style="line-height: 1.8;">
          国心解读结合东方文化视角与心理分析方法，为您和家人提供生活参考与情感陪伴，帮助理解性格特点、家庭关系和当前生活状态。
        </view>
      </GxCard>

      <GxCard padding="24rpx 32rpx">
        <view class="gx-form-label">
          字号调节
        </view>
        <view class="flex_row gap_05rem">
          <GxChip
            v-for="item in ([['standard', '标准'], ['large', '大字号'], ['xlarge', '特大号']] as const)"
            :key="item[0]"
            :label="item[1]"
            :selected="store.fontScale === item[0]"
            @toggle="setScale(item[0])"
          />
        </view>
      </GxCard>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.gx-link {
  color: #fff;
  text-decoration: underline;
  margin-left: 8rpx;
}
</style>
