<script setup lang="ts">
import { onMounted } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { openCustomerService } from '@/utils/guoxin/customerService'

const store = useGuoxinStore()

/** 对齐设计稿：会员优势对比表 */
const comparisonRows = [
  { item: '日常八字问答', free: '每日限 3 次', vip: '7×24 无限次，不限频次' },
  { item: '深度八字报告', free: '无', vip: '私人定制专属报告' },
  { item: '八字用户管理', free: '仅自己 1 位', vip: '支持多人八字切换解读' },
  { item: '邀请填写八字', free: '不支持', vip: '好友登录填写并授权' },
  { item: '多维八字解读', free: '仅基础内容', vip: '全盘梳理多维度深度解读' },
  { item: '报告内容留存', free: '无', vip: '完整内容永久保存可回看' },
  { item: '专属国学搭子', free: '无', vip: '全程陪伴，随时沟通' },
  { item: '反复追问沟通', free: '受限制', vip: '支持反复追问持续沟通' },
  { item: '日常难题实时解惑', free: '基础回复', vip: '深度解答，帮你捋清思路' },
]

onMounted(() => {
  if (!store.isLoggedIn)
    uni.reLaunch({ url: RouterPaths.home })
})

function onBack() {
  navigateBackOrHome()
}

function onContactService() {
  openCustomerService()
}
</script>

<template>
  <view class="gx-chat-page member-page">
    <GxChatHeader
      title="会员详情"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="member-scroll" :show-scrollbar="false">
      <view class="sheet">
        <!-- 红色英雄区 -->
        <view class="hero">
          <view class="seal">
            <text class="seal-text">
              享
            </text>
          </view>
          <text class="eyebrow">
            国心解读会员
          </text>
          <text class="hero-title">
            会员优势对比
          </text>
          <text class="hero-sub">
            开通后立即解锁完整权益
          </text>
        </view>

        <!-- 对比表 -->
        <view class="table-card">
          <view class="cmp-row cmp-head">
            <text class="col-item">
              权益项目
            </text>
            <text class="col-free">
              免费用户
            </text>
            <text class="col-vip">
              会员用户
            </text>
          </view>
          <view
            v-for="row in comparisonRows"
            :key="row.item"
            class="cmp-row"
          >
            <text class="col-item">
              {{ row.item }}
            </text>
            <text class="col-free">
              {{ row.free }}
            </text>
            <view class="col-vip">
              <view class="check">
                <text class="check-mark">
                  ✓
                </text>
              </view>
              <text class="vip-text">
                {{ row.vip }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-block">
        <view class="tip-bar">
          <text class="tip-text">
            年度会员更划算：平均成本更低，权益更全
          </text>
        </view>

        <view class="cta-btn" @tap="onContactService">
          <text class="cta-main">
            联系客服开通
          </text>
          <text class="cta-sub">
            新人首单 · 月度 · 季度 · 年度
          </text>
        </view>

        <text class="footnote">
          专属客服协助确认套餐、付款方式与权益到账
        </text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.member-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background:
    radial-gradient(circle at 12% 8%, rgba(255, 214, 196, 0.55), transparent 28%),
    linear-gradient(180deg, #f8e8e4 0%, #f6ebe4 48%, #f4e7df 100%);
}

.member-scroll {
  flex: 1;
  height: 0;
}

.sheet {
  margin: 40rpx 28rpx 0;
  border-radius: 28rpx;
  overflow: hidden;
  background: #fffdf9;
  box-shadow: 0 12rpx 32rpx rgba(127, 31, 38, 0.12);
}

.hero {
  position: relative;
  padding: 48rpx 28rpx 40rpx;
  text-align: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 190, 120, 0.3), transparent 42%),
    radial-gradient(circle at 85% 30%, rgba(255, 220, 160, 0.16), transparent 28%),
    linear-gradient(165deg, #c9484a 0%, #a52f33 48%, #7f1f26 100%);
}

.seal {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f6d98a 0%, #e2b24a 45%, #c9962e 100%);
  box-shadow:
    0 0 0 8rpx rgba(246, 217, 138, 0.28),
    0 10rpx 24rpx rgba(70, 20, 20, 0.28);
}

.seal-text {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 44rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1;
  text-shadow: 0 2rpx 4rpx rgba(120, 60, 10, 0.25);
}

.eyebrow {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 253, 247, 0.82);
  font-weight: 700;
  letter-spacing: 2rpx;
}

.hero-title {
  display: block;
  margin: 12rpx 0 10rpx;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 52rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1.2;
}

.hero-sub {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 253, 247, 0.78);
}

.table-card {
  background: #fffdf9;
}

.cmp-row {
  display: flex;
  align-items: stretch;
  min-height: 88rpx;
  border-bottom: 1rpx solid rgba(220, 190, 175, 0.55);

  &:last-child {
    border-bottom: none;
  }
}

.cmp-head {
  min-height: 72rpx;
  background: #8f2428;
}

.col-item,
.col-free,
.col-vip {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 18rpx 10rpx;
  font-size: 22rpx;
  line-height: 1.4;
}

.col-item {
  width: 26%;
  justify-content: center;
  text-align: center;
  font-weight: 700;
  color: #5a3a2e;
  background: #fffaf4;
}

.col-free {
  width: 28%;
  justify-content: center;
  text-align: center;
  color: #a89080;
  background: #fffdf9;
}

.col-vip {
  width: 46%;
  gap: 8rpx;
  padding-left: 14rpx;
  padding-right: 14rpx;
  color: #8a4a20;
  font-weight: 700;
  background: #fff3e0;
}

.cmp-head .col-item,
.cmp-head .col-free,
.cmp-head .col-vip {
  justify-content: center;
  text-align: center;
  color: #fffdf7;
  font-weight: 800;
  font-size: 24rpx;
  background: transparent;
}

.check {
  flex-shrink: 0;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #f0c15a, #d5a43d);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  font-size: 18rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1;
}

.vip-text {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  line-height: 1.4;
  color: #8a4a20;
  font-weight: 700;
}

.bottom-block {
  padding: 36rpx 40rpx 16rpx;
}

.tip-bar {
  padding: 18rpx 24rpx;
  border-radius: 999rpx;
  background: #f8e6d4;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #9a673a;
  font-weight: 700;
  line-height: 1.4;
}

.cta-btn {
  margin-top: 28rpx;
  padding: 26rpx 36rpx;
  border-radius: 999rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12rpx 20rpx;
  background: linear-gradient(135deg, #c9484a, #b43a3d 40%, #7f1f26);
  box-shadow: 0 12rpx 28rpx rgba(127, 31, 38, 0.28);
}

.cta-main {
  font-size: 34rpx;
  font-weight: 800;
  color: #fffdf7;
  line-height: 1.2;
}

.cta-sub {
  font-size: 22rpx;
  color: rgba(255, 253, 247, 0.88);
  line-height: 1.3;
}

.footnote {
  display: block;
  margin-top: 20rpx;
  text-align: center;
  font-size: 22rpx;
  color: #b09a8c;
  line-height: 1.5;
}

.safe-bottom {
  height: calc(32rpx + env(safe-area-inset-bottom));
}
</style>
