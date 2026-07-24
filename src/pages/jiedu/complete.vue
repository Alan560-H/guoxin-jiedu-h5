<script setup lang="ts">
import type { RecordVo } from '@/models/guoxin/record'
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'

const store = useGuoxinStore()
const reportIdParam = ref('')
const record = ref<RecordVo | null>(null)
const loading = ref(true)

onLoad((query) => {
  if (query?.reportId)
    reportIdParam.value = String(query.reportId)
})

onMounted(async () => {
  store.initSeedData()
  try {
    if (reportIdParam.value) {
      const id = Number(reportIdParam.value)
      if (!Number.isNaN(id)) {
        const detail = await store.loadReportDetail(id)
        if (detail)
          record.value = store.mapServerDetailToRecord(detail)
      }
      if (!record.value && store.activeProfileId) {
        await store.loadReadingRecords(store.activeProfileId)
        const found = store.readingRecords.find((r: { reportId?: number, id?: number }) => String(r.reportId ?? r.id) === reportIdParam.value)
        if (found)
          record.value = store.mapServerReportToRecord(found)
      }
    }
    if (record.value?.profileId)
      store.setActiveProfile(record.value.profileId)
  }
  finally {
    loading.value = false
  }
})

function goDetail() {
  if (!record.value)
    return
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${record.value.id}` })
}

function goMine() {
  uni.redirectTo({ url: RouterPaths.mine })
}

function goChat() {
  if (store.activeProfileId)
    uni.reLaunch({ url: RouterPaths.jieduChat })
  else
    uni.reLaunch({ url: RouterPaths.home })
}

function goHome() {
  uni.reLaunch({ url: RouterPaths.home })
}

function onBack() {
  goChat()
}
</script>

<template>
  <view class="gx-chat-page complete-page">
    <GxChatHeader
      title="解读已完成"
      show-back
      @back="onBack"
      @mine="goMine"
    />

    <scroll-view scroll-y class="complete-scroll" :show-scrollbar="false">
      <view class="complete-inner">
        <view v-if="loading" class="empty-hint">
          加载中...
        </view>

        <template v-else-if="record">
          <view class="complete-banner">
            <view class="success-mark">
              ✓
            </view>
            <text class="banner-title">
              本次专属解读已整理完成
            </text>
            <text class="banner-subtitle">
              报告已保存，可在「我的」随时查看完整内容。
            </text>
          </view>

          <view class="content-card">
            <text class="section-label">
              解读报告包含以下内容：
            </text>
            <view class="checklist-items">
              <view
                v-for="(sec, idx) in record.content || []"
                :key="sec.title"
                class="checklist-row"
              >
                <view class="bullet-dot">
                  <text class="dot-num">
                    {{ idx + 1 }}
                  </text>
                </view>
                <text class="checklist-title">
                  {{ sec.title.replace(/^[^、]+、/, '') }}
                </text>
              </view>
            </view>
          </view>

          <view class="actions">
            <view class="btn primary" @tap="goDetail">
              查看完整解读
            </view>
            <view class="btn secondary" @tap="goChat">
              返回问答
            </view>
            <view class="btn outline" @tap="goMine">
              我的报告
            </view>
          </view>
        </template>

        <view v-else class="empty-block">
          <text class="empty-hint">
            未找到本次解读记录，您可以返回问答或首页。
          </text>
          <view class="actions">
            <view class="btn primary" @tap="goChat">
              返回问答
            </view>
            <view class="btn secondary" @tap="goHome">
              返回首页
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.complete-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.complete-scroll {
  flex: 1;
  height: 0;
}

.complete-inner {
  padding: 24rpx 28rpx 48rpx;
}

.complete-banner {
  padding: 48rpx 36rpx;
  border-radius: var(--gx-chat-radius);
  text-align: center;
  color: #fffdf7;
  background:
    radial-gradient(circle at 88% 14%, rgba(213, 164, 61, 0.45), transparent 32%),
    linear-gradient(150deg, var(--gx-chat-red), var(--gx-chat-red-deep));
  box-shadow: var(--gx-chat-shadow);
}

.success-mark {
  width: 72rpx;
  height: 72rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  background: rgba(255, 253, 247, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 800;
}

.banner-title {
  display: block;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
}

.banner-subtitle {
  display: block;
  font-size: 24rpx;
  line-height: 1.65;
  opacity: 0.9;
}

.content-card {
  margin-top: 24rpx;
  padding: 32rpx 28rpx;
  border-radius: var(--gx-chat-radius);
  background: var(--gx-chat-paper);
  border: 2rpx solid var(--gx-chat-border);
  box-shadow: var(--gx-chat-shadow);
}

.section-label {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--gx-chat-ink);
  margin-bottom: 20rpx;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checklist-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.bullet-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--gx-chat-red-soft);
  border: 2rpx solid var(--gx-chat-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dot-num {
  font-size: 22rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
}

.checklist-title {
  font-size: 28rpx;
  color: var(--gx-chat-ink);
  font-weight: 600;
}

.actions {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.btn {
  padding: 28rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 800;

  &.primary {
    background: linear-gradient(135deg, var(--gx-chat-red), var(--gx-chat-red-deep));
    color: #fffdf7;
  }

  &.secondary {
    background: var(--gx-chat-paper);
    border: 2rpx solid var(--gx-chat-border);
    color: var(--gx-chat-brown);
  }

  &.outline {
    background: transparent;
    border: 2rpx solid var(--gx-chat-border);
    color: var(--gx-chat-muted);
  }
}

.empty-block,
.empty-hint {
  padding: 48rpx 16rpx;
  text-align: center;
  font-size: 28rpx;
  color: var(--gx-chat-muted);
  line-height: 1.6;
}
</style>
