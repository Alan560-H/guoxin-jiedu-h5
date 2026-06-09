import type {
  BindPhoneReq,
  BindPhoneVo,
  CreditsVo,
  SmsCodeReq,
  SmsCodeVo,
  WxAuthorizeVo,
  WxSessionReq,
  WxSessionVo,
} from '@/models/guoxin/auth'
import type {
  JieduTaskCreateReq,
  JieduTaskCreateVo,
  JieduTaskStatusVo,
} from '@/models/guoxin/jiedu'
import type { CreateProfileDto, ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'
import type { ResponseData } from '@/models/responseData'
import { guoxinDelete, guoxinGet, guoxinPost, guoxinPut } from '@/api/guoxinHttp'

export const postWxSession = (data: WxSessionReq): Promise<ResponseData<WxSessionVo>> =>
  guoxinPost('/app/guoxin/auth/wx-session', data, { loading: false, toast: false })

export const postWxAuthorize = (): Promise<ResponseData<WxAuthorizeVo>> =>
  guoxinPost('/app/guoxin/auth/wx-authorize', { mock: true }, { loading: false })

export const postSmsCode = (data: SmsCodeReq): Promise<ResponseData<SmsCodeVo>> =>
  guoxinPost('/app/guoxin/auth/sms-code', data, { loading: false })

export const postBindPhone = (data: BindPhoneReq): Promise<ResponseData<BindPhoneVo>> =>
  guoxinPost('/app/guoxin/auth/bind-phone', data)

export const getProfiles = (): Promise<ResponseData<ProfileVo[]>> =>
  guoxinGet('/app/guoxin/profiles')

export const createProfile = (dto: CreateProfileDto): Promise<ResponseData<ProfileVo>> =>
  guoxinPost('/app/guoxin/profiles', dto)

export const updateProfile = (id: string, dto: CreateProfileDto): Promise<ResponseData<ProfileVo>> =>
  guoxinPut(`/app/guoxin/profiles/${id}`, dto)

export const deleteProfile = (id: string): Promise<ResponseData<null>> =>
  guoxinDelete(`/app/guoxin/profiles/${id}`)

export const getJieduRecords = (profileId: string): Promise<ResponseData<RecordVo[]>> =>
  guoxinGet('/app/guoxin/records', { profileId })

export const getLatestRecord = (): Promise<ResponseData<RecordVo | null>> =>
  guoxinGet('/app/guoxin/records/latest')

export const getCredits = (): Promise<ResponseData<CreditsVo>> =>
  guoxinGet('/app/guoxin/credits', undefined, { loading: false })

export const postCreditsPurchase = (packageId: string): Promise<ResponseData<CreditsVo>> =>
  guoxinPost('/app/guoxin/credits/purchase', { packageId })

export const createJieduTask = (data: JieduTaskCreateReq): Promise<ResponseData<JieduTaskCreateVo>> =>
  guoxinPost('/app/guoxin/jiedu/create', data)

export const getJieduTaskStatus = (taskId: string): Promise<ResponseData<JieduTaskStatusVo>> =>
  guoxinGet(`/app/guoxin/jiedu/task/${taskId}`, undefined, { loading: false, toast: false })

export const getJieduReport = (recordId: string): Promise<ResponseData<RecordVo>> =>
  guoxinGet('/app/guoxin/jiedu/report', { recordId })
