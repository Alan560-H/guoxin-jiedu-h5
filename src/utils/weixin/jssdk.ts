import wx from 'weixin-js-sdk'
import { getWxJssdkSign } from '@/api/guoxin'
import { getJssdkSignUrl, isWeChatBrowser } from '@/utils/weixin/env'

let initPromise: Promise<void> | undefined
let configuredApis: wx.ApiMethod[] = []

/** 初始化微信 JSSDK（仅 H5 微信内浏览器生效） */
export function initWxJssdk(jsApiList: wx.ApiMethod[] = []): Promise<void> {
  // #ifndef H5
  return Promise.resolve()
  // #endif

  // #ifdef H5
  if (!isWeChatBrowser())
    return Promise.resolve()

  const mergedApis = [...new Set([...configuredApis, ...jsApiList])]
  const cachedPromise = initPromise
  if (cachedPromise !== undefined && arraysEqual(configuredApis, mergedApis))
    return cachedPromise as Promise<void>

  configuredApis = mergedApis
  const promise = new Promise<void>((resolve, reject) => {
    const signUrl = getJssdkSignUrl()
    getWxJssdkSign(signUrl)
      .then((res) => {
        const { appId, timestamp, nonceStr, signature } = res.data
        wx.config({
          debug: false,
          appId,
          timestamp,
          nonceStr,
          signature,
          jsApiList: configuredApis,
        })
        wx.ready(() => resolve())
        wx.error((err) => {
          initPromise = undefined
          uni.showToast({ title: '微信 JSSDK 初始化失败', icon: 'none' })
          reject(err)
        })
      })
      .catch((err) => {
        initPromise = undefined
        reject(err)
      })
  })
  initPromise = promise
  return promise
  // #endif
}

function arraysEqual(a: wx.ApiMethod[], b: wx.ApiMethod[]): boolean {
  if (a.length !== b.length)
    return false
  return a.every((item, index) => item === b[index])
}

export { wx }
