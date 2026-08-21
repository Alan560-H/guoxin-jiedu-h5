<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import {
  RELATION_OPTIONS,
  REPORT_CONFIRM_FOCUS_DEFAULT,
} from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import { useChatSessionStore } from '@/stores/chatSessionStore'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { formatDualBirthDayDisplay } from '@/utils/guoxin/birthDateTime'
import { openCustomerServiceLink } from '@/utils/guoxin/customerService'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { useActionLock } from '@/utils/guoxin/useActionLock'

const store = useGuoxinStore()
const chatStore = useChatSessionStore()
const { locking: confirming, runLocked } = useActionLock()
const showBazi = ref(false)
/** 解读重点：用户自由输入 */
const focusText = ref(REPORT_CONFIRM_FOCUS_DEFAULT)

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

function onFocusInput(e: { detail?: { value?: string } }) {
  focusText.value = String(e.detail?.value ?? '')
}

/** 自由输入 → directions：整段作为一项，保留用户原文 */
function focusToDirections(text: string): string[] {
  const t = text.trim()
  return t ? [t] : []
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
    const directions = focusToDirections(focusText.value)
    if (directions.length === 0) {
      uni.showToast({ title: '请填写解读重点', icon: 'none' })
      return
    }
    await store.ensureCreditsLoaded(true)
    if (store.totalAvailableCount <= 0) {
      await openCustomerServiceLink()
      return
    }
    await store.confirmJiedu(
      directions,
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
              本次消耗
            </text>
            <text class="value accent">
              1 次报告额度
            </text>
          </view>

          <view class="focus-block">
            <view class="focus-head">
              <text class="focus-title">
                解读重点
              </text>
              <text class="focus-hint">
                可自行修改
              </text>
            </view>
            <textarea
              class="focus-input"
              :value="focusText"
              maxlength="200"
              :auto-height="true"
              placeholder="例如：整体命理、近期状态、事业方向…"
              placeholder-class="focus-placeholder"
              @input="onFocusInput"
            />
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

.focus-block {
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid rgba(236, 205, 187, 0.7);
}

.focus-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.focus-title {
  font-size: 26rpx;
  font-weight: 800;
  color: var(--gx-chat-ink);
}

.focus-hint {
  font-size: 22rpx;
  color: var(--gx-chat-hint);
}

.focus-input {
  width: 100%;
  min-height: 140rpx;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.96);
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  line-height: 1.55;
  font-weight: 600;
}

.focus-placeholder {
  color: var(--gx-chat-hint, #a28777);
  font-weight: 400;
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
