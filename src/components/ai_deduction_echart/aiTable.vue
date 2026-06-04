<template>
	<view class="flex_column gap_1rem">
		<view style="border-left: 8rpx solid #854d0e;" p-2>
			<u-text text="运势量化明细表" color="#854d0e" size="24px" bold></u-text>
			<u-text text="数据来源：天机子平量化引擎" color="#854d0e" type="info"></u-text>
		</view>
		<!-- ai推演图表-->
		<view class="table_main_body" style="overflow-x: auto;">
			<!-- 表头 -->
			<view class="flex_row ">
				<view v-for="(title,index) in titles" :key="index">
					<view class=" table_title_bg border_bottom f_center flex_row"
						:class="index<=0||index>4?'col_width':'col_width2'" p-2>
						<u-text :text="title" align="center"></u-text>
					</view>
				</view>
			</view>
			<!-- 表体 -->
			<view>
				<view v-for="(row,rowI) in props.rowData" :key="rowI" class="flex_row" @click="chooseItem(row)">
					<!-- 年份/干支 -->
					<view>
						<view class="col_width table_title_bg border_bottom f_center flex_row" p-2>
							<u-text :text="row.year" align="center" bold></u-text>
							<u-text :text="row.ganzhi" align="center"></u-text>
						</view>
					</view>
					<!-- 岁启 -->
					<view>
						<view class="col_width2 table_title_bg border_bottom f_center flex_row" p-2>
							<u-text :text="row.values[0]>0?`+${row.values[0]}`:row.values[0]"
								:color="row.values[0]>0?'red':'green'" align="center" bold></u-text>
						</view>
					</view>
					<!-- 定局 -->
					<view>
						<view class="col_width2 table_title_bg border_bottom f_center flex_row" p-2>
							<u-text :text="row.values[1]>0?`+${row.values[2]}`:row.values[2]"
								:color="row.values[2]>0?'red':'green'" align="center" bold></u-text>
						</view>
					</view>
					<!-- 承旺 -->
					<view>
						<view class="col_width2 table_title_bg border_bottom f_center flex_row" p-2>
							<u-text :text="row.values[2]>0?`+${row.values[2]}`:row.values[2]"
								:color="row.values[2]>0?'red':'green'" align="center" bold></u-text>
						</view>
					</view>
					<!-- 否极 -->
					<view>
						<view class="col_width2 table_title_bg border_bottom f_center flex_row" p-2>
							<u-text :text="row.values[3]>0?`+${row.values[3]}`:row.values[3]"
								:color="row.values[3]>0?'red':'green'" align="center" bold></u-text>
						</view>
					</view>
					<!-- 关键转折点 -->
					<view>
						<view class="col_width table_title_bg border_bottom f_center flex_row" p-2>
							<view class="fill_view f_center tag" v-if="row.turningPoint!=null" p-1
								:style="getTurningPointStyle(row.turningPoint)">
								<u-text :text="row.turningPoint" size="18" align="center"></u-text>
							</view>
							<view class="fill_view f_center" v-else>
								-
							</view>
						</view>
					</view>
					<!-- 量化点评 -->
					<view>
						<view class="col_width table_title_bg border_bottom f_center flex_row" p-2>
							<u-text :text="row.note" align="center" lines='1'></u-text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 流年详情 -->
		<u-modal v-model="show" :show-title="false" confirm-text="关闭">
			<view class="slot-content">
				<!-- header -->
				<view class="flex_row f_j_sb" p-5 style="background: #f5f2eb;">
					<view class="flex_column">
						<u-text :text="`${chosseRow.year} · ${chosseRow.ganzhi}`" size="18px" bold
							color="#854d0e"></u-text>
						<u-text text="年度运势详批" type="info"></u-text>
					</view>
					<u-icon @click="show = false" name="close-circle-fill" color="#854d0e" size="25px"></u-icon>
				</view>
				<!-- body -->
				<view p-3>
					<!-- 量化点评 -->
					<view class="flex_column gap_05rem">
						<view class="flex_column " style="border-left: 8rpx solid #854d0e;" p-2>
							<u-text text="运势量化明细表" color="#854d0e" bold></u-text>
						</view>
						<view class="view_model_1" p-3>
							<u-text :text="chosseRow.note" align="center"></u-text>
						</view>
					</view>
					<!-- 年度格局 -->
					<view class="flex_column gap_05rem">
						<view class="flex_column " style="border-left: 8rpx solid #6366f1;" p-2>
							<u-text text="年度格局" color="#854d0e" bold></u-text>
						</view>
						<view class="view_model_1" p-3>
							<view class="custon_view fill_view f_center tag" v-if="chosseRow.turningPoint!=null" p-1
								:style="getTurningPointStyle(chosseRow.turningPoint)">
								<u-text :text="chosseRow.turningPoint" size="12px" align="center"></u-text>
							</view>
						</view>
					</view>
					<!-- 古籍原文 -->
					<view class="flex_column gap_05rem">
						<view class="flex_column " style="border-left: 8rpx solid #6366f1;" p-2>
							<u-text text="古籍原文" color="#854d0e" bold></u-text>
						</view>
						<view class="view_model_2" p-3>
							<u-text :text="getYuanWen()" color="#854d0e"></u-text>
						</view>
					</view>
				</view>

			</view>
		</u-modal>
	</view>
</template>


<script lang="ts" setup>
	import { ref, reactive, watch, toRaw } from "vue"
	import type { RowEChartData } from "@/models/customAiBaZiInput";
	const props = defineProps<{
		rowData : Record<string, RowEChartData>; // 接收你传入的 rowEChartData
	}>();

	// // 8. 监听 rowData 变化，更新图表
	watch(
		() => props.rowData,
		(newVal, oldVal) => {
			console.log('===== rowData 发生变化 =====，我是表格里得拉');
			console.log('旧值：', toRaw(oldVal)); // toRaw避免看到Vue响应式代理，只看真实数据
			console.log('新值：', toRaw(newVal));
		},
		{ deep: true } // 深度监听对象变化
	);

	const titles = ['年份/干支', '岁启', '定局', '承旺', '否极', '关键转折点', '量化点评'];
	const show = ref<boolean>(false)
	let chosseRow : RowEChartData = {};
	const getYuanWen = () => {
		const ancientText = `
		    岁次${chosseRow.ganzhi}，纳音${chosseRow.nayin}。
		    ${chosseRow.note.substring(1, 6)}者，气运流转之机也。
		    是以君子藏器于身，待时而动。
		    
		    《渊海子平》卷三·流年论云：
		    “${chosseRow.ganzhi}之年，${chosseRow.values[0] > 0 ? '阳气始生' : '阴气凝结'}，凡谋事者，${chosseRow.values[1] > 0 ? '吉曜照临' : '凶星隐伏'}，不可不察。”
		  `;
		return ancientText
	}
	const chooseItem = (row : RowEChartData) => {
		chosseRow = row;
		console.log(chosseRow, "选中得");
		show.value = true;
	}

	console.log(props.rowData, "数据源")
	const getTurningPointStyle = (type : string) => {
		if (!type) return '';
		switch (type) {
			case '飞龙在天': return { border: '1px #fed1d1 solid', background: '#fef2f2', borderRadius: "10rpx" };
			case '潜龙勿用': return { border: '1px #e6ebf2 solid', background: '#f8fafc', borderRadius: "10rpx" };
			case '绝处逢生': return { border: '1px #b0f4d4 solid', background: '#ecfdf5', borderRadius: "10rpx" };
			case '惊涛骇浪': return { border: '1px #fedbb2 solid', background: '#fff7ed', borderRadius: "10rpx" };
			default: return { border: '1px #f9fafb solid', background: '#6b7280', borderRadius: "10rpx" };
		}
	}
</script>

<style scoped lang="scss">
	.table_main_body {
		border: 2rpx #333 solid;

		.col_width {
			width: 250rpx;
			height: 80rpx;
		}

		.col_width2 {
			width: 100rpx;
			height: 80rpx;
		}

		.table_title_bg {
			background-color: #f5f2eb;

		}

		.tag {
			width: 150rpx;
		}

	}

	.slot-content {

		.view_model_1 {
			background: #fff;
			border: #f7f7f6 solid 2rpx;
			border-radius: 10rpx;

			.custon_view {
				width: 130rpx;
				height: 80rpx;
			}
		}

		.view_model_2 {
			background: #f7f5f0;
		}
	}
</style>