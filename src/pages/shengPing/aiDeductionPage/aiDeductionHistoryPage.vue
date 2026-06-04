<template>
	<view class="ai_deduction flex_column gap_1rem" p-3>
		<aiDeductionLoading :isLoading="isLoading" />
		<!-- 个人信息概览 -->
		<view class="current_container flex_column gap_05rem" p-3>
			<u-row gutter="3">
				<u-col span="2">
					<u-text text="命造" bold color="#bec0ae"></u-text>
				</u-col>
				<u-col span="8">
					<u-text :text="`${_aiDeductionStore.chooseHistory.birthday} 生人`" bold color="#333"></u-text>
				</u-col>
				<u-col span="2">
					<u-tag :text="_aiDeductionStore.chooseHistory.gender" shape="circle" :closeable="false" mode="light"
						bg-color="#f5f5f4" />
				</u-col>
			</u-row>
			<u-row gutter="2">
				<u-col span="2">
					<u-text text="八字" bold color="#bec0ae"></u-text>
				</u-col>
				<u-col span="2" v-for="(bazi,i) in _aiDeductionStore.chooseHistory.bazi" :key="i">
					<u-text :text="bazi" type="info" size="18px"></u-text>
				</u-col>

			</u-row>
			<!-- 当前大运 -->
			<view class="current_lucky f_center flex_row f_j_sb" p-3>
				<u-text text="当前大运" color="#bec0ae"></u-text>
				<u-text :text="_aiDeductionStore.chooseHistory.daYun??'暂无'" align="right" bold color="#854d0e"
					size="24px"></u-text>
			</view>
			<u-divider type="primary" :use-slot="false" half-width="100%" border-color="#6d6d6d"></u-divider>
			<!-- 分析区间 -->
			<view class="flex_row f_j_sb">
				<view class="flex_column">
					<view><u-text text="分析区间" size="16"></u-text></view>
					<view>
						<u-text bold size="18px" :text="_aiDeductionStore.chooseHistory.startYear"></u-text>
						<u-text bold size="18px" text="-"></u-text>
						<u-text bold size="18px" :text="_aiDeductionStore.chooseHistory.endYear"></u-text>
					</view>
				</view>
				<view class="f_center" @click="goBaZiPage">
					<view class="custom_btn f_center gap_05rem" p-2>
						<u-icon name="reload" color="#7b7978"></u-icon>
						<u-text text="重新排盘" color="#7b7978"></u-text>
					</view>
				</view>
			</view>
		</view>
		<!-- 图表组件 -->
		<view class="current_container flex_column f_j_center gap_05rem " p-3>
			<aiDeductionEChart :rowData="_aiDeductionStore.chooseHistory.content"
				v-if="_aiDeductionStore.chooseHistory.content" />
			<view class="fill_div f_center" v-else>
				<u-empty text="暂无数据" mode="list"></u-empty>
			</view>
		</view>
		<!-- 图例说明 -->
		<view p-3>
			<aiDescription />
		</view>
		<!-- 切换十年 -->
		<view class="flex_row">
			<u-button :ripple="true" ripple-bg-color="#d3653c" @click="changeFn('prev')">
				<view class="f_center flex_row gap_05rem">
					<u-icon name="arrow-leftward" color="#7b7978"></u-icon>
					<u-text text="上个十年"></u-text>
				</view>
			</u-button>
			<u-button :ripple="true" ripple-bg-color="#d3653c" @click="changeFn('next')">
				<view class="f_center flex_row gap_05rem">
					<u-text text="下个十年"></u-text>
					<u-icon name="arrow-rightward" color="#7b7978"></u-icon>
				</view>
			</u-button>
		</view>
		<!-- 图表组件 -->
		<view class="current_container gap_05rem flex_column f_j_center" p-3>
			<aiTable :rowData="_aiDeductionStore.chooseHistory.content"
				v-if="_aiDeductionStore.chooseHistory.content" />
			<view class="fill_div f_center" v-else>
				<u-empty text="暂无数据" mode="list"></u-empty>
			</view>
		</view>
		<!-- 转折点格局释义 -->
		<view class="current_container flex_column gap_05rem" p-3>
			<view class="flex_row gap_05rem">
				<u-icon name="info-circle" color="#854d0e" size="20px"></u-icon>
				<u-text text="转折点格局释义" color="#854d0e" size="20px" bold></u-text>
			</view>
			<view class="menu_grid gap_05rem">
				<view v-for="(item,i) in descArr" :key="i" :class="`view_${i}`" class="f_center flex_column gap_05rem"
					p-5>
					<u-text :text="item.title" :color="item.color" size="20px" bold></u-text>
					<u-text :text="item.subTitle" type="info"></u-text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { aiDeductionStore } from "@/stores/aiDeductionStore"
	import { ref, reactive, onMounted, onUnmounted } from "vue"
	import aiDeductionEChart from "@/components/ai_deduction_echart/aiDeductionEchart.vue"
	import type { LiuYue, ResponseData } from "@/models/responseData";
	import aiDescription from "@/components/ai_deduction_echart/aiDescription.vue"
	import aiTable from "@/components/ai_deduction_echart/aiTable.vue"
	import { RouterPaths } from '@/routerPaths'
	import aiDeductionLoading from "@/components/ai_deduction_loading/aiDeductionLoading.vue"
	import type { AIChatFormData } from "@/models/customForm"


	const isLoading = ref(false);
	const _aiDeductionStore = aiDeductionStore() // ai推演信息
	const goBaZiPage = () => {
		uni.$u.route({
			url: RouterPaths.shengPing
		});
	}
	const descArr = [
		{ title: "飞龙在天", subTitle: "大运爆发", color: '#b91e1e' },
		{ title: "潜龙勿用", subTitle: "岁月并临", color: '#707b8b' },
		{ title: "绝处逢生", subTitle: "枯木逢春", color: '#298d70' },
		{ title: "惊涛骇浪", subTitle: "富贵险中求", color: '#c2420d' },
	]
	let timer = null;
	const postAIContent = async (item : LiuYue) => {
		let { gender, birthday, bazi, solar, userName, districtGeocode, liuYue } = _aiDeductionStore.chooseHistory;
		console.log(_aiDeductionStore.chooseHistory, "选中得历史");
		const param : AIChatFormData = {
			user_info: {
				gender: gender,
				birthday: birthday,
				bazi: bazi,
				solar: solar,
				userName: userName,
				districtGeocode: districtGeocode,
				daYun: item.ganZhi,
				liuYue: liuYue,
			},
			timeline_data: item.customLiuNian,
		};
		console.log(param, "凑齐得");
		// 拿到会话id
		const res : ResponseData<AIChat> = await _aiDeductionStore.postAIChatStore(param);
		console.log(res.data, "结果")
		timer = setInterval(async () => {
			try {
				let params : AIContentFormData = {
					chatId: _aiDeductionStore.aiChat.chatId,
					conversationId: _aiDeductionStore.aiChat.conversationId
				};
				const responsse : ResponseData<AIContent> = await _aiDeductionStore.postAIContentStoreHistoryFN(params);
				console.log(responsse.data, "开始轮询结果")
				if (responsse.data.status == 'completed') {
					await _aiDeductionStore.getCount()
					isLoading.value = false;
					clearInterval(timer)
					timer = null

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
	const changeFn = async (v : string) => {
		// 先找到当前索引
		let itemIndex = _aiDeductionStore.chooseHistory.liuYue.findIndex((item)=>item.startYear==_aiDeductionStore.chooseHistory.startYear)
		let desc = "往后没有数据了";
		// 如果是下个十年
		if (v == 'next') {
			itemIndex++;
			
		} else {
			itemIndex--;
		}
		console.log(itemIndex,"索引");
		if (itemIndex < 0 || itemIndex >= _aiDeductionStore.chooseHistory.liuYue.length) {
			if (itemIndex<0) {
				desc = "往前没有数据了"
			}
			uni.showToast({
				title: desc,
				icon: 'error'
			})
			return
		}
		// 当前选中大运
		isLoading.value = true;
		const chooseDaYun:LiuYue = _aiDeductionStore.chooseHistory.liuYue[itemIndex]
		_aiDeductionStore.chooseHistory.startYear = chooseDaYun.startYear;
		_aiDeductionStore.chooseHistory.endYear = chooseDaYun.endYear;
		_aiDeductionStore.chooseHistory.daYun = chooseDaYun.ganZhi;
		const res : ResponseData<any> = await _aiDeductionStore.changeLiuNianHistory(chooseDaYun.ganZhi, chooseDaYun.startYear, chooseDaYun.endYear)
		// 如果有已经生成得记录
		if (res.rows && res.rows.length) {
			_aiDeductionStore.chooseHistory.content = res.rows[0].content
			isLoading.value = false;
		} else {
			postAIContent(chooseDaYun);
		}
	}

	onMounted(async () => {

		console.log(_aiDeductionStore.chooseHistory, "选择得历史",);
	
	});

	onUnmounted(() => {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	})
</script>

<style lang="scss">
	:deep(.u-collapse-head) {
		padding: 0 !important;
	}

	.ai_deduction {
		.current_container {
			min-height: 400rpx;
			background: #fcfaf7;
			border-radius: 20rpx;
			box-shadow: 2rpx 2rpx 14rpx 5rpx #e5e2dc;

			.current_lucky {
				border: 4rpx solid #f2eee9;
				border-radius: 20rpx;
				background-color: #ffffff;
			}

			.custom_btn {
				min-width: 200rpx;
				max-height: 80rpx;
				background-color: #ffffff;
				border: 4rpx solid #f2eee9;
				border-radius: 20rpx;
			}
		}

		.menu_grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);

			.view_0 {
				background: #fef2f2;
				border: 1px #fed1d1 solid;
				border-radius: 10rpx;
			}

			.view_1 {
				background: #f8fafc;
				border: 1px #fed1d1 solid;
				border-radius: 10rpx;
			}

			.view_2 {
				background: #ecfdf5;
				border: 1px #fed1d1 solid;
				border-radius: 10rpx;
			}

			.view_3 {
				background: #fff7ed;
				border: 1px #fed1d1 solid;
				border-radius: 10rpx;
			}
		}



	}
</style>