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
					<u-text :text="`${_baZiInfo.lunarDate} 生人`" bold color="#333"></u-text>
				</u-col>
				<u-col span="2">
					<u-tag :text="_baZiInfo.sex === '男' ? '乾造' : '坤造'" shape="circle" :closeable="false" mode="light"
						bg-color="#f5f5f4" />
				</u-col>
			</u-row>
			<u-row gutter="2">
				<u-col span="2">
					<u-text text="八字" bold color="#bec0ae"></u-text>
				</u-col>
				<u-col span="2">
					<u-text :text="`${_baZiInfo.yearGan}${_baZiInfo.yearZhi}`" type="info" size="18px"></u-text>
				</u-col>
				<u-col span="2">
					<u-text :text="`${_baZiInfo.monthGan}${_baZiInfo.monthZhi}`" type="info" size="18px"></u-text>
				</u-col>
				<u-col span="2">
					<u-text :text="`${_baZiInfo.dayGan}${_baZiInfo.dayZhi}`" type="info" size="18px"></u-text>
				</u-col>
				<u-col span="2">
					<u-text :text="`${_baZiInfo.timeGan}${_baZiInfo.timeZhi}`" type="info" size="18px"></u-text>
				</u-col>
			</u-row>
			<!-- 当前大运 -->
			<view class="current_lucky f_center flex_row f_j_sb" p-3>
				<u-text text="当前大运" color="#bec0ae"></u-text>
				<u-text :text="chooseDaYun.ganZhi" align="right" bold color="#854d0e" size="24px"></u-text>
			</view>
			<u-divider type="primary" :use-slot="false" half-width="100%" border-color="#6d6d6d"></u-divider>
			<!-- 分析区间 -->
			<view class="flex_row f_j_sb">
				<view class="flex_column">
					<view><u-text text="分析区间" size="16"></u-text></view>
					<view>
						<u-text bold size="18px" :text="chooseDaYun.startYear"></u-text>
						<u-text bold size="18px" text="-"></u-text>
						<u-text bold size="18px" :text="chooseDaYun.endYear"></u-text>
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
		<view class="current_container flex_column gap_05rem" p-3>
			<aiDeductionEChart :rowData="rowEChartData" />
		</view>
		<!-- 图例说明 -->
		<view p-3>
			<aiDescription />
		</view>
		<!-- 切换十年 -->
		<view class="flex_row">
			<u-button :ripple="true" ripple-bg-color="#d3653c" @click="changeLiuNian('perv')">
				<view class="f_center flex_row gap_05rem">
					<u-icon name="arrow-leftward" color="#7b7978"></u-icon>
					<u-text text="上个十年"></u-text>
				</view>
			</u-button>
			<u-button :ripple="true" ripple-bg-color="#d3653c" @click="changeLiuNian('next')">
				<view class="f_center flex_row gap_05rem">
					<u-text text="下个十年"></u-text>
					<u-icon name="arrow-rightward" color="#7b7978"></u-icon>
				</view>
			</u-button>
		</view>
		<!-- 图表组件 -->
		<view class="current_container flex_column gap_05rem" p-3>
			<aiTable :rowData="rowEChartData" />
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
	import { shengPingStore } from "@/stores/shengPingStore"
	import aiDeductionEChart from "@/components/ai_deduction_echart/aiDeductionEchart.vue"
	import aiDescription from "@/components/ai_deduction_echart/aiDescription.vue"
	import aiTable from "@/components/ai_deduction_echart/aiTable.vue"
	import { RouterPaths } from '@/routerPaths'

	const isLoading = ref(false);
	const _aiDeductionStore = aiDeductionStore() // ai推演信息

	const rowEChartData = _aiDeductionStore.rowEChartData
	const _baZiStore = shengPingStore(); // 八字仓库
	// 2. 调用初始化方法，确保数据加载完成

	const _baZiInfo = _baZiStore.baZiInfo; // 当前八字信息
	const descArr = [
		{ title: "飞龙在天", subTitle: "大运爆发", color: '#b91e1e' },
		{ title: "潜龙勿用", subTitle: "岁月并临", color: '#707b8b' },
		{ title: "绝处逢生", subTitle: "枯木逢春", color: '#298d70' },
		{ title: "惊涛骇浪", subTitle: "富贵险中求", color: '#c2420d' },
	]
	const goBaZiPage = () => {
		uni.$u.route({
			url: RouterPaths.shengPing
		});
	}

	let timer = null;
	const postAIContent = async () => {
		let tempTimeLineData = []; // 流年数据
		let allDaYun = [];
		if (!_baZiInfo.daYun.length || !chooseDaYun.customLiuNian.length) return;
		// 默认使用第一个大运得数据
		chooseDaYun.customLiuNian.map(liuNian => {
			let tempArr = [
				liuNian.year,
				liuNian.ganZhi,
				chooseDaYun.ganZhi,
				`${liuNian.tianGanAttention}${liuNian.diZhiAttention}`,
				liuNian.shenSha,
			]
			tempTimeLineData.push(tempArr)
		})
		// 生成所有大运得流年数据
		_baZiInfo.daYun.map((daYun) => {
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
				bazi: [`${_baZiInfo.yearGan}${_baZiInfo.yearZhi}`, `${_baZiInfo.monthGan}${_baZiInfo.monthZhi}`, `${_baZiInfo.dayGan}${_baZiInfo.dayZhi}`, `${_baZiInfo.timeGan}${_baZiInfo.timeZhi}`,],
				solar: _baZiInfo.solar,
				userName: _baZiInfo.userName,
				districtGeocode: _baZiInfo.districtGeocode,
				daYun: chooseDaYun.ganZhi,
				liuYue: allDaYun,
			},
			timeline_data: tempTimeLineData,
		};
		const res : ResponseData<AIChat> = await _aiDeductionStore.postAIChatStore(param);
		console.log(res.data, "结果")
		timer = setInterval(async () => {
			try {
				let params : AIContentFormData = {
					chatId: _aiDeductionStore.aiChat.chatId,
					conversationId: _aiDeductionStore.aiChat.conversationId
				};
				const responsse : ResponseData<AIContent> = await _aiDeductionStore.postAIContentStoreFN(params);
				console.log(responsse.data, "开始轮询结果", chooseDaYun)
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

	const changeLiuNian = async (v : string) => {
		// 先找到当前索引
		let itemIndex = _baZiInfo.daYun.findIndex((item) => item.startYear == _baZiInfo.daYun.startYear)
		let desc = "往后没有数据了";
		// 如果是下个十年
		if (v == 'next') {
			itemIndex++;

		} else {
			itemIndex--;
		}
		console.log(itemIndex,"索引");
		if (itemIndex < 0 || itemIndex >= _baZiInfo.daYun.length) {
			if (itemIndex<0) {
				desc = "往前没有数据了"
			}
			uni.showToast({
				title: desc,
				icon: 'error'
			})
			return
		}
	
		console.log("选中得大运（不是历史界面得哦）", chooseDaYun, tempIndex);
		// 当前选中大运
		isLoading.value = true;
		const chooseDaYun:LiuYue = _baZiInfo.daYun[itemIndex]
		_baZiInfo.daYun.startYear = chooseDaYun.startYear;
		_baZiInfo.daYun.endYear = chooseDaYun.endYear;
		_baZiInfo.daYun.daYun = chooseDaYun.ganZhi;
		let param : AIHistoryFormData = {
			pageNum: 1,
			pageSize: 10,
			gender: _baZiInfo.sex == '男' ? '乾造' : '坤造',
			birthday: _baZiInfo.birthDay,
			userName: _baZiInfo.userName,
			districtGeocode: _baZiInfo.districtGeocode,
			solar: _baZiInfo.solar,
			startYear: chooseDaYun.startYear,
			endYear: chooseDaYun.endYear,
		}
		console.log(param, _baZiInfo, "参数");
		isLoading.value = true;
		const res : ResponseData<any> = await _aiDeductionStore.getAILogsStoreFN(param)
		// 如果有已经生成得记录 
		if (res.rows && res.rows.length) {
			_aiDeductionStore.setRowEChartData(res.rows[0].content)
			isLoading.value = false;
		} else {
			postAIContent();
		}
	}
	onMounted(async () => {
	
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