<template>
	<view p-3 class="yangPanView flex_column gap_1rem">
		<!-- 上方盘信息 -->
		<view class="common_border_all yangPanViewTop">
			<view class="flex_row">
				<view class="yangPanViewTopLabel f_center border_right border_bottom" p-2>
					<u-text text="局式" type="info"></u-text>
				</view>
				<view class="flex_1 f_center border_bottom" p-2>
					<u-text text="转盘-拆补-寄坤宫" bold align="center"></u-text>
				</view>
			</view>
			<view class="flex_row">
				<view class="yangPanViewTopLabel f_center border_right border_bottom" p-2>
					<u-text text="阳历" type="info"></u-text>
				</view>
				<view class="flex_1 f_center border_bottom" p-2>
					<u-text :text="yangPanBaseInfo.yearGongLi" bold align="center"></u-text>
				</view>
			</view>
			<view class="flex_row">
				<view class="yangPanViewTopLabel f_center border_right border_bottom" p-2>
					<u-text text="阴历" type="info"></u-text>
				</view>
				<view class="flex_1 f_center border_bottom" p-2>
					<u-text :text="yangPanBaseInfo.yearNongLi" bold align="center"></u-text>
				</view>
			</view>
			<view class="flex_row">
				<view class="yangPanViewTopLabel f_center border_right border_bottom" p-2>
					<u-text text="四柱" type="info"></u-text>
				</view>
				<view class="flex_1 f_center border_bottom" p-2>
					<!-- 四柱标题 -->
					<view class="fill_width">
						<!-- 四柱 -->
						<view class="flex_row">
							<view class="flex_1 f_center" p-3 v-for="(item,index) in ['年柱','月柱','日柱','时柱']"
								:key="index">
								<u-text :text="item" align="center"></u-text>
							</view>
						</view>
						<!-- 天干 -->
						<view class="flex_row">
							<view class="flex_1 f_center flex_column" p-1
								v-for="(item ,i) in yangPanStorePage.yangPanTiangan" :key="i">
								<view p-1
									:style="{border:i==2?`2rpx solid ${COMUtils.fiveElementInfo(item).color}`:'none'}">
									<u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color"
										size="20px" bold></u-text>
								</view>
							</view>
						</view>
						<!-- 地支 -->
						<view class="flex_row">
							<view class="flex_1 f_center flex_column" p-1
								v-for="(item ,i) in yangPanStorePage.yangPanDizhi" :key="i">
								<view><u-text :text="item" align="center" :color="COMUtils.fiveElementInfo(item).color"
										size="20px" bold></u-text></view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="flex_row">
				<view class="yangPanViewTopLabel f_center border_right border_bottom" p-2>
					<u-text text="空亡" type="info"></u-text>
				</view>
				<view class="flex_1 f_center border_bottom" p-2>
					<u-text :text="yangPanBaseInfo.yearXunKong" bold align="center"></u-text>
					<u-text :text="yangPanBaseInfo.monthXunKong" bold align="center"></u-text>
					<u-text :text="yangPanBaseInfo.dayXunKong" bold align="center"></u-text>
					<u-text :text="yangPanBaseInfo.timeXunKong" bold align="center"></u-text>
				</view>
			</view>


			<view class="flex_row" v-show="isShowLord">
				<view class="yangPanViewTopLabel f_center border_right border_bottom" p-2>
					<u-text text="节气" type="info"></u-text>
				</view>
				<view class="flex_1 f_center flex_column border_bottom" p-2>
					<view class="f_center gap_05rem fill_width">
						<view class="">
							<u-text :text="yangPanBaseInfo.prevJieQiName" bold align="center"></u-text>
						</view>
						<view class="">
							<u-text :text="yangPanBaseInfo.prevJieQiTime?.split(' ')[0]" bold align="center"></u-text>
						</view>
					</view>
					<view class="f_center gap_05rem fill_width">
						<view class="">
							<u-text :text="yangPanBaseInfo.nextJieQiName" bold align="center"></u-text>
						</view>
						<view class="">
							<u-text :text="yangPanBaseInfo.nextJieQiTime?.split(' ')[0]" bold align="center"></u-text>
						</view>
					</view>
				</view>
			</view>

			<view class="flex_row" v-show="isShowLord">
				<view class="yangPanViewTopLabel f_center border_right " p-2>
					<u-text text="旬首" type="info"></u-text>
				</view>
				<view class="flex_1 f_center " p-2>
					<view class="flex_1 flex_column f_a_center fill_height">
						<view class="f_center">
							<u-text text="选局" type="info" align="center" size="24" bold></u-text>
						</view>
						<view>
							<u-text text="拆补法" align="center" bold></u-text>
						</view>
					</view>
					<view class="flex_1 f_center flex_column">
						<view class="f_center">
							<u-text text="值符" type="info" align="center" size="24" bold></u-text>
						</view>
						<view>
							<u-text :text="yangPanBaseInfo.zhiFu" align="center" bold></u-text>
						</view>
						<view>
							<u-text :text="`落${yangPanBaseInfo.zhiFuIndex}宫`" align="center" bold></u-text>
						</view>
					</view>
					<view class="flex_1 f_center flex_column">
						<view class="f_center">
							<u-text text="值使" type="info" align="center" size="24" bold></u-text>
						</view>
						<view>
							<u-text :text="yangPanBaseInfo.zhiShi" align="center" bold></u-text>
						</view>
						<view>
							<u-text :text="`门落${yangPanBaseInfo.zhiShiIndex}宫`" align="center" bold></u-text>
						</view>
					</view>
					<view class="flex_1 flex_column f_a_center fill_height">
						<view class="f_center">
							<u-text text="马星" type="info" align="center" size="24" bold></u-text>
						</view>
						<view>
							<u-text :text="yangPanBaseInfo.maXingContent" align="center" bold></u-text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 隐藏节气，旬首 -->
		<view class="f_center gap_05rem" @click.stop="isShowLord = !isShowLord">
			<u-icon :name="isShowLord?'arrow-up-fill':'arrow-down-fill'"></u-icon>
			<view class="">
				<u-text text="隐藏节气，旬首"></u-text>
			</view>
			<u-icon :name="isShowLord?'arrow-up-fill':'arrow-down-fill'"></u-icon>
		</view>

		<!-- 九宫格宫位图 -->
		<view class="common_border_all gongView fill_width">
			<view class="cellItem fill_div common_border_all overflow_all_auto"
				v-for="(cell,index) in yangPanStorePage.qimenGong" :key="index">
				<!-- 索引为5得跳过 -->
				<view class="fill_div flex_column f_j_sb" v-if="cell.index == 5">
					<view class="">
						<u-text :text="cell.index" size="18px"></u-text>
					</view>
					<view class="flex_row f_j_end">
						<u-text :text="txt" size="22px" bold align="right" v-for="(txt, tIndex) in cell.diPan"
							:key="tIndex"></u-text>
					</view>
				</view>
				<view class="fill_div flex_column f_j_sb u-rela" v-else>
					<view class="cellBg fill_div f_center u-abso">
						<u-text :text="cell.baGua" :color="couputedColor(cell.baGua)" align="center"
							size="55px"></u-text>
					</view>
					<view class="cellView fill_div flex_row" p-1>
						<view class="">
							<u-text :text="cell.index" size="18px"></u-text>
						</view>
						<view class=" flex_1 f_center flex_column">
							<u-text :text="cell.baShen" bold size="18px"></u-text>
							<u-text :text="cell.baXing=='天芮'?'芮禽':cell.baXing" bold size="18px"></u-text>
							<u-text :text="`${cell.newBaMen}门`" :color="couputedBaMenColor(cell.newBaMen, cell)" bold
								size="18px"></u-text>
						</view>
						<view class="fill_height flex_column f_j_end" style="min-width: 2rem;">
							<!-- 马星 -->
							<view class="flex_row f_j_end f_a_end" v-if="yangPanStorePage.maxingItem.index==cell.index">
								<u-text text="♞" block align="right" size="18px"></u-text>
							</view>
							<!-- 旬空 -->
							<view class="flex_row f_j_end f_a_end" v-if="cell.xunKong">
								<u-text text="〇" block color="#61ed02" bold align="right" size="18px"></u-text>
							</view>
							<!-- 天干长生盘 -->
							<view class="f_center flex_row">
								<view class="f_center" v-for="(txt,i) in cell.tianGanChangSheng" :key="i">
									<u-text :text="txt.content" type="info" align="center" size="10px"></u-text>
								</view>
							</view>
							<view class="f_center flex_row">
								<view class="f_center" v-for="(txt, tIndex) in cell.tianPan" :key="tIndex">
									<u-text :text="txt" align="center" bold size="18px"></u-text>
								</view>
							</view>

							<!-- 地支长生盘 -->
							<view class="f_center flex_row">
								<view class="f_center" v-for="(txt,i) in cell.diZhiChangSheng" :key="i">
									<u-text :text="txt.content" type="info" size="10px"></u-text>
								</view>
							</view>
							<view class="f_center flex_row">
								<view class="f_center" v-for="(txt, tIndex) in cell.diPan" :key="tIndex">
									<u-text :text="txt" bold align="center" size="18px"></u-text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 颜色说明 -->
		<view class="f_center">
			<view class="">
				<u-text text="颜色说明：" color="#853218" bold></u-text>
			</view>
			<view class="">
				<u-text text="入墓、" color="#C78C2E" bold></u-text>
			</view>
			<view class="">
				<u-text text="击刑、" color="#913BC7" bold></u-text>
			</view>
			<view class="">
				<u-text text="门迫、" color="#CB3E3E" bold></u-text>
			</view>
			<view class="">
				<u-text text="刑+墓；" color="#3C7BCE " bold></u-text>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref, computed } from "vue"
	import { yangPanStore } from "@/stores/yangPanStore"
	const yangPanStorePage = yangPanStore();
	import { COMUtils } from '@/utils/commonUtils'
	import type { qimenGongVo } from '@/models/panModel/panInfo'

	const yangPanBaseInfo = yangPanStorePage.yangPanInfo.qiMenZao;
	// 计算八卦背景颜色
	const couputedColor = (str : string) => {
		switch (str) {
			case '艮':
			case '坤':
				return '#E9E2DA';
			case '震':
			case '巽':
				return '#D7F2E3'
			case '坎':
				return '#DBF3FD'
			case '离':
				return '#F5D6D4'
			case '兑':
			case '乾':
				return '#FEF5D6'
		}
	}
	const couputedBaMenColor = (zi : string, obj : qimenGongVo) => {
		let item = obj.siHai.find((e) => e.word == zi);
		if (item != undefined) {
			if (item.siHai == '迫') {
				return '#ff001a';
			}
			if (item.siHai == '墓') {
				let item = obj.siHai.find((e) => e.word == zi && e.siHai == '刑');
				if (item != undefined) {
					return '#0098ff';
				} else {
					return '#ff6c00';
				}
			}
			if (item.siHai == '刑') {
				let item = obj.siHai.find((e) => e.word == zi && e.siHai == '墓');
				if (item != undefined) {
					return '#0098ff';
				} else {
					return '#c800ff';
				}
			}
		}
		return '#333';
	}

	// 是否显示长生
	const showChangsheng = ref(true)

	// 隐藏节气，旬首
	const isShowLord = ref(false);

	console.log(yangPanStorePage.maxingItem, "马星信息")
</script>

<style scoped lang="scss">
	.yangPanView {
		.yangPanViewTop {
			.yangPanViewTopLabel {
				min-width: 100rpx;
			}
		}

		.gongView {
			display: grid;
			grid-template-columns: repeat(3, 1fr); // 3列等分
			max-width: 750rpx;
			margin: 0 auto;
		}

		.cellItem {
			aspect-ratio: 1/1;
			box-sizing: border-box;

			.cellBg {
				z-index: 1;
			}

			.cellView {
				z-index: 2;
			}
		}
	}
</style>