<script setup lang="ts">
import type { NameDetailTransformed } from '@/models/xingMingDetail'
import type { XingMingFormData } from '@/models/xingMingForm'
import { computed, onMounted, ref } from 'vue'
import { getPartialAnalysis } from '@/api/xingMing'
import XingMingNameBox from '@/components/xing_ming/XingMingNameBox.vue'
import { buildGetNameInfoPayload } from '@/models/xingMingDetail'
import { RouterPaths } from '@/routerPaths'
import { xingMingStore } from '@/stores/xingMingStore'
import { transformNameDetailResponse } from '@/utils/xingMingDetailTransform'

const _store = xingMingStore()
const detail = ref<NameDetailTransformed | null>(null)
const loadFailed = ref(false)

const firstnameLen = computed(() => String(detail.value?.firstname ?? '').length)

function payloadForm(): XingMingFormData {
  const s = _store.lastSubmit
  if (s && (s.firstName || s.lastName))
    return s
  return {
    firstName: _store.form.firstName,
    lastName: _store.form.lastName,
    sex: _store.form.sex,
    type: _store.form.type,
  }
}

async function loadDetail() {
  const form = payloadForm()
  if (!form.firstName?.trim() && !form.lastName?.trim()) {
    uni.showToast({ title: '请先填写姓名', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: RouterPaths.xingMing })
        },
      })
    }, 1500)
    return
  }
  loadFailed.value = false
  uni.showLoading({ title: '加载中', mask: true })
  try {
    const res = await getPartialAnalysis(buildGetNameInfoPayload(form))
    if (res.code === 200 && res.data) {
      detail.value = transformNameDetailResponse(res.data as Record<string, unknown>)
    }
    else {
      loadFailed.value = true
      uni.showToast({
        title: res.msg || '获取信息失败',
        icon: 'none',
        duration: 2000,
      })
    }
  }
  catch {
    loadFailed.value = true
    uni.showToast({ title: '获取信息失败', icon: 'none', duration: 2000 })
  }
  finally {
    uni.hideLoading()
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <view v-if="detail" class="content">
    <!-- 基础信息（与老 xingming/detail.vue 一致：ziDes → 米字格 jtz + 拼音/繁体/笔画） -->
    <view class="title_box title_box--basic-head">
      <view class="title_line" />
      <view class="title_text title_text--on-gradient">
        基础信息
      </view>
    </view>
    <view class="tips-box tips-box--basic">
      <view class="name_list">
        <XingMingNameBox
          v-for="(item, i) in detail.ziDes"
          :key="`z-${i}`"
          class="name-box-cell"
          :class="{ 'name-box-cell--last': i === detail.ziDes.length - 1 }"
          :text="item.jtz || ''"
        />
        <view class="pinYin pinYin--stripe pinYin--stripe-0">
          <view class="box_title">
            拼音
          </view>
          <view
            v-for="(item, i) in detail.ziDes"
            :key="`py-${i}`"
            class="box_item"
          >
            {{ item.py }}
          </view>
        </view>
        <view class="pinYin pinYin--stripe pinYin--stripe-1">
          <view class="box_title">
            繁体
          </view>
          <view
            v-for="(item, i) in detail.ziDes"
            :key="`zt-${i}`"
            class="box_item"
          >
            {{ item.zi }}
          </view>
        </view>
        <view class="pinYin pinYin--stripe pinYin--stripe-2">
          <view class="box_title">
            笔画
          </view>
          <view
            v-for="(item, i) in detail.ziDes"
            :key="`bh-${i}`"
            class="box_item"
          >
            {{ item.bihua }}
          </view>
        </view>
      </view>
    </view>

    <view class="tips-box tips-box--wuge">
      <view class="title_box title_box--inner">
        <view class="title_line" />
        <view class="title_text">
          五格信息
        </view>
      </view>
      <view class="wuge_list wuge_list--top">
        <view class="outge-wrap">
          <view class="outge">
            <view>外格</view>
            <view>{{ detail.outge }}</view>
          </view>
        </view>
        <!-- 外格左侧长括号：同 liugeDetail 用 img-bottomLine2 独立列 -->
        <view class="wuge-bracket-col">
          <image
            class="wuge-outge-bracket"
            src="/static/name/img-bottomLine2.png"
            mode="aspectFit"
          />
        </view>
        <view class="wuge-main">
          <view class="item_detail item_detail--mt">
            <XingMingNameBox
              v-if="firstnameLen !== 3"
              class="mb-20"
              text=""
            />
            <view class="xing_box">
              <template v-for="(item, i) in detail.xingList" :key="i">
                <XingMingNameBox
                  v-if="item.zi"
                  :text="item.zi"
                  :style="{ marginRight: i === 1 ? '0' : '10rpx' }"
                />
              </template>
              <view
                class="item_wuxing"
                :style="{
                  top: firstnameLen === 3 ? '8rpx' : '-112rpx',
                  left: firstnameLen === 3 ? '196rpx' : '230rpx',
                }"
              >
                <view class="ge_item">
                  天格
                </view>
                <view class="ge_item">
                  {{ detail.tiange }}
                </view>
                <image
                  class="wuge-top-line"
                  src="/static/name/img_topLine.png"
                  mode="aspectFit"
                />
              </view>
            </view>

            <view
              v-for="(child, l) in detail.mingList"
              :key="l"
              class="ming-row"
            >
              <XingMingNameBox class="mt-20" :text="child.zi || ''" />
              <view
                v-if="l < 2"
                class="item_wuxing"
                :class="
                  firstnameLen !== 3
                    ? `item_wuxing${l}`
                    : `item_wuxing${l}san`
                "
              >
                <view class="ge_item">
                  {{ l === 0 ? '人格' : '地格' }}
                </view>
                <view class="ge_item">
                  {{ l === 0 ? detail.renge : detail.dige }}
                </view>
                <image
                  class="wuge-top-line"
                  src="/static/name/img_topLine.png"
                  mode="aspectFit"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="item_bottom">
        <text class="item_bottom-label">
          总格：
        </text>
        <text class="item_bottom-num">
          {{ detail.totalgedes?.num }}
        </text>
      </view>
    </view>
  </view>
  <view v-else-if="loadFailed" class="content content--fail">
    <text class="fail-text">
      未能加载名称赏析详情
    </text>
    <u-button type="primary" class="fail-btn" @click="loadDetail">
      重试
    </u-button>
  </view>
</template>

<style scoped lang="scss">
/** 与 uview-pro 主题 primary、default 布局 u-navbar 一致 */
$xing-ming-detail-page-bg: #d3653c;

.content {
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20rpx 60rpx;
  background: $xing-ming-detail-page-bg;
}

.content--fail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;
  gap: 40rpx;
}

.fail-text {
  font-size: 30rpx;
  color: #fff;
}

.fail-btn {
  width: 280rpx;
}

.tips-box {
  width: 100%;
  max-width: calc(100% - 0rpx);
  background: #fff;
  border-radius: 10rpx;
  padding: 40rpx 0 100rpx;
  margin-top: 40rpx;
  box-sizing: border-box;
}

.tips-box--wuge {
  margin-left: 0;
  margin-top: 40rpx;
  padding-top: 0;
}

.title_box--basic-head {
  margin-left: 20rpx;
  padding-top: 40rpx;
}

.title_text--on-gradient {
  color: #fff;
  font-size: 60rpx;
}

.tips-box--basic {
  margin-top: 24rpx;
  padding: 32rpx 16rpx 40rpx;
}

.name_list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.name-box-cell {
  margin-right: 20rpx;
}

.name-box-cell--last {
  margin-right: 0;
}

.pinYin {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  min-height: 74rpx;
  box-sizing: border-box;
  padding: 8rpx 12rpx;
}

.pinYin--stripe-0 {
  margin-top: 40rpx;
  background: #fff;
}

.pinYin--stripe-1 {
  background: #f6f6f6;
}

.pinYin--stripe-2 {
  background: #fff;
}

.box_title {
  flex-shrink: 0;
  font-size: 30rpx;
  font-weight: bold;
  margin: 0 48rpx 0 32rpx;
  color: #3d3d3d;
}

.box_item {
  flex-shrink: 0;
  font-size: 28rpx;
  font-weight: bold;
  color: #3d3d3d;
  width: 88rpx;
  margin-left: 12rpx;
  text-align: center;
}

.title_box {
  padding-top: 40rpx;
  display: flex;
  align-items: center;
  font-size: 60rpx;
  color: #492310;
}

.title_box--inner {
  padding-left: 20rpx;
}

.title_text {
  font-size: 44rpx;
}

.title_line {
  width: 14rpx;
  height: 46rpx;
  background: #492310;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.wuge_list {
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0 24rpx 30rpx;
  box-sizing: border-box;
}

.wuge_list--top {
  padding-top: 80rpx;
}

.outge-wrap {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outge {
  writing-mode: vertical-rl;
  text-orientation: upright;
  display: flex;
  align-items: center;
  margin-right: 0;
}

.wuge-bracket-col {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  padding: 0 6rpx;
}

.wuge-outge-bracket {
  display: block;
  width: 42rpx;
  height: 100%;
  min-height: 360rpx;
  max-height: 560rpx;
}

.wuge-main {
  position: relative;
  flex: 0 0 auto;
  min-width: 400rpx;
  align-self: stretch;
}

.item_detail {
  position: relative;
  margin-right: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item_detail--mt {
  margin-top: 20rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.mt-20 {
  margin-top: 20rpx;
}

.xing_box {
  display: flex;
  position: relative;
  width: 276rpx;
  justify-content: center;
}

.ming-row {
  position: relative;
}

.item_wuxing {
  position: absolute;
  text-align: center;
  top: -112rpx;
  left: 230rpx;
}

.wuge-top-line {
  display: block;
  transform: rotate(90deg);
  margin-top: 8rpx;
  width: 130rpx;
  height: 42rpx;
}

.ge_item {
  transform: translate(90rpx, 64rpx);
}

.item_wuxing0 {
  top: -70rpx;
  left: 80rpx;
  width: 276rpx;
}

.item_wuxing1 {
  top: -70rpx;
  left: 80rpx;
  width: 276rpx;
}

.item_wuxing0san {
  top: 40rpx;
  left: 118rpx;
}

.item_wuxing1san {
  top: 60rpx;
  left: 118rpx;
}

.item_bottom {
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #dccdbe;
  background-image: url('/static/name/bgc-taiji.png');
  background-size: contain 100%;
  background-position: 105%;
  background-repeat: no-repeat;
  font-size: 48rpx;
  padding: 40rpx 0;
}

.item_bottom-label {
  font-weight: 200;
}

.item_bottom-num {
  font-weight: bold;
  margin-left: 8rpx;
  font-size: 72rpx;
}
</style>
