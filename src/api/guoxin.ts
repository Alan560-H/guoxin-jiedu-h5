import { http } from 'uview-pro'
import type { ResponseData } from '@/models/responseData'
import type { ProfileVo } from '@/models/guoxin/profile'
import type { RecordVo } from '@/models/guoxin/record'

/** V2 预留：档案列表 */
export const getProfiles = (): Promise<ResponseData<ProfileVo[]>> =>
  http.get('/app/guoxin/profiles')

/** V2 预留：解读记录 */
export const getJieduRecords = (profileId: string): Promise<ResponseData<RecordVo[]>> =>
  http.get('/app/guoxin/records', { profileId })

/** V2 预留：创建解读任务 */
export const createJieduTask = (profileId: string, directions: string[]): Promise<ResponseData<{ taskId: string }>> =>
  http.post('/app/guoxin/jiedu/create', { profileId, directions })

/** V2 预留：获取解读报告 */
export const getJieduReport = (recordId: string): Promise<ResponseData<RecordVo>> =>
  http.get('/app/guoxin/jiedu/report', { recordId })
