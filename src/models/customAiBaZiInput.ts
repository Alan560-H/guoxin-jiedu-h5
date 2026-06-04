// 自定义提交表单
// ?userName=%E8%BF%98%E7%9C%9F%E6%98%AF&birthDay=2026-1-14%2016%3A45&districtGeocode=110102&sex=%E7%94%B7&solar=true
export interface BaziInput {
	userName : string; // 姓名
	birthDay:string;//生辰
	sex : number; // 性别：1：男 0：女
	solar : boolean;//是否使用真太阳时 true：使用，false：不适用
	districtGeocode : number; // 地区编码
	yearMonth?:string;//流月要求得数据
	type?:string ; // 派系
}

export interface RowEChartData {
  year: string;
  ganzhi: string;
  nayin: string;
  // [Open, Close, Low, High] -> [岁启, 定局, 否极, 乘旺]
  values: [number, number, number, number]; 
  note: string;
  turningPoint?: string | null; // 新增：关键转折点
}