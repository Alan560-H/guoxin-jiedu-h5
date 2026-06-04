<script setup lang="ts">
/**
 * 梅花学一级页：布局参考老 meihua/meihua.vue；主题色 #d3653c。
 */
import type { MeiHuaPanPayload } from '@/stores/meiHuaStore'
import { RouterPaths } from '@/routerPaths'
import { meiHuaStore } from '@/stores/meiHuaStore'
import { buildMeiHuaDetailsUrl } from '@/utils/meihua/buildMeiHuaDetailsUrl'
import { CalendarConverter } from '@/utils/meihua/calendarConverterFn.js'
import formatDate from '@/utils/meihua/formatMeiHuaDate'
import { SiZhuInfo } from '@/utils/meihua/siZhuInfo.js'

const THEME_PRIMARY = '#d3653c'

const calendarConverterFn = new CalendarConverter()
const siZhuInfoFn = new SiZhuInfo()
const mhStore = meiHuaStore()

interface MenuItem {
  key: string
  title: string
}

const menuItems: MenuItem[] = [
  { key: 'shijian', title: '时间起盘' },
  { key: 'suiji', title: '随机起盘' },
  { key: 'baoshu', title: '报数起盘' },
  { key: 'zhiding', title: '指定起盘' },
  { key: 'about', title: '八宫六十四盘' },
]

function navigateRandomPan() {
  const o = formatDate(new Date(), 'Y')
  const s = formatDate(new Date(), 'M')
  const i = formatDate(new Date(), 'D')
  const u = Math.floor((new Date().getHours() + 1) % 24 / 2) + 1
  const l = '子丑寅卯辰巳午未申酉戌亥'.charAt(u - 1)
  const g = new Date(Number(o), Number(s) - 1, Number(i))
  const c = calendarConverterFn.solar2lunar(g) as {
    cDay: string
    cMonth: string
    cYear: string
    lunarMonth: string
    lunarDay: string
  }
  const f = siZhuInfoFn.getSiZhu(c.cDay, u) + l
  const p = siZhuInfoFn.getKongWang(c.cDay)
  const d = formatDate(new Date(), 'Y年M月D日 h:m')
  const w = `${c.cYear}年${c.lunarMonth}月${c.lunarDay}日${l}时`
  const h = `${c.cYear} ${c.cMonth} ${c.cDay} ${f} (${p}空)`
  const D: MeiHuaPanPayload = {
    type: 2,
    sg: Math.floor(8 * Math.random() + 1),
    xg: Math.floor(8 * Math.random() + 1),
    dy: Math.floor(6 * Math.random() + 1),
    sc: 1,
    number1: 1,
    number2: 1,
    gonli: d,
    nongli: w,
    sizhu: h,
  }
  mhStore.setLastPan(D)
  uni.navigateTo({ url: buildMeiHuaDetailsUrl(D) })
}

function onTapItem(item: MenuItem) {
  if (item.key === 'shijian') {
    uni.navigateTo({ url: RouterPaths.meiHuaShijian })
    return
  }
  if (item.key === 'suiji') {
    navigateRandomPan()
    return
  }
  if (item.key === 'baoshu') {
    uni.navigateTo({ url: RouterPaths.meiHuaBaoshu })
    return
  }
  if (item.key === 'zhiding') {
    uni.navigateTo({ url: RouterPaths.meiHuaZhiding })
    return
  }
  if (item.key === 'about') {
    uni.navigateTo({ url: RouterPaths.meiHuaAbout })
    return
  }
  uni.showToast({
    title: '功能暂未开放',
    icon: 'none',
  })
}
</script>

<template>
  <view class="content">
    <view class="content-main">
      <view class="info-box">
        <view class="info-block">
          <view class="tips-content" :style="{ color: THEME_PRIMARY }">
            易朴梅花排盘
          </view>
          <view class="section info-tips">
            <view>选择您想要的排盘方式</view>
          </view>
          <view
            v-for="item in menuItems"
            :key="item.key"
            class="meihua-item"
            :style="{ backgroundColor: THEME_PRIMARY }"
            @tap="onTapItem(item)"
          >
            <view class="meihua-title">
              {{ item.title }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.content {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: linear-gradient(180deg, #d3653c 0%, #d3653c 200rpx, #f3f4f6 280rpx, #f3f4f6 100%);
  padding: 32rpx 0 48rpx;
}

.content-main {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tips-content {
  height: 65rpx;
  width: 100%;
  margin: 24rpx 0 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
}

.section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #000;
  margin-bottom: 24rpx;
}

.info-tips {
  margin: 32rpx 0;
}

.info-box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: auto;
}

.info-block {
  background-color: #fff;
  width: 640rpx;
  height: fit-content;
  border-radius: 50rpx;
  box-shadow: 0 0 20rpx #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 48rpx;
}

.meihua-item {
  width: 521rpx;
  height: 78rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 36rpx;
  box-sizing: border-box;
}

.meihua-item:active {
  opacity: 0.92;
}

.meihua-title {
  font-size: 32rpx;
  color: #fff;
}
</style>
