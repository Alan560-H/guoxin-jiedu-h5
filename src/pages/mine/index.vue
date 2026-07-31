<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLoginModal from '@/components/guoxin/chat/GxChatLoginModal.vue'
import GxCustomerServiceModal from '@/components/guoxin/GxCustomerServiceModal.vue'
import { CHAT_CREDITS_LOCAL_FALLBACK, CHAT_PENDING_QUESTION_KEY, DAILY_QUESTION_LIMIT } from '@/constants/chatHome'
import { RouterPaths } from '@/routerPaths'
import { useChatSessionStore } from '@/stores/chatSessionStore'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { userInfoStore } from '@/stores/userInfoStore'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'
import { isShowPayEnabled } from '@/utils/guoxin/showPay'

const store = useGuoxinStore()
const chatStore = useChatSessionStore()

const showLogin = ref(false)
const showService = ref(false)
const loadingReports = ref(false)
/** isShowPay=1 显示「我的报告」区块 */
const showReportsSection = computed(() => isShowPayEnabled())

const isLoggedIn = computed(() => store.isLoggedIn)
const nickname = computed(() => {
  if (!isLoggedIn.value)
    return '未登录用户'
  return store.nickname || maskMobile(store.mobile) || '国心用户'
})
const avatarChar = computed(() => {
  if (!isLoggedIn.value)
    return '游'
  const n = nickname.value.trim()
  return n ? n.slice(0, 1) : '我'
})
const profileCopy = computed(() =>
  isLoggedIn.value
    ? '已保存昵称、问答记录和报告'
    : '登录后保存昵称、问答记录和报告',
)
const profileAction = computed(() => (isLoggedIn.value ? '已登录' : '登录'))
const reportListCopy = computed(() =>
  isLoggedIn.value
    ? '查看已生成、生成中和失败返还的报告。'
    : '登录后可查看已生成、生成中和失败返还的报告。',
)

const chatUnlimited = computed(() => store.chatUnlimited)
const chatRemaining = computed(() => {
  if (store.chatCreditsFromServer || !CHAT_CREDITS_LOCAL_FALLBACK)
    return store.chatRemaining
  return chatStore.localRemaining
})
const reportCredits = computed(() => store.totalAvailableCount)

const activeProfile = computed(() => store.activeProfile)
const activeUserName = computed(() => activeProfile.value?.name || '输入八字更了解TA')
const activeUserSeal = computed(() => {
  const n = (activeProfile.value?.name || '').trim()
  return n ? n.slice(0, 1) : '八'
})

const guestRows = [
  {
    title: '八字命理综合报告',
    guest: '登录后查看完整报告',
    logged: '近期状态解读已保存',
  },
  {
    title: '流年运势报告',
    guest: '登录后同步生成进度',
    logged: '可查看整理进度',
  },
  {
    title: '家庭关系参考报告',
    guest: '登录后保存失败返还记录',
    logged: '已同步历史记录',
  },
]

const reportRows = computed(() => {
  if (!isLoggedIn.value)
    return []
  return store.readingRecords.map(raw => store.mapServerReportToRecord(raw))
})

onShow(() => {
  void bootstrapMine()
})

async function bootstrapMine() {
  chatStore.ensureQuotaDay()
  if (!store.isLoggedIn)
    return
  await Promise.all([
    store.ensureCreditsLoaded(true),
    store.ensureProfilesLoaded(),
  ])
  if (store.chatCreditsFromServer)
    chatStore.syncLocalRemaining(store.chatRemaining)
  const pid = store.activeProfileId || store.profiles[0]?.id
  if (pid) {
    if (!store.activeProfileId)
      store.setActiveProfile(pid)
    loadingReports.value = true
    try {
      await store.loadReadingRecords(pid)
    }
    finally {
      loadingReports.value = false
    }
  }
}

function maskMobile(mobile: string) {
  const m = (mobile || '').trim()
  if (m.length < 7)
    return m
  return `${m.slice(0, 3)}****${m.slice(-4)}`
}

function onBack() {
  navigateBackOrHome()
}

function onProfileTap() {
  if (!isLoggedIn.value)
    showLogin.value = true
}

function onManageUsers() {
  if (!isLoggedIn.value) {
    showLogin.value = true
    return
  }
  uni.navigateTo({ url: RouterPaths.users })
}

function onService() {
  showService.value = true
}

function onContinueChat() {
  uni.reLaunch({ url: RouterPaths.jieduChat })
}

function onLogout() {
  if (!isLoggedIn.value)
    return
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号吗？',
    confirmText: '退出',
    success: (res) => {
      if (!res.confirm)
        return
      store.clearSession()
      try {
        uni.removeStorageSync(CHAT_PENDING_QUESTION_KEY)
      }
      catch {
        // ignore
      }
      void userInfoStore().loginOut({ delayMs: 0 })
    },
  })
}

function onReportTap(recordId?: string) {
  if (!isLoggedIn.value) {
    showLogin.value = true
    return
  }
  if (!recordId) {
    uni.showToast({ title: '报告不存在', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `${RouterPaths.jieduDetail}?recordId=${recordId}` })
}

async function afterLogin() {
  await store.bootstrapAfterLogin()
  await bootstrapMine()
}

function statusLabel(status?: string) {
  const s = String(status || '').toLowerCase()
  if (!s)
    return '查看'
  if (/fail|失败/.test(s))
    return '失败'
  if (/ing|生成|pending|process/.test(s))
    return '生成中'
  return '查看'
}
</script>

<template>
  <view class="gx-chat-page mine-page">
    <GxChatHeader
      title="我的"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="mine-scroll" :show-scrollbar="false">
      <view class="mine-inner">
        <view class="profile-card" @tap="onProfileTap">
          <view class="avatar">
            {{ avatarChar }}
          </view>
          <view class="profile-copy">
            <text class="profile-name">
              {{ nickname }}
            </text>
            <text class="profile-desc">
              {{ profileCopy }}
            </text>
          </view>
          <text class="profile-action">
            {{ profileAction }}
          </text>
        </view>

        <view class="entitlement-ledger">
          <view class="ledger-col">
            <text class="ledger-label">
              今日问答
            </text>
            <text v-if="chatUnlimited" class="ledger-value">
              套餐期内不限次
            </text>
            <text v-else class="ledger-value">
              剩余
              <text class="ledger-num">
                {{ chatRemaining }}
              </text>
              /
              <text class="ledger-num">
                {{ DAILY_QUESTION_LIMIT }}
              </text>
              次
            </text>
          </view>
          <view class="ledger-col">
            <text class="ledger-label">
              深度报告
            </text>
            <text class="ledger-value">
              <text class="ledger-num">
                {{ reportCredits }}
              </text>
              次
            </text>
          </view>
          <text class="ledger-foot">
            两项额度独立计算，普通问答不消耗报告次数。
          </text>
        </view>

        <view class="reports-user-entry" @tap="onManageUsers">
          <view class="bazi-seal">
            {{ activeUserSeal }}
          </view>
          <view class="user-copy">
            <text class="user-small">
              当前八字用户
            </text>
            <text class="user-name">
              {{ activeUserName }}
            </text>
          </view>
          <text class="user-action">
            管理
          </text>
        </view>

        <template v-if="showReportsSection">
          <view class="list-title">
            <text class="list-h2">
              我的报告
            </text>
            <text class="list-p">
              {{ reportListCopy }}
            </text>
          </view>

          <view v-if="!isLoggedIn" class="login-save-card">
            <text class="save-strong">
              登录后保存信息
            </text>
            <text class="save-span">
              当前未登录，不能发起问答。登录后会保存个人资料、每日问答次数和历史报告。
            </text>
            <view class="save-btn" @tap="showLogin = true">
              立即登录
            </view>
          </view>

          <view v-if="!isLoggedIn" class="report-list">
            <view
              v-for="row in guestRows"
              :key="row.title"
              class="report-row locked"
              @tap="showLogin = true"
            >
              <view class="report-main">
                <text class="report-title">
                  {{ row.title }}
                </text>
                <text class="report-em">
                  {{ row.guest }}
                </text>
              </view>
              <text class="report-action">
                登录
              </text>
            </view>
          </view>

          <view v-else class="report-list">
            <view v-if="loadingReports" class="empty-hint">
              加载中…
            </view>
            <view v-else-if="reportRows.length === 0" class="empty-hint">
              暂无报告，去问答后可生成
            </view>
            <view
              v-for="row in reportRows"
              :key="row.id"
              class="report-row"
              @tap="onReportTap(row.id)"
            >
              <view class="report-main">
                <text class="report-title">
                  {{ row.title }}
                </text>
                <text class="report-em">
                  {{ row.time || row.profileName }}
                </text>
              </view>
              <text class="report-action">
                {{ statusLabel(row.status) }}
              </text>
            </view>
          </view>
        </template>

        <view class="reports-service-entry" @tap="onService">
          <view class="service-icon">
            客
          </view>
          <view class="service-copy">
            <text class="service-strong">
              联系客服
            </text>
            <text class="service-small">
              会员开通、权益问题与报告售后
            </text>
          </view>
          <text class="service-arrow">
            ›
          </text>
        </view>

        <view
          v-if="isLoggedIn"
          class="logout-btn"
          @tap="onLogout"
        >
          退出登录
        </view>

        <view class="continue-btn" @tap="onContinueChat">
          继续问答
        </view>
      </view>
    </scroll-view>

    <GxChatLoginModal
      :show="showLogin"
      @close="showLogin = false"
      @success="afterLogin"
    />
    <GxCustomerServiceModal
      :show="showService"
      @close="showService = false"
    />
  </view>
</template>

<style scoped lang="scss">
.mine-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mine-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.mine-inner {
  padding: 24rpx 28rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.96);
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 36rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-copy {
  flex: 1;
  min-width: 0;
}

.profile-name {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 32rpx;
  font-weight: 800;
}

.profile-desc {
  display: block;
  margin-top: 6rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
  line-height: 1.4;
}

.profile-action {
  flex-shrink: 0;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 800;
}

.entitlement-ledger {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.ledger-label {
  display: block;
  font-size: 22rpx;
  opacity: 0.88;
}

.ledger-value {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 800;
}

.ledger-num {
  color: var(--gx-chat-gold, #d5a43d);
}

.ledger-foot {
  grid-column: 1 / -1;
  margin-top: 8rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid rgba(255, 253, 247, 0.18);
  font-size: 22rpx;
  opacity: 0.88;
  line-height: 1.4;
}

.reports-user-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.96);
}

.bazi-seal {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 3rpx solid var(--gx-chat-red, #b43a3d);
  background: linear-gradient(135deg, var(--gx-chat-gold, #d5a43d), #f0d48a);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-copy {
  flex: 1;
  min-width: 0;
}

.user-small {
  display: block;
  color: var(--gx-chat-hint, #a28777);
  font-size: 22rpx;
}

.user-name {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.user-action {
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 800;
}

.list-title {
  margin-bottom: 16rpx;
}

.list-h2 {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 34rpx;
  font-weight: 800;
}

.list-p {
  display: block;
  margin-top: 8rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.45;
}

.login-save-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  border: 2rpx solid rgba(180, 58, 61, 0.18);
}

.save-strong {
  display: block;
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 28rpx;
  font-weight: 800;
}

.save-span {
  display: block;
  margin-top: 8rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.45;
}

.save-btn {
  display: inline-flex;
  margin-top: 16rpx;
  min-height: 64rpx;
  padding: 0 28rpx;
  border-radius: 14rpx;
  background: var(--gx-chat-red, #b43a3d);
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 700;
  align-items: center;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.report-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #fff;

  &.locked {
    opacity: 0.72;
  }
}

.report-main {
  flex: 1;
  min-width: 0;
}

.report-title {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.report-em {
  display: block;
  margin-top: 6rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
}

.report-action {
  flex-shrink: 0;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 800;
}

.empty-hint {
  padding: 28rpx;
  text-align: center;
  color: var(--gx-chat-hint, #a28777);
  font-size: 24rpx;
  border-radius: 20rpx;
  border: 2rpx dashed var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.8);
}

.reports-service-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.96);
}

.service-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: var(--gx-chat-red-deep, #7f1f26);
  color: #fffdf7;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-copy {
  flex: 1;
  min-width: 0;
}

.service-strong {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.service-small {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
}

.service-arrow {
  color: var(--gx-chat-hint, #a28777);
  font-size: 36rpx;
}

.logout-btn {
  min-height: 88rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.96);
  color: var(--gx-chat-muted, #755d52);
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.continue-btn {
  min-height: 92rpx;
  border-radius: 20rpx;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
