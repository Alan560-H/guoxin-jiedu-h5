<template>
	<view class="ai_history flex_column fill_div">
		<!-- 头部 -->
		<view class="flex_row" p-3>
			<u-text text="历史测算档案" bold size="24px" color="#854d0e" />
		</view>
		<!-- 表单 -->
		<view class="hzs_test table" m-2>
			<!-- 表头 -->
			<view class="flex_row">
				<view class="f_center item" p-2>
					<u-text text="时间/姓名" align="center" bold size="16px" color="#887870"></u-text>
				</view>
				<view class="flex_1 f_center" p-2>
					<u-text text="测算八字(年/月/日/时)" align="center" bold size="16px" color="#887870"></u-text>
				</view>
				<view class="f_center item2" p-2>
					<u-text text="操作" align="center" bold size="16px" color="#887870"></u-text>
				</view>
			</view>
			<view class="table_body">
				<view class="flex_row table_border_top " v-for="(historyItem,index) in _aiDeductionStore.aiLogsArr"
					:key="index">
					<view class="f_center item flex_column" p-2>
						<u-text :text="historyItem.userName?historyItem.userName:'暂无'" align="center" bold color="#887870"></u-text>
						<u-text :text="historyItem.generateDate" align="center" bold color="#887870"></u-text>
					</view>
					<view class="flex_1 f_center flex_column gap_05rem" p-2>
						<view class="flex_row gap_05rem">
							<view v-for="(txt,i) in historyItem.bazi" :key="i">
								<u-text :text="txt" align="center" bold color="#333" size="19px"></u-text>
							</view>
						</view>
						<u-text :text="`${historyItem.birthday}·${historyItem.gender}`" align="center"
							type="info"></u-text>
					</view>
					<view class="f_center item2" p-2>
						<u-button size="mini" :custom-style="customStyle"
							@click="_aiDeductionStore.chooseHistoryFN(historyItem)">
							<u-text text="查看" align="center" bold size="16px" color="#8a5519"></u-text>
						</u-button>
					</view>
				</view>
				<view p-2 v-if="_aiDeductionStore.historyTotal>historyParam.pageSize">
					<u-pagination @change="_aiDeductionStore.getAILogsStoreFN(historyParam)" v-model="historyParam.pageNum" :total="_aiDeductionStore.historyTotal"></u-pagination>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup lang="ts">
	import {  reactive, onMounted} from "vue"
	import { aiDeductionStore } from "@/stores/aiDeductionStore"
	import type {AIHistoryFormData } from "@/models/customForm"
	const _aiDeductionStore = aiDeductionStore()
	const historyParam = reactive<AIHistoryFormData>({
		pageNum: 1,
		pageSize: 999,
	})
	onMounted(() => {
		_aiDeductionStore.getAILogsStoreFN(historyParam);
	})
	const customStyle = reactive({
		background: "#f9f6f3",
		border: 'none'
	})
	const goBack = () => {
		uni.navigateBack()
	}

</script>

<style lang="scss">
	.ai_history {
		background: #f5f2eb;
		min-height: 70vh;

		.table {
			border: 1rpx solid #ece8e0;
			border-radius: 20rpx;
			overflow: hidden;
		}

		.table_body {
			background: #fff;
		}

		.item {
			width: 190rpx;
		}

		.item2 {
			width: 190rx;
		}

		.table_border_top {
			border-top: 1rpx solid #ece8e0;
		}
	}
</style>