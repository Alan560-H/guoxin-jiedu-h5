<script setup lang="ts">
import type { ReportDocument } from '@/models/guoxin/reportContent'
import { DISCLAIMER_TEXT } from '@/constants/guoxin'
import ReportChapter from './ReportChapter.vue'
import ReportFooter from './ReportFooter.vue'
import ReportHero from './ReportHero.vue'
import ReportPillarCard from './ReportPillarCard.vue'
import ReportRichText from './ReportRichText.vue'

defineProps<{
  document: ReportDocument
  reportTitle?: string
}>()
</script>

<template>
  <div class="report-html-theme">
    <ReportHero :hero="document.hero" :meta="document.meta" :report-title="reportTitle" />

    <div class="container">
      <ReportPillarCard :pillars="document.hero?.pillars" />

      <template v-if="document.chapters?.length">
        <ReportChapter
          v-for="(ch, i) in document.chapters"
          :key="ch.chapterNum || i"
          :chapter="ch"
          :show-divider="i < (document.chapters?.length || 0) - 1"
        />
      </template>

      <div v-else-if="document.htmlContent" class="text-block">
        <ReportRichText :html="document.htmlContent" />
      </div>

      <ReportFooter :footer="document.footer" />

      <div class="disclaimer">
        <div>{{ DISCLAIMER_TEXT }}</div>
        <div style="margin-top: 8px;">
          本报告基于 AI 生成，旨在提供柔性参考建议，不属于玄学占卜或命运预测，不具备医疗诊断、心理治疗、法律维权或理财投资等专业效力。
        </div>
      </div>
    </div>
  </div>
</template>
