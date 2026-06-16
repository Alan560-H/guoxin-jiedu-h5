<script setup lang="ts">
import type { ReportSectionBlock } from '@/models/guoxin/reportContent'
import ReportComponentRenderer from './ReportComponentRenderer.vue'

defineProps<{
  section: ReportSectionBlock
  preface?: boolean
}>()
</script>

<template>
  <div v-if="section.sectionTitle && !preface" class="sub-title">{{ section.sectionTitle }}</div>

  <ReportComponentRenderer
    v-for="(comp, i) in section.components || []"
    :key="`c-${i}`"
    :component="comp"
  />

  <template v-for="(sub, si) in section.subSections || []" :key="`s-${si}`">
    <div v-if="sub.label" class="sub-title">{{ sub.label }}</div>
    <ReportComponentRenderer
      v-for="(comp, ci) in sub.components || []"
      :key="`sc-${ci}`"
      :component="comp"
    />
  </template>
</template>
