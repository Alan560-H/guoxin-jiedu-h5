<script setup lang="ts">
import type { XingMingFormData, XingMingPaiPanType } from '@/models/xingMingForm'
import { ref } from 'vue'
import { RouterPaths } from '@/routerPaths'
import { xingMingStore } from '@/stores/xingMingStore'

interface TypeRadioItem {
  name: string
  value: XingMingPaiPanType
}

const _store = xingMingStore()
const uToastRef = ref()

const typeList = ref<TypeRadioItem[]>([
  { name: '三才五格', value: 0 },
  { name: '三才六格', value: 1 },
])

function chooseType(item: TypeRadioItem) {
  _store.form.type = item.value
}

/** 与老项目 xingming.vue queryStart 校验一致 */
function validateForm(form: XingMingFormData): string | null {
  const { firstName, lastName, type } = form
  if (firstName === '' || lastName === '') {
    return '姓名不能为空'
  }
  if (firstName.length > 2 || lastName.length > 3) {
    return '姓名长度超过限制'
  }
  if (firstName.length === 2 && lastName.length >= 3) {
    return '姓名长度超过限制'
  }
  if (type === 1 && lastName.length >= 3) {
    return '三才六格流派名长度不能超过2'
  }
  return null
}

function submit() {
  const err = validateForm(_store.form)
  if (err) {
    uToastRef.value?.show({
      position: 'top',
      title: err,
      type: 'error',
    })
    return
  }
  _store.setLastSubmitFromForm()
  if (_store.form.type === 1) {
    uni.navigateTo({ url: RouterPaths.xingMingLiuGeDetail })
    return
  }
  uni.navigateTo({ url: RouterPaths.xingMingDetail })
}
</script>

<template>
  <view p-3>
    <u-form :model="_store.form">
      <u-form-item :border-bottom="false" label="您的姓" prop="firstName" label-position="top">
        <view class="fill_width common_input_border com_input com_input--trail">
          <u-input v-model="_store.form.firstName" maxlength="2" placeholder="请输入您的姓" />
          <view class="com_icon">
            <u-icon name="account" color="#999999" size="36" />
          </view>
        </view>
      </u-form-item>
      <u-form-item :border-bottom="false" label="您的名" prop="lastName" label-position="top">
        <view class="fill_width common_input_border com_input com_input--trail">
          <u-input v-model="_store.form.lastName" maxlength="3" placeholder="请输入您的名" />
          <view class="com_icon">
            <u-icon name="account" color="#999999" size="36" />
          </view>
        </view>
      </u-form-item>
      <u-form-item :border-bottom="false" label="性别" prop="sex" label-position="top">
        <view class="fill_width flex_column gap_05rem">
          <view class="flex_row gap_1rem fill_width">
            <view
              class=" flex_1 f_center default" :class="_store.form.sex === 1 ? 'active' : ''"
              @tap.stop="_store.form.sex = 1"
            >
              男
            </view>
            <view
              class=" flex_1 f_center default" :class="_store.form.sex === 0 ? 'active' : ''"
              @tap.stop="_store.form.sex = 0"
            >
              女
            </view>
          </view>
        </view>
      </u-form-item>
      <u-form-item :border-bottom="false" label="流派" prop="type" label-position="top">
        <view class="flex_column fill_width gap_05rem">
          <view class="flex_row gap_1rem fill_width">
            <view
              v-for="(item, index) in typeList"
              :key="index"
              class=" flex_1 f_center default"
              :class="_store.form.type === item.value ? 'active' : ''"
              @tap.stop="chooseType(item)"
            >
              {{ item.name }}
            </view>
          </view>
        </view>
      </u-form-item>
      <u-form-item :border-bottom="false">
        <view class="fill_width">
          <u-button type="primary" @click="submit">
            开始排盘
          </u-button>
        </view>
      </u-form-item>
    </u-form>
    <u-toast ref="uToastRef" />
  </view>
</template>

<style lang="scss">
.default {
  border: 2rpx solid #666666;
  background: #fff;
  border-radius: 10rpx;
  height: 80rpx;
  color: #999999;
}

.active {
  border: 2rpx solid #D3653C;
  background: #FFD7C7;
  color: #DD6B18;
}
</style>
