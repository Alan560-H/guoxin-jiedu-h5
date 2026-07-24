<script setup lang="ts">
import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'
import type { BirthDateTimeParts } from '@/utils/guoxin/birthDateTime'
import { computed, ref, watch } from 'vue'
import {
  CALENDAR_OPTIONS,
  GENDER_OPTIONS,
  RELATION_OPTIONS,
} from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import {
  buildDualBirthDays,
  buildHourOptions,
  buildMinuteOptions,
  buildYearRange,
  formatBirthDay,
  getDaysInSolarMonth,
} from '@/utils/guoxin/birthDateTime'
import {
  buildRegionSelection,
  getCityList,
  getDistrictList,
  getProvinceList,
} from '@/utils/guoxin/chinaRegion'
import {
  getLunarDayOptions,
  getLunarMonthOptions,
  getLunarYearOptions,
} from '@/utils/guoxin/lunarCalendar'
import {
  formatLunarDayLabel,
  formatLunarMonthLabel,
  resolveShichenIndex,
  SHICHEN_OPTIONS,
  shichenLabels,
  toChineseYear,
} from '@/utils/guoxin/lunarDisplay'
import { useActionLock } from '@/utils/guoxin/useActionLock'

type SheetKind = 'relation' | 'date' | 'time' | 'region' | null

const props = withDefaults(defineProps<{
  show: boolean
  /** 编辑已有档案 id */
  editId?: string
  /** 邀请填写：默认关系为亲友 */
  inviteMode?: boolean
}>(), {
  editId: '',
  inviteMode: false,
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const store = useGuoxinStore()
const { locking: saving, runLocked } = useActionLock()

const isEdit = computed(() => Boolean(props.editId))
const modalTitle = computed(() => {
  if (props.inviteMode)
    return '填写八字并授权'
  if (isEdit.value)
    return '编辑八字用户'
  return '开始问答前'
})
const modalLead = computed(() => {
  if (props.inviteMode)
    return '请填写性别、历法、出生时间与地点，并授权给邀请人用于国心解读。'
  if (isEdit.value)
    return '修改后将按新资料继续问答；会话上下文会重新开始。'
  return '请选择历法、出生日期、时间和地点。信息保存后，后续问答无需重复选择。'
})
const saveLabel = computed(() => {
  if (props.inviteMode)
    return '确认授权并提交'
  if (isEdit.value)
    return '保存修改'
  return '保存并开始'
})

const relationOpts = computed(() =>
  store.relationOptions.length > 0 ? store.relationOptions : RELATION_OPTIONS,
)

const name = ref('')
const relation = ref<RelationValue | ''>('self')
const gender = ref<GenderValue | ''>('female')
const calendarType = ref<CalendarValue>('solar')
const birthPlace = ref('')
const areaCode = ref('')
const useTrueSolarTime = ref(false)
const timeUncertain = ref(false)

const dateFilled = ref(false)
const dateIndex = ref<[number, number, number]>([0, 0, 0])
const timeIndex = ref<[number, number]>([0, 0])
const shichenIndex = ref(0)
const shichenTouched = ref(false)
const storedBirthHour = ref(0)
const storedBirthMinute = ref(0)
const regionIndex = ref<[number, number, number]>([0, 0, 0])

const sheet = ref<SheetKind>(null)
const draftIndex = ref<number[]>([0])

const solarYears = buildYearRange()
const lunarYears = getLunarYearOptions()
const hourOptions = buildHourOptions()
const minuteOptions = buildMinuteOptions()
const provinceList = getProvinceList()

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

const yearLabels = computed(() =>
  calendarType.value === 'lunar'
    ? yearList.value.map(y => toChineseYear(y))
    : yearList.value.map(y => `${y}年`),
)
const monthLabels = computed(() =>
  calendarType.value === 'lunar'
    ? monthList.value.map(m => formatLunarMonthLabel(m.month))
    : monthList.value.map(m => m.label),
)
const dayLabels = computed(() =>
  calendarType.value === 'lunar'
    ? dayList.value.map(d => formatLunarDayLabel(d))
    : dayList.value.map(d => `${d}日`),
)

const hourLabels = computed(() => hourOptions.map(h => `${String(h).padStart(2, '0')}时`))
const minuteLabels = computed(() => minuteOptions.map(m => `${String(m).padStart(2, '0')}分`))
const shichenPickerRange = shichenLabels()

const cityList = computed(() => getCityList(regionIndex.value[0]))
const districtList = computed(() => getDistrictList(regionIndex.value[0], regionIndex.value[1]))
const provinceLabels = computed(() => provinceList.map(p => p.label))
const cityLabels = computed(() => cityList.value.map(c => c.label))
const districtLabels = computed(() => districtList.value.map(d => d.label))

const relationLabels = computed(() => relationOpts.value.map(r => (
  r.value === 'self' ? '自己' : r.label
)))

const relationIndex = computed(() => {
  const idx = relationOpts.value.findIndex(r => r.value === relation.value)
  return idx >= 0 ? idx : 0
})

const dateDisplay = computed(() => {
  if (!dateFilled.value)
    return ''
  const y = yearList.value[dateIndex.value[0]]
  const m = monthList.value[dateIndex.value[1]]
  const d = dayList.value[dateIndex.value[2]]
  if (y == null || !m || d == null)
    return ''
  if (calendarType.value === 'lunar')
    return `农历 ${toChineseYear(y)}${formatLunarMonthLabel(m.month)}${formatLunarDayLabel(d)}`
  return `${y}年${m.month}月${d}日`
})

const timeDisplay = computed(() => {
  if (timeUncertain.value)
    return '时辰不确定'
  if (calendarType.value === 'lunar') {
    if (shichenTouched.value)
      return SHICHEN_OPTIONS[shichenIndex.value]?.label ?? '子时(早)'
    return SHICHEN_OPTIONS[resolveShichenIndex(storedBirthHour.value, storedBirthMinute.value)]?.label ?? '子时(早)'
  }
  const h = hourOptions[timeIndex.value[0]] ?? 0
  const m = minuteOptions[timeIndex.value[1]] ?? 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const datetimeDisplay = computed(() => {
  if (!dateFilled.value)
    return '请选择出生日期与时间'
  return `${dateDisplay.value} ${timeDisplay.value}`
})

const regionDisplay = computed(() => birthPlace.value || '省份 / 城市')

const sheetTitle = computed(() => {
  if (sheet.value === 'relation')
    return '与我的关系'
  if (sheet.value === 'date')
    return '出生日期'
  if (sheet.value === 'time')
    return calendarType.value === 'lunar' ? '出生时辰' : '出生时间'
  if (sheet.value === 'region')
    return '出生地'
  return ''
})

watch(
  () => props.show,
  async (v) => {
    if (!v) {
      sheet.value = null
      return
    }
    resetForm()
    await store.loadRelationOptions()
    if (props.editId) {
      await fillFromProfile(props.editId)
    }
    else if (props.inviteMode) {
      relation.value = 'relative'
    }
    else {
      relation.value = store.profiles.length === 0 ? 'self' : 'relative'
    }
  },
)

watch(calendarType, (type) => {
  dateIndex.value = [0, 0, 0]
  dateFilled.value = false
  timeIndex.value = [0, 0]
  shichenIndex.value = 0
  shichenTouched.value = false
  storedBirthHour.value = 0
  storedBirthMinute.value = 0
  if (type === 'lunar')
    useTrueSolarTime.value = false
})

function resetForm() {
  name.value = ''
  relation.value = 'self'
  gender.value = 'female'
  calendarType.value = 'solar'
  birthPlace.value = ''
  areaCode.value = ''
  useTrueSolarTime.value = false
  timeUncertain.value = false
  dateFilled.value = false
  dateIndex.value = [0, 0, 0]
  timeIndex.value = [0, 0]
  shichenIndex.value = 0
  shichenTouched.value = false
  storedBirthHour.value = 0
  storedBirthMinute.value = 0
  regionIndex.value = [0, 0, 0]
  sheet.value = null
}

async function fillFromProfile(id: string) {
  let profile = store.getProfileById(id)
  if (!profile && !Number.isNaN(Number(id)))
    profile = await store.loadProfileDetail(Number(id))
  if (!profile)
    return

  name.value = profile.name || ''
  relation.value = profile.relation || 'self'
  gender.value = profile.gender || 'female'
  calendarType.value = profile.calendarType || 'solar'
  birthPlace.value = profile.birthPlace || ''
  areaCode.value = profile.areaCode || ''
  useTrueSolarTime.value = Boolean(profile.useTrueSolarTime)

  const solar = profile.birthDaySolar || profile.birthDay || ''
  const m = solar.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (m && calendarType.value === 'solar') {
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    const hour = Number(m[4])
    const minute = Number(m[5])
    const yi = solarYears.indexOf(year)
    if (yi >= 0) {
      dateIndex.value = [yi, Math.max(0, month - 1), Math.max(0, day - 1)]
      dateFilled.value = true
    }
    const hi = hourOptions.indexOf(hour)
    const mi = minuteOptions.indexOf(minute)
    timeIndex.value = [hi >= 0 ? hi : 0, mi >= 0 ? mi : 0]
    storedBirthHour.value = hour
    storedBirthMinute.value = minute
    if (hour === 0 && minute === 0)
      timeUncertain.value = true
  }

  if (areaCode.value) {
    const provinces = getProvinceList()
    for (let pi = 0; pi < provinces.length; pi++) {
      const cities = getCityList(pi)
      for (let ci = 0; ci < cities.length; ci++) {
        const districts = getDistrictList(pi, ci)
        const di = districts.findIndex(d => String(d.value) === String(areaCode.value))
        if (di >= 0) {
          regionIndex.value = [pi, ci, di]
          return
        }
      }
    }
  }
}

function openSheet(kind: SheetKind) {
  if (!kind)
    return
  sheet.value = kind
  if (kind === 'relation')
    draftIndex.value = [relationIndex.value]
  else if (kind === 'date')
    draftIndex.value = [...dateIndex.value]
  else if (kind === 'time')
    draftIndex.value = calendarType.value === 'lunar' ? [shichenIndex.value] : [...timeIndex.value]
  else if (kind === 'region')
    draftIndex.value = [...regionIndex.value]
}

function closeSheet() {
  sheet.value = null
}

function onSheetPick(e: { detail: { value: number[] } }) {
  const next = [...e.detail.value]
  if (sheet.value === 'date') {
    if (next[0] !== draftIndex.value[0]) {
      next[1] = 0
      next[2] = 0
    }
    else if (next[1] !== draftIndex.value[1]) {
      next[2] = 0
    }
  }
  if (sheet.value === 'region') {
    if (next[0] !== draftIndex.value[0]) {
      next[1] = 0
      next[2] = 0
      regionIndex.value = [next[0], 0, 0]
    }
    else if (next[1] !== draftIndex.value[1]) {
      next[2] = 0
      regionIndex.value = [next[0], next[1], 0]
    }
  }
  draftIndex.value = next
}

function confirmSheet() {
  if (sheet.value === 'relation') {
    const opt = relationOpts.value[draftIndex.value[0]]
    if (opt)
      relation.value = opt.value as RelationValue
  }
  else if (sheet.value === 'date') {
    dateIndex.value = [
      draftIndex.value[0] ?? 0,
      draftIndex.value[1] ?? 0,
      draftIndex.value[2] ?? 0,
    ]
    dateFilled.value = true
  }
  else if (sheet.value === 'time') {
    if (calendarType.value === 'lunar') {
      shichenIndex.value = draftIndex.value[0] ?? 0
      shichenTouched.value = true
    }
    else {
      timeIndex.value = [draftIndex.value[0] ?? 0, draftIndex.value[1] ?? 0]
    }
  }
  else if (sheet.value === 'region') {
    regionIndex.value = [
      draftIndex.value[0] ?? 0,
      draftIndex.value[1] ?? 0,
      draftIndex.value[2] ?? 0,
    ]
    const sel = buildRegionSelection(
      regionIndex.value[0],
      regionIndex.value[1],
      regionIndex.value[2],
    )
    if (sel) {
      birthPlace.value = sel.birthPlace
      areaCode.value = sel.areaCode
    }
  }
  closeSheet()
}

function toggleTimeUncertain() {
  timeUncertain.value = !timeUncertain.value
  if (timeUncertain.value) {
    timeIndex.value = [0, 0]
    shichenIndex.value = 0
    shichenTouched.value = false
    storedBirthHour.value = 0
    storedBirthMinute.value = 0
  }
}

function resolveBirthHourMinute(): { hour: number, minute: number } {
  if (timeUncertain.value)
    return { hour: 0, minute: 0 }
  if (calendarType.value === 'lunar') {
    if (shichenTouched.value) {
      const opt = SHICHEN_OPTIONS[shichenIndex.value] ?? SHICHEN_OPTIONS[0]
      return { hour: opt.hour, minute: opt.minute }
    }
    return { hour: storedBirthHour.value, minute: storedBirthMinute.value }
  }
  return {
    hour: hourOptions[timeIndex.value[0]] ?? 0,
    minute: minuteOptions[timeIndex.value[1]] ?? 0,
  }
}

function buildBirthParts(): BirthDateTimeParts | null {
  const y = yearList.value[dateIndex.value[0]]
  const m = monthList.value[dateIndex.value[1]]
  const d = dayList.value[dateIndex.value[2]]
  const { hour: h, minute: min } = resolveBirthHourMinute()
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

function validate() {
  if (!name.value.trim()) {
    uni.showToast({ title: '请输入称呼', icon: 'none' })
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
  if (!dateFilled.value || !buildBirthParts()) {
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
  const rel = relationOpts.value.find(r => r.value === relation.value)
    ?? RELATION_OPTIONS.find(r => r.value === relation.value)!
  const gen = GENDER_OPTIONS.find(g => g.value === gender.value)!
  const cal = CALENDAR_OPTIONS.find(c => c.value === calendarType.value)!
  const parts = buildBirthParts()
  const dual = parts ? buildDualBirthDays(calendarType.value, parts) : null
  return {
    name: name.value.trim(),
    relation: rel.value as RelationValue,
    relationText: rel.value === 'self' ? '自己' : rel.label,
    gender: gen.value,
    genderText: gen.label,
    birthDay: dual?.birthDay ?? (parts ? formatBirthDay(parts) : ''),
    birthDaySolar: dual?.birthDaySolar ?? '',
    birthDayLunar: dual?.birthDayLunar ?? '',
    lunarLeapMonth: dual?.lunarLeapMonth || undefined,
    birthPlace: birthPlace.value.trim(),
    areaCode: areaCode.value,
    calendarType: cal.value,
    calendarTypeText: cal.label,
    useTrueSolarTime: calendarType.value === 'solar' && useTrueSolarTime.value,
  }
}

async function save() {
  if (!validate())
    return
  await runLocked(async () => {
    try {
      uni.showLoading({ title: '保存中...', mask: true })
      const dto = buildDto()
      if (props.editId)
        await store.updateProfile(props.editId, dto)
      else
        await store.createProfile(dto)
      uni.hideLoading()
      uni.showToast({
        title: props.inviteMode ? '已提交授权' : (props.editId ? '保存成功' : '创建成功'),
        icon: 'success',
      })
      emit('success')
      emit('close')
    }
    catch {
      uni.hideLoading()
    }
  })
}

/** 日期 sheet 滚动时同步临时年月，保证日列选项正确 */
const sheetYearLabels = yearLabels
const sheetMonthLabels = computed(() => {
  if (sheet.value !== 'date')
    return monthLabels.value
  const y = yearList.value[draftIndex.value[0] ?? 0]
  if (y == null)
    return []
  if (calendarType.value === 'lunar')
    return getLunarMonthOptions(y).map(m => formatLunarMonthLabel(m.month))
  return Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
})
const sheetDayLabels = computed(() => {
  if (sheet.value !== 'date')
    return dayLabels.value
  const y = yearList.value[draftIndex.value[0] ?? 0]
  const mi = draftIndex.value[1] ?? 0
  if (y == null)
    return []
  if (calendarType.value === 'lunar') {
    const months = getLunarMonthOptions(y)
    const month = months[mi]?.month ?? 1
    return getLunarDayOptions(y, month).map(d => formatLunarDayLabel(d))
  }
  const dayCount = getDaysInSolarMonth(y, mi + 1)
  return Array.from({ length: dayCount }, (_, i) => `${i + 1}日`)
})

const sheetCityLabels = computed(() => {
  if (sheet.value !== 'region')
    return cityLabels.value
  return getCityList(draftIndex.value[0] ?? 0).map(c => c.label)
})
const sheetDistrictLabels = computed(() => {
  if (sheet.value !== 'region')
    return districtLabels.value
  return getDistrictList(draftIndex.value[0] ?? 0, draftIndex.value[1] ?? 0).map(d => d.label)
})
</script>

<template>
  <view v-if="props.show" class="modal-root">
    <view class="modal-mask" @tap="emit('close')" />

    <view class="modal-card" @tap.stop>
      <view class="close-x" @tap="emit('close')">
        ×
      </view>
      <text class="eyebrow">
        {{ modalTitle }}
      </text>
      <text class="title">
        填写八字信息
      </text>
      <text class="copy">
        {{ modalLead }}
      </text>

      <scroll-view scroll-y class="form-scroll">
        <view class="row-2">
          <view class="field">
            <text class="label">
              称呼
            </text>
            <input v-model="name" class="input" maxlength="12" placeholder="例如：自己、妈妈">
          </view>
          <view class="field">
            <text class="label">
              与我的关系
            </text>
            <view class="input picker-face" @tap="openSheet('relation')">
              {{ relationLabels[relationIndex] || '自己' }}
              <text class="arrow">
                ▾
              </text>
            </view>
          </view>
        </view>

        <view class="field">
          <text class="label">
            性别
          </text>
          <view class="segment">
            <view
              class="segment-item"
              :class="{ active: gender === 'female' }"
              @tap="gender = 'female'"
            >
              女
            </view>
            <view
              class="segment-item"
              :class="{ active: gender === 'male' }"
              @tap="gender = 'male'"
            >
              男
            </view>
          </view>
        </view>

        <view class="field">
          <text class="label">
            历法
          </text>
          <view class="segment">
            <view
              v-for="c in CALENDAR_OPTIONS"
              :key="c.value"
              class="segment-item"
              :class="{ active: calendarType === c.value }"
              @tap="calendarType = c.value"
            >
              {{ c.label }}
            </view>
          </view>
        </view>

        <view class="field">
          <text class="label">
            出生日期与时间
          </text>
          <view class="datetime-row">
            <view class="input picker-face datetime-face datetime-main" @tap="openSheet('date')">
              <text class="cal-tag">
                历
              </text>
              <text :class="{ placeholder: !dateFilled }">
                {{ datetimeDisplay }}
              </text>
            </view>
            <view class="uncertain" @tap="toggleTimeUncertain">
              <view class="checkbox" :class="{ checked: timeUncertain }">
                <text v-if="timeUncertain">
                  ✓
                </text>
              </view>
              <text>时辰不确定</text>
            </view>
          </view>
          <view
            v-if="!timeUncertain"
            class="input picker-face time-extra"
            @tap="openSheet('time')"
          >
            {{ calendarType === 'lunar' ? '时辰' : '时间' }} {{ timeDisplay }}
            <text class="arrow">
              ▾
            </text>
          </view>
        </view>

        <view class="field">
          <text class="label">
            出生地
          </text>
          <view class="input picker-face" @tap="openSheet('region')">
            <text :class="{ placeholder: !birthPlace }">
              {{ regionDisplay }}
            </text>
            <text class="arrow">
              ›
            </text>
          </view>
        </view>

        <view v-if="calendarType === 'solar'" class="field solar-row" @tap="useTrueSolarTime = !useTrueSolarTime">
          <view>
            <text class="label">
              使用真太阳时
            </text>
            <text class="hint">
              按出生地经度微调出生时辰
            </text>
          </view>
          <view class="switch" :class="{ on: useTrueSolarTime }">
            <view class="knob" />
          </view>
        </view>
      </scroll-view>

      <view class="btn primary" :class="{ disabled: saving }" @tap="saving ? undefined : save()">
        {{ saveLabel }}
      </view>
      <view class="btn secondary" @tap="emit('close')">
        暂不选择
      </view>
    </view>

    <!-- 自定义选择层：与遮罩同根节点，层级高于遮罩，避免原生 picker 被挡 -->
    <view v-if="sheet" class="sheet-layer">
      <view class="sheet-dim" @tap="closeSheet" />
      <view class="sheet-panel" @tap.stop>
        <view class="sheet-bar">
          <text class="sheet-cancel" @tap="closeSheet">
            取消
          </text>
          <text class="sheet-title">
            {{ sheetTitle }}
          </text>
          <text class="sheet-ok" @tap="confirmSheet">
            完成
          </text>
        </view>

        <picker-view
          v-if="sheet === 'relation'"
          class="sheet-picker"
          :value="draftIndex"
          @change="onSheetPick"
        >
          <picker-view-column>
            <view v-for="(label, i) in relationLabels" :key="i" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
        </picker-view>

        <picker-view
          v-else-if="sheet === 'date'"
          class="sheet-picker"
          :value="draftIndex"
          @change="onSheetPick"
        >
          <picker-view-column>
            <view v-for="(label, i) in sheetYearLabels" :key="`y-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(label, i) in sheetMonthLabels" :key="`m-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(label, i) in sheetDayLabels" :key="`d-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
        </picker-view>

        <picker-view
          v-else-if="sheet === 'time' && calendarType === 'solar'"
          class="sheet-picker"
          :value="draftIndex"
          @change="onSheetPick"
        >
          <picker-view-column>
            <view v-for="(label, i) in hourLabels" :key="`h-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(label, i) in minuteLabels" :key="`min-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
        </picker-view>

        <picker-view
          v-else-if="sheet === 'time'"
          class="sheet-picker"
          :value="draftIndex"
          @change="onSheetPick"
        >
          <picker-view-column>
            <view v-for="(label, i) in shichenPickerRange" :key="`s-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
        </picker-view>

        <picker-view
          v-else-if="sheet === 'region'"
          class="sheet-picker"
          :value="draftIndex"
          @change="onSheetPick"
        >
          <picker-view-column>
            <view v-for="(label, i) in provinceLabels" :key="`p-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(label, i) in sheetCityLabels" :key="`c-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(label, i) in sheetDistrictLabels" :key="`a-${i}`" class="sheet-item">
              {{ label }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}

.modal-mask {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: rgba(43, 23, 18, 0.48);
}

.modal-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 680rpx;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  padding: 36rpx 32rpx 28rpx;
  border-radius: 32rpx;
  background: #fffbf5;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  box-sizing: border-box;
}

.close-x {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eyebrow {
  display: block;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 700;
}

.title {
  display: block;
  margin-top: 8rpx;
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 40rpx;
  font-weight: 800;
}

.copy {
  display: block;
  margin: 12rpx 0 24rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.5;
}

.form-scroll {
  flex: 1;
  min-height: 0;
  max-height: 58vh;
}

.row-2 {
  display: flex;
  gap: 16rpx;
}

.row-2 .field {
  flex: 1;
  min-width: 0;
}

.field {
  margin-bottom: 22rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 24rpx;
  font-weight: 700;
}

.hint {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-hint, #a28777);
  font-size: 20rpx;
}

.input {
  width: 100%;
  min-height: 80rpx;
  padding: 0 20rpx;
  border-radius: 18rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #f9ebe8;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 26rpx;
  box-sizing: border-box;
}

.picker-face {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.arrow {
  color: var(--gx-chat-hint, #a28777);
  font-size: 22rpx;
}

.segment {
  display: flex;
  gap: 12rpx;
}

.segment-item {
  flex: 1;
  min-height: 76rpx;
  border-radius: 18rpx;
  background: #f9ebe8;
  color: var(--gx-chat-brown, #7c402a);
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: var(--gx-chat-red-deep, #7f1f26);
    color: #fff;
  }
}

.datetime-row {
  display: flex;
  gap: 12rpx;
  align-items: stretch;
}

.datetime-main {
  flex: 1;
  min-width: 0;
}

.datetime-face {
  justify-content: flex-start;
}

.cal-tag {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red, #b43a3d);
  font-size: 18rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  color: var(--gx-chat-hint, #a28777);
}

.uncertain {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 0 12rpx;
  border-radius: 18rpx;
  background: #f9ebe8;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
}

.checkbox {
  width: 28rpx;
  height: 28rpx;
  border-radius: 6rpx;
  border: 2rpx solid var(--gx-chat-hint, #a28777);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: #fff;

  &.checked {
    background: var(--gx-chat-red, #b43a3d);
    border-color: var(--gx-chat-red, #b43a3d);
  }
}

.time-extra {
  margin-top: 12rpx;
}

.solar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 16rpx 0;
}

.switch {
  width: 88rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: #e8d5cf;
  position: relative;
  flex-shrink: 0;

  &.on {
    background: var(--gx-chat-red, #b43a3d);
  }
}

.knob {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}

.switch.on .knob {
  left: 44rpx;
}

.btn {
  min-height: 88rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
  margin-top: 12rpx;

  &.primary {
    background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
    color: #fffdf7;
  }

  &.secondary {
    background: transparent;
    color: var(--gx-chat-muted, #755d52);
    border: 2rpx solid var(--gx-chat-border, #eccdbb);
  }

  &.disabled {
    opacity: 0.55;
  }
}

.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sheet-dim {
  position: absolute;
  inset: 0;
  background: rgba(43, 23, 18, 0.28);
}

.sheet-panel {
  position: relative;
  z-index: 1;
  background: #fffbf5;
  border-radius: 28rpx 28rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -8rpx 32rpx rgba(121, 38, 32, 0.16);
}

.sheet-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid var(--gx-chat-border, #eccdbb);
}

.sheet-cancel {
  color: var(--gx-chat-muted, #755d52);
  font-size: 28rpx;
}

.sheet-title {
  color: var(--gx-chat-ink, #2b1712);
  font-size: 30rpx;
  font-weight: 700;
}

.sheet-ok {
  color: var(--gx-chat-red, #b43a3d);
  font-size: 28rpx;
  font-weight: 700;
}

.sheet-picker {
  width: 100%;
  height: 440rpx;
}

.sheet-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: var(--gx-chat-ink, #2b1712);
}
</style>
