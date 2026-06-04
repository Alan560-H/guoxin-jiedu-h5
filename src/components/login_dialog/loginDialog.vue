<!-- ai解读 等待 -->
<template>
	<view id="captcha"></view>
	<u-mask :show="show" z-index="999">
		<!-- mode="center" -->

		<view class="login_view fill_div f_center flex_column">
			<view class="login_from">

				<!-- 顶部logo -->
				<view class="login_from_top fill_width flex_row f_a_center gap_05rem" p-l-4 p-r-4 h-23>
					<image h-12 w-12 src="/static/logo.png" />
					<view class="flex_row fill_width">
						<view class="flex_1 flex_column">
							<u-text text="易朴" bold size="22px"></u-text>
							<u-text text="手机号登录" type="info" size="18"></u-text>
						</view>
						<view class="" @click.stop="closeLogin">
							<u-icon size="40" name="close"></u-icon>
						</view>
					</view>
				</view>
				<view class="login_from_main " p-3>
					<u-form :model="codeFormData" ref="uFormRef">
						<u-form-item :border-bottom="false" prop="phone">
							<view class=" fill_width common_input_border com_input login_input">
								<u-input v-model="codeFormData.phone" height="60" placeholder="请输入您的手机号" />
							</view>
						</u-form-item>
						<u-form-item :border-bottom="false" prop="smscode">
							<view class="fill_width">
								<view class="fill_width common_input_border com_input flex_row login_input">
									<view class=" flex_1">
										<u-input type="number" maxlength="6" v-model="codeFormData.smscode" height="60"
											placeholder="请输入验证码" />
									</view>
									<view class="f_center">
										<u-verification-code :seconds="seconds" @end="end" @start="start" ref="uCodeRef"
											@change="codeChange"></u-verification-code>
										<!-- 获取验证码 -->
										<u-button @click="sendCode" :ripple="true" ripple-bg-color="#d3653c"
											size="mini">
											<u-text :text="codeText" color="#BA9723" size="20" bold></u-text>
										</u-button>
									</view>
								</view>
								<u-text text="未注册账号将自动注册" type="info" size="20"></u-text>
							</view>
						</u-form-item>


						<u-form-item :border-bottom="false">
							<view class="fill_width">
								<u-button @click="submit" type="primary">
									同意协议并登录
								</u-button>
							</view>

						</u-form-item>
					</u-form>
					<view class="">
						<view class="flex_row f_j_sa" @click.stop="isChoose=!isChoose">
							<u-icon :name="isChoose?'checkmark-circle-fill':'checkmark-circle'"
								:color="isChoose?'#e6d39b':'#888'" size="36"></u-icon>
							<view p-l-1 p-r-1 class="flex_1 flex_row">
								<view>
									<u-text text="我已经同意" type="info" />
								</view>
								<view p-l-1 p-r-1>
									<u-link color="#e6d39b" :href="service">用户协议</u-link>
									<u-text p-l-1 p-r-1 text="和" type="info" />
									<u-link color="#e6d39b" :href="privacy">隐私政策</u-link>
								</view>
							</view>

						</view>
					</view>
				</view>
			</view>
		</view>
	</u-mask>

</template>

<script lang="ts" setup>
	import { ref, computed, onUnmounted, reactive, onMounted } from "vue"
	import { userInfoStore } from "@/stores/userInfoStore"
	import { postSendCode, postLogin } from "@/api/userinfoApi"
	import type { SendCode, LoginFormData } from "@/models/customForm"
	import type { ResponseData } from "@/models/responseData";
	import { $u } from 'uview-pro'
	import { title } from "process";
	const userInfo = userInfoStore();
	const show : ComputedRef<boolean> = computed(() => userInfo.isShowLoginDialog);

	onMounted(() => {
		initNECaptcha();
	});

	const service = "https://newappback.yipuwh.com/apph5/pages/protocol/service";
	const privacy = "https://newappback.yipuwh.com/apph5/pages/protocol/privacy";


	const isChoose = ref(false) // 是否同意隐私政策
	let captchaIns = {}; // 易盾实例
	//  短信表单
	const codeFormData = reactive<SendCode>({
		phone: "",
		validate: "",
		smscode: "",
	})

	const loginFormData = reactive<LoginFormData>({
		phone: "",
		code: "",
		smscode: "",
		validate: "",
		password: "",
		username: "",
		uuid: "",
		loginType: 3
	}) // 登录需要得表单信息
	//  登录
	const submit = async () => {
		if (!isChoose.value) {
			$u.toast("请同意相关协议", {
				icon: "error"
			})
			return;
		}
		try {
			let { phone, smscode, validate } = codeFormData;
			loginFormData.loginType = 3;
			loginFormData.code = smscode;
			loginFormData.smscode = smscode;
			loginFormData.phone = phone;
			loginFormData.validate = validate;
			uni.showLoading({
				title: '正在登录'
			})
			const res : ResponseData = await postLogin(loginFormData)
			if (res.code == 200) {
				userInfo.setToken(res.token);
				userInfo.setUserInfo(res.user);
				$u.toast("登录成功", {
					icon: "success"
				})
				closeLogin();
			}
		} catch (e) {
			console.log(e);
			$u.toast("网络错误", {
				icon: "error"
			})
		} finally {
			uni.hideLoading();
		}
	}
	// 关闭登录框
	const closeLogin = () => {
		userInfo.setIsShowLoginDialog(false)
	}
	// 倒计时组件
	const seconds = ref(300)
	const uCodeRef = ref()
	function codeChange(e) {
		codeText.value = e;
	}
	function end() {
	}

	function start() {
	}
	const codeText = ref("获取验证码");
	// 触发易盾安全认证
	const sendCode = () => {

		if (!$u.test.mobile(codeFormData.phone)) {
			$u.toast('手机号格式不正确')
			return
		}
		console.log(captchaIns, "有这个玩意》？");
		captchaIns && captchaIns.verify();
	}
	const initNECaptcha = () => {
		console.log("开始初始化")

		initNECaptchaWithFallback({
			element: '#captcha',
			captchaId: '5fb3f0a0f6cd4d9283cd6c98bc727603',
			width: '320px',
			mode: 'popup',
			apiVersion: 2,
			popupStyles: {
				position: 'fixed',
				top: '20%'
			},
			onVerify: async function (err, data) {
				if (err) return // 当验证失败时，内部会自动refresh方法，无需手动再调用一次

				codeFormData.validate = data.validate;
				// 若成功拿到 validate，可向后端发送请求
				// 发送短信验证码
				try {
					uni.showLoading({
						title: '正在获取验证码'
					})
					captchaIns && captchaIns.refresh()
					const res : ResponseData = await postSendCode(codeFormData)
					if (res.code == 200) {
						$u.toast(res.msg, {
							icon: "success"
						})
						loginFormData.uuid = res.uuid;
						uCodeRef.value?.start()
					}
				} catch (e) {
					console.error(e, "错误")
					$u.toast("请求过于频繁", {
						icon: "error"
					})
				} finally {
					uni.hideLoading()
				}
			}
		}, function onload(instance) {
			console.log(instance, "渠道得实例")
			captchaIns = instance
		}, function onerror(err) {
			console.warn("插件发生错误")
		})
	}
</script>

<style lang="scss" scoped>
	.login_view {


		.login_from {
			width: 78vw;
			border-radius: 20rpx;
			background: #f7f6f2;

			max-height: 60vh;
			min-height: 30vh;

			.login_from_top {
				background: url("/src/static/loginImg/login_bg.png") no-repeat center center / 100% 100%;
			}

			.login_input {
				background: #EBE8E3;
				border: none;
			}
		}
	}
</style>