<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  BIRTH_HOUR_OPTIONS,
  CALENDAR_OPTIONS,
  GENDER_OPTIONS,
} from '@/constants/guoxin'
import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RELATION_OPTIONS } from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxChip from '@/components/guoxin/GxChip.vue'
import GxCard from '@/components/guoxin/GxCard.vue'

const store = useGuoxinStore()

// 关系选项：优先使用字典加载的，否则用本地常量
const relationOpts = computed(() =>
  store.relationOptions.length > 0 ? store.relationOptions : RELATION_OPTIONS
)

const profileId = ref('')
const isEditMode = ref(false)

const name = ref('')
const relation = ref<RelationValue | ''>('')
const gender = ref<GenderValue | ''>('')
const calendarType = ref<CalendarValue>('solar')
const birthYear = ref<number | ''>('')
const birthMonth = ref<number | ''>('')
const birthDay = ref<number | ''>('')
const birthHour = ref('记不清了')
const birthPlace = ref('')
const useTrueSolarTime = ref(false) // True Solar Time checkbox state

const yearOptions = Array.from({ length: new Date().getFullYear() - 1930 + 1 }, (_, i) => new Date().getFullYear() - i)
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

onMounted(async () => {
  if (store.useRemoteApi)
    await store.loadRelationOptions()
})

function applyProfileToForm(p: {
  name: string
  relation: RelationValue
  gender: GenderValue
  calendarType: CalendarValue
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: string
  birthPlace: string
  useTrueSolarTime?: boolean
}) {
  name.value = p.name
  relation.value = p.relation
  gender.value = p.gender
  calendarType.value = p.calendarType
  birthYear.value = p.birthYear
  birthMonth.value = p.birthMonth
  birthDay.value = p.birthDay
  birthHour.value = p.birthHour
  birthPlace.value = p.birthPlace
  useTrueSolarTime.value = !!p.useTrueSolarTime
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

function toggleHour(h: string) {
  birthHour.value = h
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
  if (!birthYear.value || !birthMonth.value || !birthDay.value) {
    uni.showToast({ title: '请选择完整出生日期', icon: 'none' })
    return false
  }
  if (!birthPlace.value.trim()) {
    uni.showToast({ title: '请填写出生地', icon: 'none' })
    return false
  }
  return true
}

function buildDto() {
  const rel = RELATION_OPTIONS.find(r => r.value === relation.value)!
  const gen = GENDER_OPTIONS.find(g => g.value === gender.value)!
  const cal = CALENDAR_OPTIONS.find(c => c.value === calendarType.value)!
  return {
    name: name.value.trim(),
    relation: rel.value,
    relationText: rel.label,
    gender: gen.value,
    genderText: gen.label,
    birthYear: Number(birthYear.value),
    birthMonth: Number(birthMonth.value),
    birthDay: Number(birthDay.value),
    birthHour: birthHour.value,
    birthPlace: birthPlace.value.trim(),
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
    <GxNavBar :title="isEditMode ? '修改心语档案' : '创建心语档案'" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="create-explain">
        请填写档案基本信息。信息越完整，心语老师给出的解读参考就越准确。
      </view>

      <view class="form-wrapper">
        <GxCard>
          <!-- 1. Name Input -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              档案名称 / 称呼 <text class="required-star">*</text>
            </view>
            <input v-model="name" class="gx-input custom-input" placeholder="如：妈妈、我自己、老伴儿…">
          </view>

          <!-- 2. Relation Select -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              与我的关系 <text class="required-star">*</text>
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

          <!-- 3. Gender Select -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              性别 <text class="required-star">*</text>
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

          <!-- 4. Calendar Type Select -->
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

          <!-- 5. Birth Date Year Picker -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              出生年份 <text class="required-star">*</text>
            </view>
            <picker :range="yearOptions" @change="(e: any) => birthYear = yearOptions[e.detail.value]" class="custom-picker-trigger">
              <view class="gx-input select-trigger-box">
                <text :class="{ 'placeholder-color': !birthYear }">
                  {{ birthYear ? `${birthYear}年` : '请选择年份' }}
                </text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- 6. Birth Month & Day Picker -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              出生月日 <text class="required-star">*</text>
            </view>
            <view class="flex_row gap_05rem">
              <picker :range="monthOptions" @change="(e: any) => birthMonth = monthOptions[e.detail.value]" class="flex_1 custom-picker-trigger">
                <view class="gx-picker select-trigger-box">
                  <text :class="{ 'placeholder-color': !birthMonth }">
                    {{ birthMonth ? `${birthMonth}月` : '月份' }}
                  </text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
              <picker :range="dayOptions" @change="(e: any) => birthDay = dayOptions[e.detail.value]" class="flex_1 custom-picker-trigger">
                <view class="gx-picker select-trigger-box">
                  <text :class="{ 'placeholder-color': !birthDay }">
                    {{ birthDay ? `${birthDay}日` : '日期' }}
                  </text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 7. Birth Hour Selector -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              出生时辰（选填）
            </view>
            <view class="chips-flex-row hour-chips-grid">
              <GxChip
                v-for="h in BIRTH_HOUR_OPTIONS"
                :key="h"
                :label="h"
                :selected="birthHour === h"
                @toggle="toggleHour(h)"
              />
            </view>
          </view>

          <!-- 8. True Solar Time Checkbox -->
          <view class="form-item">
            <view class="gx-form-label item-label">
              真太阳时校对
            </view>
            <view class="checkbox-row flex_row f_a_center" @tap="useTrueSolarTime = !useTrueSolarTime">
              <view class="custom-checkbox-solar" :class="{ checked: useTrueSolarTime }">
                <text v-if="useTrueSolarTime" class="check-mark">✓</text>
              </view>
              <view class="checkbox-label-desc">
                启用真太阳时校对（勾选后系统将根据您的出生地自动校对时辰）
              </view>
            </view>
          </view>

          <!-- 9. Birth Place Input -->
          <view class="form-item" style="margin-bottom: 0;">
            <view class="gx-form-label item-label">
              出生地 <text class="required-star">*</text>
            </view>
            <input v-model="birthPlace" class="gx-input custom-input" placeholder="如：山东济南">
          </view>
        </GxCard>
      </view>

      <!-- Action Buttons -->
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
  color: #665B4E;
  margin: 32rpx 32rpx 20rpx;
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.88), rgba(252, 245, 233, 0.88));
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  border-left: 6rpx solid #153F33;
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
  color: #153F33;
  margin-bottom: 16rpx;

  .required-star {
    color: #B7654A;
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
  color: #241F19;
  outline: none;
}

.chips-flex-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.hour-chips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;

  :deep(.gx-chip) {
    margin: 0;
    width: 100%;
    padding: 16rpx 8rpx;
    box-sizing: border-box;
    font-size: 24rpx;
    white-space: nowrap;
    text-align: center;
  }
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
  color: #241F19;
  box-sizing: border-box;

  .placeholder-color {
    color: #958878;
  }

  .picker-arrow {
    font-size: 38rpx;
    color: #B9945F;
  }
}

.gx-picker {
  border: 2rpx solid rgba(185, 148, 95, 0.32);
  background: rgba(255, 253, 248, 0.92);
  border-radius: 20rpx;
  height: 96rpx;
  font-size: 28rpx;
  padding: 0 32rpx;
  color: #241F19;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .placeholder-color {
    color: #958878;
  }

  .picker-arrow {
    font-size: 38rpx;
    color: #B9945F;
  }
}

/* Custom Checkbox styles */
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
    border-color: #153F33;
    background-color: #153F33;
  }

  .check-mark {
    color: #FCF5E9;
    font-size: 24rpx;
    font-weight: 700;
  }
}

.checkbox-label-desc {
  font-size: 26rpx;
  color: #665B4E;
  line-height: 1.4;
}

.form-actions {
  margin-top: 16rpx;
  margin-bottom: 40rpx;
}
</style>
