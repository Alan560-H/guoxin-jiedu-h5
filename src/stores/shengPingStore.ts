import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

// 生时子平 store
export const shengPingStore = defineStore('shengPingStore',
	() => {
		const baZiInfo = reactive({
			// ——————十神————————
			yearGanShiShen: "",
			monthGanShiShen: "",
			dayGanShiShen: "",
			timeGanShiShen: "",
			// 天干
			yearGan: "",
			monthGan: "",
			dayGan: "",
			timeGan: "",
			// 地支
			yearZhi: "",
			monthZhi: "",
			dayZhi: "",
			timeZhi: "",
			// 藏干
			yearCangGan: "",
			monthCangGan: "",
			dayCangGan: "",
			timeCangGan: "",
			// 藏干十神
			yearZhiShiShen: "",
			monthZhiShiShen: "",
			dayZhiShiShen: "",
			timeZhiShiShen: "",
			// 星运
			yearDiShi: "",
			monthDiShi: "",
			dayDiShi: "",
			timeDiShi: "",
			// 自坐
			yearZiZuo: "",
			monthZiZuo: "",
			dayZiZuo: "",
			timeZiZuo: "",
			// 纳音
			yearNaYin: "",
			monthNaYin: "",
			dayNaYin: "",
			timeNaYin: "",
			// 空亡
			yearXunKong: "",
			monthXunKong: "",
			dayXunKong: "",
			timeXunKong: "",
			// 神煞
			yearShenSha: "",
			monthShenSha: "",
			dayShenSha: "",
			timeShenSha: "",
			// 分析模式
			// 大运
			daYun: [],
		}
		);

		//  设置排盘信息
		const setBaZiInfo = (data : Record<string, any>) => {
			Object.assign(baZiInfo, data);
		}

		// 获取十神
		const baziShishen = computed(() => {
			const res = [
				baZiInfo.yearGanShiShen,
				baZiInfo.monthGanShiShen,
				baZiInfo.dayGanShiShen,
				baZiInfo.timeGanShiShen
			];
			return res;
		});

		// 获取天干
		const baziTiangan = computed(() => {
			const res = [
				baZiInfo.yearGan,
				baZiInfo.monthGan,
				baZiInfo.dayGan,
				baZiInfo.timeGan
			];
			return res;
		});
		// 获取地支
		const baziDizhi = computed(() => {
			const res = [
				baZiInfo.yearZhi,
				baZiInfo.monthZhi,
				baZiInfo.dayZhi,
				baZiInfo.timeZhi
			];
			return res;
		});

		// 获取藏干
		const baziCanggan = computed(() => {
			const res = [
				baZiInfo.yearCangGan,
				baZiInfo.monthCangGan,
				baZiInfo.dayCangGan,
				baZiInfo.timeCangGan
			];
			return res;
		});
		// 藏干十神
		const cangganShishen = computed(() => {
			const res = [
				baZiInfo.yearZhiShiShen,
				baZiInfo.monthZhiShiShen,
				baZiInfo.dayZhiShiShen,
				baZiInfo.timeZhiShiShen
			];
			return res;
		});
		// 星运
		const xingYun = computed(() => {
			const res = [
				baZiInfo.yearDiShi,
				baZiInfo.monthDiShi,
				baZiInfo.dayDiShi,
				baZiInfo.timeDiShi
			];
			return res;
		});
		// 自坐
		const ziZuo = computed(() => {
			const res = [
				baZiInfo.yearZiZuo,
				baZiInfo.monthZiZuo,
				baZiInfo.dayZiZuo,
				baZiInfo.timeZiZuo
			];
			return res;
		});
		// 自坐
		const nayin = computed(() => {
			const res = [
				baZiInfo.yearNaYin,
				baZiInfo.monthNaYin,
				baZiInfo.dayNaYin,
				baZiInfo.timeNaYin
			];
			return res;
		});
		// 空亡
		const kongwang = computed(() => {
			const res = [
				baZiInfo.yearXunKong,
				baZiInfo.monthXunKong,
				baZiInfo.dayXunKong,
				baZiInfo.timeXunKong

			];
			return res;
		});
		// 神煞
		const shensha = computed(() => {
			const res = [
				baZiInfo.yearShenSha,
				baZiInfo.monthShenSha,
				baZiInfo.dayShenSha,
				baZiInfo.timeShenSha
			];
			return res;
		});
		const initShengPingStore = () => {
			// let baZiInfoStorage = uni.getStorageSync('baZiInfoStorage');
			// console.log("初始化生平姿势Store", baZiInfoStorage);
			// if (baZiInfoStorage != null && baZiInfoStorage != "") {
			// 	setBaZiInfo(baZiInfoStorage)
			// }

		}
		// 分析模式

		return {
			baZiInfo, setBaZiInfo, baziShishen, baziTiangan, baziDizhi,
			baziCanggan, cangganShishen, xingYun,
			ziZuo, nayin, kongwang, shensha, initShengPingStore

		}


	},
	{
		persist: true,
	}
)