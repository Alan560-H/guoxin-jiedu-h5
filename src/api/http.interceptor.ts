import type { RequestConfig, RequestInterceptor, RequestMeta } from 'uview-pro'
import type { ResponseData } from "@/models/responseData";
import { dev, prod } from "@/api/env";
import { userInfoStore } from "@/stores/userInfoStore"
import { useGuoxinStore } from '@/stores/guoxinStore'
import { RouterPaths } from '@/routerPaths'
import { isAppEmbeddedWebView } from '@/utils/appWebView'
import { extractHttpResponseMsg } from '@/utils/guoxin/apiError'
// 示例：演示如何使用token
const isDevelopment = process.env.NODE_ENV === 'development';
const baseUrl = isDevelopment ? dev.baseUrl : prod.baseUrl;

// 全局配置
const httpRequestConfig : RequestConfig = {
	baseUrl,
	header: {
		'content-type': 'application/json',
	},
	meta: {
		originalData: true,
		toast: true,
		loading: true,
	},
}
declare global {
	interface Window {
		flutter_inappwebview?: boolean | unknown
	}
}
// 请求/响应拦截器
const httpInterceptor : RequestInterceptor = {
	// 请求拦截器
	request: (config : any) => {
		// eslint-disable-next-line no-console
		// console.log('请求拦截器', config)
		const meta : RequestMeta = config.meta || {}
		meta.loading && showLoading()
		
		let token = uni.getStorageSync('apph5Token')
		config.header['custom-eader'] = isAppEmbeddedWebView() ? 'app' : 'apph5'
		if (token) {
			// 确保Token以 Bearer 格式发送
			config.header.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
		}
		// config.header.Authorization = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImRmZDI5YjEzLTJjM2UtNDY5Zi1hNWI1LTkyZGIxMzhjNTI2MSJ9.PlSEvYjkyqcP9HUsm-h1yWcId9pGyTCbeLs25id9e0GdDu6bgfD9ASP65o-mtEml0thQwlcYeLnaXTx_4JxEbQ";
		// console.log("当前请求头", config)
		return config
	},
	// 响应拦截器
	response: async (response : any) : Promise<ResponseData> => {
		// eslint-disable-next-line no-console
		// console.log('响应拦截器', response)
		const meta : RequestMeta = response.config?.meta || {}
		meta.loading && hideLoading()
		const { statusCode, data: rawData, errMsg } = response as any
		// 网络错误
		if (errMsg && errMsg.includes('Failed to connect')) {
			meta.toast && showToast('网络错误', 'error')
			throw new Error('网络错误')
		}
		if (errMsg && errMsg.includes('request:fail')) {
			meta.toast && showToast('请求错误：未知', 'error')
			throw new Error('请求错误：未知')
		}
		// 请求错误（HTTP 非 2xx；body 为 JSON 时优先展示 msg）
		if (!(statusCode >= 200 && statusCode < 300)) {
			const errorMessage = extractHttpResponseMsg(rawData, statusCode)
			meta.toast && showToast(errorMessage, 'error', { duration: 2500 })
			throw new Error(errorMessage)
		}
		// 业务逻辑错误：登录过期/状态码不正确
		const { code, msg = '请求错误：未知' } = rawData as any
		const codeNum = Number(code)
		if (codeNum === 403 || codeNum === 401) {
			if (!meta.skipSessionClear) {
				uni.removeStorageSync('apph5Token')
				useGuoxinStore().clearSession()
				meta.toast && showToast('登录已过期，请重新登录', 'error')
				const userInfo = userInfoStore()
				userInfo.loginOut()
			}
			throw new Error(rawData)
		}
		else if (!(codeNum >= 200 && codeNum < 300)) {
			meta.toast && showToast(msg, 'error', { duration: 2500 })
			 return Promise.reject(rawData); // 替换throw，返回拒绝的Promise
		}
		return rawData as ResponseData;
	},
}

// 显示加载中，可以替换为uview-pro的u-loading-popup组件
function showLoading() {
	uni.showLoading({
		title: '加载中...',
		mask: true,
	})
}

// 隐藏加载中
function hideLoading() {
	uni.hideLoading()
}

// 显示toast，可以替换为uview-pro的u-toast组件
function showToast(title = '', icon : 'success' | 'error' | 'none' = 'none', options : { duration : number } = { duration: 2000 }) {
	if (title.length === 0) {
		return
	}
	// uni-app：loading 未关闭时 showToast 会被吞掉
	uni.hideLoading()
	uni.showToast({
		title,
		icon,
		duration: options.duration,
	})
}

// 导出
export { httpInterceptor, httpRequestConfig }