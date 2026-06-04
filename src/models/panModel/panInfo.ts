// 奇门造
export interface QiMenZaoVo{
	dayGan?:string;//天干
	dayGanZhi?:string;//日干支
	dayXunKong?:string;//日旬空
	degreeRange?:string;//度数范围
	hourGan?:string;//
	hourGanZhi?:string;//
	hourZhi?:string;//
	huangQuan?:string;//
	juShu?:string;//
	lotusGateFlowDate?:string;//
	maXing?:string;//
	maXingContent?:string;//
	monthGanZhi?:string;//
	monthXunKong?:string;//
	monthZhi?:string;//
	nextJieQiName?:string;//下一节气名字
	nextJieQiTime?:string;//下一节气时间
	prevJieQiName?:string;// 上一节气名字
	prevJieQiTime?:string;// 上一节气时间
	qimenType?:string;// 奇门类型
	question?:string;//
	sex?:string;// 
	shan?:string;//
	timeXunKong?:string;//
	xiang?:string;//
	xunKong?:string;//
	xunKongGong?:string;//
	xunShou?:string;//
	yearGanZhi?:string;//
	yearGongLi?:string;//
	yearNongLi?:string;//
	yearXunKong?:string;//
	yinOrYangDun?:string;//
	yueJiang?:string;//
	zhiFu?:string;//
	zhiFuIndex?:string;//
	zhiShi?:string;//
	zhiShiIndex?:string;//
}
export interface diZhiChangShengVo{
	content?:string;
	description?:string;
	title?:string;
}
export interface qimenGongVo{
	YinGan?:string;//
	anGan?:string;//
	baGua?:string;//八卦
	baMen?:string;//八门
	baShen?:string;//八神
	baXing?:string;//八星
	dayGan?:string;//
	diPan?:string;//
	diZhiChangSheng?:diZhiChangShengVo[];//
	fangWei?:string;//
	index?:number;//
	isMaXing?:boolean;//是否马星
	isSelect?:number;//
	isXunKong?:boolean;//是否巡控
	isZhiFu?:boolean;//
	isZhiShi?:boolean;//
	jiuXing?:string;// 救星
	lianHuaTianGanChangSheng?:string;
	maXing?:boolean;
	newBaMen?:boolean;//八门
	siHai?:any[];
	tianGanChangSheng?:diZhiChangShengVo[];
	tianPan?:string;
	wuXing?:string;
	xunKong?:boolean;
	yinGan?:string;
	zhiFu?:boolean;
	zhiShi?:boolean;
}
export interface tianMenDiHuListVo{
	diHu:string;
	diZhi:string;
	tianMen:string;
}
// 阳盘决策
export interface PanInfo {
	qiMenZao : QiMenZaoVo; // 奇门造？？
	qimenGong:qimenGongVo[]
	tianMenDiHuList:tianMenDiHuListVo[], 
}