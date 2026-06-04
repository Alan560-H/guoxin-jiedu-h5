<!-- 主页面 -->
<template>
	<loginDialog />
	<aiDeductionLoading :isLoading="isLoading" />
	<view class="sheng_ping_container">
		<u-tabs :list="menus" name="title" active-color="#fff" inactive-color="#e8af9b" bg-color=" #d3653c"
			:is-scroll="false" :current="current.id" @change="change"></u-tabs>
		<!-- 排盘信息 -->
		<traditionModel v-if="current.id==0" />
		<analysisModel v-if="current.id==1" />
		<decipherModel v-if="current.id==2" />
		<view class="padding_LR_1rem f_center flex_column gap_05rem">
			<u-button v-if="_userInfoStore.isLogin" ripple-bg-color="#909399" :custom-style="customStyle"
				@tap.stop="goAIPages">
				{{`AI测算(今日还剩${_aiDeductionStore.count}次)`}}
			</u-button>
			<u-button v-else ripple-bg-color="#909399" :custom-style="customStyle" @tap.stop="goAIPages">
				{{`AI解析`}}
			</u-button>
			<u-text text="历史记录" @click="goHistory"></u-text>
		</view>

	</view>
</template>

<script setup lang="ts">
	import type { TabVo, TabVos } from '@/models/customTabVo';
	import aiDeductionLoading from "@/components/ai_deduction_loading/aiDeductionLoading.vue"
	import loginDialog from "@/components/login_dialog/loginDialog.vue"
	import traditionModel from "@/components/bazi_son_page/traditionModel.vue"
	import analysisModel from "@/components/bazi_son_page/analysisModel"
	import decipherModel from "@/components/bazi_son_page/decipherModel"
	import { aiDeductionStore } from "@/stores/aiDeductionStore"
	import { shengPingStore } from "@/stores/shengPingStore"
	import { userInfoStore } from "@/stores/userInfoStore"
	import { ref, reactive, onMounted, onUnmounted, watch } from "vue"
	import { RouterPaths } from '@/routerPaths'
	import type { FormData, AIChatFormData, AIContentFormData, TimelineItem } from "@/models/customForm"
	import type { ResponseData, AIChat, AIContent } from "@/models/responseData";
	import { getBaZiPanInfo } from "@/api/bazi"

	const _baZiInfo = shengPingStore().baZiInfo

	onMounted(() => {
		uni.showLoading({
			title: '加载中...',
			mask: true,
		})

	})
	// 用户信息
	const _userInfoStore = userInfoStore();
	const isLoading = ref(false);
	const _aiDeductionStore = aiDeductionStore()
	const menus = reactive<TabVos>([
		{ title: "传统模式", id: 0 },
		{ title: "分析模式", id: 1 },
		{ title: "解读模式", id: 2 },
	])
	const current = ref<TabVo>({ title: "传统模式", id: 0 })
	const customStyle = reactive({
		marginTop: '20px', // 注意驼峰命名，并且值必须用引号包括，因为这是对象
		background: '#d3653d',
		color: '#fff',
		minWidth: "400rpx"
	})
	watch(
		() => _userInfoStore.isLogin, // 监听的目标状态
		async (newVal) => { // newVal是变化后的isLogin值
			if (newVal) { // 只有当状态变为true时才执行
				await _aiDeductionStore.getCount();
				console.log("登录状态已激活，已获取AI测算次数");
			}
		},
		{ immediate: true } // 3. 立即执行：页面挂载时如果已登录，也会执行一次
	);
	async function getHistory() : Promise<ResponseData<any>> {
		console.log(_baZiInfo);
		let param : AIHistoryFormData = {
			pageNum: 1,
			pageSize: 10,
			gender: _baZiInfo.sex == '男' ? '乾造' : '坤造',
			birthday: _baZiInfo.birthDay,
			userName: _baZiInfo.userName,
			districtGeocode: _baZiInfo.districtGeocode,
			solar: _baZiInfo.solar,
			startYear: _baZiInfo.daYun[0].startYear,
			endYear: _baZiInfo.daYun[0].endYear,
		}
		const res : ResponseData<any> = await _aiDeductionStore.getAILogsStoreFN(param)
		console.log(res,"返回的东东");
		if(res.rows?.length){
			_aiDeductionStore.chooseHistoryFN(res.rows[0])
			return true;
		}else{
			return false
		}
	}
	let timer = null;
	async function goAIPages() {
		if (!_userInfoStore.isLogin) {
			_userInfoStore.setIsShowLoginDialog(true)
			return;
		}
		isLoading.value = true;
		// 如果有历史记录，则跳转历史图表页面（跳转在方法体里面）
		const isHasLog = await getHistory();
		if(isHasLog)return;
		
		let tempTimeLineData = []; // 流年数据
		let allDaYun = [];
		const daYunInfo = _baZiInfo.daYun;
		if (!daYunInfo.length) return;
		// 默认使用第一个大运得数据
		daYunInfo[0].customLiuNian.map(liuNian => {
			let tempArr = [
				liuNian.year,
				liuNian.ganZhi,
				daYunInfo[0].ganZhi,
				`${liuNian.tianGanAttention}${liuNian.diZhiAttention}`,
				liuNian.shenSha,
			]
			tempTimeLineData.push(tempArr)
		})
		// 生成所有大运得流年数据
		daYunInfo.map((daYun) => {
			let tempDaYun = {
				ganZhi: daYun.ganZhi,
				startYear: daYun.startYear,
				endYear: daYun.endYear,
				customLiuNian: []
			}
			if (daYun.customLiuNian.length) {
				daYun.customLiuNian.map(liuNian2 => {
					let tempArr = [
						liuNian2.year,
						liuNian2.ganZhi,
						daYun.ganZhi,
						`${liuNian2.tianGanAttention}${liuNian2.diZhiAttention}`,
						liuNian2.shenSha,
					]
					tempDaYun.customLiuNian.push(tempArr)
				})
			}
			allDaYun.push(tempDaYun);
		})
		const param : AIChatFormData = {
			user_info: {
				gender: _baZiInfo.sex == '男' ? '乾造' : '坤造',
				birthday: _baZiInfo.birthDay,
				bazi: [
					`${_baZiInfo.yearGan}${_baZiInfo.yearZhi}`,
					`${_baZiInfo.monthGan}${_baZiInfo.monthZhi}`,
					`${_baZiInfo.dayGan}${_baZiInfo.dayZhi}`,
					`${_baZiInfo.timeGan}${_baZiInfo.timeZhi}`,
				],
				solar: _baZiInfo.solar,
				userName: _baZiInfo.userName,
				districtGeocode: _baZiInfo.districtGeocode,
				daYun: daYunInfo[0].ganZhi,
				liuYue: allDaYun,
			},
			timeline_data: tempTimeLineData,
		};
		console.log(param,"给AI得参数")
		// 拿到会话id
		const res : ResponseData<AIChat> = await _aiDeductionStore.postAIChatStore(param);
		console.log(res.data, "结果")
		timer = setInterval(async () => {
			try {
				let params : AIContentFormData = {
					chatId: _aiDeductionStore.aiChat.chatId,
					conversationId: _aiDeductionStore.aiChat.conversationId
				};
				const responsse : ResponseData<AIContent> = await _aiDeductionStore.postAIContentStoreFN(params);
				console.log(responsse.data, "开始轮询结果")
				if (responsse.data.status == 'completed') {
					isLoading.value = false;
					clearInterval(timer)
					timer = null
					await _aiDeductionStore.getCount();
					uni.$u.route({
						url: RouterPaths.aiDeductionPage
					});

				}
			} catch (e) {
				console.log(e, "大出错");
				isLoading.value = false;
				uni.showToast({
					title: e.msg,
					icon: "error"
				})
				clearInterval(timer)
				timer = null
			}
		}, 5000)
	}
	const goHistory = () => {
		uni.$u.route({
			url: RouterPaths.aiDeductionHistory
		});
	}
	const change = (index : number) => {
		current.value = menus[index];
	}

	onUnmounted(() => {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	})
</script>

<style scoped lang="scss">

</style>