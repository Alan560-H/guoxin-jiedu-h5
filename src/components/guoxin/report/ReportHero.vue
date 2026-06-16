<script setup lang="ts">
import type { ReportHero, ReportMeta } from '@/models/guoxin/reportContent'

const props = defineProps<{
  hero?: ReportHero
  meta?: ReportMeta
  reportTitle?: string
}>()

function heroTags() {
  const tags: string[] = []
  if (props.hero?.badge)
    tags.push(props.hero.badge)
  if (props.hero?.title?.pattern)
    tags.push(props.hero.title.pattern)
  if (props.meta?.currentAge)
    tags.push(`${props.meta.currentAge}岁`)
  return tags
}
</script>

<template>
  <div v-if="hero" class="hero">
    <div class="hero-icon">🏔️</div>
    <h1 class="hero-title">
      {{ hero.title?.subtitle || hero.title?.pattern || reportTitle || '专属解读报告' }}
    </h1>
    <div v-if="hero.subtitle" class="hero-subtitle">
      {{ hero.subtitle }}
    </div>
    <div v-if="heroTags().length" class="hero-info">
      <span v-for="(tag, i) in heroTags()" :key="i" class="hero-tag">{{ tag }}</span>
    </div>
  </div>
</template>
