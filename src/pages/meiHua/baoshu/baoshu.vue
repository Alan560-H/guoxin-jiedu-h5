<script setup lang="ts">
import type { MeiHuaPanPayload } from '@/stores/meiHuaStore'
import { ref } from 'vue'
import { meiHuaStore } from '@/stores/meiHuaStore'
import { buildMeiHuaDetailsUrl } from '@/utils/meihua/buildMeiHuaDetailsUrl'
import { CalendarConverter } from '@/utils/meihua/calendarConverterFn.js'
import formatDate from '@/utils/meihua/formatMeiHuaDate'
import { SiZhuInfo } from '@/utils/meihua/siZhuInfo.js'

const THEME_PRIMARY = '#d3653c'

const calendarConverterFn = new CalendarConverter()
const siZhuInfoFn = new SiZhuInfo()
const mhStore = meiHuaStore()

const number1 = ref('')
const number2 = ref('')
const addTime = ref(0)
const category = ref(0)

const timeOptions = [
  { text: '是', value: 1 },
  { text: '否', value: 0 },
]

const categoryOptions = [
  { text: '朱昱/易谦老师', value: 0 },
  { text: '广元老师', value: 1 },
]

function finishPan(payload: MeiHuaPanPayload) {
  mhStore.setLastPan(payload)
  uni.navigateTo({
    url: buildMeiHuaDetailsUrl(payload),
  })
}

function bindQuery() {
  const i = Number.parseInt(number1.value, 10)
  const o = Number.parseInt(number2.value, 10)
  if (i === 0 || o === 0 || Number.isNaN(i) || Number.isNaN(o)) {
    uni.showToast({ title: '请输入大于0的数字', icon: 'none', duration: 1000 })
    return
  }

  const l = addTime.value === 1
  const r = new Date().getHours()
  const w = Math.floor((r + 1) % 24 / 2) + 1
  const s = `${'子丑寅卯辰巳午未申酉戌亥'.charAt(w - 1)}时`

  let u = 1
  let d = 1
  let c = 1
  let f = 1
  let g = 3

  if (category.value === 0) {
    let num1 = 0
    for (const ch of String(i))
      num1 += Number.parseInt(ch, 10)
    if (num1 > 0 && num1 <= 8)
      u = num1
    else
      u = num1 % 8 === 0 ? 8 : num1 % 8

    let num2 = 0
    for (const ch of String(o))
      num2 += Number.parseInt(ch, 10)
    if (num2 > 0 && num2 <= 8)
      d = num2
    else
      d = num2 % 8 === 0 ? 8 : num2 % 8

    if (l) {
      f = i + o + w
      g = 5
    }
    else {
      f = num1 + num2
    }
    if (f > 0 && f <= 6)
      c = f
    else
      c = f % 6 === 0 ? 6 : f % 6
  }
  else {
    if (i > 0 && i <= 8)
      u = i
    else
      u = i % 8 === 0 ? 8 : i % 8
    if (o > 0 && o <= 8)
      d = o
    else
      d = o % 8 === 0 ? 8 : o % 8
    if (l) {
      f = i + o + w
      g = 5
    }
    else {
      f = i + o
    }
    if (f > 0 && f <= 6)
      c = f
    else
      c = f % 6 === 0 ? 6 : f % 6
  }

  const m = formatDate(new Date(), 'Y')
  const y = formatDate(new Date(), 'M')
  const p = formatDate(new Date(), 'D')
  const b = new Date(Number(m), Number(y) - 1, Number(p))
  const M = calendarConverterFn.solar2lunar(b) as {
    cYear: string
    cMonth: string
    cDay: string
    lunarMonth: string
    lunarDay: string
  }
  const q = siZhuInfoFn.getSiZhu(M.cDay, w) + s
  const N = siZhuInfoFn.getKongWang(M.cDay)
  const S: MeiHuaPanPayload = {
    category: category.value,
    type: g,
    sg: u,
    xg: d,
    dy: c,
    sc: w,
    number1: i,
    number2: o,
    gonli: formatDate(new Date(), 'Y年M月D日 h:m'),
    nongli: `${M.cYear}年${M.lunarMonth}月${M.lunarDay}日${s}`,
    sizhu: `${M.cYear} ${M.cMonth} ${M.cDay} ${q} (${N}空)`,
  }
  finishPan(S)
}
</script>

<template>
  <view class="content">
    <view class="content-main">
      <view class="info-box">
        <view class="info-block">
          <view class="tips-content" :style="{ color: THEME_PRIMARY }">
            报数起盘
          </view>

          <view class="section">
            <view class="section-title">
              数字一：
            </view>
            <view class="section-content">
              <input
                v-model="number1"
                class="name input_text"
                placeholder="请输入0以上的数字"
                type="number"
              >
            </view>
          </view>
          <view class="section">
            <view class="section-title">
              数字二：
            </view>
            <view class="section-content">
              <input
                v-model="number2"
                class="name input_text"
                placeholder="请输入0以上的数字"
                type="number"
              >
            </view>
          </view>

          <view class="section">
            <view class="section-title">
              加时辰：
            </view>
            <view class="section-content check-row">
              <view
                v-for="opt in timeOptions"
                :key="opt.value"
                class="check-opt"
                :class="{ 'check-opt--on': addTime === opt.value }"
                :style="addTime === opt.value ? { borderColor: THEME_PRIMARY, color: THEME_PRIMARY } : {}"
                @click="addTime = opt.value"
              >
                {{ opt.text }}
              </view>
            </view>
          </view>

          <view class="section">
            <view class="section-title">
              课程流派：
            </view>
            <view class="section-content check-col">
              <view
                v-for="opt in categoryOptions"
                :key="opt.value"
                class="check-opt check-opt--wide"
                :class="{ 'check-opt--on': category === opt.value }"
                :style="category === opt.value ? { borderColor: THEME_PRIMARY, color: THEME_PRIMARY } : {}"
                @click="category = opt.value"
              >
                {{ opt.text }}
              </view>
            </view>
          </view>

          <view class="btn-box">
            <view class="quiryButton" :style="{ backgroundColor: THEME_PRIMARY }" @click="bindQuery">
              <view class="btn-text">
                立即起盘
              </view>
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
  position: relative;
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
  width: 100%;
  min-height: 31rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  line-height: 34rpx;
  margin: 24rpx auto 28rpx;
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

.section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-bottom: 40rpx;
}

.section-title {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  font-size: 32rpx;
}

.section-content {
  width: 422rpx;
  min-height: 88rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 30rpx;
}

.check-row {
  gap: 24rpx;
  flex-wrap: wrap;
}

.check-col {
  flex-direction: column;
  align-items: stretch;
  gap: 16rpx;
}

.check-opt {
  padding: 12rpx 28rpx;
  border-radius: 10rpx;
  border: 2rpx solid #ccc;
  font-size: 28rpx;
  color: #333;
}

.check-opt--wide {
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.check-opt--on {
  font-weight: bold;
}

.btn-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin-top: 20rpx;
}

.quiryButton {
  width: 521rpx;
  height: 78rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.btn-text {
  font-size: 32rpx;
  white-space: nowrap;
}

.input_text {
  flex: 1;
}
</style>
