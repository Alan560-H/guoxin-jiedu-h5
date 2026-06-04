<script setup lang="ts">
import type { NameDetailLiuGeTransformed } from '@/models/xingMingDetail'
import type { XingMingFormData } from '@/models/xingMingForm'
import { computed, onMounted, ref } from 'vue'
import { getPartialAnalysis } from '@/api/xingMing'
import XingMingNameBox from '@/components/xing_ming/XingMingNameBox.vue'
import { buildGetNameInfoPayload } from '@/models/xingMingDetail'
import { RouterPaths } from '@/routerPaths'
import { xingMingStore } from '@/stores/xingMingStore'
import { transformNameDetailResponseLiuGe } from '@/utils/xingMingDetailTransform'
import { getWuxingDisplay } from '@/utils/xingMingWxDisplay'

const _store = xingMingStore()
const detail = ref<NameDetailLiuGeTransformed | null>(null)
const loadFailed = ref(false)

const lastnameLen = computed(() => String(detail.value?.lastname ?? '').length)
const firstnameLen = computed(() => String(detail.value?.firstname ?? '').length)
const sancaiHtml = computed(() => String(detail.value?.sancai?.sancaiLiuResult ?? ''))

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

function wxStyle(wx?: string) {
  return getWuxingDisplay(wx)
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
    const res = await getPartialAnalysis(buildGetNameInfoPayload({ ...form, type: 1 }))
    if (res.code === 200 && res.data) {
      detail.value = transformNameDetailResponseLiuGe(res.data as Record<string, unknown>)
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
        <view class="pinYin pinYin--stripe pinYin--stripe-3">
          <view class="box_title">
            五行
          </view>
          <view
            v-for="(item, i) in detail.ziDes"
            :key="`wx-${i}`"
            class="box_item"
          >
            {{ item.wx }}
          </view>
        </view>
      </view>
    </view>

    <view class="tips-box tips-box--liuge">
      <view class="title_box title_box--inner">
        <view class="title_line" />
        <view class="title_text">
          六格信息
        </view>
      </view>
      <view class="liuge_list">
        <view class="liuge-col liuge-col--outge">
          <view class="ge-info">
            <view>外格</view>
            <view class="ge-info-wuxing">
              <view>{{ detail.outge }}</view>
              <view class="ge-info-wuxing-tips">
                <text :style="{ color: wxStyle(detail.outgewx).color }">
                  {{ detail.outgewx }}
                </text>
                <image
                  v-if="wxStyle(detail.outgewx).img"
                  class="wx-img"
                  :src="wxStyle(detail.outgewx).img"
                  mode="aspectFit"
                />
              </view>
            </view>
            <view>{{ detail.outgejx }}</view>
          </view>
        </view>
        <view class="liuge-col liuge-col--bracket">
          <image
            class="ge-left-line"
            src="/static/name/img-bottomLine2.png"
            mode="aspectFit"
          />
        </view>
        <view class="liuge-col liuge-col--names">
          <template v-if="lastnameLen === 1">
            <XingMingNameBox class="name-box-item" text="" />
            <XingMingNameBox
              class="name-box-item"
              :text="detail.xingList[0]?.zi || ''"
            />
          </template>
          <template v-else>
            <XingMingNameBox
              class="name-box-item"
              :text="detail.xingList[0]?.zi || ''"
            />
            <XingMingNameBox
              class="name-box-item"
              :text="detail.xingList[1]?.zi || ''"
            />
          </template>
          <XingMingNameBox
            class="name-box-item"
            :text="detail.mingList[0]?.zi || ''"
          />
          <XingMingNameBox
            v-if="firstnameLen === 2"
            class="name-box-item"
            :text="detail.mingList[1]?.zi || ''"
          />
          <XingMingNameBox
            v-else
            class="name-box-item"
            text=""
          />
        </view>
        <view class="liuge-col liuge-col--ges">
          <view class="ge-right">
            <image
              class="ge-right-img"
              src="/static/name/img_topLine2.png"
              mode="aspectFit"
            />
            <view class="ge-info">
              <view>天格</view>
              <view class="ge-info-wuxing">
                <view>{{ detail.tiange }}</view>
                <view class="ge-info-wuxing-tips">
                  <text :style="{ color: wxStyle(detail.tiangewx).color }">
                    {{ detail.tiangewx }}
                  </text>
                  <image
                    v-if="wxStyle(detail.tiangewx).img"
                    class="wx-img"
                    :src="wxStyle(detail.tiangewx).img"
                    mode="aspectFit"
                  />
                </view>
              </view>
              <view>{{ detail.tiangejx }}</view>
            </view>
          </view>
          <view class="ge-right">
            <image
              class="ge-right-img"
              src="/static/name/img_topLine2.png"
              mode="aspectFit"
            />
            <view class="ge-info">
              <view>人格</view>
              <view class="ge-info-wuxing">
                <view>{{ detail.renge }}</view>
                <view class="ge-info-wuxing-tips">
                  <text :style="{ color: wxStyle(detail.rengewx).color }">
                    {{ detail.rengewx }}
                  </text>
                  <image
                    v-if="wxStyle(detail.rengewx).img"
                    class="wx-img"
                    :src="wxStyle(detail.rengewx).img"
                    mode="aspectFit"
                  />
                </view>
              </view>
              <view>{{ detail.rengejx }}</view>
            </view>
          </view>
          <view class="ge-right">
            <image
              class="ge-right-img"
              src="/static/name/img_topLine2.png"
              mode="aspectFit"
            />
            <view class="ge-info">
              <view>地格</view>
              <view class="ge-info-wuxing">
                <view>{{ detail.dige }}</view>
                <view class="ge-info-wuxing-tips">
                  <text :style="{ color: wxStyle(detail.digewx).color }">
                    {{ detail.digewx }}
                  </text>
                  <image
                    v-if="wxStyle(detail.digewx).img"
                    class="wx-img"
                    :src="wxStyle(detail.digewx).img"
                    mode="aspectFit"
                  />
                </view>
              </view>
              <view>{{ detail.digejx }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="item_bottom">
        <view class="bottom-item">
          <text class="bottom-label">
            总格：
          </text>
          <text class="bottom-num">
            {{ detail.totalgedes?.num }}
          </text>
          <view
            class="bottom_shuxing"
            :style="{ color: wxStyle(detail.totalgewx).color }"
          >
            {{ detail.totalgewx }}
          </view>
          <view class="ge-info-wuxing-tips">
            {{ detail.totalgejx }}
          </view>
        </view>
        <view class="bottom-item">
          <text class="bottom-label">
            变格：
          </text>
          <text class="bottom-num">
            {{ detail.biange }}
          </text>
          <view class="ge-info-wuxing-tips">
            {{ detail.biangejx }}
          </view>
        </view>
      </view>
    </view>

    <view class="name_analysis">
      <view class="title_box title_box--sancai-head">
        <view class="title_line title_line--light" />
        <view class="title_text title_text--on-gradient title_text--sancai">
          三才配置
        </view>
      </view>
      <view class="name_num">
        <image
          class="img_bagua"
          src="/static/name/bgc-bagua.png"
          mode="aspectFit"
        />
        <view class="num_left">
          <view class="num_title">
            {{ detail.sancai?.title }}
          </view>
          <view class="num_title">
            {{ detail.sancai?.sancaiLiuJx }}
          </view>
        </view>
      </view>
      <view class="tips-box tips-box--sancai">
        <view class="title_box title_box--inner">
          <view class="title_line" />
          <view class="title_text">
            三才配置基础解读
          </view>
        </view>
        <rich-text
          v-if="sancaiHtml"
          class="name_explain"
          :nodes="sancaiHtml"
        />
        <view class="name_explain name_explain--note">
          (备注：三才配置仅为基础吉凶判断，并非姓名好坏，还要结合六格数理吉凶与个人子平综合判断）
        </view>
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
  background: #fff;
  border-radius: 10rpx;
  padding: 40rpx 0 100rpx;
  margin-top: 40rpx;
  box-sizing: border-box;
}

.tips-box--basic {
  margin-top: 24rpx;
  padding: 32rpx 16rpx 40rpx;
}

.tips-box--liuge {
  padding-top: 0;
}

.tips-box--sancai {
  margin-top: 0;
  padding-top: 0;
}

.title_box {
  padding-top: 40rpx;
  display: flex;
  align-items: center;
  color: #492310;
}

.title_box--basic-head {
  margin-left: 20rpx;
  padding-top: 40rpx;
}

.title_box--inner {
  padding-left: 20rpx;
}

.title_box--sancai-head {
  padding-bottom: 60rpx;
  margin-left: 20rpx;
}

.title_text--on-gradient {
  color: #fff;
  font-size: 60rpx;
}

.title_text--sancai {
  font-size: 60rpx;
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

.title_line--light {
  background: #fff;
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

.pinYin--stripe-1,
.pinYin--stripe-3 {
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

.liuge_list {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 80rpx 16rpx 24rpx;
  box-sizing: border-box;
}

.liuge-col--outge {
  flex-shrink: 0;
}

.liuge-col--bracket {
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
}

.ge-left-line {
  width: 42rpx;
  height: 100%;
  min-height: 360rpx;
  max-height: 520rpx;
}

.liuge-col--names {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.name-box-item {
  margin: 0 40rpx 20rpx;
}

.liuge-col--ges {
  flex-shrink: 0;
}

.ge-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20rpx 10rpx;
  font-size: 26rpx;
  color: #333;
}

.ge-info-wuxing,
.ge-info-wuxing-tips {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.ge-info-wuxing-tips {
  margin-left: 8rpx;
}

.wx-img {
  width: 30rpx;
  height: 20rpx;
  margin-left: 4rpx;
}

.ge-right {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.ge-right-img {
  height: 130rpx;
  width: 42rpx;
  flex-shrink: 0;
}

.item_bottom {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
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

.bottom-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 20rpx 0;
  flex-wrap: wrap;
  justify-content: center;
}

.bottom-label {
  font-weight: 200;
}

.bottom-num {
  font-weight: bold;
  margin-left: 8rpx;
  font-size: 72rpx;
}

.bottom_shuxing {
  background: #fff;
  border-radius: 4rpx;
  padding: 4rpx 8rpx;
  margin-left: 8rpx;
  font-size: 28rpx;
}

.name_analysis {
  width: 100%;
  margin-top: 24rpx;
}

.name_num {
  display: flex;
  background-color: #fff;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 60rpx 0;
  border-radius: 10rpx;
  overflow: hidden;
}

.img_bagua {
  position: absolute;
  left: 310rpx;
  top: -180rpx;
  width: 640rpx;
  height: 600rpx;
  opacity: 1;
  transform: scale(1.3);
}

.num_left {
  display: flex;
  flex-direction: row;
  margin-left: 20rpx;
  color: #3d3d3d;
  z-index: 1;
}

.num_title {
  font-size: 44rpx;
  color: #492310;
  margin-right: 16rpx;
}

.name_explain {
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-top: 28rpx;
  color: #000;
  margin-bottom: 40rpx;
}

.name_explain--note {
  color: #666;
  font-size: 26rpx;
}
</style>
