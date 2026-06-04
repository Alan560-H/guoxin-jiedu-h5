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

const showGuaPickerView = ref(false)
const showYaoPickerView = ref(false)
const guaIndex = ref([0])
const guaType = ref(1)
const guaIndex1 = ref(0)
const guaIndex2 = ref(0)
const yaoValue = ref([0])
const yaoIndex = ref(0)

const guaArray = ['乾 ☰', '兑 ☱', '离 ☲', '震 ☳', '巽 ☴', '坎 ☵', '艮 ☶', '坤 ☷']
const yaoArray = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

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

function pickGua1() {
  guaIndex.value = [guaIndex1.value]
  guaType.value = 1
  showGuaPickerView.value = true
}

function pickGua2() {
  guaIndex.value = [guaIndex2.value]
  guaType.value = 2
  showGuaPickerView.value = true
}

function bindGuaChange(ev: { detail: { value: number[] } }) {
  guaIndex.value = ev.detail.value
}

function confirmSelectGua() {
  if (guaType.value === 1)
    guaIndex1.value = guaIndex.value[0]
  else
    guaIndex2.value = guaIndex.value[0]
  showGuaPickerView.value = false
}

function pickYao() {
  yaoValue.value = [yaoIndex.value]
  showYaoPickerView.value = true
}

function bindYaoChange(ev: { detail: { value: number[] } }) {
  yaoValue.value = ev.detail.value
}

function confirmSelectYao() {
  yaoIndex.value = yaoValue.value[0]
  showYaoPickerView.value = false
}

function finishPan(payload: MeiHuaPanPayload) {
  mhStore.setLastPan(payload)
  uni.navigateTo({
    url: buildMeiHuaDetailsUrl(payload),
  })
}

function bindQuery() {
  const t = guaIndex1.value + 1
  const i = guaIndex2.value + 1
  const l = yaoIndex.value + 1
  const date = `${year.value}/${month.value.replace('月', '')}/${day.value.replace('日', '')}`
  const time = `${hour.value > 9 ? hour.value : `0${hour.value}`}:${minute.value > 9 ? minute.value : `0${minute.value}`}`
  const d = new Date(`${date} ${time}`)
  const r = formatDate(d, 'Y')
  const u = formatDate(d, 'M')
  const s = formatDate(d, 'D')
  const c = Math.floor((d.getHours() + 1) % 24 / 2) + 1
  const f = '子丑寅卯辰巳午未申酉戌亥'.charAt(c - 1)
  const g = new Date(Number(r), Number(u) - 1, Number(s))
  const h = calendarConverterFn.solar2lunar(g) as {
    cDay: string
    cMonth: string
    cYear: string
    lunarMonth: string
    lunarDay: string
  }
  const D = siZhuInfoFn.getSiZhu(h.cDay, c) + f
  const m = siZhuInfoFn.getKongWang(h.cDay)
  const v: MeiHuaPanPayload = {
    type: 4,
    sg: t,
    xg: i,
    dy: l,
    sc: 1,
    number1: 1,
    number2: 1,
    gonli: formatDate(d, 'Y年M月D日 h:m'),
    nongli: `${h.cYear}年${h.lunarMonth}月${h.lunarDay}日${f}时`,
    sizhu: `${h.cYear} ${h.cMonth} ${h.cDay} ${D} (${m}空)`,
  }
  finishPan(v)
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
            <view>指定起盘</view>
            <view class="sub-title">
              （日期时间不参与起盘，只用于显示）
            </view>
          </view>

          <view class="section">
            <view class="section-title plural-section">
              <view class="plural-title">
                阳历：
              </view>
            </view>
            <view>
              <view class="section-content" @click="chooseDate">
                <view class="section-text">
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
              <view class="section-text">
                {{ hour > 9 ? hour : `0${hour}` }} : {{ minute > 9 ? minute : `0${minute}` }}
              </view>
              <u-icon class="arrow-icon" name="arrow-down" :size="14" :color="THEME_PRIMARY" />
            </view>
          </view>

          <view class="gua-section">
            <view class="gua-content" :style="{ borderColor: THEME_PRIMARY, color: THEME_PRIMARY }" @click="pickGua1">
              <view class="input_text">
                {{ guaArray[guaIndex1] }}
              </view>
            </view>
          </view>
          <view class="section gua-section">
            <view class="gua-content" :style="{ borderColor: THEME_PRIMARY, color: THEME_PRIMARY }" @click="pickGua2">
              <view class="input_text">
                {{ guaArray[guaIndex2] }}
              </view>
            </view>
          </view>
          <view class="gua-section">
            <view class="gua-content" :style="{ borderColor: THEME_PRIMARY, color: THEME_PRIMARY }" @click="pickYao">
              <view class="input_text">
                {{ yaoArray[yaoIndex] }}
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

    <view class="picker-view" :class="[showDatePickerView ? 'show' : '']">
      <view class="picker-inner">
        <view class="pick_header">
          <view class="pick-item" :style="{ color: THEME_PRIMARY }">
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
          <view class="pick-item" :style="{ color: THEME_PRIMARY }">
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

    <view class="picker-view" :class="[showGuaPickerView ? 'show' : '']">
      <view class="picker-inner">
        <view class="pick_header">
          <view class="pick-item" :style="{ color: THEME_PRIMARY }">
            选盘
          </view>
        </view>
        <view class="time">
          <picker-view
            indicator-style="height:80rpx;"
            style="height: 100%"
            :value="guaIndex"
            @change="bindGuaChange"
          >
            <picker-view-column>
              <view v-for="(item, index) in guaArray" :key="index">
                {{ item }}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="btns">
          <view class="confirm" :style="{ backgroundColor: THEME_PRIMARY }" @click="confirmSelectGua">
            确认
          </view>
        </view>
      </view>
    </view>

    <view class="picker-view" :class="[showYaoPickerView ? 'show' : '']">
      <view class="picker-inner">
        <view class="pick_header">
          <view class="pick-item" :style="{ color: THEME_PRIMARY }">
            选爻
          </view>
        </view>
        <view class="time">
          <picker-view
            indicator-style="height:80rpx;"
            style="height: 100%"
            :value="yaoValue"
            @change="bindYaoChange"
          >
            <picker-view-column>
              <view v-for="(item, index) in yaoArray" :key="index">
                {{ item }}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="btns">
          <view class="confirm" :style="{ backgroundColor: THEME_PRIMARY }" @click="confirmSelectYao">
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
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  line-height: 44rpx;
  margin: 24rpx auto 28rpx;
}

.sub-title {
  font-size: 24rpx;
  font-weight: normal;
  color: #666;
  margin-top: 12rpx;
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

.section-text {
  color: #808080;
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

.gua-section {
  margin-bottom: 4rpx;
}

.gua-content {
  width: 521rpx;
  height: 66rpx;
  border-radius: 10rpx;
  border: solid 3rpx #d3653c;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 36rpx;
  font-weight: bold;
}

.btn-box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 80%;
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
  margin-top: 72rpx;
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
