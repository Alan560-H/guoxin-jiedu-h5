// 八字输入框
export interface BaziInput {
	gender : string; // 性别
	birthYear : string; // 生日年
	yearPillar : string; // 年柱
	monthPillar : string; // 月柱
	dayPillar : string; // 日柱
	hourPillar : string; // 时柱
	currentLuck : string; // 当前幸运值
}
export interface FormData {
	userName : string; // 姓名
	birthDay : string;//生辰
	sex : number; // 性别：1：男 0：女
	solar : boolean;//是否使用真太阳时 true：使用，false：不适用
	districtGeocode : number; // 地区编码
	yearMonth ?: string;//流月要求得数据
	type ?: string; // 派系
}

// 用于ai生成信息得用户信息
interface AIChatFormDataUserInfo{
	gender:string;//性别，男坤造，女乾造
	birthday:string;//生日 "1989-09-09 10:10:11",
	userName:string; // 姓名
	districtGeocode:string; // 地区编码
	solar?:boolean|string; // 是否适用真太阳是
	bazi?:string[]; // 八字
	daYun?:string;//当前大运
}

export type TimelineItem = [
  number,   // 年份
  string,   // 年干支
  string,   // 干支（如戊子）
  string,   // 合冲刑害描述
  string    // 贵人/神煞描述
];

/** 时间线数据数组类型（由多个TimelineItem元组组成） */
type TimelineData = TimelineItem[];

// ai生成聊天内容
export interface AIChatFormData{
	user_info:AIChatFormDataUserInfo;
	timeline_data:TimelineData;
	liuYue?:[];//包含所有得流年数据
	daYun:"";// 当前大运
}

// ai生成聊天会话
export interface AIContentFormData {
	chatId:string;
	conversationId:string;
}
// 获取ai生成记录
export interface AIHistoryFormData extends AIChatFormDataUserInfo{
	pageNum:number;
	pageSize:number;
	startYear?:number; // 开始年份
	endYear?:number;// 结束年分
}
// 发送验证码
export interface SendCode {
	phone: string; // 手机号
	signature: string; // 图片验证码
	validate: string; // 易盾返回签名
	uuid: string; //图片验证码id
}

// 登录
export interface LoginFormData {
	code: string; // 默认是""
	password: string; // 默认是""
	phone: string; // 手机号
	smscode: number; //验证码
	username:string;//取值都用手机号
	uuid:string;// 图片验证码uuid
	loginType:number;// 登录类型  3：短信登录
}


// 阳盘决策 提交表单
export interface YangPanFormData {
	birthDay:string;// 选择的日期
	isKe:number;//目前固定是4
	question:string;// 空字符串
	panType?:number;//盘式  0：转盘 1：是飞盘
	setType?:number;//局式  0：拆补，1：置润 2：茅山 3：手工
	xunkongValue?:string;//标记旬空  ["时空", "日空", "月空", "年空"]
	jiGongValue?:string;//当前寄宫  ["寄坤宫", "阳艮阴坤", "寄四维", "随节令"]
}