<script setup lang="ts">
import { computed } from 'vue'
import type { ReportPieSegment } from '@/models/guoxin/reportContent'
import { reportColorHex } from '@/utils/guoxin/reportColors'

const props = defineProps<{
  segments?: ReportPieSegment[]
  centerTitle?: string
  centerSub?: string
}>()

const R = 55
const C = 2 * Math.PI * R

const arcs = computed(() => {
  const list = props.segments || []
  let offset = 0
  return list.map((seg) => {
    const pct = seg.percentage || 0
    const len = (C * pct) / 100
    const arc = {
      color: reportColorHex(seg.color),
      dasharray: `${len} ${C}`,
      dashoffset: -offset,
    }
    offset += len
    return arc
  })
})
</script>

<template>
  <div class="pie-chart-container">
    <div class="pie-chart">
      <svg viewBox="0 0 140 140">
        <circle cx="70" cy="70" :r="R" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="20" />
        <circle
          v-for="(arc, i) in arcs"
          :key="i"
          cx="70"
          cy="70"
          :r="R"
          fill="none"
          :stroke="arc.color"
          stroke-width="20"
          :stroke-dasharray="arc.dasharray"
          :stroke-dashoffset="arc.dashoffset"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">{{ centerTitle || '构成' }}</text>
        <text x="70" y="82" text-anchor="middle" fill="#8899aa" font-size="10">{{ centerSub || '比例' }}</text>
      </svg>
    </div>
    <div class="pie-legend">
      <div v-for="(seg, i) in (segments || [])" :key="i" class="pie-legend-item">
        <div class="legend-dot" :style="{ background: reportColorHex(seg.color) }" />
        <span>{{ seg.label }} {{ seg.percentage }}%</span>
      </div>
    </div>
  </div>
</template>
