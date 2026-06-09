import type { CreditPackageId, DirectionValue, FontScale } from '@/constants/guoxin'
import { CREDIT_PACKAGES } from '@/constants/guoxin'
import type { AuthStep } from '@/models/guoxin/auth'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import {
  createJieduTask,
  createProfile as apiCreateProfile,
  deleteProfile as apiDeleteProfile,
  getCredits,
  getJieduRecords,
  getJieduReport,
  getJieduTaskStatus,
  getLatestRecord,
  getProfiles,
  postBindPhone,
  postCreditsPurchase,
  postSmsCode,
  postWxAuthorize,
  postWxSession,
  updateProfile as apiUpdateProfile,
} from '@/api/guoxin'
import { clearGuoxinToken, getGuoxinToken, setGuoxinToken } from '@/api/guoxinHttp'
import { subscribeJieduStream } from '@/api/guoxinStream'
import { RouterPaths } from '@/routerPaths'
import { wxChoosePay } from '@/utils/weixin/pay'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const GUOXIN_OPENID_KEY = 'guoxin-openid'
const GUOXIN_TASK_KEY = 'guoxin-task-id'
const LEGACY_STORE_KEY = 'guoxin-store'

function clearLegacyStorage() {
  try {
    uni.removeStorageSync(LEGACY_STORE_KEY)
  }
  catch {
    // ignore
  }
}

export const useGuoxinStore = defineStore('guoxin', () => {
  const profiles = ref<ProfileVo[]>([])
  const records = ref<RecordVo[]>([])
  const credits = ref(0)
  const latestRecord = ref<RecordVo | null>(null)
  const activeProfileId = ref('')
  const activeRecordId = ref('')
  const taskId = ref('')
  const fontScale = ref<FontScale>('standard')
  const authStep = ref<AuthStep>('anonymous')
  const openid = ref('')
  const loading = ref(false)

  const isLoggedIn = computed(() => authStep.value === 'ready')
  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) ?? null,
  )

  function persistAuth(token: string, oid: string) {
    setGuoxinToken(token)
    uni.setStorageSync(GUOXIN_OPENID_KEY, oid)
    openid.value = oid
    authStep.value = 'ready'
  }

  function clearAuth() {
    clearGuoxinToken()
    uni.removeStorageSync(GUOXIN_OPENID_KEY)
    openid.value = ''
    authStep.value = 'anonymous'
    profiles.value = []
    records.value = []
    credits.value = 0
    latestRecord.value = null
  }

  function clearPendingTask() {
    taskId.value = ''
    uni.removeStorageSync(GUOXIN_TASK_KEY)
  }

  async function tryRestoreSession() {
    clearLegacyStorage()
    const token = getGuoxinToken()
    const oid = uni.getStorageSync(GUOXIN_OPENID_KEY) || ''
    if (!token || !oid)
      return false
    openid.value = oid
    try {
      const res = await postWxSession({ openid: oid })
      if (res.data.step === 'ready' && res.data.token) {
        persistAuth(res.data.token, res.data.openid)
        await bootstrap()
        return true
      }
      clearAuth()
      return false
    }
    catch {
      clearAuth()
      return false
    }
  }

  /** 业务子页门禁：未登录返回 false */
  async function requireAuthForPage(): Promise<boolean> {
    let step = await ensureAuth()
    if (step === 'need_wx_auth')
      step = await mockWxAuthorize()
    return step === 'ready'
  }

  async function initWxSession(oid?: string) {
    const res = await postWxSession({ openid: oid || openid.value || undefined })
    const data = res.data
    openid.value = data.openid
    if (data.step === 'ready' && data.token) {
      persistAuth(data.token, data.openid)
      return 'ready' as const
    }
    if (data.step === 'need_wx_auth') {
      authStep.value = 'need_wx_auth'
      return 'need_wx_auth' as const
    }
    authStep.value = 'need_phone'
    return 'need_phone' as const
  }

  async function mockWxAuthorize() {
    const res = await postWxAuthorize()
    openid.value = res.data.openid
    return initWxSession(res.data.openid)
  }

  async function sendSmsCode(phone: string) {
    await postSmsCode({ phone })
  }

  async function bindPhone(phone: string, smsCode: string) {
    const res = await postBindPhone({ openid: openid.value, phone, smsCode })
    persistAuth(res.data.token, openid.value)
    await bootstrap()
  }

  /** 确保已登录；返回是否 ready */
  async function ensureAuth(): Promise<'ready' | 'need_phone' | 'need_wx_auth'> {
    if (isLoggedIn.value)
      return 'ready'
    const token = getGuoxinToken()
    if (token) {
      const ok = await tryRestoreSession()
      if (ok)
        return 'ready'
    }
    return initWxSession()
  }

  async function bootstrap() {
    if (!isLoggedIn.value)
      return
    loading.value = true
    try {
      const [pRes, cRes, lRes] = await Promise.all([
        getProfiles(),
        getCredits(),
        getLatestRecord(),
      ])
      profiles.value = pRes.data
      credits.value = cRes.data.credits
      latestRecord.value = lRes.data
      if (!activeProfileId.value && profiles.value.length)
        activeProfileId.value = profiles.value[0].id
    }
    catch (err: unknown) {
      if (err && typeof err === 'object' && 'needAuth' in err)
        clearAuth()
      throw err
    }
    finally {
      loading.value = false
    }
  }

  function getProfileById(id: string) {
    return profiles.value.find(p => p.id === id) ?? null
  }

  async function fetchProfiles() {
    const res = await getProfiles()
    profiles.value = res.data
  }

  async function fetchRecords(profileId: string) {
    const res = await getJieduRecords(profileId)
    records.value = res.data
  }

  async function fetchCredits() {
    const res = await getCredits()
    credits.value = res.data.credits
  }

  async function createProfile(dto: CreateProfileDto) {
    const res = await apiCreateProfile(dto)
    await fetchProfiles()
    activeProfileId.value = res.data.id
    return res.data
  }

  async function updateProfile(id: string, dto: CreateProfileDto) {
    const res = await apiUpdateProfile(id, dto)
    await fetchProfiles()
    return res.data
  }

  async function deleteProfile(id: string) {
    await apiDeleteProfile(id)
    await fetchProfiles()
    if (activeProfileId.value === id)
      activeProfileId.value = profiles.value[0]?.id ?? ''
  }

  function setActiveProfile(profileId: string) {
    activeProfileId.value = profileId
  }

  function navigateToSetup(profileId?: string) {
    if (profileId)
      activeProfileId.value = profileId
    uni.navigateTo({ url: RouterPaths.jieduSetup })
  }

  async function confirmJiedu(directions: DirectionValue[], userQuestion?: string) {
    if (directions.length === 0) {
      uni.showToast({ title: '请至少选择一个关注方向', icon: 'none' })
      return false
    }
    if (credits.value <= 0) {
      uni.navigateTo({ url: RouterPaths.credits })
      return false
    }
    if (!activeProfileId.value) {
      uni.showToast({ title: '请先选择档案', icon: 'none' })
      return false
    }
    try {
      const res = await createJieduTask({
        profileId: activeProfileId.value,
        directions,
        userQuestion,
      })
      taskId.value = res.data.taskId
      uni.setStorageSync(GUOXIN_TASK_KEY, res.data.taskId)
      uni.navigateTo({ url: RouterPaths.jieduProcessing })
      return true
    }
    catch {
      return false
    }
  }

  async function fetchReport(recordId: string) {
    const res = await getJieduReport(recordId)
    return res.data
  }

  function getTaskIdFromStorage() {
    return taskId.value || uni.getStorageSync(GUOXIN_TASK_KEY) || ''
  }

  async function runJieduStream(
    onStep: (index: number) => void,
    signal?: AbortSignal,
    onDelta?: (text: string) => void,
  ): Promise<string | null> {
    const tid = getTaskIdFromStorage()
    if (!tid)
      return null

    return new Promise((resolve) => {
      subscribeJieduStream(tid, {
        onStep: (data) => onStep(data.index),
        onDelta: (data) => onDelta?.(data.text),
        onDone: (data) => {
          void (async () => {
            activeRecordId.value = data.recordId
            clearPendingTask()
            await fetchCredits()
            await bootstrap()
            resolve(data.recordId)
          })()
        },
        onError: (data) => {
          uni.showToast({ title: data.msg, icon: 'none' })
          resolve(null)
        },
      }, signal).catch(() => resolve(null))
    })
  }

  async function resumeProcessingTask(): Promise<'complete' | 'stream' | 'setup' | null> {
    const tid = getTaskIdFromStorage()
    if (!tid)
      return null
    taskId.value = tid
    try {
      const res = await getJieduTaskStatus(tid)
      if (res.data.status === 'done' && res.data.recordId) {
        activeRecordId.value = res.data.recordId
        clearPendingTask()
        return 'complete'
      }
      if (res.data.status === 'streaming' || res.data.status === 'pending')
        return 'stream'
      return 'setup'
    }
    catch {
      return 'setup'
    }
  }

  async function purchaseCredits(pkgId: CreditPackageId): Promise<boolean> {
    const pkg = CREDIT_PACKAGES.find(p => p.id === pkgId)
    if (!pkg)
      return false

    const useMock = import.meta.env.VITE_USE_MOCK === 'true'
    if (useMock) {
      try {
        await postCreditsPurchase(pkgId)
        await fetchCredits()
        uni.showToast({ title: '开通成功', icon: 'success' })
        return true
      }
      catch {
        return false
      }
    }

    try {
      await wxChoosePay({ orderId: pkg.id, amount: Math.round(pkg.price * 100), description: pkg.name })
      await postCreditsPurchase(pkgId)
      await fetchCredits()
      uni.showToast({ title: '开通成功', icon: 'success' })
      return true
    }
    catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (code === 'cancel')
        return false
      uni.showToast({ title: '支付失败', icon: 'none' })
      return false
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

  return {
    profiles,
    records,
    credits,
    latestRecord,
    activeProfileId,
    activeRecordId,
    taskId,
    fontScale,
    authStep,
    openid,
    loading,
    isLoggedIn,
    activeProfile,
    tryRestoreSession,
    ensureAuth,
    mockWxAuthorize,
    sendSmsCode,
    bindPhone,
    bootstrap,
    getProfileById,
    fetchProfiles,
    fetchRecords,
    fetchCredits,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    navigateToSetup,
    confirmJiedu,
    fetchReport,
    runJieduStream,
    resumeProcessingTask,
    purchaseCredits,
    setFontScale,
    clearAuth,
    clearPendingTask,
    requireAuthForPage,
  }
}, {
  persist: {
    key: 'guoxin-ui',
    storage: localStorage,
    pick: ['fontScale', 'activeProfileId'],
  },
})
