import type { RowEChartData } from "./customAiBaZiInput";

export interface ResponseData<T = any> {
	code:number;
	data:T;
	msg?:string;
	rows?:rowData[];//测算历史记录
	total?:number;//总条数
}

export interface AIChat{
	chatId:string;
	conversationId:string;
	message?:string;
	status:string; // in_progress：还未完成，completed：已经完成
}
// ai返回内容
export interface AIContent{
	chatId:string;
	conversationId:string;
	message?:Record<string,RowEChartData>; // 流年图表
	status:string; // in_progress：还未完成，completed：已经完成
}
export interface LiuYue {
	ganZhi:string;//大运干支
	startYear:number|string;//开始年
	endYear:number|string;//结束年
	customLiuNian:any[];//自定义流年数据
}
// 历史生成ai记录
export interface rowData{
	id:number;
	userid:number;
	birthday:string;
	userName:string;
	districtGeocode:string;
	generateDate:string;
	bazi:string[];
	daYun:string;
	content:Record<string,RowEChartData>|null; // 流年图表
	startYear:string;
	endYear:string;
	chatId:string;
	conversationId:string;
	gender:string;
	status:string;
	crateTime?:string;
	searchValue?:string;
	createBy?:string;
	createTime?:string;
	updateBy?:string;
	updateTime?:string;
	remark?:string;
	params?:object;
	solar?:boolean|string;
	liuYue:LiuYue[];
}