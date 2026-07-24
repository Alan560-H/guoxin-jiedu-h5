import type { DifyPreviewResult, DifyUploadResult, MemberStatusVo } from '@/models/guoxin/dify'
import type { ResponseData } from '@/models/responseData'
import { http } from 'uview-pro'
import { isAppEmbeddedWebView } from '@/utils/appWebView'
import { getSource } from '@/utils/guoxin/source'

const BASE = '/api/yiqixue/app/guoxin'

/** 用户权益（二期） */
export function getMemberStatus(): Promise<ResponseData<MemberStatusVo>> {
  return http.get(`${BASE}/member/status`)
}

/** 首页 / 开聊推荐问题题库 */
export function getDifyQuestionBank(): Promise<ResponseData<unknown>> {
  return http.get(`${BASE}/dify/question/bank`)
}

/** 下一轮建议问题（messageId 来自流式会话） */
export function getDifySuggested(messageId: string): Promise<ResponseData<unknown>> {
  return http.get(`${BASE}/dify/suggested`, { messageId })
}

/** 预览已上传文件 */
export function previewDifyFile(fileId: string): Promise<ResponseData<DifyPreviewResult>> {
  return http.get(`${BASE}/dify/preview/file`, { fileId })
}

function authHeaderValue(): string {
  const token = uni.getStorageSync('apph5Token') as string
  if (!token)
    return ''
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

/**
 * 上传文件到 Dify（multipart）。
 * @param filePath uni.chooseImage / chooseFile 返回的本地临时路径
 */
export function uploadDifyFile(filePath: string): Promise<ResponseData<DifyUploadResult>> {
  return new Promise((resolve, reject) => {
    const header: Record<string, string> = {
      'custom-eader': isAppEmbeddedWebView() ? 'app' : 'apph5',
    }
    const auth = authHeaderValue()
    if (auth)
      header.Authorization = auth
    const source = getSource()
    if (source)
      header.source = source

    uni.uploadFile({
      url: `${BASE}/dify/files/upload`,
      filePath,
      name: 'file',
      header,
      success: (res) => {
        try {
          const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          resolve(body as ResponseData<DifyUploadResult>)
        }
        catch (e) {
          reject(e instanceof Error ? e : new Error('上传响应解析失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      },
    })
  })
}
