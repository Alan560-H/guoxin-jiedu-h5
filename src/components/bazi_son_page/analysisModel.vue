<!-- 分析模式 -->
<template>
	<view class="model_2 flex_column gap_05rem" p-2>
		<!-- 信息概览 -->
		<view class="table_main flex_column gap_1rem">
			<view class="table_main_body">
				<!-- 四柱 -->
				<view class="flex_row table_title_bg border_bottom">
					<view class="flex_1 f_center" p-3 v-for="(item,index) in titles" :key="index">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 时间 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 f_center" p-3>
						<u-text text="时间" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-3 v-for="(item ,i) in times" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 十神 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 f_center" p-3>
						<u-text text="十神" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-3 v-for="(item ,i) in shishenArr" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 天干 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 f_center" p-3>
						<u-text text="天干" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in tianGanArr" :key="i">
						<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color"
								size="18px" bold></u-text></view>
						<view p-top-2 v-if="item!==''&&item!=null&&item!=undefined">
							<image style="height:40rpx;width:40rpx;" :src="COMUtils.fiveElementInfo(item).img"></image>
						</view>
					</view>
				</view>
				<!-- 地支 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 f_center" p-3>
						<u-text text="地支" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in dizhiArr" :key="i">
						<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color"
								size="18px" bold></u-text></view>
						<view p-top-2 v-if="item!==''&&item!=null&&item!=undefined">
							<image style="height:40rpx;width:40rpx;" :src="COMUtils.fiveElementInfo(item).img"></image>
						</view>
					</view>
				</view>
				<!-- 藏干 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 f_center" p-3>
						<u-text text="藏干" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-1 v-for="(item ,i) in cangGanArr" :key="i">
						<view class="f_center" v-for="(txt,txtI) in cangGanTxts(item)" :key="txtI">
							<u-text :text="txt" align="center" :color="COMUtils.fiveElementInfo(txt).color"></u-text>
						</view>
					</view>
				</view>
				<!-- 藏干十神 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-3>
						<u-text text="藏干" align="center" color="#666666"></u-text>
						<u-text text="十神" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-1 v-for="(item ,i) in cangGanShiShenArr" :key="i">
						<view class="f_center" v-for="(itemStr ,i) in item" :key="i">
							<u-text :text="itemStr" align="center"></u-text>
						</view>
					</view>
				</view>
				<!-- 天干留意 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-3>
						<u-text text="天干留意" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-3 v-for="(item ,i) in tianGanLiuYiArr" :key="i">
						<u-text :text="str" align="center" v-for="(str,strI) in item " :key="strI"></u-text>
					</view>
				</view>
				<!-- 地支留意 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-3>
						<u-text text="地支留意" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-1 v-for="(item ,i) in diZhiLiuYiArr" :key="i">
						<u-text :text="str" align="center" v-for="(str,strI) in item " :key="strI"></u-text>
					</view>
				</view>

				<!-- 大运神煞 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class=" flex_col f_j_center" p-3>
						<u-text text="大运神煞" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_row f_warp" p-3>
						<view v-for="(item ,i) in daYunShenShaArr" :key="i" class="f_center" style="min-width: 80rpx;">
							<u-text :text="`${item}、`" align="center"></u-text>
						</view>
					</view>
				</view>
				<!-- 流年神煞 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class=" flex_col f_j_center" p-3>
						<u-text text="流年神煞" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_row f_warp" p-3>
						<view v-for="(item ,i) in liuNianShenShaArr" :key="i" class="f_center"
							style="min-width: 80rpx;">
							<u-text :text="`${item}、`" align="center"></u-text>
						</view>
					</view>
				</view>
				<!-- 流月神煞 -->
				<view class="flex_row table_row_bg">
					<view class=" flex_col f_j_center" p-3>
						<u-text text="流月神煞" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_row f_warp" p-3>
						<view v-for="(item ,i) in liuYueShenShaArr" :key="i" class="f_center" style="min-width: 80rpx;">
							<u-text :text="`${item}、`" align="center"></u-text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 选择大运流年流月 -->
		<view class="common_border_all">
			<!-- 大运 -->
			<view class=" flex_row">
				<view p-3 class="f_center flex_column table_title_bg2 border_right border_bottom">
					<u-text text="大" size="20px" algin="center" bold></u-text>
					<u-text text="运" size="20px" algin="center" bold></u-text>
				</view>
				<view class="flex_1 flex_row" style="overflow-x:auto;">
					<view class="common_border_all" :class="yunInfo.index == i?'active':''" @click="chooseYun(yun)" p-1
						v-for="(yun,i) in baZiStore.baZiInfo.daYun" :key="i" style="min-width: 140rpx;">
						<view class="flex_column">
							<u-text :text="yun.endYear" align="center"></u-text>
							<u-text :text="`${yun.startAge}岁`" align="center"></u-text>
						</view>
						<view class="f_center flex_row gap_05rem">
							<view>
								<u-text size="20px" :text="yun.ganZhi[0]" bold
									:color="COMUtils.fiveElementInfo(yun.ganZhi[0]).color"></u-text>
							</view>
							<view p-b-2>
								<u-text :text="shishenEllipsis(yun.shiShen[0])" align="center" size="13px"></u-text>
							</view>
						</view>

						<view class="f_center flex_row gap_05rem">
							<view>
								<u-text size="20px" :text="yun.ganZhi[1]" bold
									:color="COMUtils.fiveElementInfo(yun.ganZhi[1]).color"></u-text>
							</view>
							<view p-b-2>
								<u-text :text="shishenEllipsis(yun.shiShen[1])" align="center" size="13px"></u-text>
							</view>

						</view>
					</view>
				</view>
			</view>
			<!-- 流年 -->
			<view class=" flex_row">
				<view p-3 class="f_center flex_column table_title_bg2 border_right border_bottom">
					<u-text text="流" size="20px" algin="center" bold></u-text>
					<u-text text="年" size="20px" algin="center" bold></u-text>
				</view>
				<view class="flex_1 flex_row" style="overflow-x:auto;">
					<view class="common_border_all" :class="liuNianInfo.index == i?'active':''"
						@click="chooseLiuNian(liu)" p-1 v-for="(liu,i) in liuNianComputed" :key="i"
						style="min-width: 140rpx;">
						<view class="flex_column">
							<u-text :text="liu.year" align="center"></u-text>
							<u-text :text="`${liu.age}岁`" align="center"></u-text>
						</view>
						<view class="f_center flex_row gap_05rem">
							<view>
								<u-text size="20px" :text="liu.ganZhi[0]" bold
									:color="COMUtils.fiveElementInfo(liu.ganZhi[0]).color"></u-text>
							</view>
							<view p-b-2>
								<u-text :text="shishenEllipsis(liu.shiShen[0])" align="center" size="13px"></u-text>
							</view>
						</view>

						<view class="f_center flex_row gap_05rem">
							<view>
								<u-text size="20px" :text="liu.ganZhi[1]" bold
									:color="COMUtils.fiveElementInfo(liu.ganZhi[1]).color"></u-text>
							</view>
							<view p-b-2>
								<u-text :text="shishenEllipsis(liu.shiShen[1])" align="center" size="13px"></u-text>
							</view>

						</view>
					</view>
				</view>
			</view>
			<!-- 流月 -->
			<view class=" flex_row">
				<view p-3 class="f_center flex_column table_title_bg2 border_right">
					<u-text text="流" size="20px" algin="center" bold></u-text>
					<u-text text="月" size="20px" algin="center" bold></u-text>
				</view>
				<view class="flex_1 flex_row" style="overflow-x:auto;">
					<view v-if="liuYueInfoArr.length" class="common_border_all"
						:class="liuYueInfo.index == i?'active':''" @click="chooseLiuYue(liuYue)" p-1
						v-for="(liuYue,i) in liuYueInfoArr" :key="i" style="min-width: 140rpx;">
						<view class="flex_column">
							<u-text :text="jieqiTime(liuYue)" align="center"></u-text>
							<u-text :text="`${liuYue.jieName||'-'}`" align="center"></u-text>
						</view>
						<view class="f_center flex_row gap_05rem">
							<view>
								<u-text size="20px" :text="liuYue.ganZhi[0]" bold
									:color="COMUtils.fiveElementInfo(liuYue.ganZhi[0]).color"></u-text>
							</view>
							<view p-b-2>
								<u-text :text="shishenEllipsis(liuYue.shiShen[0])" align="center" size="13px"></u-text>
							</view>
						</view>

						<view class="f_center flex_row gap_05rem">
							<view>
								<u-text size="20px" :text="liuYue.ganZhi[1]" bold
									:color="COMUtils.fiveElementInfo(liuYue.ganZhi[1]).color"></u-text>
							</view>
							<view p-b-2>
								<u-text :text="shishenEllipsis(liuYue.shiShen[1])" align="center" size="13px"></u-text>
							</view>

						</view>
					</view>
					<view class=" flex_1 f_center" v-else>
						<u-text text="提示:点选流年年份后显示流月结果" align="center" size="18px" color="#ba926c" bold></u-text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>


<script setup lang="ts">
	import { shengPingStore } from "@/stores/shengPingStore"
	import traditionModel from "./traditionModel"
	import { ref, reactive, computed } from "vue"
	import { COMUtils } from '@/utils/commonUtils'
	import { shishenEllipsis } from '@/utils/index.js'
	import { getBaZiLiuYue } from "@/api/bazi"
	import type { FormData } from "@/models/customForm"
	const baZiStore = shengPingStore();
	// 选中得大运
	let yunInfo = reactive(baZiStore.baZiInfo.daYun[1]
		? JSON.parse(JSON.stringify(baZiStore.baZiInfo.daYun[1]))
		: {});
	// 选中得流年
	let liuNianInfo = reactive({});
	// 选中得流月
	let liuYueInfo = reactive({});
	// 返回得流月数据
	let liuYueInfoArr = reactive([]);
	// 选中大运方法
	function chooseYun(yun) {
		// 清空现有属性
		Object.keys(yunInfo).forEach(key => delete yunInfo[key]);

		// 清空选中得流年属性
		Object.keys(liuNianInfo).forEach(key => delete liuNianInfo[key]);
		// 清空选中得流月属性
		Object.keys(liuYueInfo).forEach(key => delete liuYueInfo[key]);
		// 重置返回得流月数据
		liuYueInfoArr.length = 0;
		// 重新赋值
		Object.assign(liuNianInfo, {});
		// 深拷贝
		Object.assign(yunInfo, JSON.parse(JSON.stringify(yun)));
		console.log("选中得大运数据", yunInfo);
		times[0] = `${yunInfo.startAge}-${yunInfo.endAge}岁`;
		shishenArr[0] = yunInfo.shiShen[0]
		tianGanArr[0] = yunInfo.ganZhi[0]
		dizhiArr[0] = yunInfo.ganZhi[1]
		cangGanArr[0] = yunInfo.cangGan
		cangGanShiShenArr[0] = yunInfo.cangGanShiShen
		tianGanLiuYiArr[0] = yunInfo.tianGanAttention
		diZhiLiuYiArr[0] = yunInfo.diZhiAttention
		// 重置+清除
		daYunShenShaArr.splice(0, daYunShenShaArr.length, ...(yunInfo.shenSha || []));

	}
	// 选中大运后，返会得流年数组
	const liuNianComputed = computed(() => {
		if (yunInfo.customLiuNian) {
			return yunInfo.customLiuNian;
		} else {
			return [];
		}
	})

	// 选中得流年方法，选中流年后去请求流月数据
	function chooseLiuNian(yun) {
		Object.assign(liuNianInfo, yun);
		console.log("选中得流年", liuNianInfo);
		times[1] = `${liuNianInfo.year}年`;
		shishenArr[1] = liuNianInfo.shiShen[1]
		tianGanArr[1] = liuNianInfo.ganZhi[0]
		dizhiArr[1] = liuNianInfo.ganZhi[1]
		cangGanArr[1] = liuNianInfo.cangGan
		cangGanShiShenArr[1] = liuNianInfo.cangGanShiShen
		tianGanLiuYiArr[1] = liuNianInfo.tianGanAttention
		diZhiLiuYiArr[1] = liuNianInfo.diZhiAttention
		// 重置+清除
		liuNianShenShaArr.splice(0, liuNianShenShaArr.length, ...(liuNianInfo.shenSha || []));
		// 设置时间行，流年数据

		let { userName, birthDay, sex, districtGeocode } = baZiStore.baZiInfo;
		let tempFormData : FormData = {
			userName: userName, // 姓名
			birthDay: birthDay,//生辰
			sex: sex,// 性别：1：男 0：女
			solar: (baZiStore.baZiInfo.trueSolarTime && baZiStore.baZiInfo.trueSolarTime != "") ? true : false,//是否使用真太阳时 true：使用，false：不适用
			districtGeocode: districtGeocode, // 地区编码
			yearMonth: liuNianInfo.year,//流月要求得数据
			type: "jiulong" // 派系

		};
		getBaZiLiuYue(tempFormData).then((res) => {
			// 清空选中得流月属性
			Object.keys(liuYueInfo).forEach(key => delete liuYueInfo[key]);
			// 重置+清除
			liuYueInfoArr.splice(0, liuYueInfoArr.length, ...(res.data || []));
			console.log(liuYueInfoArr, "返沪得六月数据");
		})
	}
	function chooseLiuYue(liuYue) {
		Object.assign(liuYueInfo, liuYue);
		times[2] = `${liuYueInfo.monthInChinese}月`;
		shishenArr[2] = liuYueInfo.shiShen[1]
		tianGanArr[2] = liuYueInfo.ganZhi[0]
		dizhiArr[2] = liuYueInfo.ganZhi[1]
		cangGanArr[2] = liuYueInfo.cangGan
		cangGanShiShenArr[2] = liuYueInfo.cangGanShiShen
		tianGanLiuYiArr[2] = liuYueInfo.tianGanAttention
		diZhiLiuYiArr[2] = liuYueInfo.diZhiAttention
		// 重置，重新赋值
		liuYueShenShaArr.splice(0, liuYueShenShaArr.length, ...(liuYueInfo.shenSha || []));
	}
	function jieqiTime(ele) {
		let tem = ele.jieSolar.split(" ")[0];
		let date = tem.split("-");
		return `${date[1]}-${date[2]}`;
	}
	const titles = reactive(["时间", "大运", "流年", "流月"])
	// 时间
	const times = reactive([`${yunInfo.startAge}-${yunInfo.endAge}岁`, "", ""])
	// 十神
	const shishenArr = reactive([yunInfo.shiShen[0], "", ""])
	// 天干
	const tianGanArr = reactive([yunInfo.ganZhi[0], "", ""])
	// 地址
	const dizhiArr = reactive([yunInfo.ganZhi[1], "", ""])
	// 藏干
	const cangGanArr = reactive([yunInfo?.cangGan, "", ""])
	// 藏干十神
	const cangGanShiShenArr = reactive([yunInfo?.cangGanShiShen, "", ""])
	// 天干留意
	const tianGanLiuYiArr = reactive([yunInfo?.tianGanAttention, "", ""])
	// 地支留意
	const diZhiLiuYiArr = reactive([yunInfo?.diZhiAttention, "", ""])
	// 大运神煞
	const daYunShenShaArr = reactive(yunInfo?.shenSha ?? [])
	// 流年神煞
	const liuNianShenShaArr = reactive(liuNianInfo?.shenSha ?? [])
	// 流月神煞
	const liuYueShenShaArr = reactive(liuYueInfo?.shenSha ?? [])

	// 藏干分割方法
	const cangGanTxts = (str : string) => {
		return str?.split(',');
	};
	const arr4 = reactive(["", "", ""])


	console.log("大运", shishenEllipsis);
</script>



<style lang="scss" scoped>
	.model_2 {

		.active {
			background-color: #c5a680;
		}

		.table_title_bg {
			background-color: #eaeaea;
		}

		.table_title_bg2 {
			background-color: #f4dac8;
		}


		.table_main {
			.table_main_body {
				border: 2rpx #333 solid;



				.table_row_bg {
					background-color: #fff;
				}
			}

		}
	}
</style>