import type { FontScale } from '@/constants/guoxin'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import type { GuoxinLoginSession } from '@/utils/guoxin/parseLoginResponse'
import type { WxPayRedirect } from '@/utils/weixin/pay'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getMemberStatus } from '@/api/dify'
import {
  bindMobile as apiBindMobile,
  createProfile as apiCreateProfile,
  deleteProfile as apiDeleteProfile,
  generateReport as apiGenerateReport,
  getDictData as apiGetDictData,
  getProfiles as apiGetProfiles,
  login as apiLogin,
  sendSmsCode as apiSendSmsCode,
  smsLogin as apiSmsLogin,
  updateProfile as apiUpdateProfile,
  wxLogin as apiWxLogin,
  getAvailableCount,
  getConsumeRecords,
  getCredits,
  getOrders,
  getProducts,
  getProfileDetail,
  getReadingRecords,
  getReportDetail,
  getTaskStatus,
  getUserInfo,
} from '@/api/guoxin'
import { RouterPaths } from '@/routerPaths'
import { extractApiErrorMsg, showApiErrorModal } from '@/utils/guoxin/apiError'
import { navigateToReportConfirm as goReportConfirm, navigateToHome, navigateToProfileList } from '@/utils/guoxin/navigation'
import {
  indexServerProfiles,
  isStreamChatProfilePayload,
  normalizeProfileVo,
  toServerProfileRecord,
} from '@/utils/guoxin/normalizeProfile'
import { parseCreditsPayload, isUnlimitedChatRemaining } from '@/utils/guoxin/parseCredits'
import { unwrapBizPayload } from '@/utils/guoxin/parseDifyLists'
import { clearGuoxinUserSessionSnapshot, parseGuoxinLoginData, writeGuoxinUserSessionSnapshot } from '@/utils/guoxin/parseLoginResponse'
import { mapReportDetailToRecordVo, parseReportDirections } from '@/utils/guoxin/parseReportDetail'
import { createRemoteDataCache } from '@/utils/guoxin/remoteDataCache'
import {
  buildReportInputJson,
  extractReportIdFromTask,
  isReportTaskFailed,
  isReportTaskSuccess,
  isReportTaskTerminal,
  normalizeGenerateResult,
  toTaskIdNumber,
} from '@/utils/guoxin/reportGenerate'
import { formatWxPayError, wxPay } from '@/utils/weixin/pay'

/** 档案增删改由页面展示 loading，关闭拦截器默认 loading 避免双层 */
const PROFILE_MUTATION_META = { meta: { loading: false } }

export const useGuoxinStore = defineStore('guoxin', () => {
  const profiles = ref<ProfileVo[]>([])
  /** 档案接口原文，供 streamChat userinput_bazi 原样发送（不 persist） */
  const serverProfilesById = ref<Record<string, Record<string, unknown>>>({})
  const activeProfileId = ref('')
  const activeRecordId = ref('')
  const selectedDirections = ref<string[]>([])
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
  /** 档案列表内嵌：当前档案解读记录；首页「上次解读」单独存 homeLatestRecord */
  const readingRecords = ref<any[]>([])
  const homeLatestRecord = ref<any | null>(null)
  const totalAvailableCount = ref<number>(0)
  /** 问答剩余次数（统一 credits 接口） */
  const chatRemaining = ref<number>(0)
  /** 套餐期内问答不限次 */
  const chatUnlimited = ref(false)
  /** credits 是否已带问答字段；未带时开发期可走本地兜底 */
  const chatCreditsFromServer = ref(false)
  const activeProductId = ref<number | null>(null)
  /** 二期 member/status */
  const memberStatus = ref('')
  const memberSku = ref('')
  const memberExpiresAt = ref('')
  const relationOptions = ref<Array<{ value: string, label: string }>>([]) // 关系选项（从字典加载）
  const remoteCache = createRemoteDataCache()
  /** setup 确认后、进入整理页前已提交的生成任务 */
  const pendingGenerateTask = ref<{ taskId: number, reportId: number | null } | null>(null)

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) ?? null,
  )

  const displayCredits = computed(() =>
    isLoggedIn.value ? totalAvailableCount.value : 0,
  )

  /** 能否继续发问：只看问答权益，绝不看报告次；-1 / unlimited 不拦截 */
  function canAskChat(): boolean {
    if (!isLoggedIn.value)
      return false
    if (chatUnlimited.value || isUnlimitedChatRemaining(chatRemaining.value))
      return true
    return chatRemaining.value > 0
  }

  function hasNoChatQuota(): boolean {
    return !canAskChat()
  }

  const latestRecord = computed(() => {
    if (isLoggedIn.value && homeLatestRecord.value)
      return mapServerReportToRecord(homeLatestRecord.value)
    return null
  })

  function hasNoCredits() {
    if (!isLoggedIn.value)
      return true
    return totalAvailableCount.value <= 0
  }

  /** 已登录但未绑定手机号 */
  function needsBindMobile() {
    if (!isLoggedIn.value)
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

  /** 页面进入时恢复字号等 UI 状态 */
  function initSeedData() {
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
    chatRemaining.value = 0
    chatUnlimited.value = false
    chatCreditsFromServer.value = false
    activeProductId.value = null
    memberStatus.value = ''
    memberSku.value = ''
    memberExpiresAt.value = ''
    profiles.value = []
    serverProfilesById.value = {}
    activeProfileId.value = ''
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

  /** 仅缓存接口原文；缺出生时间字段则忽略，避免用不完整响应覆盖 */
  function rememberServerProfile(raw: unknown): boolean {
    const rec = toServerProfileRecord(raw)
    if (!rec || !isStreamChatProfilePayload(rec))
      return false
    serverProfilesById.value = {
      ...serverProfilesById.value,
      [String(rec.id)]: rec,
    }
    return true
  }

  function forgetServerProfile(id: string) {
    if (!(id in serverProfilesById.value))
      return
    const next = { ...serverProfilesById.value }
    delete next[id]
    serverProfilesById.value = next
  }

  /** streamChat 八字：档案接口原文 JSON，不做农历/公历换算 */
  function getStreamChatBazi(profileId: string): string | null {
    const raw = serverProfilesById.value[String(profileId)]
    if (!raw || !isStreamChatProfilePayload(raw))
      return null
    return JSON.stringify(raw)
  }

  async function refreshServerProfileForChat(id: string, raw?: unknown) {
    if (rememberServerProfile(raw))
      return
    if (Number.isNaN(Number(id)) || !isLoggedIn.value)
      return
    try {
      const res = await getProfileDetail(Number(id))
      if (res.code === 200 && res.data)
        rememberServerProfile(res.data)
    }
    catch (e) {
      console.error('刷新档案原文失败', e)
    }
  }

  async function createProfile(dto: CreateProfileDto): Promise<ProfileVo> {
    try {
      const res = await apiCreateProfile(dto, PROFILE_MUTATION_META)
      if (res.code === 200 && res.data) {
        const profile = mapServerProfile({
          ...dto,
          ...(res.data as Record<string, unknown>),
        })
        profiles.value.push(profile)
        activeProfileId.value = profile.id
        remoteCache.invalidate(['profiles'])
        await refreshServerProfileForChat(profile.id, res.data)
        return profile
      }
      throw res
    }
    catch (e) {
      console.error('创建档案失败', e)
      throw e
    }
  }

  async function updateProfile(id: string, dto: CreateProfileDto): Promise<ProfileVo | null> {
    if (profiles.value.findIndex(p => p.id === id) === -1)
      return null

    let serverPayload: unknown
    if (!Number.isNaN(Number(id))) {
      try {
        const res = await apiUpdateProfile(Number(id), dto, PROFILE_MUTATION_META)
        if (res.code !== 200)
          throw res
        serverPayload = res.data
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
    remoteCache.invalidate(['profiles'])
    await refreshServerProfileForChat(id, serverPayload)
    try {
      const { useChatSessionStore } = await import('@/stores/chatSessionStore')
      useChatSessionStore().clearConversationId(id)
    }
    catch {
      // ignore
    }
    return updated
  }

  async function deleteProfile(id: string): Promise<void> {
    if (!Number.isNaN(Number(id))) {
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
    forgetServerProfile(id)
    if (activeProfileId.value === id) {
      activeProfileId.value = profiles.value[0]?.id ?? ''
    }
    remoteCache.invalidate(['profiles'])
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

  /** 进入报告确认（对话版）；旧 setup 入口统一切到确认页 */
  function navigateToSetup(profileId?: string) {
    if (profileId)
      activeProfileId.value = profileId
    goReportConfirm()
  }

  /** 对话版：进入报告确认页（与 navigateToSetup 等价，语义更清晰） */
  function navigateToReportConfirm(profileId?: string) {
    navigateToSetup(profileId)
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

  async function confirmJiedu(directions: string[], question?: string): Promise<boolean> {
    if (directions.length === 0) {
      uni.showToast({ title: '请填写解读重点', icon: 'none' })
      return false
    }
    userQuestion.value = question?.trim() || ''
    selectedDirections.value = [...directions]

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
      invalidateRemoteCache(['credits'])
      void ensureCreditsLoaded(true)
    }
    catch (e) {
      console.error('提交报告生成失败', e)
      const action = await showApiErrorModal(e, {
        fallback: '提交失败，请重试',
        confirmText: '查看档案与记录',
        cancelText: '首页',
      })
      if (action === 'confirm')
        navigateToProfileList(activeProfileId.value || undefined)
      else if (action === 'cancel')
        navigateToHome()
      return false
    }

    uni.redirectTo({ url: RouterPaths.jieduProcessing })
    return true
  }

  /** 远程购买：创建订单后跳转尚德第三方收银台。 */
  async function purchaseRemoteProduct(
    productId: number,
    opts?: { silentSuccess?: boolean },
  ): Promise<boolean | WxPayRedirect> {
    if (!isLoggedIn.value) {
      uni.showToast({ title: '请先登录后再购买', icon: 'none' })
      return false
    }
    try {
      const outcome = await wxPay({ productId })
      activeProductId.value = productId
      if (outcome === 'pay_redirect')
        return 'pay_redirect'

      invalidateRemoteCache(['credits', 'orders', 'consumeRecords'])
      await Promise.all([
        ensureCreditsLoaded(true),
        ensureOrdersLoaded(true),
        ensureConsumeRecordsLoaded(true),
      ])
      if (!opts?.silentSuccess)
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

  // ---- 后端 API ----

  /** 发送短信验证码 */
  async function doSendSmsCode(mobileStr: string): Promise<boolean> {
    try {
      const res = await apiSendSmsCode({ mobile: mobileStr })
      if (res.code === 200) {
        return true
      }
      else {
        console.log('发送短信验证码失败', res)
        uni.showToast({ title: res.msg || '发送失败', icon: 'none' })
        return false
      }
    }
    catch (e: any) {
      console.error('发送验证码失败', e)
      uni.showToast({ title: e?.msg || '发送失败', icon: 'none' })
      return false
    }
  }

  /** 短信验证码登录 */
  async function doLoginBySms(mobileStr: string, smsCode: string) {
    try {
      const res = await apiSmsLogin({ mobile: mobileStr, smsCode })
      if (res.code === 200 && res.data) {
        applySessionFromLoginData({
          ...parseGuoxinLoginData(res.data),
          mobile: res.data.mobile ?? mobileStr,
        })
        await loadUserInfo({ skipSessionClear: true })
      }
      else {
        throw new Error(res.msg || '登录失败')
      }
    }
    catch (e) {
      console.error('短信登录失败', e)
      throw e
    }
  }

  /** 微信登录 */
  async function doLogin(openid: string, unionid?: string, nickname?: string, avatarUrl?: string) {
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
    }
    catch (e) {
      console.error('登录失败', e)
      throw e
    }
  }

  /** 微信网页授权：code 交 Java 换 openid 与会话（见微信网页授权文档第四步） */
  async function doWxLogin(code: string): Promise<{ needBindMobile: boolean }> {
    try {
      const res = await apiWxLogin({ code })
      if (res.code === 200 && res.data) {
        const session = parseGuoxinLoginData(res.data)
        applySessionFromLoginData(session)
        await loadUserInfo({ skipSessionClear: true })
        return { needBindMobile: !!session.needBindMobile }
      }
      else {
        throw new Error(res.msg || '微信登录失败')
      }
    }
    catch (e) {
      throw e
    }
  }

  /** 绑定手机号（需短信验证码） */
  async function doBindMobile(mobileStr: string) {
    try {
      const res = await apiBindMobile({ userId: userId.value || 0, mobile: mobileStr, smsCode: '' })
      if (res.code === 200) {
        mobile.value = mobileStr
        bindStatus.value = 1
      }
    }
    catch (e) {
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
    }
    else {
      throw new Error(res.msg || '绑定失败')
    }
  }

  /** 加载商品列表 */
  async function loadProducts() {
    try {
      const res = await getProducts()
      if (res.code === 200 && res.data) {
        serverProducts.value = res.data
      }
    }
    catch (e) {
      console.error('加载商品失败', e)
    }
  }

  /** 刷新可用权益次数 */
  async function refreshAvailableCount(productId?: number) {
    if (!productId && serverProducts.value.length > 0) {
      productId = serverProducts.value[0].id
    }
    if (!productId)
      return
    try {
      const res = await getAvailableCount(productId)
      if (res.code === 200 && res.data) {
        totalAvailableCount.value = res.data.availableCount || 0
      }
    }
    catch (e) {
      console.error('刷新可用次数失败', e)
    }
  }

  /** 加载字典数据（关系选项等） */
  async function loadDictData(dictType: string) {
    try {
      const res = await apiGetDictData(dictType)
      if (res.code === 200 && res.data) {
        return res.data.map((d: any) => ({ value: d.dictValue, label: d.dictLabel }))
      }
    }
    catch (e) {
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

  /** 加载用户档案列表（直接请求；页面入口优先用 ensureProfilesLoaded 去重） */
  async function loadProfiles() {
    try {
      const res = await apiGetProfiles()
      if (res.code === 200) {
        const list = Array.isArray(res.data) ? res.data : []
        serverProfilesById.value = indexServerProfiles(list)
        profiles.value = list.map(mapServerProfile)
        if (profiles.value.length > 0) {
          if (!activeProfileId.value || !profiles.value.some(p => p.id === activeProfileId.value))
            activeProfileId.value = profiles.value[0].id
        }
        else {
          activeProfileId.value = ''
        }
      }
    }
    catch (e) {
      console.error('加载档案列表失败', e)
    }
  }

  /** 档案列表去重入口：并发合并 + 会话内缓存；增删改后需 force 或已 invalidate */
  async function ensureProfilesLoaded(force = false) {
    if (!isLoggedIn.value)
      return
    return remoteCache.ensure('profiles', () => loadProfiles(), { force })
  }

  /** 加载档案详情（编辑页拉最新数据） */
  async function loadProfileDetail(id: number): Promise<ProfileVo | null> {
    if (!isLoggedIn.value)
      return null
    try {
      const res = await getProfileDetail(id)
      if (res.code === 200 && res.data) {
        rememberServerProfile(res.data)
        const mapped = mapServerProfile(res.data)
        const idx = profiles.value.findIndex(p => p.id === mapped.id)
        if (idx >= 0)
          profiles.value[idx] = mapped
        else
          profiles.value.push(mapped)
        return mapped
      }
    }
    catch (e) {
      console.error('加载档案详情失败', e)
    }
    return null
  }

  /** 首页「上次解读」：全局最近一条，不带 profileId */
  async function loadHomeLatestRecord() {
    if (!isLoggedIn.value)
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
    if (!isLoggedIn.value || profileId === '' || profileId == null)
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

  /** 加载用户权益：优先二期 member/status，失败回退 credits */
  async function loadCredits(): Promise<boolean> {
    try {
      let payload: unknown = null
      let usedMemberStatus = false

      try {
        const res = await getMemberStatus() as Record<string, unknown>
        const code = Number(res?.code)
        const httpOk = !Number.isFinite(code) || (code >= 200 && code < 300)
        if (httpOk) {
          const unwrapped = unwrapBizPayload(res)
          if (unwrapped != null) {
            payload = unwrapped
            usedMemberStatus = true
          }
        }
      }
      catch (e) {
        console.warn('member/status 不可用，回退 credits', e)
      }

      if (!usedMemberStatus) {
        const res = await getCredits()
        if (res.code === 200 && res.data)
          payload = res.data
        else
          return false
      }

      const parsed = parseCreditsPayload(payload)
      totalAvailableCount.value = parsed.credits
      if (parsed.productId != null)
        activeProductId.value = parsed.productId

      if (parsed.chatFieldsPresent) {
        chatRemaining.value = parsed.chatRemaining
        chatUnlimited.value = parsed.chatUnlimited
        chatCreditsFromServer.value = true
      }
      else {
        // member/status 成功但未带问答字段时，勿静默走本地 3 次；保持未从服务端确认
        chatCreditsFromServer.value = false
      }

      memberStatus.value = parsed.memberStatus || ''
      memberSku.value = parsed.memberSku || ''
      memberExpiresAt.value = parsed.memberExpiresAt || ''
      return true
    }
    catch (e) {
      console.error('加载可用次数失败', e)
      return false
    }
  }

  function invalidateRemoteCache(keys?: RemoteCacheKey[] | 'all') {
    remoteCache.invalidate(keys)
  }

  async function ensureProductsLoaded(force = false) {
    return remoteCache.ensure('products', () => loadProducts(), { force })
  }

  async function ensureCreditsLoaded(force = false): Promise<boolean> {
    if (!isLoggedIn.value)
      return false
    try {
      await remoteCache.ensure('credits', async () => {
        const ok = await loadCredits()
        if (!ok)
          throw new Error('credits-load-failed')
      }, { force })
      return true
    }
    catch {
      return false
    }
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
    if (!isLoggedIn.value)
      return
    return remoteCache.ensure('orders', () => loadOrders(), { force })
  }

  async function ensureConsumeRecordsLoaded(force = false) {
    if (!isLoggedIn.value)
      return
    return remoteCache.ensure('consumeRecords', () => loadConsumeRecords(), { force })
  }

  /** 登录/恢复会话后拉取首页所需远程数据 */
  async function bootstrapAfterLogin() {
    remoteCache.invalidate(['credits', 'profiles'])
    await Promise.all([
      ensureCreditsLoaded(),
      ensureProfilesLoaded(true),
      loadHomeLatestRecord(),
    ])
  }

  /** 按当前商品刷新剩余解读次数（远程展示统一入口，带缓存） */
  async function refreshDisplayCredits(force = false) {
    return ensureCreditsLoaded(force)
  }

  /** 加载用户订单列表 */
  async function loadOrders() {
    if (!isLoggedIn.value)
      return
    try {
      const res = await getOrders()
      if (res.code === 200 && res.data)
        serverOrders.value = res.data
    }
    catch (e) {
      console.error('加载订单列表失败', e)
    }
  }

  /** 加载消费记录 */
  async function loadConsumeRecords() {
    if (!isLoggedIn.value)
      return
    try {
      const res = await getConsumeRecords()
      if (res.code === 200 && res.data)
        consumeRecords.value = res.data
    }
    catch (e) {
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
    if (!isLoggedIn.value)
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
      reportDocument: null,
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
    if (!isLoggedIn.value)
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
    activeProfileId,
    activeRecordId,
    selectedDirections,
    userQuestion,
    fontScale,
    isLoggedIn,
    activeProfile,
    latestRecord,
    displayCredits,
    canAskChat,
    hasNoChatQuota,
    hasNoCredits,
    needsBindMobile,
    clearJieduSession,
    takePendingGenerateTask,
    initSeedData,
    clearSession,
    tryRestoreSession,
    getProfileById,
    getStreamChatBazi,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    resolveStartProfile,
    navigateToSetup,
    navigateToReportConfirm,
    startJieduFromHome,
    confirmJiedu,
    purchaseRemoteProduct,
    refreshDisplayCredits,
    invalidateRemoteCache,
    bootstrapAfterLogin,
    ensureProductsLoaded,
    ensureCreditsLoaded,
    resolveActiveProductId,
    ensureOrdersLoaded,
    ensureConsumeRecordsLoaded,
    setFontScale,
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
    chatRemaining,
    chatUnlimited,
    chatCreditsFromServer,
    activeProductId,
    memberStatus,
    memberSku,
    memberExpiresAt,
    doSendSmsCode,
    doLoginBySms,
    doWxLogin,
    doLogin,
    doBindMobile,
    doBindMobileWithSms,
    loadRelationOptions,
    loadProfiles,
    ensureProfilesLoaded,
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
    pick: ['activeProfileId', 'selectedDirections', 'fontScale', 'isLoggedIn', 'userId', 'mobile', 'bindStatus', 'openId', 'nickname', 'avatarUrl'],
  },
})
