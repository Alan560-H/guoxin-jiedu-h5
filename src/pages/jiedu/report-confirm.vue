<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import {
  RELATION_OPTIONS,
  REPORT_CONFIRM_DIRECTIONS,
  REPORT_CONFIRM_FOCUS_LABEL,
} from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import { useChatSessionStore } from '@/stores/chatSessionStore'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { formatDualBirthDayDisplay } from '@/utils/guoxin/birthDateTime'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const store = useGuoxinStore()
const chatStore = useChatSessionStore()
const { locking: confirming, runLocked } = useActionLock()
const showBazi = ref(false)

const profile = computed(() => store.activeProfile)

const profileName = computed(() => profile.value?.name || '尚未选择')

const relationLabel = computed(() => {
  const v = profile.value?.relation
  if (!v)
    return ''
  return RELATION_OPTIONS.find(o => o.value === v)?.label || v
})

const birthSummary = computed(() => {
  const p = profile.value
  if (!p)
    return '尚未选择'
  const dual = formatDualBirthDayDisplay(p).replace(/\n/g, ' · ')
  const place = (p.birthPlace || '').trim()
  return place ? `${dual} · ${place}` : dual
})

const objectLabel = computed(() => {
  const name = profileName.value
  const rel = relationLabel.value
  return rel ? `${name}（${rel}）` : name
})

const lastUserQuestion = computed(() => {
  const id = store.activeProfileId
  if (!id)
    return ''
  const msgs = chatStore.getMessages(id)
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'user' && msgs[i].content.trim())
      return msgs[i].content.trim()
  }
  return ''
})

const profileIncomplete = computed(() => {
  const p = profile.value
  if (!p)
    return true
  const nameOk = Boolean(p.name?.trim())
  const birthOk = Boolean((p.birthDaySolar || p.birthDay || '').trim())
  return !nameOk || !birthOk
})

onMounted(() => {
  void bootstrap()
})

onShow(() => {
  void store.ensureCreditsLoaded(false)
})

async function bootstrap() {
  if (!store.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.reLaunch({ url: RouterPaths.home })
    return
  }
  await store.ensureProfilesLoaded()
  if (store.profiles.length === 0) {
    uni.showToast({ title: '请先创建解读用户', icon: 'none' })
    showBazi.value = true
    return
  }
  if (!store.activeProfile) {
    store.setActiveProfile(store.profiles[0].id)
  }
  if (profileIncomplete.value) {
    uni.showToast({ title: '请先完善出生信息', icon: 'none' })
    showBazi.value = true
  }
  await store.ensureCreditsLoaded(true)
}

function onBack() {
  navigateBackOrHome(1, RouterPaths.jieduChat)
}

function onMine() {
  uni.navigateTo({ url: RouterPaths.mine })
}

function onEditBazi() {
  if (!store.activeProfileId && store.profiles.length === 0) {
    showBazi.value = true
    return
  }
  if (!store.activeProfileId) {
    uni.showToast({ title: '请先选择解读用户', icon: 'none' })
    return
  }
  showBazi.value = true
}

function onBaziSuccess() {
  showBazi.value = false
  if (!store.activeProfile && store.profiles.length > 0)
    store.setActiveProfile(store.profiles[0].id)
}

async function onConfirm() {
  await runLocked(async () => {
    if (!store.activeProfile) {
      uni.showToast({ title: '请先创建或选择解读用户', icon: 'none' })
      showBazi.value = true
      return
    }
    if (profileIncomplete.value) {
      uni.showToast({ title: '请先完善出生信息', icon: 'none' })
      showBazi.value = true
      return
    }
    await store.ensureCreditsLoaded(true)
    if (store.totalAvailableCount <= 0) {
      uni.navigateTo({ url: RouterPaths.credits })
      return
    }
    await store.confirmJiedu(
      [...REPORT_CONFIRM_DIRECTIONS],
      lastUserQuestion.value || undefined,
    )
  })
}
</script>

<template>
  <view class="gx-chat-page confirm-page">
    <GxChatHeader
      title="确认生成"
      show-back
      @back="onBack"
      @mine="onMine"
    />

    <scroll-view scroll-y class="confirm-scroll" :show-scrollbar="false">
      <view class="confirm-inner">
        <view class="confirm-card">
          <text class="eyebrow">
            生成前确认
          </text>
          <text class="title">
            八字命理综合报告
          </text>

          <view class="confirm-grid">
            <text class="label">
              解读对象
            </text>
            <text class="value">
              {{ objectLabel }}
            </text>
            <text class="label">
              出生信息
            </text>
            <text class="value">
              {{ birthSummary }}
            </text>
            <text class="label">
              解读重点
            </text>
            <text class="value">
              {{ REPORT_CONFIRM_FOCUS_LABEL }}
            </text>
            <text class="label">
              本次消耗
            </text>
            <text class="value accent">
              1 次报告额度
            </text>
          </view>
        </view>

        <view class="note-card">
          确认后将消耗 1 次报告额度，不影响问答次数。生成失败按服务端规则不扣或返还；成功后可在「我的」查看报告。
        </view>

        <view class="credits-row">
          <text class="credits-label">
            当前报告剩余
          </text>
          <text class="credits-value">
            {{ store.displayCredits }} 次
          </text>
        </view>

        <view class="actions">
          <view
            class="btn primary"
            :class="{ disabled: confirming }"
            @tap="onConfirm"
          >
            {{ confirming ? '提交中…' : '确认生成' }}
          </view>
          <view class="btn secondary" @tap="onEditBazi">
            修改信息
          </view>
        </view>
      </view>
    </scroll-view>

    <GxBaziProfileModal
      :show="showBazi"
      :edit-id="store.activeProfileId"
      @close="showBazi = false"
      @success="onBaziSuccess"
    />
  </view>
</template>

<style scoped lang="scss">
.confirm-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.confirm-scroll {
  flex: 1;
  height: 0;
}

.confirm-inner {
  padding: 32rpx 28rpx 48rpx;
}

.confirm-card {
  padding: 36rpx 32rpx;
  border-radius: var(--gx-chat-radius);
  background: var(--gx-chat-paper);
  border: 2rpx solid var(--gx-chat-border);
  box-shadow: var(--gx-chat-shadow);
}

.eyebrow {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  color: var(--gx-chat-red);
}

.title {
  display: block;
  margin: 12rpx 0 28rpx;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 40rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.confirm-grid {
  display: grid;
  grid-template-columns: 160rpx 1fr;
  gap: 20rpx 16rpx;
  align-items: start;
}

.label {
  font-size: 24rpx;
  color: var(--gx-chat-hint);
  line-height: 1.5;
  padding-top: 4rpx;
}

.value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--gx-chat-ink);
  line-height: 1.55;

  &.accent {
    color: var(--gx-chat-red);
  }
}

.note-card {
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: var(--gx-chat-radius-sm);
  background: var(--gx-chat-paper-warm);
  border: 2rpx solid var(--gx-chat-border);
  font-size: 26rpx;
  line-height: 1.65;
  color: var(--gx-chat-muted);
}

.credits-row {
  margin-top: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
}

.credits-label {
  font-size: 24rpx;
  color: var(--gx-chat-hint);
}

.credits-value {
  font-size: 28rpx;
  font-weight: 800;
  color: var(--gx-chat-brown);
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

  &.disabled {
    opacity: 0.65;
    pointer-events: none;
  }
}
</style>
