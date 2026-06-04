<script setup lang="ts">
import type { TabVo, TabVos } from '@/models/customTabVo'
import { ref } from 'vue'
import SketTtimer from '@/components/sket_t_timer/SketTTimer'
import { RouterPaths } from '@/routerPaths'

//
defineOptions({
  layout: 'default',
  style: {
    navigationBarTitleText: '易朴工具箱',
  },
})
const menus = ref<TabVos>([
  { iconPath: '/static/home/shengPingZiShi.png', title: '干支排盘', id: 0, routePath: RouterPaths.shengPing, limitTo: false },
  { iconPath: '/static/home/xingXiangXue.png', title: '名称赏析', id: 1, routePath: RouterPaths.xingMing, limitTo: false },
  { iconPath: '/static/home/meiHuaXue.png', title: '梅花学', id: 2, routePath: RouterPaths.meiHua, limitTo: false },
  { iconPath: '/static/home/yangPanJueCe.png', title: '遁甲学', id: 3, routePath: RouterPaths.yangPan, limitTo: false },
  { iconPath: '/static/home/yinPanJueCe.png', title: '阴盘决策', id: 4, routePath: '/pages/yinPan/yinPan', limitTo: true },
  { iconPath: '/static/home/luoJiXue.png', title: '逻辑学', id: 5, routePath: '/pages/luoJi/luoJi', limitTo: true },
])
function goRouter(tab: TabVo) {
  if (tab.limitTo) {
    uni.showToast({
      title: `暂未开放${tab.title}`,
    })
    return
  };
  uni.$u.route({
    url: tab.routePath,
  })
}
</script>

<template>
  <view p-3 text-center class="flex_column gap_1rem">
    <SketTtimer />
    <!-- 菜单 -->
    <view class="menu_grid gap_1rem f_j_center f_a_center">
      <view v-for="menu in menus" :key="menu.id" class="f_center" @tap.stop="goRouter(menu)">
        <view class="menu_grid_item f_center flex_column gap_05rem">
          <image h-20 w-20 :src="menu.iconPath" />
          <view class="u-font-lg">
            {{ menu.title }}
          </view>
        </view>
      </view>
    </view>
    <!-- 分割线 -->
    <u-divider>长辈关怀版</u-divider>
  </view>
</template>

<style lang="scss">
.menu_grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  .menu_grid_item {
    border-radius: 10px;
    border: 1px solid #666666;
    width: 320rpx;
    height: 320rpx;
    font-size: 28rpx;
    font-weight: 600;
  }
}
</style>
