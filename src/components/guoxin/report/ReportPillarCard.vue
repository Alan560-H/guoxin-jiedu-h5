<script setup lang="ts">
import type { ReportHeroPillar } from '@/models/guoxin/reportContent'

defineProps<{
  pillars?: ReportHeroPillar[]
}>()
</script>

<template>
  <div v-if="pillars?.length" class="info-card">
    <div class="info-grid">
      <div v-for="(p, i) in pillars" :key="i" class="info-item">
        <div class="info-label">{{ p.label }}</div>
        <div class="info-value">{{ p.tiangan }}{{ p.dizhi }}</div>
      </div>
    </div>
  </div>
</template>
