<script setup lang="ts">
import type { ReportChapter } from '@/models/guoxin/reportContent'
import { computed } from 'vue'
import { formatChapterBadge } from '@/utils/guoxin/reportChapterNum'
import ReportSectionBlock from './ReportSectionBlock.vue'

const props = defineProps<{
  chapter: ReportChapter
  showDivider?: boolean
}>()

const badge = computed(() => formatChapterBadge(props.chapter.chapterNum))
const isPreface = computed(() => props.chapter.chapterNum === '00')
</script>

<template>
  <div class="section">
    <div v-if="!isPreface" class="section-header">
      <div class="section-number">{{ badge }}</div>
      <div class="section-title">{{ chapter.chapterTitle }}</div>
    </div>
    <div v-else class="preface">
      <div class="preface-title">{{ chapter.chapterTitle }}</div>
    </div>
    <ReportSectionBlock
      v-for="(sec, i) in chapter.sections || []"
      :key="sec.sectionId || i"
      :section="sec"
      :preface="isPreface"
    />
  </div>
  <div v-if="showDivider" class="divider" />
</template>
