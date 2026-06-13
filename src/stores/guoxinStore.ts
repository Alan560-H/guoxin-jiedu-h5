import type { CreditPackage, CreditPackageId, DirectionValue, FontScale } from '@/constants/guoxin'
import { CREDIT_PACKAGES } from '@/constants/guoxin'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import { RouterPaths } from '@/routerPaths'
import { wxChoosePay, formatWxPayError } from '@/utils/weixin/pay'
import { normalizeSeedProfile } from '@/utils/guoxin/seedData'
import { normalizeProfileVo } from '@/utils/guoxin/normalizeProfile'
import { parseGuoxinLoginData, clearGuoxinUserSessionSnapshot, writeGuoxinUserSessionSnapshot, type GuoxinLoginSession } from '@/utils/guoxin/parseLoginResponse'
import { formatNowTime, formatRecordTitle, generateDynamicReportContent } from '@/utils/guoxin/reportGenerator'
import {
  buildReportInputJson,
  extractReportIdFromTask,
  isReportTaskFailed,
  isReportTaskSuccess,
  isReportTaskTerminal,
  normalizeGenerateResult,
  toTaskIdNumber,
} from '@/utils/guoxin/reportGenerate'
import { extractApiErrorMsg, showApiErrorModal } from '@/utils/guoxin/apiError'
import { mapReportDetailToRecordVo, parseReportDirections } from '@/utils/guoxin/parseReportDetail'
import { createRemoteDataCache } from '@/utils/guoxin/remoteDataCache'
import {
  login as apiLogin,
  wxLogin as apiWxLogin,
  loginBySms as apiLoginBySms,
  sendSmsCode as apiSendSmsCode,
  bindMobile as apiBindMobile,
  getUserInfo,
  getProducts,
  getOrders,
  getAvailableCount,
  generateReport as apiGenerateReport,
  getTaskStatus,
  getReadingRecords,
  getCredits,
  getConsumeRecords,
  getReportDetail,
  getProfiles as apiGetProfiles,
  getProfileDetail,
  createProfile as apiCreateProfile,
  updateProfile as apiUpdateProfile,
  deleteProfile as apiDeleteProfile,
  getDictData as apiGetDictData,
} from '@/api/guoxin'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** 档案增删改由页面展示 loading，关闭拦截器默认 loading 避免双层 */
const PROFILE_MUTATION_META = { meta: { loading: false } }

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
  const nickname = ref<string>('')
  const avatarUrl = ref<string>('')
  const serverProducts = ref<any[]>([])
  const serverOrders = ref<any[]>([])
  const consumeRecords = ref<any[]>([])
  /** 解读记录页：当前档案列表；首页「上次解读」单独存 homeLatestRecord */
  const readingRecords = ref<any[]>([])
  const homeLatestRecord = ref<any | null>(null)
  const totalAvailableCount = ref<number>(0)
  const activeProductId = ref<number | null>(null)
  const useRemoteApi = ref(true) // 是否启用远程API
  const relationOptions = ref<Array<{ value: string; label: string }>>([]) // 关系选项（从字典加载）
  const remoteCache = createRemoteDataCache()
  /** setup 确认后、进入整理页前已提交的生成任务 */
  const pendingGenerateTask = ref<{ taskId: number, reportId: number | null } | null>(null)

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) ?? null,
  )

  const displayCredits = computed(() =>
    useRemoteApi.value && isLoggedIn.value ? totalAvailableCount.value : credits.value,
  )

  const latestRecord = computed(() => {
    if (useRemoteApi.value && isLoggedIn.value && homeLatestRecord.value)
      return mapServerReportToRecord(homeLatestRecord.value)
    if (useRemoteApi.value)
      return null
    return records.value[0] ?? null
  })

  function hasNoCredits() {
    if (useRemoteApi.value && isLoggedIn.value)
      return totalAvailableCount.value <= 0
    return credits.value <= 0
  }

  /** 已登录但未绑定手机号（远程模式） */
  function needsBindMobile() {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return false
    return bindStatus.value !== 1
  }

  /** 解读流程结束后清理本次方向与自定义问题 */
  function clearJieduSession() {
    selectedDirections.value = []
    userQuestion.value = ''
    pendingGenerateTask.value = null
  }

  function takePendingGenerateTask() {
    const task = pendingGenerateTask.value
    pendingGenerateTask.value = null
    return task
  }

  function initSeedData() {
    if (!useRemoteApi.value) {
      profiles.value = profiles.value.map(p => normalizeSeedProfile(normalizeProfileVo(p as unknown as Record<string, unknown>)))
      if (!activeProfileId.value || !profiles.value.some(p => p.id === activeProfileId.value))
        activeProfileId.value = profiles.value[0]?.id ?? ''
    }
    setFontScale(fontScale.value)
  }

  /** 写入 wxLogin / userInfo 返回的会话（token → apph5Token；快照 → guoxin-user-session） */
  function applySessionFromLoginData(data: GuoxinLoginSession) {
    if (data.userId != null)
      userId.value = data.userId
    if (data.mobile != null)
      mobile.value = data.mobile
    if (data.bindStatus != null)
      bindStatus.value = data.bindStatus
    if (data.nickname != null)
      nickname.value = data.nickname
    if (data.avatarUrl != null)
      avatarUrl.value = data.avatarUrl
    if (data.token) {
      token.value = data.token
      uni.setStorageSync('apph5Token', data.token)
    }
    const oid = data.openId ?? data.openid
    if (oid)
      openId.value = oid
    isLoggedIn.value = true
    writeGuoxinUserSessionSnapshot({
      userId: userId.value ?? undefined,
      mobile: mobile.value,
      bindStatus: bindStatus.value,
      openId: openId.value,
      nickname: nickname.value,
      avatarUrl: avatarUrl.value,
      token: token.value || undefined,
    })
  }

  /** 401 或登出时清空远程会话（与 apph5Token 同步） */
  function clearSession() {
    isLoggedIn.value = false
    userId.value = null
    mobile.value = ''
    bindStatus.value = 0
    token.value = ''
    openId.value = ''
    nickname.value = ''
    avatarUrl.value = ''
    serverProducts.value = []
    serverOrders.value = []
    consumeRecords.value = []
    readingRecords.value = []
    homeLatestRecord.value = null
    totalAvailableCount.value = 0
    activeProductId.value = null
    remoteCache.invalidate('all')
    try {
      uni.removeStorageSync('apph5Token')
      clearGuoxinUserSessionSnapshot()
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
        applySessionFromLoginData(parseGuoxinLoginData(res.data))
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

  async function createProfile(dto: CreateProfileDto): Promise<ProfileVo> {
    if (useRemoteApi.value) {
      remoteCache.invalidate(['profiles'])
      try {
        const res = await apiCreateProfile(dto, PROFILE_MUTATION_META)
        if (res.code === 200 && res.data) {
          const profile = mapServerProfile({
            ...dto,
            ...(res.data as Record<string, unknown>),
          })
          profiles.value.push(profile)
          activeProfileId.value = profile.id
          return profile
        }
        throw res
      }
      catch (e) {
        console.error('创建档案失败', e)
        throw e
      }
    }

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

  async function updateProfile(id: string, dto: CreateProfileDto): Promise<ProfileVo | null> {
    if (profiles.value.findIndex(p => p.id === id) === -1)
      return null

    if (useRemoteApi.value && !Number.isNaN(Number(id))) {
      remoteCache.invalidate(['profiles'])
      try {
        const res = await apiUpdateProfile(Number(id), dto, PROFILE_MUTATION_META)
        if (res.code !== 200)
          throw res
      }
      catch (e) {
        console.error('更新档案失败', e)
        throw e
      }
    }

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

  async function deleteProfile(id: string): Promise<void> {
    if (useRemoteApi.value && !Number.isNaN(Number(id))) {
      remoteCache.invalidate(['profiles'])
      try {
        const res = await apiDeleteProfile(Number(id), PROFILE_MUTATION_META)
        if (res.code !== 200)
          throw res
      }
      catch (e) {
        console.error('删除档案失败', e)
        throw e
      }
    }

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

  async function confirmJiedu(directions: DirectionValue[], question?: string): Promise<boolean> {
    if (directions.length === 0) {
      uni.showToast({ title: '请至少选择一个关注方向', icon: 'none' })
      return false
    }
    userQuestion.value = question?.trim() || ''
    selectedDirections.value = [...directions]

    if (useRemoteApi.value) {
      if (!isLoggedIn.value) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return false
      }
      await ensureCreditsLoaded()
      if (totalAvailableCount.value <= 0) {
        uni.navigateTo({ url: RouterPaths.credits })
        return false
      }
      const productId = await resolveActiveProductId()
      if (!productId) {
        uni.showToast({ title: '暂无法获取体验包，请前往权益页', icon: 'none' })
        uni.navigateTo({ url: RouterPaths.credits })
        return false
      }
      const inputJson = buildActiveReportInputJson()
      if (!inputJson) {
        uni.showToast({ title: '档案或关注方向缺失', icon: 'none' })
        return false
      }
      try {
        const result = await doGenerateReport(productId, inputJson)
        if (!result?.taskId)
          return false
        const taskId = toTaskIdNumber(result.taskId)
        if (!taskId)
          return false
        const reportIdRaw = result.reportId != null ? Number(result.reportId) : null
        pendingGenerateTask.value = {
          taskId,
          reportId: reportIdRaw != null && !Number.isNaN(reportIdRaw) ? reportIdRaw : null,
        }
      }
      catch (e) {
        console.error('提交报告生成失败', e)
        const action = await showApiErrorModal(e, {
          fallback: '提交失败，请重试',
          confirmText: '查看解读记录',
          cancelText: '知道了',
        })
        if (action === 'confirm')
          uni.navigateTo({ url: RouterPaths.jieduRecords })
        return false
      }
    }
    else if (credits.value <= 0) {
      uni.navigateTo({ url: RouterPaths.credits })
      return false
    }

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

  /** 远程：微信公众号 JSAPI 购买商品套餐 */
  async function purchaseRemoteProduct(productId: number): Promise<boolean> {
    if (!useRemoteApi.value)
      return false
    if (!isLoggedIn.value) {
      uni.showToast({ title: '请先登录后再购买', icon: 'none' })
      return false
    }
    try {
      await wxChoosePay({ productId })
      activeProductId.value = productId
      invalidateRemoteCache(['credits', 'orders', 'consumeRecords'])
      await Promise.all([
        ensureCreditsLoaded(true),
        ensureOrdersLoaded(true),
        ensureConsumeRecordsLoaded(true),
      ])
      uni.showToast({ title: '开通成功', icon: 'success' })
      return true
    }
    catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (code === 'cancel' || code === 'not_wechat')
        return false
      console.error('远程购买失败', err)
      uni.showToast({ title: formatWxPayError(err), icon: 'none', duration: 3000 })
      return false
    }
  }

  async function purchaseCredits(pkgId: CreditPackageId): Promise<boolean> {
    const pkg: CreditPackage | undefined = CREDIT_PACKAGES.find(p => p.id === pkgId)
    if (!pkg)
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
        applySessionFromLoginData({
          ...parseGuoxinLoginData(res.data),
          mobile: res.data.mobile ?? mobileStr,
        })
        await loadUserInfo({ skipSessionClear: true })
      } else {
        throw new Error(res.msg || '登录失败')
      }
    } catch (e) {
      console.error('短信登录失败', e)
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
          ...parseGuoxinLoginData(res.data),
          openId: parseGuoxinLoginData(res.data).openId ?? openid,
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
        const session = parseGuoxinLoginData(res.data)
        applySessionFromLoginData(session)
        await loadUserInfo({ skipSessionClear: true })
        return { needBindMobile: !!session.needBindMobile }
      } else {
        throw new Error(res.msg || '微信登录失败')
      }
    }     catch (e) {
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
      mobile.value = res.data?.mobile || mobileStr
      bindStatus.value = res.data?.bindStatus ?? 1
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

  function mapServerProfile(p: Record<string, unknown>): ProfileVo {
    return normalizeProfileVo({
      ...p,
      jieduCount: p.jieduCount ?? 0,
      lastJieduTime: p.lastJieduTime ?? '无',
    })
  }

  /** 加载用户档案列表 */
  async function loadProfiles() {
    if (!useRemoteApi.value) return
    try {
      const res = await apiGetProfiles()
      if (res.code === 200 && res.data && res.data.length > 0) {
        profiles.value = res.data.map(mapServerProfile)
        if (profiles.value.length > 0 && !activeProfileId.value) {
          activeProfileId.value = profiles.value[0].id
        }
      }
    } catch (e) {
      console.error('加载档案列表失败', e)
    }
  }

  /** 加载档案详情（编辑页拉最新数据） */
  async function loadProfileDetail(id: number): Promise<ProfileVo | null> {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return null
    try {
      const res = await getProfileDetail(id)
      if (res.code === 200 && res.data) {
        const mapped = mapServerProfile(res.data)
        const idx = profiles.value.findIndex(p => p.id === mapped.id)
        if (idx >= 0)
          profiles.value[idx] = mapped
        else
          profiles.value.push(mapped)
        return mapped
      }
    } catch (e) {
      console.error('加载档案详情失败', e)
    }
    return null
  }

  /** 首页「上次解读」：全局最近一条，不带 profileId */
  async function loadHomeLatestRecord() {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    try {
      const res = await getReadingRecords({ pageSize: 1 })
      if (res.code === 200 && res.data?.length)
        homeLatestRecord.value = res.data[0]
      else
        homeLatestRecord.value = null
    }
    catch (e) {
      console.error('加载上次解读失败', e)
    }
  }

  /** 按档案加载解读记录（解读记录页每次进入直接请求，不走缓存） */
  async function loadReadingRecords(profileId: string | number) {
    if (!useRemoteApi.value || profileId === '' || profileId == null)
      return
    try {
      const res = await getReadingRecords({ profileId })
      if (res.code === 200 && res.data)
        readingRecords.value = res.data
    }
    catch (e) {
      console.error('加载解读记录失败', e)
    }
  }

  /** 加载用户总可用次数（首页/权益展示；不依赖商品列表） */
  async function loadCredits() {
    if (!useRemoteApi.value) return
    try {
      const res = await getCredits()
      if (res.code === 200 && res.data) {
        const count = res.data.credits ?? res.data.availableCount ?? 0
        credits.value = count
        totalAvailableCount.value = count
        if (res.data.productId != null)
          activeProductId.value = Number(res.data.productId)
      }
    } catch (e) {
      console.error('加载可用次数失败', e)
    }
  }

  function invalidateRemoteCache(keys?: RemoteCacheKey[] | 'all') {
    remoteCache.invalidate(keys)
  }

  async function ensureProductsLoaded(force = false) {
    if (!useRemoteApi.value)
      return
    return remoteCache.ensure('products', () => loadProducts(), { force })
  }

  async function ensureProfilesLoaded(force = false) {
    if (!useRemoteApi.value)
      return
    return remoteCache.ensure('profiles', () => loadProfiles(), { force })
  }

  async function ensureCreditsLoaded(force = false) {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    return remoteCache.ensure('credits', () => loadCredits(), { force })
  }

  /** 生成报告前解析商品 id（credits → 解读提交时按需拉 products 兜底） */
  async function resolveActiveProductId(): Promise<number | null> {
    if (activeProductId.value != null)
      return activeProductId.value
    await ensureCreditsLoaded()
    if (activeProductId.value != null)
      return activeProductId.value
    await ensureProductsLoaded()
    if (serverProducts.value.length > 0) {
      activeProductId.value = serverProducts.value[0].id
      return activeProductId.value
    }
    return null
  }

  async function ensureOrdersLoaded(force = false) {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    return remoteCache.ensure('orders', () => loadOrders(), { force })
  }

  async function ensureConsumeRecordsLoaded(force = false) {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    return remoteCache.ensure('consumeRecords', () => loadConsumeRecords(), { force })
  }

  /** 登录/恢复会话后拉取首页所需远程数据 */
  async function bootstrapAfterLogin() {
    if (!useRemoteApi.value)
      return
    remoteCache.invalidate(['credits'])
    await Promise.all([
      ensureCreditsLoaded(),
      loadHomeLatestRecord(),
    ])
  }

  /** 按当前商品刷新剩余解读次数（远程展示统一入口，带缓存） */
  async function refreshDisplayCredits(force = false) {
    return ensureCreditsLoaded(force)
  }

  /** 加载用户订单列表 */
  async function loadOrders() {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    try {
      const res = await getOrders()
      if (res.code === 200 && res.data)
        serverOrders.value = res.data
    } catch (e) {
      console.error('加载订单列表失败', e)
    }
  }

  /** 加载消费记录 */
  async function loadConsumeRecords() {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    try {
      const res = await getConsumeRecords()
      if (res.code === 200 && res.data)
        consumeRecords.value = res.data
    } catch (e) {
      console.error('加载消费记录失败', e)
    }
  }

  /** 当前解读上下文 → report/generate 的 inputJson */
  function buildActiveReportInputJson(): string | null {
    const profile = activeProfile.value
    if (!profile || selectedDirections.value.length === 0)
      return null
    return buildReportInputJson(profile, selectedDirections.value, userQuestion.value)
  }

  /** 提交报告生成；失败时 throw（HTTP 500 的 msg 由拦截器 toast，业务失败在本方法 toast） */
  async function doGenerateReport(productId: number, inputJson?: string) {
    if (!useRemoteApi.value)
      return null
    try {
      const res = await apiGenerateReport(
        { productId, inputJson },
        { meta: { toast: false } },
      )
      if (res.code === 200 && res.data)
        return normalizeGenerateResult(res.data as Record<string, unknown>)
      throw res
    }
    catch (e) {
      console.error('生成报告失败', e)
      throw e
    }
  }

  /** 轮询任务状态（兼容 success/done/completed 与 failed/error）；离开页面时传 shouldAbort 取消轮询 */
  async function pollTaskStatus(
    taskId: number | string,
    maxRetries = 60,
    interval = 3000,
    shouldAbort?: () => boolean,
  ) {
    const id = toTaskIdNumber(taskId)
    if (!id)
      return null
    for (let i = 0; i < maxRetries; i++) {
      if (shouldAbort?.())
        return { cancelled: true as const }
      try {
        const res = await getTaskStatus(id, {
          meta: { loading: false, toast: false },
        })
        if (shouldAbort?.())
          return { cancelled: true as const }
        if (res.code === 200 && res.data) {
          const data = res.data as Record<string, unknown>
          const status = data.status
          if (isReportTaskTerminal(status)) {
            return {
              ...data,
              status,
              success: isReportTaskSuccess(status),
              failed: isReportTaskFailed(status),
              reportId: extractReportIdFromTask(data),
              msg: typeof data.msg === 'string' ? data.msg : undefined,
              message: typeof data.message === 'string' ? data.message : undefined,
            }
          }
        }
      }
      catch (e) {
        console.error('查询任务状态失败', e)
        return {
          failed: true as const,
          success: false as const,
          msg: extractApiErrorMsg(e, '查询任务状态失败'),
        }
      }
      if (i < maxRetries - 1) {
        const slept = await sleepUntil(interval, shouldAbort)
        if (!slept)
          return { cancelled: true as const }
      }
    }
    return null
  }

  function sleepUntil(ms: number, shouldAbort?: () => boolean): Promise<boolean> {
    return new Promise((resolve) => {
      const start = Date.now()
      const tick = () => {
        if (shouldAbort?.()) {
          resolve(false)
          return
        }
        if (Date.now() - start >= ms) {
          resolve(true)
          return
        }
        setTimeout(tick, 200)
      }
      tick()
    })
  }

  /** 加载用户信息（wxLogin 后 softFail 避免 getUserInfo 失败清空刚写入的会话） */
  async function loadUserInfo(options?: { skipSessionClear?: boolean }) {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return
    try {
      const res = await getUserInfo({
        meta: {
          loading: false,
          toast: false,
          skipSessionClear: options?.skipSessionClear,
        },
      })
      if (res.code === 200 && res.data)
        applySessionFromLoginData(parseGuoxinLoginData(res.data))
    }
    catch (e) {
      console.error('加载用户信息失败', e)
    }
  }

  /** @deprecated 请用 bootstrapAfterLogin */
  const initRemoteData = bootstrapAfterLogin

  const COMPLETE_PLACEHOLDER_SECTIONS: RecordVo['content'] = [
    { title: '一、整体状态', body: '结合您的关注方向整理的阶段状态与情绪脉络。' },
    { title: '二、家庭关系', body: '围绕家人互动与相处节奏的参考建议。' },
    { title: '三、行动建议', body: '可执行的生活调整与自我照护提示。' },
  ]

  /** readingRecords / report/detail 列表项 → RecordVo */
  function mapServerReportToRecord(report: any): RecordVo {
    const rawId = report.reportId ?? report.id
    const title = report.title || report.reportName || '专属解读报告'
    const directions = Array.isArray(report.directions)
      ? report.directions
      : parseReportDirections(report.directions ?? report.focusDirections)
    return {
      id: String(rawId),
      profileId: report.profileId != null ? String(report.profileId) : (activeProfileId.value || ''),
      profileName: report.profileName || activeProfile.value?.name || '心语档案',
      title,
      time: report.time || report.createTime || '',
      directions,
      content: (report._content?.length ? report._content : COMPLETE_PLACEHOLDER_SECTIONS),
      status: report.status,
    }
  }

  /** 报告详情接口 → RecordVo（data 扁平含 reportContent.chapters） */
  function mapServerDetailToRecord(detail: any): RecordVo | null {
    if (!detail)
      return null
    const mapped = mapReportDetailToRecordVo(detail as Record<string, unknown>)
    if (!mapped)
      return null
    if (!mapped.content?.length)
      mapped.content = COMPLETE_PLACEHOLDER_SECTIONS
    return mapped
  }

  /** 加载报告详情 */
  async function loadReportDetail(reportId: number): Promise<any> {
    if (!useRemoteApi.value || !isLoggedIn.value)
      return null
    try {
      const res = await getReportDetail(reportId)
      const code = Number(res.code)
      if (code >= 200 && code < 300) {
        const payload = res.data ?? res
        if (payload && typeof payload === 'object' && (payload as { id?: unknown }).id != null)
          return payload
      }
    }
    catch (e) {
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
    needsBindMobile,
    clearJieduSession,
    takePendingGenerateTask,
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
    purchaseRemoteProduct,
    refreshDisplayCredits,
    invalidateRemoteCache,
    bootstrapAfterLogin,
    ensureProductsLoaded,
    ensureProfilesLoaded,
    ensureCreditsLoaded,
    resolveActiveProductId,
    ensureOrdersLoaded,
    ensureConsumeRecordsLoaded,
    setFontScale,
    addCredits,
    // 后端集成
    userId,
    mobile,
    bindStatus,
    token,
    openId,
    nickname,
    avatarUrl,
    serverProducts,
    serverOrders,
    consumeRecords,
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
    loadProfileDetail,
    relationOptions,
    loadProducts,
    refreshAvailableCount,
    loadReadingRecords,
    loadHomeLatestRecord,
    loadCredits,
    loadOrders,
    loadConsumeRecords,
    buildActiveReportInputJson,
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
    pick: ['profiles', 'records', 'activeProfileId', 'selectedDirections', 'fontScale', 'isLoggedIn', 'userId', 'mobile', 'bindStatus', 'openId', 'nickname', 'avatarUrl', 'useRemoteApi'],
  },
})
