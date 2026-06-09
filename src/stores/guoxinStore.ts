import type { CreditPackageId, DirectionValue, FontScale } from '@/constants/guoxin'
import { CREDIT_PACKAGES } from '@/constants/guoxin'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { RouterPaths } from '@/routerPaths'
import { wxChoosePay } from '@/utils/weixin/pay'
import { DEFAULT_PROFILES, DEFAULT_RECORDS, normalizeSeedProfile } from '@/utils/guoxin/seedData'
import { formatNowTime, formatRecordTitle, generateDynamicReportContent } from '@/utils/guoxin/reportGenerator'
import { login as apiLogin, loginBySms as apiLoginBySms, wxLogin as apiWxLogin, sendSmsCode as apiSendSmsCode, bindMobile as apiBindMobile, getUserInfo, getProducts, getAvailableCount, generateReport as apiGenerateReport, getTaskStatus, getReports, getReportDetail } from '@/api/guoxin'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useGuoxinStore = defineStore('guoxin', () => {
  const profiles = ref<ProfileVo[]>([])
  const records = ref<RecordVo[]>([])
  const credits = ref(99)
  const activeProfileId = ref('')
  const activeRecordId = ref('')
  const selectedDirections = ref<DirectionValue[]>([])
  const userQuestion = ref('')
  const fontScale = ref<FontScale>('standard')
  const isLoggedIn = ref(false)

  // ---- 后端集成状态 ----
  const userId = ref<number | null>(null)
  const mobile = ref<string>('')
  const bindStatus = ref<number>(0)
  const token = ref<string>('')
  const serverProducts = ref<any[]>([])
  const serverReports = ref<any[]>([])
  const totalAvailableCount = ref<number>(0)
  const useRemoteApi = ref(true) // 是否启用远程API

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

  function confirmJiedu(directions: DirectionValue[], question?: string): boolean {
    if (directions.length === 0) {
      uni.showToast({ title: '请至少选择一个关注方向', icon: 'none' })
      return false
    }
    if (useRemoteApi.value) {
      // 远程模式：检查后端可用次数
      if (totalAvailableCount.value <= 0 && serverProducts.value.length > 0) {
        uni.navigateTo({ url: RouterPaths.credits })
        return false
      }
    } else if (credits.value <= 0) {
      uni.navigateTo({ url: RouterPaths.credits })
      return false
    }
    userQuestion.value = question?.trim() || ''
    selectedDirections.value = [...directions]
    uni.navigateTo({ url: RouterPaths.jieduProcessing })
    return true
  }

  function completeJiedu() {
    const profile = activeProfile.value
    if (!profile || selectedDirections.value.length === 0)
      return null
    if (!useRemoteApi.value) {
      // 本地模式
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
    // 远程模式：由 processing 页面调用 doGenerateReport + pollTaskStatus
    return null
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

  // ---- 后端集成方法 ----

  /** 启用远程API模式 */
  function enableRemoteApi() {
    useRemoteApi.value = true
  }

  /** 发送短信验证码 */
  async function doSendSmsCode(mobileStr: string): Promise<boolean> {
    if (!useRemoteApi.value) {
      // 本地演示模式
      return true
    }
    try {
      const res = await apiSendSmsCode({ mobile: mobileStr })
      if (res.code === 200) {
        return true
      } else {
        uni.showToast({ title: res.msg || '发送失败', icon: 'none' })
        return false
      }
    } catch (e: any) {
      console.error('发送验证码失败', e)
      uni.showToast({ title: e?.message || '发送失败', icon: 'none' })
      return false
    }
  }

  /** 短信验证码登录 */
  async function doLoginBySms(mobileStr: string, smsCode: string) {
    if (!useRemoteApi.value) {
      // 本地演示模式
      isLoggedIn.value = true
      userId.value = Date.now()
      mobile.value = mobileStr
      bindStatus.value = 1
      return
    }
    try {
      const res = await apiLoginBySms({ mobile: mobileStr, smsCode })
      if (res.code === 200 && res.data) {
        userId.value = res.data.userId
        mobile.value = res.data.mobile || mobileStr
        bindStatus.value = res.data.bindStatus || 1
        // 存储JWT Token
        if (res.data.token) {
          token.value = res.data.token
          uni.setStorageSync('apph5Token', res.data.token)
        }
        isLoggedIn.value = true
      } else {
        throw new Error(res.msg || '登录失败')
      }
    } catch (e) {
      console.error('登录失败', e)
      throw e
    }
  }

  /** 微信登录 */
  async function doLogin(openid: string, unionid?: string, nickname?: string, avatarUrl?: string) {
    if (!useRemoteApi.value) {
      // 本地演示模式
      isLoggedIn.value = true
      userId.value = Date.now()
      return
    }
    try {
      const res = await apiLogin({ openid, unionid, nickname, avatarUrl })
      if (res.code === 200 && res.data) {
        userId.value = res.data.userId
        mobile.value = res.data.mobile || ''
        bindStatus.value = res.data.bindStatus || 0
        // 存储JWT Token
        if (res.data.token) {
          token.value = res.data.token
          uni.setStorageSync('apph5Token', res.data.token)
        }
        isLoggedIn.value = true
      }
    } catch (e) {
      console.error('登录失败', e)
      throw e
    }
  }

  /** 微信网页授权登录（code换用户信息） */
  async function doWxLogin(code: string): Promise<{ needBindMobile: boolean }> {
    if (!useRemoteApi.value) {
      // 本地演示模式
      isLoggedIn.value = true
      userId.value = Date.now()
      return { needBindMobile: false }
    }
    try {
      const res = await apiWxLogin({ code })
      if (res.code === 200 && res.data) {
        userId.value = res.data.userId
        mobile.value = res.data.mobile || ''
        bindStatus.value = res.data.bindStatus || 0
        // 存储JWT Token
        if (res.data.token) {
          token.value = res.data.token
          uni.setStorageSync('apph5Token', res.data.token)
        }
        isLoggedIn.value = true
        return { needBindMobile: !!res.data.needBindMobile }
      } else {
        throw new Error(res.msg || '微信登录失败')
      }
    } catch (e) {
      console.error('微信登录失败', e)
      throw e
    }
  }

  /** 绑定手机号（需短信验证码） */
  async function doBindMobile(mobileStr: string) {
    if (!useRemoteApi.value || !userId.value) return
    try {
      const res = await apiBindMobile({ userId: userId.value, mobile: mobileStr, smsCode: '' })
      if (res.code === 200) {
        mobile.value = mobileStr
        bindStatus.value = 1
      }
    } catch (e) {
      console.error('绑定手机号失败', e)
    }
  }

  /** 绑定手机号（带短信验证码） */
  async function doBindMobileWithSms(mobileStr: string, smsCode: string) {
    if (!userId.value) {
      throw new Error('用户未登录')
    }
    const res = await apiBindMobile({ userId: userId.value, mobile: mobileStr, smsCode })
    if (res.code === 200) {
      mobile.value = mobileStr
      bindStatus.value = 1
      // 绑定成功后更新Token（后端会返回新token）
      if (res.data && res.data.token) {
        token.value = res.data.token
        uni.setStorageSync('apph5Token', res.data.token)
      }
    } else {
      throw new Error(res.msg || '绑定失败')
    }
  }

  /** 加载商品列表 */
  async function loadProducts() {
    if (!useRemoteApi.value) return
    try {
      const res = await getProducts()
      if (res.code === 200 && res.data) {
        serverProducts.value = res.data
      }
    } catch (e) {
      console.error('加载商品失败', e)
    }
  }

  /** 刷新可用权益次数 */
  async function refreshAvailableCount(productId?: number) {
    if (!useRemoteApi.value || !userId.value) return
    if (!productId && serverProducts.value.length > 0) {
      productId = serverProducts.value[0].id
    }
    if (!productId) return
    try {
      const res = await getAvailableCount(productId)
      if (res.code === 200 && res.data) {
        totalAvailableCount.value = res.data.availableCount || 0
        credits.value = totalAvailableCount.value
      }
    } catch (e) {
      console.error('刷新可用次数失败', e)
    }
  }

  /** 加载用户报告列表 */
  async function loadReports() {
    if (!useRemoteApi.value || !userId.value) return
    try {
      const res = await getReports()
      if (res.code === 200 && res.data) {
        serverReports.value = res.data
      }
    } catch (e) {
      console.error('加载报告列表失败', e)
    }
  }

  /** 提交报告生成 */
  async function doGenerateReport(productId: number, inputJson?: string) {
    if (!useRemoteApi.value || !userId.value) return null
    try {
      const res = await apiGenerateReport({ productId, inputJson })
      if (res.code === 200 && res.data) {
        return res.data
      } else {
        uni.showToast({ title: res.msg || '生成失败', icon: 'none' })
      }
    } catch (e) {
      console.error('生成报告失败', e)
    }
    return null
  }

  /** 轮询任务状态 */
  async function pollTaskStatus(taskId: number, maxRetries = 30, interval = 3000): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await getTaskStatus(taskId)
        if (res.code === 200 && res.data) {
          const status = res.data.status
          if (status === 'success' || status === 'failed') {
            return res.data
          }
        }
      } catch (e) {
        console.error('查询任务状态失败', e)
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }
    return null
  }

  /** 加载用户信息 */
  async function loadUserInfo() {
    if (!useRemoteApi.value || !userId.value) return
    try {
      const res = await getUserInfo()
      if (res.code === 200 && res.data) {
        mobile.value = res.data.mobile || ''
        bindStatus.value = res.data.bindStatus || 0
      }
    } catch (e) {
      console.error('加载用户信息失败', e)
    }
  }

  /** 初始化远程数据（登录后调用） */
  async function initRemoteData() {
    if (!useRemoteApi.value) return
    await loadProducts()
    if (serverProducts.value.length > 0) {
      await refreshAvailableCount(serverProducts.value[0].id)
    }
    await loadReports()
  }

  /** 将后端报告映射为本地 RecordVo 格式 */
  function mapServerReportToRecord(report: any): RecordVo {
    return {
      id: String(report.id),
      profileId: activeProfileId.value || 'server',
      profileName: report.reportName || '命理报告',
      title: report.reportName || '命理报告',
      time: report.createTime || '',
      directions: [],
      content: report._content || [],
      status: report.status,
    }
  }

  /** 加载报告详情 */
  async function loadReportDetail(reportId: number): Promise<any> {
    if (!useRemoteApi.value || !userId.value) return null
    try {
      const res = await getReportDetail(reportId)
      if (res.code === 200 && res.data) {
        return res.data
      }
    } catch (e) {
      console.error('加载报告详情失败', e)
    }
    return null
  }

  return {
    profiles,
    records,
    credits,
    activeProfileId,
    activeRecordId,
    selectedDirections,
    userQuestion,
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
    // 后端集成
    userId,
    mobile,
    bindStatus,
    token,
    serverProducts,
    serverReports,
    totalAvailableCount,
    useRemoteApi,
    enableRemoteApi,
    doSendSmsCode,
    doLoginBySms,
    doWxLogin,
    doLogin,
    doBindMobile,
    doBindMobileWithSms,
    loadProducts,
    refreshAvailableCount,
    loadReports,
    doGenerateReport,
    pollTaskStatus,
    loadUserInfo,
    initRemoteData,
    mapServerReportToRecord,
    loadReportDetail,
  }
}, {
  persist: {
    key: 'guoxin-store',
    storage: localStorage,
    pick: ['profiles', 'records', 'credits', 'activeProfileId', 'selectedDirections', 'fontScale', 'isLoggedIn', 'userId', 'mobile', 'token', 'useRemoteApi'],
  },
})
