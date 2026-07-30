<script setup lang="ts">
/**
 * 应用入口壳：处理邀请 scene 后进入真开聊。
 * 不再展示假聊天；未登录 / 无档案由开聊页承接。
 */
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import GxSourceBackBar from '@/components/guoxin/GxSourceBackBar.vue'
import {
  IS_SHOW_BACK_QUERY_KEY,
  IS_SHOW_BACK_QUERY_VALUE,
  IS_SHOW_PAY_QUERY_KEY,
  IS_SHOW_PAY_QUERY_OFF,
  IS_SHOW_PAY_QUERY_ON,
} from '@/constants/guoxin'
import { RouterPaths } from '@/routerPaths'
import { captureShowPayFromUrl, isShowPayEnabled } from '@/utils/guoxin/showPay'
import { isShowBackEntry } from '@/utils/guoxin/sourceEntry'

const showSourceBackBar = ref(isShowBackEntry())
/** 避免 onShow 重复跳转 */
const entered = ref(false)

onLoad((query) => {
  const q = query as Record<string, string | undefined>
  captureShowPayFromUrl(q)
  routeInviteIfNeeded(q)
})

onShow(() => {
  showSourceBackBar.value = isShowBackEntry()
  // 仅从当前 URL 补抓；无参时不覆盖已写入的 0/1
  captureShowPayFromUrl()
  // #ifdef H5
  if (typeof window !== 'undefined') {
    try {
      const sp = new URLSearchParams(window.location.search)
      if (sp.get('scene') === 'invite') {
        routeInviteIfNeeded({ scene: 'invite', token: sp.get('token') || undefined })
        return
      }
    }
    catch {
      // ignore
    }
  }
  // #endif
  enterChat()
})

function routeInviteIfNeeded(query?: Record<string, string | undefined>) {
  if (query?.scene !== 'invite')
    return
  const token = String(query.token || '').trim()
  const url = token
    ? `${RouterPaths.inviteAccept}?token=${encodeURIComponent(token)}`
    : RouterPaths.inviteAccept
  // #ifdef H5
  if (typeof window !== 'undefined') {
    try {
      const u = new URL(window.location.href)
      if (u.searchParams.has('scene')) {
        u.searchParams.delete('scene')
        u.searchParams.delete('token')
        window.history.replaceState({}, '', u.toString())
      }
    }
    catch {
      // ignore
    }
  }
  // #endif
  entered.value = true
  uni.redirectTo({ url })
}

function enterChat() {
  if (entered.value)
    return
  entered.value = true
  const params = new URLSearchParams()
  if (isShowBackEntry())
    params.set(IS_SHOW_BACK_QUERY_KEY, IS_SHOW_BACK_QUERY_VALUE)
  // 带上支付开关，避免跳转后仅靠 storage 时调试不直观
  params.set(
    IS_SHOW_PAY_QUERY_KEY,
    isShowPayEnabled() ? IS_SHOW_PAY_QUERY_ON : IS_SHOW_PAY_QUERY_OFF,
  )
  const q = params.toString()
  uni.reLaunch({ url: `${RouterPaths.jieduChat}${q ? `?${q}` : ''}` })
}
</script>

<template>
  <view class="gx-chat-page home-entry">
    <GxSourceBackBar v-if="showSourceBackBar" />
    <view class="entry-hint">
      <text class="entry-text">
        正在进入解读…
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.home-entry {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.entry-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.entry-text {
  color: var(--gx-chat-muted, #755d52);
  font-size: 28rpx;
}
</style>
