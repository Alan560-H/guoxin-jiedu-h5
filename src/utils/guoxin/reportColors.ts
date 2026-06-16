import type { ReportColorToken } from '@/models/guoxin/reportContent'

const FILL_CLASS: Record<string, string> = {
  gold: 'fill-gold',
  fire: 'fill-gold',
  water: 'fill-blue',
  wood: 'fill-green',
  earth: 'fill-orange',
  metal: 'fill-purple',
  danger: 'fill-red',
  warning: 'fill-orange',
  success: 'fill-green',
  accent: 'fill-cyan',
  cyan: 'fill-cyan',
  purple: 'fill-purple',
  pink: 'fill-pink',
  orange: 'fill-orange',
}

const TAG_CLASS: Record<string, string> = {
  gold: 'tag-gold',
  fire: 'tag-gold',
  water: 'tag-blue',
  wood: 'tag-green',
  earth: 'tag-orange',
  metal: 'tag-purple',
  danger: 'tag-red',
  warning: 'tag-orange',
  success: 'tag-green',
  accent: 'tag-blue',
}

const HEX: Record<string, string> = {
  gold: '#B9945F',
  fire: '#C4784A',
  water: '#4a9eff',
  wood: '#4ade80',
  earth: '#fb923c',
  metal: '#a78bfa',
  danger: '#f87171',
  warning: '#fb923c',
  success: '#4ade80',
  accent: '#22d3ee',
  cyan: '#22d3ee',
  purple: '#a78bfa',
  pink: '#f472b6',
  orange: '#fb923c',
}

export function reportFillClass(color?: ReportColorToken | string): string {
  if (!color)
    return 'fill-gold'
  return FILL_CLASS[color] || 'fill-gold'
}

export function reportTagClass(color?: ReportColorToken | string): string {
  if (!color)
    return 'tag-gold'
  return TAG_CLASS[color] || 'tag-gold'
}

export function reportColorHex(color?: ReportColorToken | string): string {
  if (!color)
    return '#B9945F'
  return HEX[color] || '#B9945F'
}
