import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { UserInfoVo } from "@/models/userInfoVo";
import { RouterPaths } from "@/routerPaths"
export const userInfoStore = defineStore('userInfoStore', () => {

	// 用户资料
	const userInfo = reactive<UserInfoVo>({
		admin: false,
		avatar: '',
		birthArea: '',
		birthDay: '',
		channelCode: '',
		createBy: '',
		createTime: '',
		delFlag: '',
		dept: undefined,
		deptId: 0,
		email: '',
		isFirst: 0,
		loginDate: '',
		loginIp: '',
		loginType: '',
		nickName: '',
		params: [],
		phonenumber: '',
		postIds: undefined,
		remark: undefined,
		roleId: undefined,
		roleIds: undefined,
		roles: '',
		salt: '',
		searchValue: '',
		sex: '',
		status: '',
		updateBy: '',
		updateTime: '',
		userId: 0,
		userName: ''
	})
	// token
	const token = ref<string>();
	let isLogin = computed(() => {
		return userInfo.userId != 0;
	});
	// 登录模态框开关
	const isShowLoginDialog = ref(false);
	// 打开/关闭登录模态框
	const setIsShowLoginDialog = (val : boolean) => isShowLoginDialog.value = val;

	// 设置token
	const setToken = (tokenValue : string) => {
		token.value = tokenValue;
		uni.setStorageSync('apph5Token', tokenValue);
		console.log("当前token", tokenValue)
	}

	// 设置用户信息
	const setUserInfo = (value : UserInfoVo) => {
		Object.assign(userInfo, value);
		uni.setStorageSync('apph5UserInfo', value);
		console.log("当前用户信息", userInfo, value)
	}
	
	const loginOut = () => {
		return new Promise((resolve) => {
			uni.removeStorageSync('apph5UserInfo')
			uni.removeStorageSync('apph5Token')
			setTimeout(() => {
				uni.reLaunch({ url: RouterPaths.home })
			}, 1000)
		})
	}
	return { userInfo, isLogin, isShowLoginDialog, setIsShowLoginDialog, setToken, setUserInfo, loginOut }
}, {
	persist: true,
})