<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  html?: string
}>()

const content = computed(() => {
  const raw = props.html || ''
  if (!raw)
    return ''
  return raw.replace(/<br\s*\/?>/gi, '<br/>')
})
</script>

<template>
  <!-- #ifdef H5 -->
  <div v-if="content" class="rich-html" v-html="content" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <rich-text v-if="content" :nodes="content" />
  <!-- #endif -->
</template>
