import type { DataItem } from 'element-china-area-data'
import { codeToText, regionData } from 'element-china-area-data'

export interface RegionSelection {
  birthPlace: string
  areaCode: string
}

export function getProvinceList(): DataItem[] {
  return regionData
}

export function getCityList(provinceIndex: number): DataItem[] {
  return regionData[provinceIndex]?.children ?? []
}

export function getDistrictList(provinceIndex: number, cityIndex: number): DataItem[] {
  return regionData[provinceIndex]?.children?.[cityIndex]?.children ?? []
}

export function buildRegionSelection(
  provinceIndex: number,
  cityIndex: number,
  districtIndex: number,
): RegionSelection | null {
  const province = regionData[provinceIndex]
  const city = province?.children?.[cityIndex]
  const district = city?.children?.[districtIndex]
  if (!province || !city || !district)
    return null
  return {
    birthPlace: `${province.label}${city.label}${district.label}`,
    areaCode: district.value,
  }
}

export function findRegionIndicesByAreaCode(areaCode: string): [number, number, number] | null {
  if (!areaCode)
    return null
  for (let pi = 0; pi < regionData.length; pi++) {
    const province = regionData[pi]
    for (let ci = 0; ci < (province.children?.length ?? 0); ci++) {
      const city = province.children![ci]
      for (let di = 0; di < (city.children?.length ?? 0); di++) {
        if (city.children![di].value === areaCode)
          return [pi, ci, di]
      }
    }
  }
  return null
}

export function getRegionLabelByCode(areaCode: string): string {
  if (!areaCode)
    return ''
  const province = regionData.find(p =>
    p.children?.some(c => c.children?.some(a => a.value === areaCode)),
  )
  if (!province)
    return codeToText[areaCode] ?? ''
  for (const city of province.children ?? []) {
    for (const area of city.children ?? []) {
      if (area.value === areaCode)
        return `${province.label}${city.label}${area.label}`
    }
  }
  return ''
}
