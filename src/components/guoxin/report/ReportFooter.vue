<script setup lang="ts">
import type { ReportFooter } from '@/models/guoxin/reportContent'

defineProps<{
  footer?: ReportFooter
}>()
</script>

<template>
  <div v-if="footer" class="footer">
    <div class="footer-divider" />
    <div v-if="footer.reportTitle">{{ footer.reportTitle }}</div>
    <div v-if="footer.pillars">{{ footer.pillars }}</div>
    <div v-if="footer.motto" class="footer-motto">{{ footer.motto }}</div>
    <div v-if="footer.blessing" class="footer-blessing">— {{ footer.blessing }} —</div>
  </div>
</template>
