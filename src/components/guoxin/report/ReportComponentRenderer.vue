<script setup lang="ts">
import type { ReportComponent } from '@/models/guoxin/reportContent'
import { computed } from 'vue'
import { reportColorHex, reportFillClass, reportTagClass } from '@/utils/guoxin/reportColors'
import ReportPieDonut from './ReportPieDonut.vue'
import ReportRichText from './ReportRichText.vue'

const props = defineProps<{
  component: ReportComponent
}>()

const gradId = `goldGradient-${Math.random().toString(36).slice(2, 9)}`

const c = computed(() => props.component)
const type = computed(() => c.value.type)

const scoreDash = computed(() => {
  if (type.value !== 'scoreCircle')
    return '0 314'
  const max = (c.value.maxValue as number) || 100
  const val = (c.value.value as number) || 0
  const circumference = 2 * Math.PI * 50
  const filled = (val / max) * circumference
  return `${filled} ${circumference}`
})

function tagChipStyle(color?: string) {
  const hex = reportColorHex(color)
  return { color: hex, background: `${hex}26` }
}

function phaseStyle(color?: string) {
  const hex = reportColorHex(color)
  return { borderColor: hex, background: `${hex}33`, color: '#fff' }
}

function starsText(n?: number) {
  const count = Math.min(5, Math.max(0, n || 0))
  return '★'.repeat(count) + '☆'.repeat(5 - count)
}

function isAlertCard(variant?: string) {
  return variant === 'warning' || variant === 'danger'
}
</script>

<template>
  <div v-if="type === 'text'" class="text-block">
    <ReportRichText :html="c.content as string" />
  </div>

  <div v-else-if="type === 'callout' && (c.variant === 'warning' || c.variant === 'danger')" class="alert-box">
    <div v-if="c.icon" class="alert-title">
      {{ c.icon }} 提示
    </div>
    <div class="alert-text">
      <ReportRichText :html="c.content as string" />
    </div>
  </div>

  <div v-else-if="type === 'callout' && c.variant === 'success'" class="success-box">
    <div v-if="c.icon" class="success-title">
      {{ c.icon }} 提示
    </div>
    <div class="success-text">
      <ReportRichText :html="c.content as string" />
    </div>
  </div>

  <div v-else-if="type === 'callout'" class="insight-box">
    <div class="insight-inline">
      <span v-if="c.icon" class="insight-icon">{{ c.icon }}</span>
      <ReportRichText :html="c.content as string" />
    </div>
  </div>

  <div v-else-if="type === 'quote'" class="quote-box">
    <div class="quote-text">
      <ReportRichText :html="c.content as string" />
    </div>
    <div v-if="c.source" class="quote-source">
      —— {{ c.source }}
    </div>
  </div>

  <div v-else-if="type === 'divider'" class="divider" />

  <div v-else-if="type === 'grid'" class="info-card">
    <div class="info-grid">
      <div v-for="(item, i) in (c.items as any[])" :key="i" class="info-item">
        <div class="info-label">
          {{ item.label }}
        </div>
        <div class="info-value" :style="{ color: reportColorHex(item.color) }">
          {{ item.value }}
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'progressGroup'" class="progress-group">
    <div v-if="c.title" class="group-title">
      {{ c.title }}
    </div>
    <div v-for="(item, i) in (c.items as any[])" :key="i" class="progress-item">
      <div class="progress-label">
        <span class="progress-name">{{ item.name }}</span>
        <span class="progress-value">{{ item.displayValue }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :class="reportFillClass(item.color)" :style="{ width: `${item.value || 0}%` }" />
      </div>
      <div v-if="item.description" class="progress-desc">
        {{ item.description }}
      </div>
    </div>
  </div>

  <div v-else-if="type === 'scoreCircle'" class="score-ring-container">
    <div class="score-ring">
      <svg viewBox="0 0 120 120">
        <defs>
          <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#B9945F" />
            <stop offset="100%" stop-color="#C9A86C" />
          </linearGradient>
        </defs>
        <circle class="score-ring-bg" cx="60" cy="60" r="50" />
        <circle
          class="score-ring-fill" cx="60" cy="60" r="50"
          :stroke="`url(#${gradId})`"
          :stroke-dasharray="scoreDash"
          stroke-dashoffset="0"
        />
      </svg>
      <div class="score-ring-text">
        <span class="score-number">{{ c.value }}</span>
        <span v-if="c.label" class="score-label">{{ c.label }}</span>
      </div>
    </div>
  </div>

  <ReportPieDonut
    v-else-if="type === 'pieChart'"
    :segments="c.segments as any[]"
    center-title="五行"
    center-sub="能量比"
  />

  <div v-else-if="type === 'hbarChart'" class="progress-group">
    <div v-if="c.title" class="hbar-group-title">
      {{ c.title }}
    </div>
    <div v-for="(item, i) in (c.items as any[])" :key="i" class="progress-item">
      <div class="progress-label">
        <span class="progress-name">{{ item.label }}</span>
        <span class="progress-value">{{ item.displayText }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :class="reportFillClass(item.color)" :style="{ width: `${item.percentage || 0}%` }" />
      </div>
    </div>
    <div v-if="c.note" class="hbar-note">
      {{ c.note }}
    </div>
  </div>

  <div v-else-if="type === 'energyWave'" class="energy-wave">
    <div v-if="c.title" class="hbar-group-title">
      {{ c.title }}
    </div>
    <div class="energy-bars-scroll">
      <div class="energy-bars">
        <div v-for="(bar, i) in (c.bars as any[])" :key="i" class="energy-bar-col">
          <div class="energy-bar-track">
            <div
              class="energy-bar" :class="{ hl: bar.isHighlight }"
              :style="{ height: `${bar.height || 10}%`, background: reportColorHex(bar.color) }"
            />
          </div>
          <div class="energy-bar-label">
            {{ bar.label }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="c.bottomLabel" class="energy-bottom">
      {{ c.bottomLabel }}
    </div>
  </div>

  <div v-else-if="type === 'dataTable'">
    <!-- #ifdef H5 -->
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="(h, i) in (c.headers as string[])" :key="i">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in (c.rows as any[][])" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">
            <span v-if="!cell.type || cell.type === 'text'">{{ cell.text }}</span>
            <span v-else-if="cell.type === 'stars'" class="stars">{{ starsText(cell.starsValue) }}</span>
            <span v-else-if="cell.type === 'tag'" class="tag" :class="reportTagClass(cell.tagColor)">{{ cell.text }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <div class="card-list">
      <div v-for="(row, ri) in (c.rows as any[][])" :key="ri" class="card-item">
        <span v-for="(cell, ci) in row" :key="ci">{{ cell.text }} </span>
      </div>
    </div>
    <!-- #endif -->
  </div>

  <div v-else-if="type === 'styledList'" class="card-list">
    <div v-for="(item, i) in (c.items as any[])" :key="i" class="card-item">
      <div v-if="item.boldPrefix" class="card-item-title">
        {{ item.boldPrefix }}
      </div>
      <div class="card-item-text">
        {{ item.text }}
      </div>
    </div>
  </div>

  <div v-else-if="type === 'tagList'" class="keyword-tags">
    <span
      v-for="(item, i) in (c.items as any[])" :key="i"
      class="keyword-tag" :style="tagChipStyle(item.color)"
    >{{ item.text }}</span>
  </div>

  <div v-else-if="type === 'timeline'" class="timeline">
    <div v-for="(item, i) in (c.items as any[])" :key="i" class="timeline-item">
      <div class="timeline-year">
        <span v-if="item.period">{{ item.period }}</span>
        <span v-if="item.title"> {{ item.title }}</span>
      </div>
      <div v-if="item.description" class="timeline-text">
        {{ item.description }}
      </div>
    </div>
  </div>

  <div v-else-if="type === 'upgradePath'" class="phase-progress">
    <div v-for="(step, i) in (c.steps as any[])" :key="i" class="phase-item">
      <div class="phase-dot" :style="phaseStyle(step.color)">
        {{ step.version }}
      </div>
      <div class="phase-content">
        <div class="phase-title">
          {{ step.label }}
        </div>
        <div class="phase-desc">
          {{ step.description }}
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'seasonGrid'" class="dual-cards">
    <div v-for="(s, i) in (c.seasons as any[])" :key="i" class="dual-card">
      <div class="dual-card-title">
        <span v-if="s.icon" class="dual-card-icon">{{ s.icon }}</span>
        <span>{{ s.name }} · {{ s.energy }}</span>
      </div>
      <div class="dual-card-text">
        {{ s.description }}
      </div>
    </div>
  </div>

  <div v-else-if="type === 'card' && isAlertCard(c.variant as string)" class="alert-box">
    <div v-if="c.title" class="alert-title">
      {{ c.title }}
    </div>
    <div class="alert-text">
      <ReportComponentRenderer
        v-for="(child, i) in (c.children as ReportComponent[])"
        :key="i"
        :component="child"
      />
    </div>
  </div>

  <div v-else-if="type === 'card' && c.variant === 'success'" class="success-box">
    <div v-if="c.title" class="success-title">
      {{ c.title }}
    </div>
    <div class="success-text">
      <ReportComponentRenderer
        v-for="(child, i) in (c.children as ReportComponent[])"
        :key="i"
        :component="child"
      />
    </div>
  </div>

  <div v-else-if="type === 'card' && (c.variant === 'gradient' || c.variant === 'highlight')" class="summary-box card-wrap">
    <div v-if="c.title" class="preface-title" style="justify-content: center;">
      {{ c.title }}
    </div>
    <ReportComponentRenderer
      v-for="(child, i) in (c.children as ReportComponent[])"
      :key="i"
      :component="child"
    />
  </div>

  <div v-else-if="type === 'card'" class="card-wrap">
    <div class="card-item">
      <div v-if="c.title" class="card-item-title">
        {{ c.title }}
      </div>
      <ReportComponentRenderer
        v-for="(child, i) in (c.children as ReportComponent[])"
        :key="i"
        :component="child"
      />
    </div>
  </div>

  <div v-else-if="c.content" class="text-block">
    <ReportRichText :html="String(c.content)" />
  </div>
</template>
