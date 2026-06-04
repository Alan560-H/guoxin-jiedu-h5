<!-- 传统模式 -->
<template>
	<view class="model_1">
		<!-- 用户信息 -->
		<view class="flex_column gap_05rem" p-3 style="background-color: #d3653c;">
			<view class="flex_row">
				<u-text class="flex_1" :text="`姓名：${baZiInfo.userName} | 性别：${baZiInfo.sex} | 地区：${baZiInfo.area}`"
					color="#fff"></u-text>
			</view>
			<view class="flex_row">
				<u-text :text="`农历：${baZiInfo.lunarDate}`" color="#fff"></u-text>
			</view>
			<view class="flex_row">
				<u-text :text="`阳历：${baZiInfo.trueSolarTime	}`" color="#fff"></u-text>
			</view>
		</view>
		<!-- 排盘信息 -->
		<view class="table_main flex_column gap_1rem" p-3>
			<!-- 基础表格 -->
			<view class="table_main_body">
				<!-- 四柱 -->
				<view class="flex_row table_title_bg border_bottom">
					<view class="flex_1 f_center" p-3 v-for="(item,index) in ['时间','年柱','月柱','日柱','时柱']" :key="index">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 十神 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 " p-1>
						<u-text text="十神" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in shiShen" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 天干 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 " p-1>
						<u-text text="天干" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in tiangan" :key="i">
						<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="28px" bold></u-text></view>
					</view>
				</view>
				<!-- 地支 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 " p-1>
						<u-text text="地支" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in dizhi" :key="i">
						<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color" size="28px" bold></u-text></view>
					</view>
				</view>
				<!-- 藏干 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-1>
						<u-text text="藏干" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-1 v-for="(item ,i) in cangGan" :key="i">
						<view class="f_center" v-for="(txt,txtI) in cangGanTxts(item)" :key="txtI">
							<u-text :text="txt" align="center" :color="COMUtils.fiveElementInfo(txt).color"></u-text>
						</view>
					</view>
				</view>
				<!-- 藏干十神 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-1>
						<u-text text="藏干" align="center" color="#666666"></u-text>
						<u-text text="十神" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-1 v-for="(item ,i) in cangGanShiShen" :key="i">
						<view class="f_center" v-for="(itemStr ,i) in item" :key="i">
							<u-text :text="itemStr" align="center"></u-text>
						</view>
					</view>
				</view>
				<!-- 星运 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-1>
						<u-text text="星运" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in xingYun" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 自坐 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-1>
						<u-text text="自坐" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in ziZuo" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 空亡 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-1>
						<u-text text="空亡" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 f_center" p-1 v-for="(item ,i) in kongwang" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>
				<!-- 神煞 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-1>
						<u-text text="神煞" align="center" color="#666666" lineHeight="50rpx"></u-text>
					</view>
					<view class="flex_1 flex_col" p-1 v-for="(itemSS ,i) in shensha" :key="i">
						<view class="f_center" v-for="(itemStr ,sI) in itemSS" :key="sI">
							<u-text :text="itemStr" align="center"  lineHeight="50rpx"></u-text>
						</view>
					</view>
				</view>
				<!-- 天干留意 -->
				<view class="flex_row table_row_bg border_bottom">
					<view class="flex_1 flex_col f_j_center" p-3>
						<u-text text="天干留意" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-3 v-for="(item ,i) in baZiStore.tianGanAttention" :key="i">
						<u-text :text="str" align="center" v-for="(str,strI) in item " :key="strI"></u-text>
					</view>
				</view>
				<!-- 地支留意 -->
				<view class="flex_row table_row_bg">
					<view class="flex_1 flex_col f_j_center" p-3>
						<u-text text="地支留意" align="center" color="#666666"></u-text>
					</view>
					<view class="flex_1 flex_col" p-3 v-for="(item ,i) in baZiStore.diZhiAttention" :key="i">
						<u-text :text="item" align="center"></u-text>
					</view>
				</view>

			</view>
			<!-- 袁天罡称骨 -->
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="ytgShow=!ytgShow">
					<view class="flex_1 flex_row" p-3>
						<u-text text="袁天罡称骨" align="left" bold></u-text>
						<u-icon :name="ytgShow?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<!-- 称骨重量 -->
				<view class="flex_row table_row_bg border_bottom" p-3 v-if="ytgShow">
					<u-text text="称骨重量：" align="left" color="#666666"></u-text>
					<u-text :text="baZiInfo.weight" align="left" color="#666666"></u-text>
				</view>
			</view>
			<!-- 宫位分析 -->
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="gwFenXi=!gwFenXi">
					<view class="flex_1 flex_row" p-3>
						<u-text text="宫位分析" align="left" bold></u-text>
						<u-icon :name="gwFenXi?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<!-- jjj -->
				<view v-if="gwFenXi">
					<view class="flex_row table_row_bg border_bottom" p-3>
						<span style="color: red;font-weight: bold;">红色</span>为喜用，对你有利；<span
							style="color: green;font-weight: bold;">绿色</span>为忌凶，对你不利
					</view>
					<!-- 四柱 -->
					<view class="flex_row table_title_bg border_bottom">
						<view class="flex_1 " p-3 v-for="(item,index) in ['时间','年柱','月柱','日柱','时柱']" :key="index">
							<u-text :text="item" align="center"></u-text>
						</view>
					</view>
					<!-- 天干 -->
					<view class="flex_row table_row_bg border_bottom">
						<view class="flex_1 " p-1>
							<u-text text="天干" align="center" color="#666666"></u-text>
						</view>
						<view class="flex_1 flex_row" p-3 v-for="(item ,i) in tiangan" :key="i">
							<u-text :text="item" size="28px" align="center" :color="COMUtils.fiveElementInfo(item).color" bold></u-text>
						</view>
					</view>
					<!-- 天干宫位 -->
					<view p-1 class="border_bottom">
						<view class="flex_row table_row_bg gap_05rem">
							<view class="flex_1 flex_col f_j_center" p-1>
								<u-text text="年龄" align="center" color="#666666" lineHeight="50rpx"></u-text>
								<u-text text="身体" align="center" color="#666666" lineHeight="50rpx"></u-text>
								<u-text text="宫位" align="center" color="#666666" lineHeight="50rpx"></u-text>
							</view>
					
							<view class="flex_1 flex_col"
								:style="{border:`4rpx solid ${getBorder(item)}`,borderRadius:'5px'}" p-1 v-for="item in 4"
								:key="item">
								<view class="f_center" v-for="(itemStr ,sI) in getCol(item)" :key="sI">
									<u-text :text="itemStr" align="center" lineHeight="50rpx"></u-text>
								</view>
							</view>
						</view>
					</view>
					<!-- 四柱 -->
					<view class="flex_row table_title_bg border_bottom">
						<view class="flex_1 " p-3 v-for="(item,index) in ['时间','年柱','月柱','日柱','时柱']" :key="index">
							<u-text :text="item" align="center"></u-text>
						</view>
					</view>
					<view p-1 class="border_bottom">
						<view class="flex_row table_row_bg gap_05rem">
							<view class="flex_1 flex_col f_j_center" p-1>
								<u-text text="年龄" align="center" color="#666666" lineHeight="50rpx"></u-text>
								<u-text text="身体" align="center" color="#666666" lineHeight="50rpx"></u-text>
								<u-text text="宫位" align="center" color="#666666" lineHeight="50rpx"></u-text>
							</view>
					
							<view class="flex_1 flex_col"
								:style="{border:`4rpx solid ${getBorder2(item)}`,borderRadius:'5px'}" p-1 v-for="item in 4"
								:key="item">
								<view class="f_center" v-for="(itemStr ,sI) in getCol2(item)" :key="sI">
									<u-text :text="itemStr" align="center" lineHeight="50rpx"></u-text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!-- 六亲图示 -->
			<view class="table_main_body">
				<view class="flex_row table_title_bg2 border_bottom" @click="lqTshi = !lqTshi">
					<view class="flex_1 flex_row" p-3>
						<u-text text="六亲图示" align="left" bold></u-text>
						<u-icon :name="lqTshi?'arrow-down':'arrow-up'" color="#333" size="28"></u-icon>
					</view>
				</view>
				<view v-if="lqTshi">
					<view class="flex_row table_row_bg border_bottom" p-3>
						<span style="color: red;font-weight: bold;">红色</span>为喜用，对你有利；<span
							style="color: green;font-weight: bold;">绿色</span>为忌凶，对你不利
					</view>
					<!-- 四柱 -->
					<view class="flex_row table_title_bg border_bottom">
						<view class="flex_1 " p-3 v-for="(item,index) in ['年柱','月柱','日柱','时柱']" :key="index">
							<u-text :text="item" align="center"></u-text>
						</view>
					</view>
					<!-- 天干六亲 -->
					<view class="flex_row" p-2>
						<view class="flex_1 f_center flex_column " p-1 v-for="(item,index) in liuQinsTianGan" :key="index">
							<view class="f_center" :style="{background: item.color,borderRadius:'5px',width:'60rpx',height:'60rpx'}" >
								<u-text :text="item.title" align="center" :color="index==2?'#333':'#fff'" bold></u-text>
							</view>
							<view class="f_center flex_column flex_1 ">
								<u-text v-for="(str,i) in item.persons" :text="str" align="center"></u-text>
							</view>
						</view>
					</view>
					<!-- 地支六亲 -->
					<view class="flex_row" p-2>
						<view class="flex_1 f_center flex_column " p-1 v-for="(item,index) in liuQinsDiZhi" :key="index">
							<view class="f_center" :style="{background: item.color,borderRadius:'5px',width:'60rpx',height:'60rpx'}" >
								<u-text :text="item.title" align="center" color="#fff" bold></u-text>
							</view>
							<view class="f_center flex_column flex_1 ">
								<u-text v-for="(str,i) in item.persons" :text="str" align="center" ></u-text>
							</view>
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
	// 袁天罡显示/隐藏
	const ytgShow = ref(true);
	// 宫位分析显示/隐藏
	const gwFenXi = ref(true);
	// 六亲图示显示/隐藏
	const lqTshi = ref(true);
	const baZiStore = shengPingStore()
	// 排盘信息
	const baZiInfo = baZiStore.baZiInfo;
	// 十神
	const shiShen = baZiStore.baziShishen;
	// 天干
	const tiangan = baZiStore.baziTiangan;
	// 地支
	const dizhi = baZiStore.baziDizhi;
	// 藏干
	const cangGan = baZiStore.baziCanggan;
	// 藏干十神
	const cangGanShiShen = baZiStore.cangganShishen
	// 星运
	const xingYun = baZiStore.xingYun
	// 自坐
	const ziZuo = baZiStore.ziZuo
	// 空亡
	const kongwang = baZiStore.kongwang
	// 神煞
	const shensha = baZiStore.shensha
	
	
	const cangGanTxts = (str : string) => {
		return str.split(',');
	};
	
	
	// 宫位分析-------------start
	const age1_9 = ["1-9岁", "头", "祖先宫"]
	const age10_18 = ["10-18岁", "脖子", "远方"]
	const age19_27 = ["19-27岁", "胸", "交友宫", "兄弟宫", "父母宫", "事业宫"]
	const age28_36 = ["28-36岁", "肚子", "家乡"]

	const age1_9_2 = ["1-9岁", "-", "夫妻宫"]

	const age37_45 = ["37-45岁", "屁股", "居住场所", "工作场所"]
	const age46_53 = ["46-53岁", "大腿", "子女宫"]
	const age54_all = ["54岁以上", "小腿", "房子附近"]
	function isJx(str) {
		if( str == "吉"){
			return 'red'
		}else{
			return 'green'
		}
	}
	function getBorder(item) {
		let resStr = "";
		switch (item) {
			case 1:
				resStr = isJx(baZiInfo.bzPalaceJx.yearGanPalace);
				break;
			case 2:
				resStr = isJx(baZiInfo.bzPalaceJx.monthGanPalace);
				break;
			case 3:
				resStr = 'transparent';
				break;
			case 4:
				resStr = isJx(baZiInfo.bzPalaceJx.timeGanPalace);
				break;
			default:
				break;
		}
		return resStr
	}
	function getBorder2(item) {
		let resStr = "";
		switch (item) {
			case 1:
				resStr = isJx(baZiInfo.bzPalaceJx.yearZhiPalace);
				break;
			case 2:
				resStr = isJx(baZiInfo.bzPalaceJx.monthZhiPalace);
				break;
			case 3:
				resStr = isJx(baZiInfo.bzPalaceJx.dayZhiPalace);
				break;
			case 4:
				resStr = isJx(baZiInfo.bzPalaceJx.timeZhiPalace);
				break;
			default:
				break;
		}
		return resStr
	}
	function getCol(item) {
		let resArr = [];
		switch (item) {
			case 1:
				resArr = age1_9;
				break;
			case 2:
				resArr = age19_27;
				break;
			case 3:
				resArr = age1_9_2;
				break;
			case 4:
				resArr = age46_53;
				break;
			default:
				break;
		}
		return resArr;
	}
	function getCol2(item) {
		let resArr = [];
		switch (item) {
			case 1:
				resArr = age10_18;
				break;
			case 2:
				resArr = age28_36;
				break;
			case 3:
				resArr = age37_45;
				break;
			case 4:
				resArr = age54_all;
				break;
			default:
				break;
		}
		return resArr;
	}
	// 宫位分析-------------end
	// 六亲图示-------------start
	const liuQinsTianGan = [
		{title:tiangan[0],color:isJx(baZiInfo.bzLiuQinJx.yearGanLiuQin),persons:['父亲','父亲家族']},
		{title:tiangan[1],color:isJx(baZiInfo.bzLiuQinJx.monthGanLiuQin),persons:['堂兄弟','社会上兄姐']},
		{title:tiangan[2],color:'transparent',persons:['自己']},
		{title:tiangan[3],color:isJx(baZiInfo.bzLiuQinJx.timeGanLiuQin),persons:['长子']},
		
	];
	const liuQinsDiZhi = [
		{title:dizhi[0],color:isJx(baZiInfo.bzLiuQinJx.yearGanLiuQin),persons:['母亲','母亲家族']},
		{title:dizhi[1],color:isJx(baZiInfo.bzLiuQinJx.monthZhiLiuQin),persons:['表弟妹','社会上弟妹']},
		{title:dizhi[2],color:isJx(baZiInfo.bzLiuQinJx.dayZhiLiuQin),persons:['夫妻','夫妻家族']},
		{title:dizhi[3],color:isJx(baZiInfo.bzLiuQinJx.timeZhiLiuQin),persons:['次子']},
	]
	
</script>

<style lang="scss" scoped>
	.model_1 {

		

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
			}

		}
	}
</style>