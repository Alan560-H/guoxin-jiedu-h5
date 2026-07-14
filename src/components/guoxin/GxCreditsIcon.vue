<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  size?: string
}>(), {
  size: '40rpx',
})
</script>

<template>
  <svg
    class="gx-credits-icon"
    :style="{ width: props.size, height: props.size }"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 盾牌勾：次数不足 / 微信支付 -->
    <template v-if="props.name === 'shield-check' || props.name === 'trust-wechat'">
      <path
        d="M24 6 10 12v12c0 10 6.5 16.5 14 19 7.5-2.5 14-9 14-19V12L24 6z"
        stroke="currentColor"
        stroke-width="3"
        stroke-linejoin="round"
      />
      <path
        d="M16.5 24.5 22 30l10-12"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>

    <!-- 体验礼盒 -->
    <template v-else-if="props.name === 'pkg-gift'">
      <rect x="9" y="20" width="30" height="20" rx="2" stroke="currentColor" stroke-width="3" />
      <path d="M9 28h30M24 20v20" stroke="currentColor" stroke-width="3" />
      <path
        d="M24 20c-4-7-10-7-10-2s5 4 10 2c4 7 10 7 10 2s-5-4-10-2z"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
    </template>

    <!-- 家庭双人 -->
    <template v-else-if="props.name === 'pkg-family'">
      <circle cx="18" cy="16" r="6" stroke="currentColor" stroke-width="3" />
      <path
        d="M8 36c1.5-7 5.5-10 10-10s8.5 3 10 10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle cx="32" cy="15" r="5" stroke="currentColor" stroke-width="3" />
      <path
        d="M28 28c3-2 6-2 9 0 2 4 2 7 1 9"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </template>

    <!-- 长期日历 -->
    <template v-else-if="props.name === 'pkg-calendar'">
      <rect x="9" y="12" width="30" height="28" rx="3" stroke="currentColor" stroke-width="3" />
      <path
        d="M9 20h30M17 8v8M31 8v8"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <path
        d="M18 30l5 5 9-10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>

    <!-- AI 机器人 -->
    <template v-else-if="props.name === 'trust-ai'">
      <rect x="12" y="14" width="24" height="22" rx="5" stroke="currentColor" stroke-width="3" />
      <circle cx="20" cy="24" r="2.5" fill="currentColor" />
      <circle cx="28" cy="24" r="2.5" fill="currentColor" />
      <path
        d="M24 8v6M18 40h12M10 24h2M36 24h2"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <path d="M19 31h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </template>

    <!-- 仅供参考 info -->
    <template v-else-if="props.name === 'trust-info'">
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="3" />
      <path
        d="M24 22v12M24 16.5v2.5"
        stroke="currentColor"
        stroke-width="3.5"
        stroke-linecap="round"
      />
    </template>

    <!-- 开通钱包 -->
    <template v-else-if="props.name === 'wallet'">
      <rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" stroke-width="3" />
      <path
        d="M6 22h36M30 30h8"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle cx="34" cy="30" r="2" fill="currentColor" />
      <path
        d="M12 14V12c0-3 2.5-5 6-5h12c3.5 0 6 2 6 5v2"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </template>
  </svg>
</template>

<style scoped>
.gx-credits-icon {
  display: block;
  flex-shrink: 0;
}
</style>
