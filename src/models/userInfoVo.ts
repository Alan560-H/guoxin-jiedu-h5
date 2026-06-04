/// 用户资料得模型
export interface UserInfoVo {
	admin:boolean;//是否管理员
	avatar:string;// 头像
	birthArea:string;//出生区域
	birthDay:string;//
	channelCode:string;//通道
	createBy:string;//
	createTime:string;//
	delFlag:string;//删除标志
	dept:any;
	deptId:number;
	email:string;
	isFirst:number;// 是否首次
	loginDate:string;//登录时间
	loginIp:string;//ip
	loginType:string;//
	nickName:string;
	params:any[];
	phonenumber:string;//
	postIds:any;
	remark:any;
	roleId:any;
	roleIds:any;
	roles:string;
	salt:string;
	searchValue:string;
	sex:string;//性别 01
	status:string;//
	updateBy:string;
	updateTime:string;
	userId:number;
	userName:string;
}