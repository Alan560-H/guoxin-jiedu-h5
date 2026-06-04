<script setup lang="ts">
import type { MeiHuaAboutPalace } from '@/utils/meihua/aboutGuaList'
import { ref } from 'vue'
import { RouterPaths } from '@/routerPaths'
import { MEI_HUA_ABOUT_GUA_LIST } from '@/utils/meihua/aboutGuaList'

interface Row extends MeiHuaAboutPalace {
  open: boolean
}

const list = ref<Row[]>(
  MEI_HUA_ABOUT_GUA_LIST.map(p => ({ ...p, open: false })),
)

function kindToggle(id: string) {
  list.value = list.value.map(p => ({
    ...p,
    open: p.id === id ? !p.open : false,
  }))
}

function openExplain(guapath: string) {
  uni.navigateTo({
    url: `${RouterPaths.meiHuaAboutExplain}?guapath=${encodeURIComponent(guapath)}`,
  })
}
</script>

<template>
  <view class="content">
    <view class="content-main about-scroll">
      <view class="about-inner">
        <view class="kind-list">
          <view
            v-for="item in list"
            :key="item.id"
            class="kind-list-item"
          >
            <view
              class="kind-list-item-hd"
              :class="{ 'kind-list-item-hd-show': item.open }"
              @click="kindToggle(item.id)"
            >
              <view class="kind-list-text">
                {{ item.name }}
              </view>
              <image
                class="kind-list-img"
                :src="`/static/gua/${item.id}.png`"
                mode="aspectFit"
              />
            </view>
            <view
              class="kind-list-item-bd"
              :class="{ 'kind-list-item-bd-show': item.open }"
            >
              <view
                class="navigator-box"
                :class="{ 'navigator-box-show': item.open }"
              >
                <view
                  v-for="(page, pid) in item.pages"
                  :key="pid"
                  class="navigator"
                  @click="openExplain(page.guapath)"
                >
                  <view class="navigator-item">
                    <view class="navigator-text">
                      {{ page.zh }}
                    </view>
                    <view class="navigator-icons">
                      <image
                        class="navigator-gua"
                        :src="`/static/meihua/gua/${page.guapath}.png`"
                        mode="aspectFit"
                      />
                      <image
                        class="navigator-arrow"
                        src="/static/gua/arrow_l.png"
                        mode="aspectFit"
                      />
                    </view>
                  </view>
                </view>
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
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #f3f4f6;
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

.about-scroll {
  padding: 0 24rpx;
}

.about-inner {
  width: 100%;
  max-width: 640rpx;
  margin: 0 auto;
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: auto;
}

.kind-list-item {
  margin: 20rpx 0;
  background-color: #d3653c;
  border-radius: 10rpx;
  overflow: hidden;
}

.kind-list-text {
  color: #fff;
  font-size: 36rpx;
  flex: 1;
}

.kind-list-img {
  width: 50rpx;
  height: 37rpx;
}

.kind-list-item-hd {
  padding: 18rpx 48rpx;
  display: flex;
  align-items: center;
  transition: opacity 0.3s;
}

.kind-list-item-hd-show {
  opacity: 0.85;
}

.kind-list-item-bd {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.kind-list-item-bd-show {
  max-height: 2000rpx;
}

.navigator-box {
  opacity: 0;
  transform: translateY(-12rpx);
  transition:
    opacity 0.3s,
    transform 0.3s;
  background-color: #fff;
  font-size: 30rpx;
  padding: 8rpx 0 20rpx;
}

.navigator-box-show {
  opacity: 1;
  transform: translateY(0);
}

.navigator {
  box-sizing: border-box;
  padding: 12rpx 24rpx 0;
}

.navigator-item {
  box-sizing: border-box;
  min-height: 66rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10rpx;
  border: solid 3rpx #d3653c;
}

.navigator + .navigator .navigator-item {
  margin-top: 12rpx;
}

.navigator-text {
  color: #d3653c;
  font-size: 30rpx;
}

.navigator-icons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.navigator-gua {
  height: 40rpx;
  width: 40rpx;
}

.navigator-arrow {
  height: 37rpx;
  width: 39rpx;
  margin-left: 16rpx;
}
</style>
