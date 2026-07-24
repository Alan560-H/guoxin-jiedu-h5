<script setup lang="ts">
import type { ProfileVo } from '@/models/guoxin/profile'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import GxBaziProfileModal from '@/components/guoxin/chat/GxBaziProfileModal.vue'
import GxChatHeader from '@/components/guoxin/chat/GxChatHeader.vue'
import GxChatLoginModal from '@/components/guoxin/chat/GxChatLoginModal.vue'
import GxInviteModal from '@/components/guoxin/chat/GxInviteModal.vue'
import { RouterPaths } from '@/routerPaths'
import { useGuoxinStore } from '@/stores/guoxinStore'
import { navigateBackOrHome } from '@/utils/guoxin/navigation'

const store = useGuoxinStore()

const showLogin = ref(false)
const showBazi = ref(false)
const showInvite = ref(false)
const showDelete = ref(false)
const editId = ref('')
const pendingDeleteId = ref('')
const pendingDeleteName = ref('')

const profiles = computed(() => store.profiles)
const activeId = computed(() => store.activeProfileId)

onShow(() => {
  void bootstrapUsers()
})

async function bootstrapUsers() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  await store.ensureProfilesLoaded()
  if (store.profiles.length > 0
    && (!store.activeProfileId || !store.profiles.some(p => p.id === store.activeProfileId))) {
    store.setActiveProfile(store.profiles[0].id)
  }
}

function onBack() {
  navigateBackOrHome()
}

function seal(name: string) {
  const t = name.trim()
  return t ? t.slice(0, 1) : '?'
}

function summaryLine(p: ProfileVo) {
  return `${p.relationText || p.relation} · ${p.genderText || p.gender} · ${p.calendarTypeText || ''}`
}

function placeLine(p: ProfileVo) {
  const day = (p.birthDaySolar || p.birthDay || '').slice(0, 16)
  return `${day} · ${p.birthPlace || '未填地点'}`
}

function onAdd() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  editId.value = ''
  showBazi.value = true
}

function onSelect(id: string) {
  store.setActiveProfile(id)
  uni.showToast({ title: '已切换当前用户', icon: 'none' })
}

function onEdit(id: string) {
  editId.value = id
  showBazi.value = true
}

function onDeleteAsk(p: ProfileVo) {
  pendingDeleteId.value = p.id
  pendingDeleteName.value = p.name
  showDelete.value = true
}

async function onDeleteConfirm() {
  const id = pendingDeleteId.value
  showDelete.value = false
  if (!id)
    return
  try {
    await store.deleteProfile(id)
    uni.showToast({ title: '已删除', icon: 'none' })
  }
  catch {
    // store 已 toast
  }
  pendingDeleteId.value = ''
}

function onInvite() {
  if (!store.isLoggedIn) {
    showLogin.value = true
    return
  }
  showInvite.value = true
}

function onInvitePreview() {
  uni.navigateTo({ url: RouterPaths.inviteAccept })
}

async function afterLogin() {
  await store.bootstrapAfterLogin()
  await bootstrapUsers()
}

async function afterBaziSuccess() {
  editId.value = ''
  await store.ensureProfilesLoaded(true)
}
</script>

<template>
  <view class="gx-chat-page users-page">
    <GxChatHeader
      title="八字用户"
      show-back
      :show-mine="false"
      @back="onBack"
    />

    <scroll-view scroll-y class="users-scroll" :show-scrollbar="false">
      <view class="users-inner">
        <view class="users-hero">
          <text class="hero-eyebrow">
            八字用户
          </text>
          <text class="hero-title">
            为谁解读
          </text>
          <text class="hero-desc">
            保存自己和家人的八字，对话前选择一位，回答会更贴合TA的情况。
          </text>
        </view>

        <view class="users-toolbar">
          <view class="toolbar-copy">
            <text class="toolbar-strong">
              输入八字更了解TA
            </text>
            <text class="toolbar-span">
              称呼、关系与出生信息可随时修改
            </text>
          </view>
          <view class="toolbar-add" @tap="onAdd">
            ＋ 新增
          </view>
        </view>

        <view v-if="profiles.length === 0" class="bazi-user-empty">
          <text class="empty-strong">
            还没有八字用户
          </text>
          <text class="empty-span">
            先新增自己或家人的八字，之后问答时即可选择。
          </text>
        </view>

        <view v-else class="bazi-user-list">
          <view
            v-for="p in profiles"
            :key="p.id"
            class="bazi-user-card"
            :class="{ selected: p.id === activeId }"
          >
            <view class="card-avatar">
              {{ seal(p.name) }}
            </view>
            <view class="card-copy">
              <text class="card-name">
                {{ p.name }}
              </text>
              <text class="card-meta">
                {{ summaryLine(p) }}
              </text>
              <text class="card-place">
                {{ placeLine(p) }}
              </text>
            </view>
            <view
              class="card-status"
              @tap="onSelect(p.id)"
            >
              {{ p.id === activeId ? '当前' : '选择' }}
            </view>
            <view class="card-actions">
              <view class="act" @tap="onSelect(p.id)">
                {{ p.id === activeId ? '正在使用' : '用于问答' }}
              </view>
              <view class="act" @tap="onEdit(p.id)">
                编辑
              </view>
              <view class="act danger" @tap="onDeleteAsk(p)">
                删除
              </view>
            </view>
          </view>
        </view>

        <view class="share-fill-card">
          <view class="share-icon">
            邀
          </view>
          <view class="share-copy">
            <text class="share-strong">
              请TA自己填写八字
            </text>
            <text class="share-span">
              分享邀请链接，对方登录后填写并授权给你使用。
            </text>
          </view>
          <view class="share-btn" @tap="onInvite">
            发邀请
          </view>
        </view>

        <text class="privacy-note">
          八字信息仅用于所选用户的问答与报告，未经授权不会自动共享。
        </text>
      </view>
    </scroll-view>

    <GxChatLoginModal
      :show="showLogin"
      @close="showLogin = false"
      @success="afterLogin"
    />
    <GxBaziProfileModal
      :show="showBazi"
      :edit-id="editId"
      @close="showBazi = false; editId = ''"
      @success="afterBaziSuccess"
    />
    <GxInviteModal
      :show="showInvite"
      @close="showInvite = false"
      @preview="onInvitePreview"
    />

    <view v-if="showDelete" class="modal-root">
      <view class="modal-mask" @tap="showDelete = false" />
      <view class="modal-card" @tap.stop>
        <text class="modal-eyebrow">
          删除八字用户
        </text>
        <text class="modal-title">
          确定删除{{ pendingDeleteName || '这位用户' }}？
        </text>
        <text class="modal-desc">
          删除后，该用户的八字信息将从本机移除，已有问答记录会保留。
        </text>
        <view class="modal-btn primary" @tap="onDeleteConfirm">
          确认删除
        </view>
        <view class="modal-btn secondary" @tap="showDelete = false">
          取消
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.users-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.users-scroll {
  flex: 1;
  min-height: 0;
  height: 0;
}

.users-inner {
  padding: 24rpx 28rpx calc(40rpx + env(safe-area-inset-bottom));
}

.users-hero {
  margin-bottom: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  border: 3rpx solid rgba(213, 164, 61, 0.5);
  background:
    radial-gradient(circle at 94% 8%, rgba(240, 194, 78, 0.32), transparent 28%),
    linear-gradient(145deg, var(--gx-chat-red-deep, #7f1f26), var(--gx-chat-red, #b43a3d));
  color: #fffdf7;
}

.hero-eyebrow {
  display: block;
  color: #ffe394;
  font-size: 24rpx;
  font-weight: 800;
}

.hero-title {
  display: block;
  margin-top: 8rpx;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1.2;
}

.hero-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.55;
  opacity: 0.88;
}

.users-toolbar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: rgba(255, 253, 248, 0.96);
}

.toolbar-copy {
  flex: 1;
  min-width: 0;
}

.toolbar-strong {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.toolbar-span {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
}

.toolbar-add {
  flex-shrink: 0;
  min-height: 64rpx;
  padding: 0 22rpx;
  border-radius: 14rpx;
  background: var(--gx-chat-red, #b43a3d);
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
}

.bazi-user-empty {
  margin-bottom: 20rpx;
  padding: 36rpx 28rpx;
  border-radius: 20rpx;
  border: 2rpx dashed var(--gx-chat-border, #eccdbb);
  text-align: center;
}

.empty-strong {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.empty-span {
  display: block;
  margin-top: 8rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
  line-height: 1.45;
}

.bazi-user-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.bazi-user-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "avatar copy status"
    "actions actions actions";
  gap: 12rpx 16rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #fff;

  &.selected {
    border-color: rgba(180, 58, 61, 0.45);
    background: #fff8f4;
  }
}

.card-avatar {
  grid-area: avatar;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gx-chat-gold, #d5a43d), #f0d48a);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-copy {
  grid-area: copy;
  min-width: 0;
}

.card-name {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
  font-weight: 800;
}

.card-meta,
.card-place {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
  line-height: 1.35;
}

.card-status {
  grid-area: status;
  align-self: start;
  min-height: 48rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: var(--gx-chat-red-soft, #fae5e2);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 22rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
}

.card-actions {
  grid-area: actions;
  display: flex;
  gap: 12rpx;
  padding-top: 8rpx;
  border-top: 2rpx solid rgba(236, 205, 187, 0.7);
}

.act {
  flex: 1;
  min-height: 56rpx;
  border-radius: 12rpx;
  background: #fff4ec;
  color: var(--gx-chat-brown, #7c402a);
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;

  &.danger {
    color: var(--gx-chat-red, #b43a3d);
  }
}

.share-fill-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(213, 164, 61, 0.4);
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.96), rgba(247, 237, 207, 0.78));
}

.share-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: var(--gx-chat-red-deep, #7f1f26);
  color: #fffdf7;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.share-copy {
  flex: 1;
  min-width: 0;
}

.share-strong {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 26rpx;
  font-weight: 800;
}

.share-span {
  display: block;
  margin-top: 4rpx;
  color: var(--gx-chat-muted, #755d52);
  font-size: 22rpx;
  line-height: 1.4;
}

.share-btn {
  flex-shrink: 0;
  min-height: 60rpx;
  padding: 0 18rpx;
  border-radius: 12rpx;
  background: var(--gx-chat-gold, #d5a43d);
  color: var(--gx-chat-red-deep, #7f1f26);
  font-size: 24rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
}

.privacy-note {
  display: block;
  color: var(--gx-chat-hint, #a28777);
  font-size: 22rpx;
  line-height: 1.5;
  text-align: center;
}

.modal-root {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(43, 23, 18, 0.48);
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 620rpx;
  padding: 40rpx 32rpx 32rpx;
  border-radius: 28rpx;
  background: #fffdf8;
  box-sizing: border-box;
}

.modal-eyebrow {
  display: block;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 22rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.modal-title {
  display: block;
  color: var(--gx-chat-ink, #2b1712);
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
}

.modal-desc {
  display: block;
  color: var(--gx-chat-muted, #755d52);
  font-size: 26rpx;
  line-height: 1.5;
  margin-bottom: 28rpx;
}

.modal-btn {
  min-height: 84rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;

  &:last-child {
    margin-bottom: 0;
  }

  &.primary {
    background: var(--gx-chat-red, #b43a3d);
    color: #fffdf7;
  }

  &.secondary {
    background: #fff4ec;
    color: var(--gx-chat-brown, #7c402a);
    border: 2rpx solid var(--gx-chat-border, #eccdbb);
  }
}
</style>
