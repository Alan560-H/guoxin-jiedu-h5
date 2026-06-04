<script setup lang="ts">
import type { MeiHuaPanPayload } from '@/stores/meiHuaStore'
import { onMounted, ref } from 'vue'
import { meiHuaStore } from '@/stores/meiHuaStore'
import { buildMeiHuaDetailsUrl } from '@/utils/meihua/buildMeiHuaDetailsUrl'
import { CalendarConverter } from '@/utils/meihua/calendarConverterFn.js'
import formatDate from '@/utils/meihua/formatMeiHuaDate'
import { SiZhuInfo } from '@/utils/meihua/siZhuInfo.js'
import {
  MEI_HUA_MONTH_LABELS,
  meiHuaBuildDayLabels,
  meiHuaInitSolarPicker,
} from '@/utils/meiHuaUiPicker'

const THEME_PRIMARY = '#d3653c'

const calendarConverterFn = new CalendarConverter()
const siZhuInfoFn = new SiZhuInfo()
const mhStore = meiHuaStore()

const yearList = ref<number[]>([])
const months = MEI_HUA_MONTH_LABELS
const days = ref<string[]>([])
const hours = ref<number[]>([])
const minutes = ref<number[]>([])

const value = ref([0, 0, 0])
const timeValue = ref([0, 0])
const year = ref(0)
const month = ref('')
const day = ref('')
const hour = ref(0)
const minute = ref(0)
const lunarDate = ref('')
const showDatePickerView = ref(false)
const showTimePickerView = ref(false)

function rebuildHoursMinutes() {
  const h: number[] = []
  const m: number[] = []
  for (let i = 0; i <= 23; i++)
    h.push(i)
  for (let i = 0; i <= 59; i++)
    m.push(i)
  hours.value = h
  minutes.value = m
}

function chooseDate() {
  showDatePickerView.value = true
}

function chooseTime() {
  showTimePickerView.value = true
}

function bindDateChange(ev: { detail: { value: number[] } }) {
  const n = ev.detail.value
  if (n[0] !== value.value[0] || n[1] !== value.value[1]) {
    const y = yearList.value[n[0]]
    days.value = meiHuaBuildDayLabels(y, n[1])
  }
  value.value = n
}

function confirmSelectDate() {
  dataValueSetting()
  showDatePickerView.value = false
}

function dataValueSetting() {
  year.value = yearList.value[value.value[0]]
  month.value = months[value.value[1]]
  day.value = days.value[value.value[2]]
  toLunarDate()
}

function toLunarDate() {
  const dateStr = `${year.value}-${month.value.replace('月', '')}-${day.value.replace('日', '')}`
  const t = new Date(dateStr)
  const yi = Number(formatDate(t, 'Y'))
  const mi = Number(formatDate(t, 'M'))
  const di = Number(formatDate(t, 'D'))
  const o = new Date(yi, mi - 1, di)
  const u = calendarConverterFn.solar2lunar(o) as {
    cYear: string
    lunarMonth: string
    lunarDay: string
  }
  lunarDate.value = `${u.cYear}年${u.lunarMonth}月${u.lunarDay}日`
}

function bindTimeChange(ev: { detail: { value: number[] } }) {
  const v = ev.detail.value
  timeValue.value = [v[0], v[1]]
}

function confirmSelectTime() {
  timeValueSetting()
  showTimePickerView.value = false
}

function timeValueSetting() {
  hour.value = hours.value[timeValue.value[0]]
  minute.value = minutes.value[timeValue.value[1]]
}

function contains(arr: string[], ch: string): number | false {
  for (let i = arr.length; i--;) {
    if (arr[i] === ch)
      return i + 1
  }
  return false
}

function finishPan(payload: MeiHuaPanPayload) {
  mhStore.setLastPan(payload)
  uni.navigateTo({
    url: buildMeiHuaDetailsUrl(payload),
  })
}

function queryNewTime() {
  const t = formatDate(new Date(), 'Y')
  const i = formatDate(new Date(), 'M')
  const l = formatDate(new Date(), 'D')
  const r = Math.floor((new Date().getHours() + 1) % 24 / 2) + 1
  const o = '子丑寅卯辰巳午未申酉戌亥'.charAt(r - 1)
  const u = new Date(Number(t), Number(i) - 1, Number(l))
  const s = calendarConverterFn.solar2lunar(u) as {
    cDay: string
    cMonth: string
    cYear: string
    lMonth: number
    lDay: number
    lunarMonth: string
    lunarDay: string
  }
  const c = siZhuInfoFn.getSiZhu(s.cDay, r) + o
  const fkw = siZhuInfoFn.getKongWang(s.cDay)
  const d = formatDate(new Date(), 'Y年M月D日 h:m')
  const D = `${s.cYear}年${s.lunarMonth}月${s.lunarDay}日${o}时`
  const g = `${s.cYear} ${s.cMonth} ${s.cDay} ${c} (${fkw}空)`
  const zhiArr = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const w = Number.parseInt(String(contains(zhiArr, s.cYear[1])), 10) + s.lMonth + s.lDay
  const y = Number.parseInt(String(contains(zhiArr, s.cYear[1])), 10) + s.lMonth + s.lDay + r
  let v = 1
  let M = 1
  let m = 1
  if (w > 0 && w <= 8)
    v = w
  else
    v = w % 8 === 0 ? 8 : w % 8

  if (y > 0 && y <= 8)
    M = y
  else
    M = y % 8 === 0 ? 8 : y % 8

  if (y > 0 && y <= 6)
    m = y
  else
    m = y % 6 === 0 ? 6 : y % 6

  const S: MeiHuaPanPayload = {
    type: 1,
    sg: v,
    xg: M,
    dy: m,
    sc: 1,
    number1: 1,
    number2: 1,
    gonli: d,
    nongli: D,
    sizhu: g,
  }
  finishPan(S)
}

function querySelectTime() {
  const date = `${year.value}/${month.value.replace('月', '')}/${day.value.replace('日', '')}`
  const time = `${hour.value > 9 ? hour.value : `0${hour.value}`}:${minute.value > 9 ? minute.value : `0${minute.value}`}`
  const dt = new Date(`${date} ${time}`)
  const ly = formatDate(dt, 'Y')
  const lm = formatDate(dt, 'M')
  const ld = formatDate(dt, 'D')
  const u = Math.floor((dt.getHours() + 1) % 24 / 2) + 1
  const s = '子丑寅卯辰巳午未申酉戌亥'.charAt(u - 1)
  const c = new Date(Number(ly), Number(lm) - 1, Number(ld))
  const f = calendarConverterFn.solar2lunar(c) as {
    cDay: string
    cMonth: string
    cYear: string
    lMonth: number
    lDay: number
    lunarMonth: string
    lunarDay: string
  }
  const d = siZhuInfoFn.getSiZhu(f.cDay, u) + s
  const D = siZhuInfoFn.getKongWang(f.cDay)
  const g = formatDate(dt, 'Y年M月D日 h:m')
  const h = `${f.cYear}年${f.lunarMonth}月${f.lunarDay}日${s}时`
  const w = `${f.cYear} ${f.cMonth} ${f.cDay} ${d} (${D}空)`
  const zhiArr = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const v = Number.parseInt(String(contains(zhiArr, f.cYear[1])), 10) + f.lMonth + f.lDay
  const M = Number.parseInt(String(contains(zhiArr, f.cYear[1])), 10) + f.lMonth + f.lDay + u
  let m = 1
  let Y = 1
  let p = 1
  if (v > 0 && v <= 8)
    m = v
  else
    m = v % 8 === 0 ? 8 : v % 8

  if (M > 0 && M <= 8)
    Y = M
  else
    Y = M % 8 === 0 ? 8 : M % 8

  if (M > 0 && M <= 6)
    p = M
  else
    p = M % 6 === 0 ? 6 : M % 6

  const q: MeiHuaPanPayload = {
    type: 1,
    sg: m,
    xg: Y,
    dy: p,
    sc: u,
    number1: 1,
    number2: 1,
    gonli: g,
    nongli: h,
    sizhu: w,
  }
  finishPan(q)
}

onMounted(() => {
  const init = meiHuaInitSolarPicker()
  yearList.value = init.yearList
  days.value = init.dayLabels
  rebuildHoursMinutes()
  year.value = yearList.value[init.yearIdx]
  month.value = months[init.monthIdx]
  day.value = days.value[init.dayIdx]
  hour.value = 0
  minute.value = 0
  value.value = [init.yearIdx, init.monthIdx, init.dayIdx]
  timeValue.value = [0, 0]
  toLunarDate()
})
</script>

<template>
  <view class="content">
    <view class="content-main">
      <view class="info-box">
        <view class="info-block">
          <view class="tips-content" :style="{ color: THEME_PRIMARY }">
            时间起盘
          </view>
          <view class="section">
            <view class="section-title plural-section">
              <view class="plural-title">
                阳历：
              </view>
            </view>
            <view>
              <view class="section-content" @click="chooseDate">
                <view class="input_text">
                  {{ year }}年{{ month }}{{ day }}
                </view>
                <u-icon class="arrow-icon" name="arrow-down" :size="14" :color="THEME_PRIMARY" />
              </view>
              <view class="section-content">
                <view class="section-title lunar-item">
                  (阴历)
                </view>
                <view class="input_text lunar-item">
                  {{ lunarDate }}
                </view>
              </view>
            </view>
          </view>
          <view class="section">
            <view class="section-title">
              时间：
            </view>
            <view class="section-content" @click="chooseTime">
              <view class="input_text">
                {{ hour > 9 ? hour : `0${hour}` }} : {{ minute > 9 ? minute : `0${minute}` }}
              </view>
              <u-icon class="arrow-icon" name="arrow-down" :size="14" :color="THEME_PRIMARY" />
            </view>
          </view>
          <view class="btn-box">
            <view class="quiryButton" :style="{ backgroundColor: THEME_PRIMARY }" @click="querySelectTime">
              <view class="btn-text">
                选时起盘
              </view>
            </view>
            <view class="quiryButton" :style="{ backgroundColor: THEME_PRIMARY }" @click="queryNewTime">
              <view class="btn-text">
                现时起盘
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="picker-view" :class="[showDatePickerView ? 'show' : '']">
      <view class="picker-inner">
        <view class="pick_header">
          <view class="pick-item" :style="{ color: THEME_PRIMARY, borderBottomColor: THEME_PRIMARY }">
            阳历
          </view>
        </view>
        <view class="time">
          <picker-view
            indicator-style="height:80rpx;"
            style="height: 100%"
            :value="value"
            @change="bindDateChange"
          >
            <picker-view-column>
              <view v-for="(item, index) in yearList" :key="index">
                {{ item }}年
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="(item, index) in months" :key="index">
                {{ item }}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="(item, index) in days" :key="index">
                {{ item }}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="btns">
          <view class="confirm" :style="{ backgroundColor: THEME_PRIMARY }" @click="confirmSelectDate">
            确认
          </view>
        </view>
      </view>
    </view>

    <view class="picker-view" :class="[showTimePickerView ? 'show' : '']">
      <view class="picker-inner">
        <view class="pick_header">
          <view class="pick-item" :style="{ color: THEME_PRIMARY, borderBottomColor: THEME_PRIMARY }">
            时间
          </view>
        </view>
        <view class="time">
          <text class="hm-span">
            :
          </text>
          <picker-view
            indicator-style="height:80rpx;"
            style="height: 100%"
            :value="timeValue"
            @change="bindTimeChange"
          >
            <picker-view-column>
              <view v-for="(item, index) in hours" :key="index">
                {{ item > 9 ? item : `0${item}` }}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="(item, index) in minutes" :key="index">
                {{ item > 9 ? item : `0${item}` }}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="btns">
          <view class="confirm" :style="{ backgroundColor: THEME_PRIMARY }" @click="confirmSelectTime">
            确认
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
  height: 88rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 30rpx;
}

.lunar-item {
  font-size: 26rpx;
  color: #808080;
}

.plural-section {
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  height: 88rpx;
  justify-content: center;
}

.plural-title {
  height: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.btn-box {
  display: flex;
  flex-direction: column;
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
  margin-bottom: 36rpx;
}

.btn-text {
  font-size: 32rpx;
  white-space: nowrap;
}

.picker-view {
  background-color: rgba(0, 0, 0, 0.6);
  height: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  visibility: hidden;
  width: 100%;
  max-width: 480px;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.picker-view.show {
  visibility: visible;
}

.picker-view .picker-inner {
  background-color: #fff;
  display: block;
  font-size: 30rpx;
  text-align: center;
  width: 100%;
}

.picker-view .picker-inner .time {
  display: block;
  height: 400rpx;
  padding: 20rpx;
  position: relative;
}

.picker-view .picker-inner .time .hm-span {
  position: absolute;
  right: 50%;
  top: 197rpx;
}

.picker-view .picker-inner .btns {
  height: 80rpx;
  line-height: 80rpx;
  overflow: hidden;
  padding-bottom: 2vw;
}

.picker-view .picker-inner .btns .confirm {
  width: 409rpx;
  height: 71rpx;
  color: #fff;
  margin: 0 auto;
  border-radius: 12rpx;
  font-size: 43rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.pick_header {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2rpx solid #d3653c;
  height: 95rpx;
  width: 100%;
}

.pick-item {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  box-sizing: border-box;
  font-size: 36rpx;
  font-weight: bolder;
}

.arrow-icon {
  margin-left: 8rpx;
}
</style>
