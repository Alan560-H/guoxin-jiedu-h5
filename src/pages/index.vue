<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import GxAvatarSwitcher from '@/components/guoxin/chat/GxAvatarSwitcher.vue'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatComposer from '@/components/guoxin/chat/GxChatComposer.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLoginModal from '@/components/guoxin/chat/GxChatLoginModal.vue'
import GxInviteModal from '@/components/guoxin/chat/GxInviteModal.vue'
import GxQuestionBoard from '@/components/guoxin/chat/GxQuestionBoard.vue'
import GxSourceBackBar from '@/components/guoxin/GxSourceBackBar.vue'
import { CHAT_PENDING_QUESTION_KEY, HOME_QUESTION_BANKS } from '@/constants/chatHome'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { isShowBackEntry } from '@/utils/guoxin/sourceEntry'

const store = useGuoxinStore()

const showLogin = ref(false)
const showBazi = ref(false)
const showInvite = ref(false)
const draft = ref('')
const bankIndex = ref(0)
const pendingQuestion = ref('')
/** 登录成功后打开邀请弹窗 */
const pendingInvite = ref(false)
/** 登录成功后是否强制选中档案列表第一个 */
const forceSelectFirst = ref(false)

const showSourceBackBar = ref(isShowBackEntry())
const profiles = computed(() => store.profiles)
const activeId = computed(() => store.activeProfileId)
const questions = computed(() => HOME_QUESTION_BANKS[bankIndex.value] ?? HOME_QUESTION_BANKS[0])

onMounted(() => {
  void bootstrapHome(false)
})

onShow(() => {
  showSourceBackBar.value = isShowBackEntry()
  if (store.isLoggedIn)
    void bootstrapHome(false)
})

async function bootstrapHome(selectFirst: boolean) {
  if (!store.isLoggedIn)
    return
  await store.loadProfiles()
  if (store.profiles.length === 0) {
    showBazi.value = true
    return
  }
  if (selectFirst || forceSelectFirst.value) {
    store.setActiveProfile(store.profiles[0].id)
    forceSelectFirst.value = false
    return
  }
  if (!store.activeProfileId || !store.profiles.some(p => p.id === store.activeProfileId))
    store.setActiveProfile(store.profiles[0].id)
}

function requireLogin(): boolean {
  if (store.isLoggedIn)
    return true
  showLogin.value = true
  return false
}

async function afterLoginSuccess() {
  forceSelectFirst.value = true
  await store.bootstrapAfterLogin()
  await bootstrapHome(true)
  if (pendingInvite.value) {
    pendingInvite.value = false
    showInvite.value = true
    return
  }
  if (pendingQuestion.value && store.profiles.length > 0)
    handleAskWithProfile(pendingQuestion.value)
}

function onMine() {
  if (!requireLogin())
    return
  uni.showToast({ title: '「我的」下一步开放', icon: 'none' })
}

function onInvite() {
  if (!store.isLoggedIn) {
    pendingInvite.value = true
    showLogin.value = true
    return
  }
  showInvite.value = true
}

function onInvitePreview() {
  uni.showToast({ title: '好友填写页下一步开放', icon: 'none' })
}

function onAdd() {
  if (!requireLogin())
    return
  showBazi.value = true
}

function onSelectProfile(id: string) {
  if (!requireLogin())
    return
  store.setActiveProfile(id)
}

function onRefreshQuestions() {
  bankIndex.value = (bankIndex.value + 1) % HOME_QUESTION_BANKS.length
}

function onPickQuestion(q: string) {
  void handleAsk(q)
}

function onSubmitComposer() {
  const q = draft.value.trim()
  if (!q) {
    uni.showToast({ title: '请输入你的问题', icon: 'none' })
    return
  }
  void handleAsk(q)
}

async function handleAsk(question: string) {
  pendingQuestion.value = question
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  if (store.profiles.length === 0) {
    await store.loadProfiles()
  }
  if (store.profiles.length === 0) {
    showBazi.value = true
    return
  }
  handleAskWithProfile(question)
}

function handleAskWithProfile(question: string) {
  try {
    uni.setStorageSync(CHAT_PENDING_QUESTION_KEY, question)
  }
  catch {
    // ignore
  }
  draft.value = ''
  pendingQuestion.value = ''
  uni.navigateTo({ url: RouterPaths.jieduChat })
}

function onBaziSuccess() {
  const q = pendingQuestion.value
  pendingQuestion.value = ''
  if (q)
    handleAskWithProfile(q)
}
</script>

<template>
  <view class="gx-chat-page home-page">
    <GxSourceBackBar v-if="showSourceBackBar" />
    <GxChatHeader @mine="onMine" />

    <scroll-view scroll-y class="home-scroll" :show-scrollbar="false">
      <view class="home-inner">
        <GxAvatarSwitcher
          :profiles="profiles"
          :active-id="activeId"
          @select="onSelectProfile"
          @add="onAdd"
          @invite="onInvite"
        />

        <view class="conversation-cover">
          <view class="cover-copy">
            <text class="cover-eyebrow">
              AI 命理问答
            </text>
            <text class="cover-title">
              把最近的困惑说给我听
            </text>
            <text class="cover-desc">
              从一个真实问题开始，国心解读会帮你梳理当下状态和下一步方向。
            </text>
          </view>
          <view class="cover-token" aria-hidden="true">
            问
          </view>
        </view>

        <view class="assistant-row">
          <view class="assistant-seal">
            知
          </view>
          <view class="bubble">
            <text class="bubble-name">
              国心解读
            </text>
            <text class="bubble-body">
              你可以先问一个近期困惑，我会根据你的情况给出清晰、好理解的参考。
            </text>
          </view>
        </view>

        <GxQuestionBoard
          :questions="questions"
          @refresh="onRefreshQuestions"
          @pick="onPickQuestion"
        />
      </view>
    </scroll-view>

    <GxChatComposer
      v-model="draft"
      placeholder="输入你的问题"
      @submit="onSubmitComposer"
    />

    <GxChatLoginModal
      :show="showLogin"
      @close="showLogin = false"
      @success="afterLoginSuccess"
    />
    <GxBaziProfileModal
      :show="showBazi"
      @close="showBazi = false"
      @success="onBaziSuccess"
    />
    <GxInviteModal
      :show="showInvite"
      @close="showInvite = false"
      @preview="onInvitePreview"
    />
  </view>
</template>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.home-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.home-inner {
  padding: 24rpx 28rpx 40rpx;
  box-sizing: border-box;
}

.conversation-cover {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 20rpx;
  margin-bottom: 28rpx;
  padding: 28rpx 24rpx;
  border-radius: var(--gx-chat-radius, 32rpx);
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background:
    linear-gradient(135deg, rgba(255, 253, 248, 0.98), rgba(255, 241, 232, 0.92));
  box-shadow: var(--gx-chat-shadow, 0 8rpx 24rpx rgba(121, 38, 32, 0.08));
  overflow: hidden;
}

.cover-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.cover-eyebrow {
  color: var(--gx-chat-red, #b43a3d);
  font-size: 22rpx;
  font-weight: 700;
}

.cover-title {
  color: var(--gx-chat-ink, #2b1712);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.25;
}

.cover-desc {
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.55;
}

.cover-token {
  flex-shrink: 0;
  width: 112rpx;
  height: 148rpx;
  border-radius: 56rpx 56rpx 28rpx 28rpx;
  border: 6rpx solid var(--gx-chat-gold-soft, #fff0c7);
  background: linear-gradient(180deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 52rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(127, 31, 38, 0.28);
  align-self: center;
}

.assistant-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.assistant-seal {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(124, 64, 42, 0.35);
  background: var(--gx-chat-red, #b43a3d);
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bubble {
  flex: 1;
  min-width: 0;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  background: #fff;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  box-shadow: 0 6rpx 16rpx rgba(121, 38, 32, 0.06);
}

.bubble-name {
  display: block;
  margin-bottom: 8rpx;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 700;
}

.bubble-body {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  line-height: 1.55;
}
</style>
