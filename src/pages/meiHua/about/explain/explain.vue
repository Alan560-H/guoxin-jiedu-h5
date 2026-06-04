<script setup lang="ts">
import type { MeiHuaGuaExplainDataList } from '@/utils/meihua/guaExplain/types'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getMeihuaGuaExplain, resolveMeihuaGuapath } from '@/utils/meihua/guaExplain'

const guapath = ref('qianqian')
const guayao = ref<MeiHuaGuaExplainDataList | null>(null)

onLoad((opts) => {
  let g = typeof opts?.guapath === 'string' ? opts.guapath : 'qianqian'
  if (opts?.info) {
    try {
      const raw = decodeURIComponent(String(opts.info))
      const o = JSON.parse(raw) as { guapath?: string }
      if (o?.guapath)
        g = o.guapath
    }
    catch {
      // ignore
    }
  }
  guapath.value = resolveMeihuaGuapath(g)
  const data = getMeihuaGuaExplain(g)
  guayao.value = data
  uni.setNavigationBarTitle({
    title: `八宫六十四盘(${data.gua.m})`,
  })
})
</script>

<template>
  <view v-if="guayao" class="page-root">
    <view class="page-head">
      <view class="page-head-title">
        {{ guayao.gua.m }}
      </view>
      <image
        class="page-head-gua"
        :src="`/static/meihua/gua-bai/${guapath}.png`"
        mode="aspectFit"
      />
    </view>
    <view class="gua-info bg">
      <view class="gua-info-m">
        <text class="article-text">
          {{ guayao.gua.y }}
        </text>
      </view>
      <view class="gua-info-m">
        <text class="article-text">
          {{ guayao.gua.t }}
        </text>
      </view>
      <view class="gua-info-m">
        <text class="article-text">
          {{ guayao.gua.x }}
        </text>
      </view>
    </view>
    <view class="page-section bg">
      <view
        v-for="(yaoci, id) in guayao.yao"
        :key="id"
      >
        <view class="yao-info-m">
          <text class="article-text">
            {{ yaoci.y }}
          </text>
        </view>
        <view class="yao-info-m">
          <text class="article-text">
            {{ yaoci.x }}
          </text>
        </view>
      </view>
      <view class="yao-info-m yong-block">
        <text class="article-text">
          {{ guayao.gua.yong }}
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  font-size: 32rpx;
  font-weight: bolder;
  padding: 24rpx 28rpx 48rpx;
  min-height: 100%;
  background: #f3f4f6;
}

.page-head {
  box-sizing: border-box;
  width: 100%;
  max-width: 564rpx;
  min-height: 88rpx;
  padding: 0 40rpx;
  background-color: #d3653c;
  border-radius: 10rpx;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-head-title {
  font-size: 40rpx;
  letter-spacing: 4rpx;
  color: #fff;
}

.page-head-gua {
  height: 43rpx;
  width: 45rpx;
}

.article-text {
  vertical-align: middle;
  margin-bottom: 20rpx;
  margin-top: 32rpx;
  line-height: 52rpx;
  font-weight: normal;
}

.page-section {
  background-color: #fff;
  margin-top: 20rpx;
  margin-bottom: 15rpx;
  padding: 10rpx 25rpx 20rpx;
  border-radius: 6rpx;
  width: 100%;
  max-width: 640rpx;
  box-sizing: border-box;
}

.yao-info-m {
  padding-top: 15rpx;
}

.yong-block {
  margin-top: 20rpx;
}

.gua-info {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 10rpx 25rpx 20rpx;
  border-radius: 6rpx;
  width: 100%;
  max-width: 640rpx;
  box-sizing: border-box;
}

.gua-info-m {
  padding-top: 15rpx;
}

.bg {
  box-sizing: border-box;
  font-size: 28rpx;
  color: #d3653c;
  background-color: #fffbf6;
  border-radius: 30rpx;
}
</style>
