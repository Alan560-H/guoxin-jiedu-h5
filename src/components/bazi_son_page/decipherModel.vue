<!-- 解读模式 -->
<template>
	<view class="model_3 " p-2>
		<!-- 五行能量 -->
		<view class="table_main flex_column gap_05rem">
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="wxnlShow=!wxnlShow">
					<view class="flex_1 flex_row" p-3>
						<u-text text="五行能量" align="left" bold></u-text>
						<u-icon :name="wxnlShow?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<view v-if="wxnlShow">
					<!-- 四柱 -->
					<view class="flex_row table_title_bg border_bottom">
						<view class="flex_1 f_center" p-3 v-for="(item,index) in ['年柱','月柱','日柱','时柱']" :key="index">
							<u-text :text="item" align="center"></u-text>
						</view>
					</view>
					<!-- 天干 -->
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1 f_center flex_column" p-1 v-for="(item ,i) in tiangan" :key="i">
							<view>
								<u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="20px"
									bold></u-text>
							</view>
							<view><u-text :text="getBotTxt(i,'year')" align="center" size="20"></u-text></view>
						</view>
					</view>
					<!-- 地支 -->
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1 f_center flex_column" p-1 v-for="(item ,i) in dizhi" :key="i">
							<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="20px"
									bold></u-text></view>
							<view><u-text :text="getBotTxt(i,'auther')" align="center" size="20"></u-text></view>
						</view>
					</view>
					<!-- 能量值 -->
					<view class="flex_column table_row_bg gap_05rem" p-2>
						<view class="flex_row fill_width f_j_sb">
							<view>
								<u-text text="能量值" bold size="20px"></u-text>
							</view>
							<view>
								<u-text :text="`${baZiInfo.guangYuanShenQiangShenRuo.tongDangScore}点`" bold
									size="20px"></u-text>
							</view>
						</view>
						<view class="flex_row fill_width f_j_sb">
							<view>
								<u-text text="结论" size="20px"></u-text>
							</view>
							<view>
								<u-text :text="`能量值${isShenqiang()?'强':'弱'}`" bold size="20px"></u-text>
							</view>
						</view>
						<view class="flex_row fill_width f_j_sb">
							<view>
								<u-text text="" size="20px"></u-text>
							</view>
							<view>
								<u-text :text="`*打能量值仅供参考`" type="info"></u-text>
							</view>
						</view>
						<view class="flex_row fill_width f_j_sb gap_05rem">
							<view>
								<u-text text="弱" size="20px"></u-text>
							</view>
							<view class="flex_1 f_center">
								<u-line-progress :percent="baZiInfo.strongWeakScore" :show-percent="false" height="50"
									striped striped-active round active-color="#d3653c"></u-line-progress>
							</view>
							<view>
								<u-text text="旺" size="20px"></u-text>
							</view>
						</view>
						<view class="flex_row">
							<view class="flex_1 f_center flex_column" v-for="(item,index) in proDesc" :key="index">
								<u-text :text="item.value" align="center"></u-text>
								<u-text :text="item.desc" align="center"></u-text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="xjysShow=!xjysShow">
					<view class="flex_1 flex_row" p-3>
						<u-text text="喜、忌、用神" align="left" bold></u-text>
						<u-icon :name="xjysShow?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<view v-if="xjysShow">
					<!-- 四柱 -->
					<view class="flex_row table_title_bg border_bottom">
						<view class="flex_1 f_center" p-3 v-for="(item,index) in ['年柱','月柱','日柱','时柱']" :key="index">
							<u-text :text="item" align="center"></u-text>
						</view>
					</view>
					<!-- 天干 -->
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1 f_center flex_column" p-1 v-for="(item ,i) in tiangan" :key="i">
							<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="20px"
									bold></u-text></view>
							<view><u-text :text="getBotTxt(i,'year')" align="center" size="20"></u-text></view>
						</view>
					</view>
					<!-- 地支 -->
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1 f_center flex_column" p-1 v-for="(item ,i) in dizhi" :key="i">
							<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="20px"
									bold></u-text></view>
							<view><u-text :text="getBotTxt(i,'auther')" align="center" size="20"></u-text></view>
						</view>
					</view>
					<!-- 旺 -->
					<view class=" f_center flex_row f_j_sa table_row_bg border_bottom" p-3
						v-for="(row,rowI) in xiJiYongShen" :key="rowI">
						<view class="row f_center" :class="I==4?'round':''" :style="
							I==4?fiveElementYongshen(rowInfo):{}" v-for="(rowInfo,I) in row" :key="I">
							<view>
								<u-text :text="rowInfo" :color="I==4?'#fff':'#333'"></u-text>
							</view>

						</view>
					</view>
				</view>

			</view>
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="cggsShow=!cggsShow">
					<view class="flex_1 flex_row" p-3>
						<u-text text="藏干个数" align="left" bold></u-text>
						<u-icon :name="cggsShow?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<view v-if="cggsShow">
					<!-- 四柱 -->
					<view class="flex_row table_title_bg border_bottom">
						<view class="flex_1 f_center" p-3 v-for="(item,index) in ['年柱','月柱','日柱','时柱']" :key="index">
							<u-text :text="item" align="center"></u-text>
						</view>
					</view>
					<!-- 天干 -->
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1 f_center flex_column" p-1 v-for="(item ,i) in tiangan" :key="i">
							<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="20px"
									bold></u-text></view>
							<view><u-text :text="getBotTxt(i,'year')" align="center" size="20"></u-text></view>
						</view>
					</view>
					<view class="flex_row table_row_bg ">
						<view class="flex_1 f_center flex_column" p-1 v-for="(item ,i) in dizhi" :key="i">
							<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="20px"
									bold></u-text></view>

						</view>
					</view>
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1" p-1 v-for="(item ,i) in cangGan" :key="i">
							<view class="f_center" v-for="(txt,txtI) in cangGanTxts(item)" :key="txtI">
								<u-text :text="COMUtils.fiveElementInfo(txt).name" align="center"
									:color="COMUtils.fiveElementInfo(txt).color"></u-text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="wxShow=!wxShow">
					<view class="flex_1 flex_row" p-3>
						<u-text text="五行个数" align="left" bold></u-text>
						<u-icon :name="wxShow?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<view v-if="wxShow">
					<view class="flex_column gap_05rem" p-3 v-for="(item,index) in wuXingCount" :key="index">
						<view class="flex_1 f_center">
							<u-line-progress :percent="item.count/5*100" :show-percent="false" height="40" striped
								striped-active round :active-color="item.color"></u-line-progress>
						</view>
						<view>
							<u-text :text="item.title" :color="item.color" size="18px" bold></u-text>
							<u-text :text="`${item.count}个${item.txt}`"></u-text>
						</view>
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
	import {COMUtils} from '@/utils/commonUtils'


	// 五行能量显示/隐藏
	const wxnlShow = ref(true);
	// 喜忌用神显示/隐藏
	const xjysShow = ref(true);
	// 藏干个数显示/隐藏
	const cggsShow = ref(true);
	// 五行个数显示/隐藏
	const wxShow = ref(true);
	const baZiStore = shengPingStore()
	// 排盘信息
	const baZiInfo = baZiStore.baZiInfo;
	const isShenqiang = () => {
		return baZiInfo.strongWeakScore > 50;
	}
	const proDesc = [
		{ value: 0, desc: "极弱" },
		{ value: 25, desc: "弱" },
		{ value: 45, desc: "偏弱" },
		{ value: 55, desc: "偏强" },
		{ value: 75, desc: "强" },
		{ value: 100, desc: "机枪" },
	];
	function fiveElementYongshen(type) {
		console.log(type, "传令");
		let {
			color,
			img
		} = wuxingColor.getWuxingColorInfo(type)
		return `color: #fff;backgroundColor: ${color}`
	}
	const xiJiYongShen = reactive([
		["旺", "———", `我${isShenqiang() ? '生' : '克'}的`, "———", baZiInfo.shen.oneShen, "———", "最喜用神"],
		["相", "———", `我${isShenqiang() ? '生' : '克'}的`, "———", baZiInfo.shen.twoShen, "———", "次喜用神"],
		["休", "———", `我${isShenqiang() ? '生' : '克'}的`, "———", baZiInfo.shen.threeShen, "———", `${isShenqiang() ? '三喜用神' : '三忌神'}`],
		["囚", "———", `我${isShenqiang() ? '生' : '克'}的`, "———", baZiInfo.shen.fourShen, "———", "次\u00A0\u00A0忌\u00A0\u00A0神"],
		["死", "———", `我${isShenqiang() ? '生' : '克'}的`, "———", baZiInfo.shen.fiveShen, "———", "最\u00A0\u00A0忌\u00A0\u00A0神"],
	]);
	// 五行个数
	const wuXingCount = reactive([
		{ color: '#C94400', title: '火', count: baZiInfo.wuXingCountShiShen.fireCount, txt: baZiInfo.wuXingCountShiShen.fireShiShen },
		{ color: '#926500', title: '土', count: baZiInfo.wuXingCountShiShen.earthCount, txt: baZiInfo.wuXingCountShiShen.earthShiShen },
		{ color: '#00BA7D', title: '木', count: baZiInfo.wuXingCountShiShen.woodCount, txt: baZiInfo.wuXingCountShiShen.woodShiShen },
		{ color: '#417ff8', title: '水', count: baZiInfo.wuXingCountShiShen.waterCount, txt: baZiInfo.wuXingCountShiShen.waterShiShen },
		{ color: '#ECAB47', title: '火', count: baZiInfo.wuXingCountShiShen.metalCount, txt: baZiInfo.wuXingCountShiShen.metalShiShen },
	]);
	// 天干
	const tiangan = baZiStore.baziTiangan;
	// 地支
	const dizhi = baZiStore.baziDizhi;
	// 藏干
	const cangGan = baZiStore.baziCanggan;
	const cangGanTxts = (str : string) => {
		return str.split(',');
	};
	const getBotTxt = (index : number, type : string) => {
		if (type == 'year') {
			switch (index) {
				case 0:
					return "年干";
				case 1:
					return "月干";
				case 2:
					return "日干（日元）";
				case 3:
					return "时干";
			}
		} else {
			switch (index) {
				case 0:
					return "年支";
				case 1:
					return "月支";
				case 2:
					return "日支";
				case 3:
					return "时支";
			}
		}
	}
	
</script>



<style lang="scss" scoped>
	.model_3 {


		.table_main {
			.table_main_body {
				border: 2rpx #333 solid;

				.table_title_bg {
					background-color: #eaeaea;
				}

				.table_title_bg2 {
					background-color: #f4dac8;
				}

				.table_row_bg {
					background-color: #fff;
				}

				.round {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
				}
			}

		}
	}
</style>