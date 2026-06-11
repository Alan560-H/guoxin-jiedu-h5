<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  buildRegionSelection,
  findRegionIndicesByAreaCode,
  getCityList,
  getDistrictList,
  getProvinceList,
} from '@/utils/guoxin/chinaRegion'

const props = withDefaults(defineProps<{
  birthPlace?: string
  areaCode?: string
  placeholder?: string
}>(), {
  birthPlace: '',
  areaCode: '',
  placeholder: '请选择省 / 市 / 区',
})

const emit = defineEmits<{
  change: [payload: { birthPlace: string, areaCode: string }]
}>()

const regionIndex = ref<[number, number, number]>([0, 0, 0])

const provinceList = getProvinceList()

const cityList = computed(() => getCityList(regionIndex.value[0]))
const districtList = computed(() =>
  getDistrictList(regionIndex.value[0], regionIndex.value[1]),
)

const regionLabels = computed(() => [
  provinceList.map(p => p.label),
  cityList.value.map(c => c.label),
  districtList.value.map(d => d.label),
])

const displayText = computed(() => {
  if (props.birthPlace)
    return props.birthPlace
  if (props.areaCode) {
    const sel = buildRegionSelection(
      regionIndex.value[0],
      regionIndex.value[1],
      regionIndex.value[2],
    )
    return sel?.birthPlace ?? props.placeholder
  }
  return props.placeholder
})

function syncIndexFromProps() {
  if (props.areaCode) {
    const found = findRegionIndicesByAreaCode(props.areaCode)
    if (found) {
      regionIndex.value = found
      return
    }
  }
  regionIndex.value = [0, 0, 0]
}

watch(() => props.areaCode, syncIndexFromProps, { immediate: true })

function onColumnChange(e: { detail: { column: number, value: number } }) {
  const { column, value } = e.detail
  const next: [number, number, number] = [...regionIndex.value]
  if (column === 0) {
    next[0] = value
    next[1] = 0
    next[2] = 0
  }
  else if (column === 1) {
    next[1] = value
    next[2] = 0
  }
  else {
    next[2] = value
  }
  regionIndex.value = next
}

function onChange() {
  const sel = buildRegionSelection(
    regionIndex.value[0],
    regionIndex.value[1],
    regionIndex.value[2],
  )
  if (sel)
    emit('change', sel)
}
</script>

<template>
  <picker
    mode="multiSelector"
    :range="regionLabels"
    :value="regionIndex"
    class="gx-region-picker"
    @columnchange="onColumnChange"
    @change="onChange"
  >
    <view class="select-trigger-box">
      <text :class="{ 'placeholder-color': !birthPlace && !areaCode }">
        {{ displayText }}
      </text>
      <text class="picker-arrow">›</text>
    </view>
  </picker>
</template>

<style scoped lang="scss">
.gx-region-picker {
  width: 100%;
}

.select-trigger-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid rgba(185, 148, 95, 0.32);
  background: rgba(255, 253, 248, 0.92);
  border-radius: 20rpx;
  height: 96rpx;
  font-size: 28rpx;
  padding: 0 32rpx;
  color: #241f19;
  box-sizing: border-box;

  .placeholder-color {
    color: #958878;
  }

  .picker-arrow {
    font-size: 38rpx;
    color: #b9945f;
  }
}
</style>
