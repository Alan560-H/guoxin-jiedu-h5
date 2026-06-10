import type { CreditPackageId, DirectionValue, FontScale } from '@/constants/guoxin'
import { CREDIT_PACKAGES } from '@/constants/guoxin'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { RouterPaths } from '@/routerPaths'
import { wxChoosePay } from '@/utils/weixin/pay'
import { DEFAULT_PROFILES, DEFAULT_RECORDS, normalizeSeedProfile } from '@/utils/guoxin/seedData'
import { formatNowTime, formatRecordTitle, generateDynamicReportContent } from '@/utils/guoxin/reportGenerator'
import { login as apiLogin, wxLogin as apiWxLogin, sendSmsCode as apiSendSmsCode, bindMobile as apiBindMobile, getUserInfo, getProducts, getAvailableCount, generateReport as apiGenerateReport, getTaskStatus, getReports, getReadingRecords, getCredits, getReportDetail, getProfiles as apiGetProfiles, createProfile as apiCreateProfile, updateProfile as apiUpdateProfile, deleteProfile as apiDeleteProfile, getDictData as apiGetDictData } from '@/api/guoxin'
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
  const openId = ref<string>('')
  const serverProducts = ref<any[]>([])
  const serverReports = ref<any[]>([])
  const readingRecords = ref<any[]>([])
  const totalAvailableCount = ref<number>(0)
  const activeProductId = ref<number | null>(null)
  const useRemoteApi = ref(true) // 是否启用远程API
  const relationOptions = ref<Array<{ value: string; label: string }>>([]) // 关系选项（从字典加载）

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) ?? null,
  )

  const displayCredits = computed(() =>
    useRemoteApi.value && isLoggedIn.value ? totalAvailableCount.value : credits.value,
  )

  const latestRecord = computed(() => {
    if (useRemoteApi.value && isLoggedIn.value && readingRecords.value.length > 0) {
      const latest = readingRecords.value[0]
      return {
        id: String(latest.id),
        profileId: latest.profileId ? String(latest.profileId) : '',
        profileName: latest.profileName || '',
        title: latest.title || '解读报告',
        time: latest.time || '',
        directions: latest.directions || [],
        content: null,
        status: latest.status,
      }
    }
    if (useRemoteApi.value && isLoggedIn.value && serverReports.value.length > 0)
      return mapServerReportToRecord(serverReports.value[0])
    return records.value[0] ?? null
  })

  function hasNoCredits() {
    if (useRemoteApi.value && isLoggedIn.value)
      return totalAvailableCount.value <= 0
    return credits.value <= 0
  }

  function initSeedData() {
    if (!useRemoteApi.value) {
      if (profiles.value.length === 0) {
        profiles.value = DEFAULT_PROFILES.map(normalizeSeedProfile)
        records.value = [...DEFAULT_RECORDS]
        activeProfileId.value = profiles.value[0]?.id ?? ''
      }
      else if (!activeProfileId.value || !profiles.value.some(p => p.id === activeProfileId.value)) {
        activeProfileId.value = profiles.value[0]?.id ?? ''
      }
      if (credits.value <= 0)
        credits.value = 99
    }
    setFontScale(fontScale.value)
  }

  /** 写入登录/用户信息接口返回的会话（token 由登录接口写入；用户信息里含 openid） */
  function applySessionFromLoginData(data: {
    userId?: number
    mobile?: string
    bindStatus?: number
    token?: string
    openId?: string
    openid?: string
  }) {
    if (data.userId != null)
      userId.value = data.userId
    mobile.value = data.mobile || ''
    bindStatus.value = data.bindStatus ?? 0
    if (data.token) {
      token.value = data.token
      uni.setStorageSync('apph5Token', data.token)
    }
    const oid = data.openId ?? data.openid
    if (oid)
      openId.value = oid
    isLoggedIn.value = true
  }

  /** 401 或登出时清空远程会话（与 apph5Token 同步） */
  function clearSession() {
    isLoggedIn.value = false
    userId.value = null
    mobile.value = ''
    bindStatus.value = 0
    token.value = ''
    openId.value = ''
    serverProducts.value = []
    serverReports.value = []
    readingRecords.value = []
    totalAvailableCount.value = 0
    activeProductId.value = null
    try {
      uni.removeStorageSync('apph5Token')
    }
    catch {
      // ignore
    }
  }

  /**
   * 再次进入：本地 token → getUserInfo 拉用户信息（含 openid 字段）。
   * 微信授权回调（URL 带 code）由首页 wxLogin 处理，不在此函数内。
   */
  async function tryRestoreSession(): Promise<boolean> {
    if (!useRemoteApi.value)
      return isLoggedIn.value

    const savedToken = uni.getStorageSync('apph5Token')
    if (!savedToken) {
      if (isLoggedIn.value)
        clearSession()
      return false
    }

    token.value = savedToken
    try {
      const res = await getUserInfo()
      if (res.code === 200 && res.data) {
        applySessionFromLoginData({
          userId: res.data.userId,
          mobile: res.data.mobile,
          bindStatus: res.data.bindStatus,
          openId: res.data.openId ?? res.data.openid,
        })
        await initRemoteData()
        return true
      }
    }
    catch {
      // token 失效
    }

    clearSession()
    return false
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
    // 同步到后端（后端从JWT解析userId）
    if (useRemoteApi.value) {
      apiCreateProfile(dto).then(res => {
        if (res.code === 200 && res.data && res.data.id) {
          // 用后端真实ID替换本地临时ID
          const idx = profiles.value.findIndex(p => p.id === profile.id)
          if (idx !== -1) {
            profiles.value[idx].id = String(res.data.id)
            if (activeProfileId.value === profile.id) {
              activeProfileId.value = String(res.data.id)
            }
          }
        } else {
          console.warn('创建档案后端返回异常', res)
        }
      }).catch(e => {
        console.error('创建档案后端同步失败', e)
        uni.showToast({ title: '档案保存失败，请重试', icon: 'none' })
      })
    } else {
      console.warn('创建档案未同步后端: useRemoteApi=', useRemoteApi.value, 'userId=', userId.value)
    }
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
    // 同步到后端（后端从JWT解析userId）
    if (useRemoteApi.value && !isNaN(Number(id))) {
      apiUpdateProfile(Number(id), dto).catch(e => console.error('更新档案后端同步失败', e))
    }
    return updated
  }

  function deleteProfile(id: string) {
    profiles.value = profiles.value.filter(p => p.id !== id)
    records.value = records.value.filter(r => r.profileId !== id)
    if (activeProfileId.value === id) {
      activeProfileId.value = profiles.value[0]?.id ?? ''
    }
    // 同步到后端（后端从JWT解析userId）
    if (useRemoteApi.value && !isNaN(Number(id))) {
      apiDeleteProfile(Number(id)).catch(e => console.error('删除档案后端同步失败', e))
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

  async function confirmJiedu(directions: DirectionValue[], question?: string): Promise<boolean> {
    if (directions.length === 0) {
      uni.showToast({ title: '请至少选择一个关注方向', icon: 'none' })
      return false
    }
    if (useRemoteApi.value) {
      if (!isLoggedIn.value) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return false
      }
      if (serverProducts.value.length === 0)
        await loadProducts()
      if (serverProducts.value.length === 0) {
        uni.showToast({ title: '商品加载失败，请稍后重试', icon: 'none' })
        return false
      }
      if (!activeProductId.value)
        activeProductId.value = serverProducts.value[0].id
      await refreshAvailableCount(activeProductId.value)
      if (totalAvailableCount.value <= 0) {
        uni.navigateTo({ url: RouterPaths.credits })
        return false
      }
    }
    else if (credits.value <= 0) {
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

  /** 绑定手机号（短信验证码登录） */
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
      const res = await apiBindMobile({ userId: userId.value || 0, mobile: mobileStr, smsCode })
      if (res.code === 200 && res.data) {
        userId.value = res.data.userId || userId.value
        mobile.value = res.data.mobile || mobileStr
        bindStatus.value = res.data.bindStatus || 1
        // 存储JWT Token
        if (res.data.token) {
          token.value = res.data.token
          uni.setStorageSync('apph5Token', res.data.token)
        }
        isLoggedIn.value = true
      } else {
        throw new Error(res.msg || '绑定失败')
      }
    } catch (e) {
      console.error('绑定手机号失败', e)
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
        applySessionFromLoginData({
          userId: res.data.userId,
          mobile: res.data.mobile,
          bindStatus: res.data.bindStatus,
          token: res.data.token,
          openId: res.data.openId ?? openid,
        })
        return
      }
      throw new Error(res.msg || '登录失败')
    } catch (e) {
      console.error('登录失败', e)
      throw e
    }
  }

  /** 微信网页授权：code 交 Java 换 openid 与会话（见微信网页授权文档第四步） */
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
        applySessionFromLoginData({
          userId: res.data.userId,
          mobile: res.data.mobile,
          bindStatus: res.data.bindStatus,
          token: res.data.token,
          openId: res.data.openId ?? res.data.openid,
        })
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
    if (!useRemoteApi.value) return
    try {
      const res = await apiBindMobile({ userId: userId.value || 0, mobile: mobileStr, smsCode: '' })
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
    const res = await apiBindMobile({ userId: userId.value || 0, mobile: mobileStr, smsCode })
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
    if (!useRemoteApi.value) return
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

  /** 加载字典数据（关系选项等） */
  async function loadDictData(dictType: string) {
    if (!useRemoteApi.value) return
    try {
      const res = await apiGetDictData(dictType)
      if (res.code === 200 && res.data) {
        return res.data.map((d: any) => ({ value: d.dictValue, label: d.dictLabel }))
      }
    } catch (e) {
      console.error('加载字典数据失败', e)
    }
    return null
  }

  /** 加载关系选项 */
  async function loadRelationOptions() {
    const options = await loadDictData('gx_profile_relation')
    if (options) {
      relationOptions.value = options
    }
  }

  /** 加载用户档案列表 */
  async function loadProfiles() {
    if (!useRemoteApi.value) return
    try {
      const res = await apiGetProfiles()
      if (res.code === 200 && res.data && res.data.length > 0) {
        profiles.value = res.data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          relation: p.relation,
          relationText: p.relationText,
          gender: p.gender,
          genderText: p.genderText,
          birthYear: p.birthYear,
          birthMonth: p.birthMonth,
          birthDay: p.birthDay,
          birthHour: p.birthHour,
          birthPlace: p.birthPlace,
          calendarType: p.calendarType,
          calendarTypeText: p.calendarTypeText,
          useTrueSolarTime: !!p.useTrueSolarTime,
          jieduCount: p.jieduCount || 0,
          lastJieduTime: p.lastJieduTime || '无',
        }))
        if (profiles.value.length > 0 && !activeProfileId.value) {
          activeProfileId.value = profiles.value[0].id
        }
      }
    } catch (e) {
      console.error('加载档案列表失败', e)
    }
  }

  /** 加载用户报告列表 */
  async function loadReports() {
    if (!useRemoteApi.value) return
    try {
      const res = await getReports()
      if (res.code === 200 && res.data) {
        serverReports.value = res.data
      }
    } catch (e) {
      console.error('加载报告列表失败', e)
    }
  }

  /** 加载解读记录列表（含档案信息） */
  async function loadReadingRecords() {
    if (!useRemoteApi.value) return
    try {
      const res = await getReadingRecords()
      if (res.code === 200 && res.data) {
        readingRecords.value = res.data
      }
    } catch (e) {
      console.error('加载解读记录失败', e)
    }
  }

  /** 加载用户可用次数 */
  async function loadCredits() {
    if (!useRemoteApi.value) return
    try {
      const res = await getCredits()
      if (res.code === 200 && res.data) {
        credits.value = res.data.credits || 0
      }
    } catch (e) {
      console.error('加载可用次数失败', e)
    }
  }

  /** 提交报告生成 */
  async function doGenerateReport(productId: number, inputJson?: string) {
    if (!useRemoteApi.value) return null
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

  /** 登录/恢复会话后拉取首页所需数据（报告列表进记录页再拉） */
  async function initRemoteData() {
    if (!useRemoteApi.value) return
    await loadProducts()
    if (serverProducts.value.length > 0) {
      activeProductId.value = serverProducts.value[0].id
      await refreshAvailableCount(activeProductId.value)
    }
    await loadProfiles()
    await loadReadingRecords()
  }

  const COMPLETE_PLACEHOLDER_SECTIONS: ReportVo['content'] = [
    { title: '一、整体状态', body: '结合您的关注方向整理的阶段状态与情绪脉络。' },
    { title: '二、家庭关系', body: '围绕家人互动与相处节奏的参考建议。' },
    { title: '三、行动建议', body: '可执行的生活调整与自我照护提示。' },
  ]

  /** 将后端报告映射为本地 RecordVo 格式 */
  function mapServerReportToRecord(report: any): RecordVo {
    const title = report.reportName || '专属解读报告'
    return {
      id: String(report.id),
      profileId: activeProfileId.value || 'server',
      profileName: report.profileName || activeProfile.value?.name || '心语档案',
      title,
      time: report.createTime || '',
      directions: selectedDirections.value.length ? [...selectedDirections.value] : [],
      content: (report._content?.length ? report._content : COMPLETE_PLACEHOLDER_SECTIONS),
      status: report.status,
    }
  }

  /** 报告详情接口 → RecordVo */
  function mapServerDetailToRecord(detail: any): RecordVo | null {
    const report = detail?.report
    if (!report)
      return null
    const version = detail?.currentVersion
    const html = version?.htmlContent
    const sections = html
      ? [{ title: '完整报告', body: html }]
      : COMPLETE_PLACEHOLDER_SECTIONS
    return {
      id: String(report.id),
      profileId: activeProfileId.value || 'server',
      profileName: report.reportName || activeProfile.value?.name || '心语档案',
      title: report.reportName || '专属解读报告',
      time: report.createTime || '',
      directions: selectedDirections.value.length ? [...selectedDirections.value] : [],
      content: sections,
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
    displayCredits,
    hasNoCredits,
    initSeedData,
    clearSession,
    tryRestoreSession,
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
    readingRecords,
    totalAvailableCount,
    activeProductId,
    useRemoteApi,
    enableRemoteApi,
    doSendSmsCode,
    doLoginBySms,
    doWxLogin,
    doLogin,
    doBindMobile,
    doBindMobileWithSms,
    loadRelationOptions,
    loadProfiles,
    relationOptions,
    loadProducts,
    refreshAvailableCount,
    loadReports,
    loadReadingRecords,
    loadCredits,
    doGenerateReport,
    pollTaskStatus,
    loadUserInfo,
    initRemoteData,
    mapServerReportToRecord,
    mapServerDetailToRecord,
    loadReportDetail,
  }
}, {
  persist: {
    key: 'guoxin-store',
    storage: localStorage,
    pick: ['profiles', 'records', 'activeProfileId', 'selectedDirections', 'fontScale', 'isLoggedIn', 'userId', 'mobile', 'useRemoteApi'],
  },
})
