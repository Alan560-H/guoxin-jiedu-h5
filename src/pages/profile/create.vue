<script setup lang="ts">
import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'
import type { ProfileVo } from '@/models/guoxin/profile'
import type { BirthDateTimeParts } from '@/utils/guoxin/birthDateTime'
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, ref, watch } from 'vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxCard from '@/components/guoxin/GxCard.vue'
import GxChip from '@/components/guoxin/GxChip.vue'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxRegionPicker from '@/components/guoxin/GxRegionPicker.vue'
import {
  CALENDAR_OPTIONS,
  GENDER_OPTIONS,
  RELATION_OPTIONS,
} from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import {
  buildDualBirthDays,
  buildHourOptions,
  buildMinuteOptions,
  buildYearRange,
  formatBirthDay,
  getDaysInSolarMonth,
  parseBirthDay,
} from '@/utils/guoxin/birthDateTime'
import {
  findLunarMonthIndex,
  getLunarDayOptions,
  getLunarMonthOptions,
  getLunarYearOptions,
} from '@/utils/guoxin/lunarCalendar'

const store = useGuoxinStore()

const relationOpts = computed(() =>
  store.relationOptions.length > 0 ? store.relationOptions : RELATION_OPTIONS,
)

const profileId = ref('')
const isEditMode = ref(false)

const name = ref('')
const relation = ref<RelationValue | ''>('')
const gender = ref<GenderValue | ''>('')
const calendarType = ref<CalendarValue>('solar')
const birthPlace = ref('')
const areaCode = ref('')
const useTrueSolarTime = ref(false)

const dateFilled = ref(false)
const dateIndex = ref<[number, number, number]>([0, 0, 0])
const timeIndex = ref<[number, number]>([0, 0])

const solarYears = buildYearRange()
const lunarYears = getLunarYearOptions()
const hourOptions = buildHourOptions()
const minuteOptions = buildMinuteOptions()

const yearList = computed(() =>
  calendarType.value === 'lunar' ? lunarYears : solarYears,
)

const monthList = computed(() => {
  const y = yearList.value[dateIndex.value[0]]
  if (y == null)
    return []
  if (calendarType.value === 'lunar')
    return getLunarMonthOptions(y)
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: `${i + 1}月`,
    dayCount: getDaysInSolarMonth(y, i + 1),
  }))
})

const dayList = computed(() => {
  const y = yearList.value[dateIndex.value[0]]
  const monthOpt = monthList.value[dateIndex.value[1]]
  if (y == null || !monthOpt)
    return []
  if (calendarType.value === 'lunar')
    return getLunarDayOptions(y, monthOpt.month)
  return Array.from({ length: monthOpt.dayCount }, (_, i) => i + 1)
})

const dateLabels = computed(() => [
  yearList.value.map(y => `${y}年`),
  monthList.value.map(m => m.label),
  dayList.value.map(d => `${d}日`),
])

const timeLabels = computed(() => [
  hourOptions.map(h => `${String(h).padStart(2, '0')}时`),
  minuteOptions.map(m => `${String(m).padStart(2, '0')}分`),
])

const dateDisplay = computed(() => {
  if (!dateFilled.value)
    return ''
  const y = yearList.value[dateIndex.value[0]]
  const m = monthList.value[dateIndex.value[1]]
  const d = dayList.value[dateIndex.value[2]]
  if (y == null || !m || d == null)
    return ''
  const cal = calendarType.value === 'lunar' ? '农历' : '公历'
  return `${cal} ${y}年${m.label}${d}日`
})

const timeDisplay = computed(() => {
  const h = hourOptions[timeIndex.value[0]] ?? 0
  const m = minuteOptions[timeIndex.value[1]] ?? 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

onMounted(async () => {
  if (store.useRemoteApi)
    await store.loadRelationOptions()
})

function resetDateIndex() {
  dateIndex.value = [0, 0, 0]
  dateFilled.value = false
}

watch(calendarType, () => {
  resetDateIndex()
})

function applyProfileToForm(p: ProfileVo) {
  name.value = p.name
  relation.value = p.relation
  gender.value = p.gender
  calendarType.value = p.calendarType
  birthPlace.value = p.birthPlace
  areaCode.value = p.areaCode
  useTrueSolarTime.value = !!p.useTrueSolarTime

  const sourceDay = p.calendarType === 'lunar' ? p.birthDayLunar : p.birthDaySolar
  const parts = parseBirthDay(sourceDay || p.birthDay)
  if (!parts)
    return
  if (p.calendarType === 'lunar' && p.lunarLeapMonth)
    parts.month = -parts.month

  const years = calendarType.value === 'lunar' ? lunarYears : solarYears
  const yi = Math.max(0, years.indexOf(parts.year))
  dateIndex.value = [yi, 0, 0]

  const months = calendarType.value === 'lunar'
    ? getLunarMonthOptions(parts.year)
    : Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        label: `${i + 1}月`,
        dayCount: getDaysInSolarMonth(parts.year, i + 1),
      }))
  const mi = calendarType.value === 'lunar'
    ? findLunarMonthIndex(months, parts.month)
    : Math.max(0, months.findIndex(m => m.month === parts.month))
  dateIndex.value[1] = mi

  const days = calendarType.value === 'lunar'
    ? getLunarDayOptions(parts.year, months[mi]?.month ?? parts.month)
    : Array.from({ length: months[mi]?.dayCount ?? 28 }, (_, i) => i + 1)
  const di = Math.max(0, days.indexOf(parts.day))
  dateIndex.value[2] = di
  dateFilled.value = true

  timeIndex.value = [
    Math.max(0, hourOptions.indexOf(parts.hour)),
    Math.max(0, minuteOptions.indexOf(parts.minute)),
  ]
}

onLoad(async (options: any) => {
  if (!store.isLoggedIn) {
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  store.initSeedData()
  if (options?.id) {
    profileId.value = options.id
    isEditMode.value = true
    let p = store.getProfileById(options.id)
    if (store.useRemoteApi && !Number.isNaN(Number(options.id)))
      p = await store.loadProfileDetail(Number(options.id)) ?? p
    if (p)
      applyProfileToForm(p)
  }
})

function toggleRelation(value: RelationValue) {
  relation.value = value
}

function toggleGender(value: GenderValue) {
  gender.value = value
}

function toggleCalendar(value: CalendarValue) {
  calendarType.value = value
}

function onDateColumnChange(e: { detail: { column: number, value: number } }) {
  const { column, value } = e.detail
  const next: [number, number, number] = [...dateIndex.value]
  if (column === 0) {
    next[0] = value
    next[1] = 0
    next[2] = 0
  }
  else if (column === 1) {
    next[1] = value
    next[2] = 0
  }
  else {
    next[2] = value
  }
  dateIndex.value = next
}

function onDateChange(e: { detail: { value: number[] } }) {
  dateIndex.value = e.detail.value as [number, number, number]
  dateFilled.value = true
}

function onTimeChange(e: { detail: { value: number[] } }) {
  timeIndex.value = e.detail.value as [number, number]
}

function onRegionChange(payload: { birthPlace: string, areaCode: string }) {
  birthPlace.value = payload.birthPlace
  areaCode.value = payload.areaCode
}

function buildBirthParts(): BirthDateTimeParts | null {
  const y = yearList.value[dateIndex.value[0]]
  const m = monthList.value[dateIndex.value[1]]
  const d = dayList.value[dateIndex.value[2]]
  const h = hourOptions[timeIndex.value[0]] ?? 0
  const min = minuteOptions[timeIndex.value[1]] ?? 0
  if (y == null || !m || d == null)
    return null
  return {
    year: y,
    month: m.month,
    day: d,
    hour: h,
    minute: min,
    second: 0,
  }
}

function buildBirthDayString(): string {
  const parts = buildBirthParts()
  return parts ? formatBirthDay(parts) : ''
}

function validate() {
  if (!name.value.trim()) {
    uni.showToast({ title: '请输入档案名称', icon: 'none' })
    return false
  }
  if (!relation.value) {
    uni.showToast({ title: '请选择与我的关系', icon: 'none' })
    return false
  }
  if (!gender.value) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return false
  }
  if (!dateFilled.value || !buildBirthDayString()) {
    uni.showToast({ title: '请选择出生日期', icon: 'none' })
    return false
  }
  if (!birthPlace.value.trim() || !areaCode.value) {
    uni.showToast({ title: '请选择出生地', icon: 'none' })
    return false
  }
  return true
}

function buildDto() {
  const rel = RELATION_OPTIONS.find(r => r.value === relation.value)!
  const gen = GENDER_OPTIONS.find(g => g.value === gender.value)!
  const cal = CALENDAR_OPTIONS.find(c => c.value === calendarType.value)!
  const parts = buildBirthParts()
  const dual = parts ? buildDualBirthDays(calendarType.value, parts) : null
  return {
    name: name.value.trim(),
    relation: rel.value,
    relationText: rel.label,
    gender: gen.value,
    genderText: gen.label,
    birthDay: dual?.birthDay ?? '',
    birthDaySolar: dual?.birthDaySolar ?? '',
    birthDayLunar: dual?.birthDayLunar ?? '',
    lunarLeapMonth: dual?.lunarLeapMonth || undefined,
    birthPlace: birthPlace.value.trim(),
    areaCode: areaCode.value,
    calendarType: cal.value,
    calendarTypeText: cal.label,
    useTrueSolarTime: useTrueSolarTime.value,
  }
}

async function save(startImmediately: boolean) {
  if (!validate())
    return
  const dto = buildDto()
  if (isEditMode.value && profileId.value) {
    await store.updateProfile(profileId.value, dto)
    uni.showToast({ title: '修改成功', icon: 'success' })
  }
  else {
    const created = await store.createProfile(dto)
    profileId.value = created.id
    uni.showToast({ title: '创建成功', icon: 'success' })
  }
  if (startImmediately) {
    store.setActiveProfile(profileId.value || store.activeProfileId)
    store.navigateToSetup()
  }
  else {
    uni.navigateTo({ url: RouterPaths.profileList })
  }
}
</script>

<template>
  <view class="gx-page flex_column page-container">
    <GxNavBar :show-back="true" :title="isEditMode ? '修改心语档案' : '创建心语档案'" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="create-explain">
        请填写档案基本信息。信息越完整，心语老师给出的解读参考就越准确。
      </view>

      <view class="form-wrapper">
        <GxCard>
          <view class="form-item">
            <view class="gx-form-label item-label">
              档案名称 / 称呼 <text class="required-star">
                *
              </text>
            </view>
            <input v-model="name" class="gx-input custom-input" placeholder="如：妈妈、我自己、老伴儿…">
          </view>

          <view class="form-item">
            <view class="gx-form-label item-label">
              与我的关系 <text class="required-star">
                *
              </text>
            </view>
            <view class="chips-flex-row">
              <GxChip
                v-for="r in relationOpts"
                :key="r.value"
                :label="r.label"
                :selected="relation === r.value"
                @toggle="toggleRelation(r.value as RelationValue)"
              />
            </view>
          </view>

          <view class="form-item">
            <view class="gx-form-label item-label">
              性别 <text class="required-star">
                *
              </text>
            </view>
            <view class="chips-flex-row">
              <GxChip
                v-for="g in GENDER_OPTIONS"
                :key="g.value"
                :label="g.label"
                :selected="gender === g.value"
                @toggle="toggleGender(g.value)"
              />
            </view>
          </view>

          <view class="form-item">
            <view class="gx-form-label item-label">
              选用历法类型
            </view>
            <view class="chips-flex-row">
              <GxChip
                v-for="c in CALENDAR_OPTIONS"
                :key="c.value"
                :label="c.label"
                :selected="calendarType === c.value"
                @toggle="toggleCalendar(c.value)"
              />
            </view>
          </view>

          <view class="form-item">
            <view class="gx-form-label item-label">
              出生日期 <text class="required-star">
                *
              </text>
            </view>
            <picker
              mode="multiSelector"
              :range="dateLabels"
              :value="dateIndex"
              class="custom-picker-trigger"
              @columnchange="onDateColumnChange"
              @change="onDateChange"
            >
              <view class="select-trigger-box">
                <text :class="{ 'placeholder-color': !dateDisplay }">
                  {{ dateDisplay || '请选择出生日期' }}
                </text>
                <text class="picker-arrow">
                  ›
                </text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <view class="gx-form-label item-label">
              出生时间（选填，默认 00:00）
            </view>
            <picker
              mode="multiSelector"
              :range="timeLabels"
              :value="timeIndex"
              class="custom-picker-trigger"
              @change="onTimeChange"
            >
              <view class="select-trigger-box">
                <text>{{ timeDisplay }}</text>
                <text class="picker-arrow">
                  ›
                </text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <view class="gx-form-label item-label">
              真太阳时校对
            </view>
            <view class="checkbox-row flex_row f_a_center" @tap="useTrueSolarTime = !useTrueSolarTime">
              <view class="custom-checkbox-solar" :class="{ checked: useTrueSolarTime }">
                <text v-if="useTrueSolarTime" class="check-mark">
                  ✓
                </text>
              </view>
              <view class="checkbox-label-desc">
                启用真太阳时校对（勾选后系统将根据您的出生地自动校对时辰）
              </view>
            </view>
          </view>

          <view class="form-item" style="margin-bottom: 0;">
            <view class="gx-form-label item-label">
              出生地 <text class="required-star">
                *
              </text>
            </view>
            <GxRegionPicker
              :birth-place="birthPlace"
              :area-code="areaCode"
              @change="onRegionChange"
            />
          </view>
        </GxCard>
      </view>

      <view class="gx-btn-group form-actions">
        <GxButton type="primary" @click="save(true)">
          保存档案并开始解读
        </GxButton>
        <GxButton type="secondary" @click="save(false)">
          仅保存档案
        </GxButton>
      </view>

      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.create-explain {
  font-size: 26rpx;
  color: #665b4e;
  margin: 32rpx 32rpx 20rpx;
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.88), rgba(252, 245, 233, 0.88));
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  border-left: 6rpx solid #153f33;
  line-height: 1.6;
}

.form-wrapper {
  margin-top: 10rpx;
}

.form-item {
  margin-bottom: 36rpx;
}

.item-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #153f33;
  margin-bottom: 16rpx;

  .required-star {
    color: #b7654a;
    margin-left: 8rpx;
  }
}

.custom-input {
  border: 2rpx solid rgba(185, 148, 95, 0.32);
  background: rgba(255, 253, 248, 0.92);
  border-radius: 20rpx;
  height: 96rpx;
  font-size: 28rpx;
  padding: 0 32rpx;
  color: #241f19;
  outline: none;
}

.chips-flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.custom-picker-trigger {
  width: 100%;
}

.select-trigger-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid rgba(185, 148, 95, 0.32);
  background: rgba(255, 253, 248, 0.92);
  border-radius: 20rpx;
  height: 96rpx;
  font-size: 28rpx;
  padding: 0 32rpx;
  color: #241f19;
  box-sizing: border-box;

  .placeholder-color {
    color: #958878;
  }

  .picker-arrow {
    font-size: 38rpx;
    color: #b9945f;
  }
}

.checkbox-row {
  background: rgba(255, 253, 247, 0.94);
  border: 2rpx solid rgba(185, 148, 95, 0.35);
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
  gap: 16rpx;
  cursor: pointer;
  box-sizing: border-box;
}

.custom-checkbox-solar {
  width: 38rpx;
  height: 38rpx;
  border-radius: 8rpx;
  border: 4rpx solid #958878;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &.checked {
    border-color: #153f33;
    background-color: #153f33;
  }

  .check-mark {
    color: #fcf5e9;
    font-size: 24rpx;
    font-weight: 700;
  }
}

.checkbox-label-desc {
  font-size: 26rpx;
  color: #665b4e;
  line-height: 1.4;
}

.form-actions {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}
</style>
