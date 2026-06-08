import type { CreditPackageId, DirectionValue, FontScale } from '@/constants/guoxin'
import { CREDIT_PACKAGES } from '@/constants/guoxin'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { RouterPaths } from '@/routerPaths'
import { wxChoosePay } from '@/utils/weixin/pay'
import { DEFAULT_PROFILES, DEFAULT_RECORDS, normalizeSeedProfile } from '@/utils/guoxin/seedData'
import { formatNowTime, formatRecordTitle, generateDynamicReportContent } from '@/utils/guoxin/reportGenerator'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useGuoxinStore = defineStore('guoxin', () => {
  const profiles = ref<ProfileVo[]>([])
  const records = ref<RecordVo[]>([])
  const credits = ref(99)
  const activeProfileId = ref('')
  const activeRecordId = ref('')
  const selectedDirections = ref<DirectionValue[]>([])
  const fontScale = ref<FontScale>('standard')
  const isLoggedIn = ref(false)

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) ?? null,
  )

  const latestRecord = computed(() => records.value[0] ?? null)

  function initSeedData() {
    if (profiles.value.length === 0) {
      profiles.value = DEFAULT_PROFILES.map(normalizeSeedProfile)
      records.value = [...DEFAULT_RECORDS]
      activeProfileId.value = profiles.value[0]?.id ?? ''
    }
    else if (!activeProfileId.value || !profiles.value.some(p => p.id === activeProfileId.value)) {
      activeProfileId.value = profiles.value[0]?.id ?? ''
    }
    if (credits.value <= 0) {
      credits.value = 99
    }
    setFontScale(fontScale.value)
  }

  function getProfileById(id: string) {
    return profiles.value.find(p => p.id === id) ?? null
  }

  function getRecordsByProfileId(profileId: string) {
    return records.value.filter(r => r.profileId === profileId)
  }

  function getRecordById(id: string) {
    const record = records.value.find(r => r.id === id)
    if (!record)
      return null
    if (!record.content) {
      const profile = getProfileById(record.profileId)
      if (profile)
        record.content = generateDynamicReportContent(profile, record.directions)
    }
    return record
  }

  function createProfile(dto: CreateProfileDto): ProfileVo {
    const profile: ProfileVo = {
      id: `p_${Date.now()}`,
      ...dto,
      jieduCount: 0,
      lastJieduTime: '无',
    }
    profiles.value.push(profile)
    activeProfileId.value = profile.id
    return profile
  }

  function updateProfile(id: string, dto: CreateProfileDto): ProfileVo | null {
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx === -1)
      return null
    const existing = profiles.value[idx]
    const updated: ProfileVo = {
      ...existing,
      ...dto,
    }
    profiles.value[idx] = updated
    return updated
  }

  function deleteProfile(id: string) {
    profiles.value = profiles.value.filter(p => p.id !== id)
    records.value = records.value.filter(r => r.profileId !== id)
    if (activeProfileId.value === id) {
      activeProfileId.value = profiles.value[0]?.id ?? ''
    }
  }

  function setActiveProfile(profileId: string) {
    activeProfileId.value = profileId
  }

  function resolveStartProfile(): Promise<string | null> {
    initSeedData()
    if (profiles.value.length === 0)
      return Promise.resolve(null)
    if (profiles.value.length === 1) {
      activeProfileId.value = profiles.value[0].id
      return Promise.resolve(profiles.value[0].id)
    }
    return new Promise((resolve) => {
      uni.showActionSheet({
        itemList: profiles.value.map(p => `${p.name}（${p.relationText}）`),
        success: (res) => {
          const profile = profiles.value[res.tapIndex]
          if (profile) {
            activeProfileId.value = profile.id
            resolve(profile.id)
          }
          else {
            resolve(null)
          }
        },
        fail: () => resolve(null),
      })
    })
  }

  function navigateToSetup(profileId?: string) {
    if (profileId)
      activeProfileId.value = profileId
    uni.navigateTo({ url: RouterPaths.jieduSetup })
  }

  async function startJieduFromHome() {
    initSeedData()
    if (profiles.value.length === 0) {
      uni.navigateTo({ url: RouterPaths.profileCreate })
      return
    }
    const id = await resolveStartProfile()
    if (id)
      navigateToSetup(id)
  }

  function confirmJiedu(directions: DirectionValue[]): boolean {
    if (directions.length === 0) {
      uni.showToast({ title: '请至少选择一个关注方向', icon: 'none' })
      return false
    }
    if (credits.value <= 0) {
      uni.navigateTo({ url: RouterPaths.credits })
      return false
    }
    selectedDirections.value = [...directions]
    uni.navigateTo({ url: RouterPaths.jieduProcessing })
    return true
  }

  function completeJiedu() {
    const profile = activeProfile.value
    if (!profile || selectedDirections.value.length === 0)
      return null
    if (credits.value <= 0) {
      uni.showToast({ title: '解读次数不足', icon: 'none' })
      uni.redirectTo({ url: RouterPaths.credits })
      return null
    }

    credits.value -= 1
    const timeStr = formatNowTime()
    const content = generateDynamicReportContent(profile, selectedDirections.value)
    const newRecord: RecordVo = {
      id: `r_${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      title: formatRecordTitle(selectedDirections.value),
      time: timeStr,
      directions: [...selectedDirections.value],
      content,
    }

    profile.jieduCount += 1
    profile.lastJieduTime = timeStr
    records.value.unshift(newRecord)
    activeRecordId.value = newRecord.id
    selectedDirections.value = []
    return newRecord
  }

  async function purchaseCredits(pkgId: CreditPackageId): Promise<boolean> {
    const pkg = CREDIT_PACKAGES.find(p => p.id === pkgId)
    if (!pkg)
      return false

    try {
      await wxChoosePay({ orderId: pkg.id, amount: Math.round(pkg.price * 100), description: pkg.name })
      credits.value += pkg.amount
      uni.showToast({ title: '开通成功', icon: 'success' })
      return true
    }
    catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (code === 'cancel')
        return false

      await new Promise<void>((resolve) => {
        uni.showModal({
          title: '模拟支付',
          content: `【演示】已成功购买：${pkg.name}\n解读次数 +${pkg.amount}`,
          showCancel: false,
          success: () => resolve(),
        })
      })
      credits.value += pkg.amount
      uni.showToast({ title: '开通成功', icon: 'success' })
      return true
    }
  }

  function setFontScale(scale: FontScale) {
    fontScale.value = scale
    // #ifdef H5
    const root = document.documentElement
    root.classList.remove('gx-scale-large', 'gx-scale-xlarge')
    if (scale === 'large')
      root.classList.add('gx-scale-large')
    if (scale === 'xlarge')
      root.classList.add('gx-scale-xlarge')
    // #endif
  }

  function addCredits(amount: number) {
    credits.value += amount
  }

  return {
    profiles,
    records,
    credits,
    activeProfileId,
    activeRecordId,
    selectedDirections,
    fontScale,
    isLoggedIn,
    activeProfile,
    latestRecord,
    initSeedData,
    getProfileById,
    getRecordsByProfileId,
    getRecordById,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    resolveStartProfile,
    navigateToSetup,
    startJieduFromHome,
    confirmJiedu,
    completeJiedu,
    purchaseCredits,
    setFontScale,
    addCredits,
  }
}, {
  persist: {
    key: 'guoxin-store',
    storage: localStorage,
    pick: ['profiles', 'records', 'credits', 'activeProfileId', 'selectedDirections', 'fontScale', 'isLoggedIn'],
  },
})
