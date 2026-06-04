<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  BIRTH_HOUR_OPTIONS,
  CALENDAR_OPTIONS,
  GENDER_OPTIONS,
  RELATION_OPTIONS,
} from '@/constants/guoxin'
import type { CalendarValue, GenderValue, RelationValue } from '@/constants/guoxin'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import GxNavBar from '@/components/guoxin/GxNavBar.vue'
import GxButton from '@/components/guoxin/GxButton.vue'
import GxChip from '@/components/guoxin/GxChip.vue'

const store = useGuoxinStore()

const name = ref('')
const relation = ref<RelationValue | ''>('')
const gender = ref<GenderValue | ''>('')
const calendarType = ref<CalendarValue>('solar')
const birthYear = ref<number | ''>('')
const birthMonth = ref<number | ''>('')
const birthDay = ref<number | ''>('')
const birthHour = ref('记不清了')
const birthPlace = ref('')

const yearOptions = Array.from({ length: new Date().getFullYear() - 1930 + 1 }, (_, i) => new Date().getFullYear() - i)
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

onMounted(() => store.initSeedData())

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
  }
}

function save(startImmediately: boolean) {
  if (!validate())
    return
  store.createProfile(buildDto())
  if (startImmediately)
    store.navigateToSetup()
  else
    uni.navigateTo({ url: RouterPaths.profileList })
}
</script>

<template>
  <view class="gx-page flex_column">
    <GxNavBar title="创建心语档案" />
    <scroll-view scroll-y class="gx-scroll">
      <view class="gx-text-sub" style="padding: 24rpx 32rpx 8rpx;">
        请填写档案基本信息，信息越完整，解读越准确。
      </view>

      <view style="padding: 0 32rpx 24rpx;">
        <view class="gx-form-label">
          档案名称 *
        </view>
        <input v-model="name" class="gx-input" placeholder="如：妈妈、我自己、老伴儿…">

        <view class="gx-form-label" style="margin-top: 24rpx;">
          与我的关系 *
        </view>
        <view class="flex_row" style="flex-wrap: wrap;">
          <GxChip
            v-for="r in RELATION_OPTIONS"
            :key="r.value"
            :label="r.label"
            :selected="relation === r.value"
            @toggle="toggleRelation(r.value)"
          />
        </view>

        <view class="gx-form-label" style="margin-top: 24rpx;">
          性别 *
        </view>
        <view class="flex_row">
          <GxChip
            v-for="g in GENDER_OPTIONS"
            :key="g.value"
            :label="g.label"
            :selected="gender === g.value"
            @toggle="toggleGender(g.value)"
          />
        </view>

        <view class="gx-form-label" style="margin-top: 24rpx;">
          历法
        </view>
        <view class="flex_row">
          <GxChip
            v-for="c in CALENDAR_OPTIONS"
            :key="c.value"
            :label="c.label"
            :selected="calendarType === c.value"
            @toggle="toggleCalendar(c.value)"
          />
        </view>

        <view class="gx-form-label" style="margin-top: 24rpx;">
          出生年份 *
        </view>
        <picker :range="yearOptions" @change="(e: any) => birthYear = yearOptions[e.detail.value]">
          <view class="gx-input">
            {{ birthYear ? `${birthYear}年` : '请选择年份' }}
          </view>
        </picker>

        <view class="gx-form-label" style="margin-top: 24rpx;">
          出生月日 *
        </view>
        <view class="flex_row gap_05rem">
          <picker :range="monthOptions" @change="(e: any) => birthMonth = monthOptions[e.detail.value]">
            <view class="gx-picker">
              {{ birthMonth ? `${birthMonth}月` : '月份' }}
            </view>
          </picker>
          <picker :range="dayOptions" @change="(e: any) => birthDay = dayOptions[e.detail.value]">
            <view class="gx-picker">
              {{ birthDay ? `${birthDay}日` : '日期' }}
            </view>
          </picker>
        </view>

        <view class="gx-form-label" style="margin-top: 24rpx;">
          出生时辰（选填）
        </view>
        <view class="flex_row" style="flex-wrap: wrap;">
          <GxChip
            v-for="h in BIRTH_HOUR_OPTIONS"
            :key="h"
            :label="h"
            :selected="birthHour === h"
            @toggle="toggleHour(h)"
          />
        </view>

        <view class="gx-form-label" style="margin-top: 24rpx;">
          出生地 *
        </view>
        <input v-model="birthPlace" class="gx-input" placeholder="如：山东济南">
      </view>

      <view class="gx-btn-group">
        <GxButton @click="save(false)">
          保存档案
        </GxButton>
        <GxButton type="secondary" @click="save(true)">
          保存并开始解读
        </GxButton>
      </view>
      <view class="gx-safe-bottom" />
    </scroll-view>
  </view>
</template>
