import type { PanInfo, qimenGongVo } from '@/models/panModel/panInfo'
import { defineStore } from 'pinia'
import { ref, computed,toRaw } from 'vue'
export const yangPanStore = defineStore('yangPanStore', () => {
	// 阳盘信息
	const yangPanInfo = ref<PanInfo>({
		qiMenZao: {},
		qimenGong: [],
		tianMenDiHuList: []
	})
	
	// 长生信息
	const changshengData = ref({
		tianpanArr: [],
		dipanArr: []
	})
	
	// 获取天干
	const yangPanTiangan = computed(() => {
		const res = [
			yangPanInfo.value.qiMenZao.yearGanZhi?.charAt(0),
			yangPanInfo.value.qiMenZao.monthGanZhi?.charAt(0),
			yangPanInfo.value.qiMenZao.dayGanZhi?.charAt(0),
			yangPanInfo.value.qiMenZao.hourGanZhi?.charAt(0),
		];
		return res;
	});
	// 获取地支
	const yangPanDizhi = computed(() => {
		const res = [
			yangPanInfo.value.qiMenZao.yearGanZhi?.charAt(1),
			yangPanInfo.value.qiMenZao.monthGanZhi?.charAt(1),
			yangPanInfo.value.qiMenZao.dayGanZhi?.charAt(1),
			yangPanInfo.value.qiMenZao.hourGanZhi?.charAt(1),
		];
		return res;
	});

	// 马星
	const maxingItem = computed(() => {
	  // 筛选对象 + 转原始对象 + 边界处理 一步完成
	  const targetGong = yangPanInfo.value.qimenGong.find(e => e.baGua === yangPanInfo.value.qiMenZao.maXing);
	  return targetGong ? toRaw(targetGong) : ({} as qimenGongVo);
	});
	// 调整后得奇门宫位
	const qimenGong = computed(()=>{
		let arr = [4, 9, 2, 3, 5, 7, 8, 1, 6];
		let res:qimenGongVo[] = [];
		arr.map((item)=>{
			let findItem = yangPanInfo.value.qimenGong.find((e) => e.index == item)
			if(findItem){
				res.push(toRaw(findItem))
			}
		})
		return res;
	})
	
	const setYangPanInfo = (value : PanInfo) => {
		yangPanInfo.value = value;
		
		if (changshengData.value.tianpanArr.length === 0) {
		    // 获取所有格子的长生数据
		    // 处理天盘长生数据
		    let changshengTianpanArr:any = [];
		    for (let cell of qimenGong.value) {
				console.log(cell,"2222222");
		      
		    }
		
		}
	};

	return {
		yangPanInfo,
		setYangPanInfo,
		yangPanTiangan,
		yangPanDizhi,
		maxingItem,
		qimenGong,

	}
}, {
	persist: true
})