<template>
	<view class="date-picker" @touchmove.stop.prevent="moveStop">
		<view class="picker-editor" @click="show">
			<view class="uni-date-x uni-date-single">
				<input class="uni-date__x-input" style="pointer-events: none" type="text" v-model="dateString"
					placeholder="请选择出生日期" :disabled="true" />
			</view>
		</view>
		<view v-if="popup" class="picker-view">
			<view class="picker-inner">
				<view class="pick-header">
					<view @click="changeType(false)"
						:class="['pick-item pick-solar', isLunar == false ? 'pick-active' : '']">阳历</view>
					<view @click="changeType(true)"
						:class="[hasSizhu == true ? 'pick-item' : 'pick-item pick-lunar', isLunar == true ? 'pick-active' : '']">
						阴历</view>
					<view v-if="hasSizhu" @click="changeType('sizhu')"
						:class="['pick-item pick-lunar', isLunar == 'sizhu' ? 'pick-active' : '']">四柱</view>
				</view>
				<view v-if="isLunar == 'sizhu'" class="sizhu-box">
					<u-top-tips ref="uNotify"></u-top-tips>
					<view class="sizhu-select">
						<view class="sizhu-item">
							<view class="sizhu-title">年柱</view>
							<view class="sizhu-top">
								<view @click="tianGanClick('yearGanShow')" class="sizhu-name">{{ yearGan }}</view>
								<u-picker :show="yearGanShow" :columns="tianganColumns"
									@confirm="sizhuTianganConfirm($event, 'yearGan', 'yearZhi')"
									@cancel="yearGanShow=false"></u-picker>
							</view>
							<view class="sizhu-bottom">
								<view @click="yearZhiClick('yearGan', 'yearZhiShow')" class="sizhu-name">{{ yearZhi }}
								</view>
								<u-picker :show="yearZhiShow" ref="yearZhiPicker" :columns="dizhiColumns"
									@confirm="sizhuDizhiConfirm($event, 'year')" @cancel="yearZhiShow=false"></u-picker>
							</view>
						</view>
						<view class="sizhu-item">
							<view class="sizhu-title">月柱</view>
							<view class="sizhu-top">
								<view @click="tianGanClick('monthGanShow')" class="sizhu-name">{{ monthGan }}</view>
								<u-picker :show="monthGanShow" :columns="tianganColumns"
									@confirm="sizhuTianganConfirm($event, 'monthGan', 'monthZhi')"
									@cancel="monthGanShow=false"></u-picker>
							</view>
							<view class="sizhu-bottom">
								<view @click="yearZhiClick('monthGan', 'monthZhiShow')" class="sizhu-name">
									{{ monthZhi }}</view>
								<u-picker :show="monthZhiShow" ref="monthZhiPicker" :columns="dizhiColumns"
									@confirm="sizhuDizhiConfirm($event, 'month')"
									@cancel="monthZhiShow=false"></u-picker>
							</view>
						</view>
						<view class="sizhu-item">
							<view class="sizhu-title">日柱</view>
							<view class="sizhu-top">
								<view @click="tianGanClick('dayGanShow')" class="sizhu-name">{{ dayGan }}</view>
								<u-picker :show="dayGanShow" :columns="tianganColumns"
									@confirm="sizhuTianganConfirm($event, 'dayGan', 'dayZhi')"
									@cancel="dayGanShow=false"></u-picker>
							</view>
							<view class="sizhu-bottom">
								<view @click="yearZhiClick('dayGan', 'dayZhiShow')" class="sizhu-name">{{ dayZhi }}
								</view>
								<u-picker :show="dayZhiShow" ref="dayZhiPicker" :columns="dizhiColumns"
									@confirm="sizhuDizhiConfirm($event, 'day')" @cancel="dayZhiShow=false"></u-picker>
							</view>
						</view>
						<view class="sizhu-item">
							<view class="sizhu-title">时柱</view>
							<view class="sizhu-top">
								<view @click="tianGanClick('hourGanShow')" class="sizhu-name">{{ hourGan }}</view>
								<u-picker :show="hourGanShow" :columns="tianganColumns"
									@confirm="sizhuTianganConfirm($event, 'hourGan', 'hourZhi')"
									@cancel="hourGanShow=false"></u-picker>
							</view>
							<view class="sizhu-bottom">
								<view @click="yearZhiClick('hourGan', 'hourZhiShow')" class="sizhu-name">{{ hourZhi }}
								</view>
								<u-picker :show="hourZhiShow" ref="hourZhiPicker" :columns="dizhiColumns"
									@confirm="sizhuDizhiConfirm($event, 'hour')" @cancel="hourZhiShow=false"></u-picker>
							</view>
						</view>
					</view>
					<view>查找范围：1900年-今天</view>
					<u-picker :show="dateSelectShow" ref="dateSelectPicker" :columns="dateColumns"
						@confirm="dateSelectConfirm" @cancel="dateSelectShow=false"></u-picker>
				</view>
				<view class="time" v-else>
					<text class="hm-span">:</text>
					<picker-view @change="bindChange"
						indicatorStyle="height:80rpx;border-top:1px solid #D3653C;border-bottom:1px solid #D3653C"
						style="height: 100%" :value="modelValue">
						<picker-view-column>
							<view class="item" v-for="(item, index) in lunarYears" :key="index">{{ item + '年' }}</view>
						</picker-view-column>
						<picker-view-column>
							<view class="item" v-for="(item, index) in isLunar ? lunarMonths : solarMonths"
								:key="index">{{ item }}</view>
						</picker-view-column>
						<picker-view-column>
							<view class="item" v-for="(item, index) in isLunar ? lunarDays : solarDays" :key="index">
								{{ item }}</view>
						</picker-view-column>
						<picker-view-column>
							<view class="item" v-for="(item, index) in lunarHours" :key="index">{{ item }}</view>
						</picker-view-column>
						<picker-view-column>
							<view class="item" v-for="(item, index) in lunarMinutes" :key="index">
								{{ item > 9 ? item : '0' + item }}</view>
						</picker-view-column>
					</picker-view>
				</view>
				<view class="btn-wrap">
					<view @click="cancelSelectDate" class="wrap-btn btn-cancel">取消</view>
					<view @click="confirmSelectDate" class="wrap-btn btn-confirm">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 日历工具
	import calendar from './js/calendar';
	import {
		hourPeriodsToString,
		parseTime
	} from './js/index';
	// import { getConvertBaZiToSolarApi } from '@/api/bazi';
	// 1900年至2100年公历、农历互转Js代码
	let lunarYears = []; // 年份,阴阳历一致
	// 循环生成年份
	for (let x = 1900; x <= 2100; x++) {
		lunarYears.push(x);
	}
	let solarMonths = ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月']; // 阳历月份
	let solarDays = [
		'01日',
		'02日',
		'03日',
		'04日',
		'05日',
		'06日',
		'07日',
		'08日',
		'09日',
		'10日',
		'11日',
		'12日',
		'13日',
		'14日',
		'15日',
		'16日',
		'17日',
		'18日',
		'19日',
		'20日',
		'21日',
		'22日',
		'23日',
		'24日',
		'25日',
		'26日',
		'27日',
		'28日',
		'29日',
		'30日',
		'31日'
	]; // 阳历日
	let lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']; // 阴历月份
	let lunarDays = [
		'初一',
		'初二',
		'初三',
		'初四',
		'初五',
		'初六',
		'初七',
		'初八',
		'初九',
		'初十',
		'十一',
		'十二',
		'十三',
		'十四',
		'十五',
		'十六',
		'十七',
		'十八',
		'十九',
		'廿十',
		'廿一',
		'廿二',
		'廿三',
		'廿四',
		'廿五',
		'廿六',
		'廿七',
		'廿八',
		'廿九',
		'卅十'
	]; // 阴历日
	// let lunarHour = ["00:00-00:59早子", "01:00-01:59丑", "02:00-02:59丑", "03:00-03:59寅", "04:00-04:59寅", "05:00-05:59卯", "06:00-06:59卯", "07:00-07:59辰", "08:00-08:59辰", "09:00-09:59巳", "10:00-10:59巳", "11:00-11:59午", "12:00-12:59午", "13:00-13:59未", "14:00-14:59未", "15:00-15:59申", "16:00-16:59申", "17:00-17:59酉", "18:00-18:59酉", "19:00-19:59戌", "20:00-20:59戌", "21:00-21:59亥", "22:00-22:59亥", "23:00-23:59晚子"]
	let lunarHours = [
		'子时 00',
		'丑时 01',
		'丑时 02',
		'寅时 03',
		'寅时 04',
		'卯时 05',
		'卯时 06',
		'辰时 07',
		'辰时 08',
		'巳时 09',
		'巳时 10',
		'午时 11',
		'午时 12',
		'未时 13',
		'未时 14',
		'申时 15',
		'申时 16',
		'酉时 17',
		'酉时 18',
		'戌时 19',
		'戌时 20',
		'亥时 21',
		'亥时 22',
		'子时 23'
	];
	let lunarMinutes = [];
	// 循环生成分钟数组
	for (let x = 0; x <= 59; x++) {
		lunarMinutes.push(x);
	}
	export default {
		data() {
			return {
				isLunar: false,
				lunarYears: lunarYears,
				solarMonths: solarMonths,
				solarDays: solarDays,
				lunarMonths: lunarMonths,
				lunarDays: lunarDays,
				lunarHours: lunarHours,
				lunarMinutes: lunarMinutes,
				popup: false,
				dateVal: this.date,
				dateValIsLunar: false,
				modelValue: [],
				dateString: '',
				tianganColumns: [
					["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
				],
				dizhiColumns: [],
				yearGanShow: false,
				yearZhiShow: false,
				monthGanShow: false,
				monthZhiShow: false,
				dayGanShow: false,
				dayZhiShow: false,
				hourGanShow: false,
				hourZhiShow: false,
				yearGan: '甲',
				yearZhi: '子',
				monthGan: '甲',
				monthZhi: '子',
				dayGan: '甲',
				dayZhi: '子',
				hourGan: '甲',
				hourZhi: '子',
				dateSelectShow: false,
				dateColumns: [],
				sizhuDate: ''
			};
		},
		props: {
			date: {
				type: Array,
				default: () => []
			},
			showCalendarType: {
				type: Boolean,
				default: false
			},
			hasSizhu: {
				type: Boolean,
				default: false
			}
		},
		watch: {
			dateVal(value) {
				this.$emit('update:date', value)
				this.dateString = this.dateToString(value)
			}
		},
		mounted() {
			// 赋值为当前时间
			if (this.date.length == 0) {
				// let nowDate = new Date().toLocaleDateString();
				// let arr = nowDate.split("/");
				// let nowTime = new Date().toLocaleTimeString();
				// let timeArr = nowTime.split(":");
				// this.modelValue = [arr[0] - 1900, arr[1] - 1, arr[2] - 1, parseInt(timeArr[0]), parseInt(timeArr[1])];

				// IOS低版本兼容
				this.timeMs = new Date().getTime();
				let queryTime = parseTime(new Date(this.timeMs));
				let nowDate = queryTime.split(' ');
				let arr = nowDate[0].split('-');
				let timeArr = nowDate[1].split(':');
				this.modelValue = [arr[0] - 1900, arr[1] - 1, arr[2] - 1, parseInt(timeArr[0]), parseInt(timeArr[1])];
				this.dateVal = [arr[0] - 1900, arr[1] - 1, arr[2] - 1, parseInt(timeArr[0]), parseInt(timeArr[1])];
			} else {
				this.modelValue = [this.date[0] - 1900, this.date[1] - 1, this.date[2] - 1, parseInt(this.date[3]),
					parseInt(this.date[4])
				];
				this.dateVal = [this.date[0] - 1900, this.date[1] - 1, this.date[2] - 1, parseInt(this.date[3]), parseInt(
					this.date[4])];
			}
		},
		methods: {
			// 获取完整日期数组
			toCompleteDateTimeArr(arr) {
				let year = 1900 + parseInt(arr[0]);
				let month = 1 + parseInt(arr[1]);
				let date = 1 + parseInt(arr[2]);
				return [year, month, date, arr[3], arr[4]];
			},
			// 切换日历类型
			changeType(type) {
				if (type == this.isLunar) return;
				let arr = this.modelValue;
				let year = 1900 + parseInt(arr[0]);
				let month = 1 + parseInt(arr[1]);
				let date = 1 + parseInt(arr[2]);
				if (type == true) {
					// 阳历转农历
					let result = calendar.solar2lunar(year, month, date);
					// 是否有闰月
					let hasLeapMonth = calendar.leapMonth(result.lYear);
					// 当前是否为闰月
					let isLeapMonth = result.isLeap;
					// 如果有闰月,根据闰月位置修改选中项顺序
					let tempMonth = result.lMonth;
					if (hasLeapMonth != 0) {
						if (isLeapMonth) {
							tempMonth = result.lMonth;
						} else {
							// [一月,二月,三月,四月,闰四月,五月]
							tempMonth = result.lMonth <= hasLeapMonth ? result.lMonth - 1 : result.lMonth;
						}
					} else {
						tempMonth = tempMonth - 1;
					}
					let tempVal = [result.lYear - 1900, tempMonth, result.lDay - 1, arr[3], arr[4]];
					// 农历月数组和天数组
					this.dateChangeFn(type, result, tempVal);
					// 农历月份数据(年,月,日,时,分)
					this.modelValue = tempVal;
				} else if (type == false) {
					// 农历转公历
					// 判断是否为闰月
					let isLeapMonth = false;
					let leapMonth = calendar.leapMonth(year);
					// 为闰月时月份减一,因为calendar方法中,闰不闰月的月份传值一样,靠isLeapMonth参数区分是否为闰月
					if (leapMonth != 0 && arr[1] == leapMonth) {
						isLeapMonth = true;
					}
					// 如果存在闰月,所以月份要根据闰月情况加减
					if (leapMonth != 0) {
						// [一月,二月,三月,四月,闰四月,五月]
						month = month <= leapMonth ? month : month - 1;
					}
					let result = calendar.lunar2solar(year, month, date, isLeapMonth);
					this.modelValue = [result.cYear - 1900, result.cMonth - 1, result.cDay - 1, arr[3], arr[4]];
				}
				this.isLunar = type;
			},
			/**
			 * 日期转化
			 * @param  type true:农历;false:公历
			 * @param  result calendar方法返回JSON对象
			 * @param  tempVal 选中值数组
			 */
			dateChangeFn(type, result, tempVal) {
				// 农历
				if (type == true) {
					// 该农历年的闰月位置(没有闰月 则返回0)
					let leapMonth = calendar.leapMonth(result.lYear);
					if (leapMonth != 0) {
						let tempMonths = JSON.parse(JSON.stringify(lunarMonths));
						// 添加闰月项
						tempMonths.splice(leapMonth, 0, `闰${lunarMonths[leapMonth - 1]}`);
						this.lunarMonths = tempMonths;
					} else {
						this.lunarMonths = lunarMonths;
					}
					// 修改月份对应的天数
					if (tempVal[1] == leapMonth && leapMonth != 0) {
						// 选中的为闰月,获取闰月天数
						let leapDays = calendar.leapDays(result.lYear);
						let tempDays = JSON.parse(JSON.stringify(lunarDays));
						this.lunarDays = tempDays.slice(0, leapDays);
					} else {
						// 选中非闰月
						let days = calendar.monthDays(result.lYear, tempVal[1]);
						let tempDays = JSON.parse(JSON.stringify(lunarDays));
						this.lunarDays = tempDays.slice(0, days);
					}
				}
			},
			bindChange(e) {
				let val = e.detail.value;
				if (this.isLunar == false) {
					// 公历
					let tempDays = JSON.parse(JSON.stringify(solarDays));
					if (val[0] != this.modelValue[0] || val[1] != this.modelValue[1]) {
						// 公历对应月份的天数
						let days = calendar.solarDays(val[0] + 1900, val[1] + 1);
						this.solarDays = tempDays.slice(0, days);
					}
				} else if (this.isLunar == true) {
					// 农历
					// 判断今天是否有闰月(0-12,没有闰月 则返回0)
					let leapMonth = calendar.leapMonth(val[0] + 1900);
					if (leapMonth != 0) {
						let tempMonths = JSON.parse(JSON.stringify(lunarMonths));
						// 添加闰月项
						tempMonths.splice(leapMonth, 0, `闰${lunarMonths[leapMonth - 1]}`);
						this.lunarMonths = tempMonths;
					} else {
						this.lunarMonths = lunarMonths;
					}
					// 修改月份对应的天数(leapMonth0-12,没有闰月 则返回0)
					if (leapMonth != 0 && val[1] == leapMonth) {
						// 选中的为闰月,获取闰月天数
						let leapDays = calendar.leapDays(val[0] + 1900);
						let tempDays = JSON.parse(JSON.stringify(lunarDays));
						this.lunarDays = tempDays.slice(0, leapDays);
					} else {
						// 选中非闰月
						let days;
						// 该年有闰月,则选中月在闰月前正常,在闰月后则需要-1
						if (leapMonth != 0) {
							days = calendar.monthDays(val[0] + 1900, val[1] < leapMonth ? val[1] + 1 : val[1] + 1 - 1);
						} else {
							days = calendar.monthDays(val[0] + 1900, val[1] + 1);
						}
						let tempDays = JSON.parse(JSON.stringify(lunarDays));
						this.lunarDays = tempDays.slice(0, days);
					}
				}
				this.modelValue = val;
			},
			moveStop() {},
			show() {
				this.popup = true;
			},
			close() {
				this.popup = false;
			},
			confirmSelectDate() {
				if (this.isLunar == 'sizhu') {
					uni.showLoading({
						mask: true,
						title: "查询中",
					});

				} else {
					// 获取选择日期
					this.dateVal = JSON.parse(JSON.stringify(this.modelValue));
					this.dateString = this.dateToString(this.modelValue);
					this.dateValIsLunar = JSON.parse(JSON.stringify(this.isLunar));
					this.popup = false;
					this.$emit('confirm', this.getSolarTime(this.modelValue))
				}
			},
			cancelSelectDate() {
				this.modelValue = JSON.parse(JSON.stringify(this.dateVal));
				this.isLunar = JSON.parse(JSON.stringify(this.dateValIsLunar));
				this.popup = false;
			},
			// 转化日期内容
			dateToString(arr) {
				let calendarTypeStr = "";
				if (this.showCalendarType) {
					calendarTypeStr = this.dateValIsLunar ? '农历：' : '公历：'
				}
				let year = 1900 + parseInt(arr[0]);
				// 因为闰月的存在，农历一年可能有13个月
				let month = 1 + parseInt(arr[1]);
				let date = 1 + parseInt(arr[2]);
				let hour = arr[3] < 10 ? '0' + arr[3] : arr[3];
				let minute = arr[4] < 10 ? '0' + arr[4] : arr[4];
				if (this.isLunar) {
					// 判断概念是否闰年
					let leapMonth = calendar.leapMonth(year);
					let isLeap = false;
					// 判断当前选择月份是否为闰月,闰月为该月后一项.例: 四月是4,闰四月就是5
					if (leapMonth != 0 && leapMonth == month - 1) {
						isLeap = true;
					}
					// 如果为闰年,修改当前月份为12月份制
					if (leapMonth != 0 && month > leapMonth) {
						month -= 1;
					}
					let result = calendar.lunar2solar(year, month, date, isLeap);
					let lunarHour = hourPeriodsToString(`${hour}:${minute}`);
					return `${calendarTypeStr}${result.lYear}年${result.IMonthCn}${result.IDayCn} ${lunarHour}`;
				} else {
					let result = calendar.solar2lunar(year, month, date);
					return `${calendarTypeStr}${result.cYear}年${result.cMonth}月${result.cDay}日 ${hour}:${minute}`;
				}
			},
			// 统一转化为阳历时间返回YYYY-MM-DD hh:mm
			getSolarTime() {
				let arr = this.modelValue;
				let year = 1900 + parseInt(arr[0]);
				// 因为闰月的存在，农历一年可能有13个月
				let month = 1 + parseInt(arr[1]);
				let date = 1 + parseInt(arr[2]);
				let hour = arr[3] < 10 ? '0' + arr[3] : arr[3];
				let minute = arr[4] < 10 ? '0' + arr[4] : arr[4];
				if (this.isLunar == 'sizhu') {
					let tem = this.sizhuDate;
					let sizhuDate = tem.split(' ');
					let dateArr = sizhuDate[0].split('-');
					let timeArr = sizhuDate[1].split(':');
					let result = calendar.solar2lunar(dateArr[0], dateArr[1], dateArr[2]);
					return {
						...result,
						hour: timeArr[0],
						minute: timeArr[1]
					};
				} else if (this.isLunar == true) {
					// 判断概念是否闰年
					let leapMonth = calendar.leapMonth(year);
					let isLeap = false;
					// 判断当前选择月份是否为闰月,闰月为该月后一项.例: 四月是4,闰四月就是5
					if (leapMonth != 0 && leapMonth == month - 1) {
						isLeap = true;
					}
					// 如果为闰年,修改当前月份为12月份制
					if (leapMonth != 0 && month > leapMonth) {
						month -= 1;
					}
					let result = calendar.lunar2solar(year, month, date, isLeap);
					return {
						...result,
						hour: hour,
						minute: minute
					};
				} else {
					let result = calendar.solar2lunar(year, month, date);
					return {
						...result,
						hour: hour,
						minute: minute
					};
				}
			},
			tianGanClick(pop) {
				this[pop] = true
			},
			yearZhiClick(prop, pop) {
				let temArr = ["甲", "丙", "戊", "庚", "壬"];
				if (temArr.includes(this[prop])) {
					this.dizhiColumns = [
						["子", "寅", "辰", "午", "申", "戌"]
					];
				} else {
					this.dizhiColumns = [
						["丑", "卯", "巳", "未", "酉", "亥"]
					];
				}
				this[pop] = true
				console.log(this.$refs.uPicker);
			},
			// 'yearGan'
			sizhuTianganConfirm(e, prop1, prop2) {
				let temArr = ["甲", "丙", "戊", "庚", "壬"];
				this[prop1] = e.value[0];
				if (temArr.includes(this[prop1])) {
					this[prop2] = '子'
				} else {
					this[prop2] = '丑'
				}
				this.$refs[`${prop2}Picker`].setIndexs([0]);
				this[`${prop1}Show`] = false;
			},
			sizhuDizhiConfirm(e, prop) {
				this[`${prop}Zhi`] = e.value[0];
				this[`${prop}ZhiShow`] = false;
			},
			dateSelectConfirm(e) {
				this.sizhuDate = e.value[0];
				this.dateString = e.value[0];
				this.dateSelectShow = false;
				this.popup = false;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.date-picker {
		width: 100%;
		font-size: 32rpx !important;
	}

	/* 弹出框 */
	.picker-view {
		background-color: rgba(0, 0, 0, 0.6);
		height: 100%;
		overflow: hidden;
		position: fixed;
		top: 0;
		width: 100%;
		max-width: 480px;
		z-index: 999;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		left: var(--window-left);
	}

	.picker-view.show {
		visibility: visible;
	}

	.pick-header {
		display: flex;
		flex-direction: row;
		justify-content: center;
		padding: 1rem 2rem;
	}

	.sizhu-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		padding: 0 80rpx;

		.sizhu-select {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			box-sizing: border-box;
			margin-bottom: 20rpx;
		}

		.sizhu-item {
			display: flex;
			flex-direction: column;
			justify-content: center;

			

			.sizhu-name {
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				width: 110rpx;
				height: 110rpx;
				margin-top: 20rpx;
				color: #fff;
				font-size: 40rpx;
				border-radius: 50%;
				background-color: #D3653C;
			}
		}
	}

	.pick-solar {
		border-radius: 0.4rem 0 0 0.4rem;
	}

	.pick-lunar {
		border-radius: 0 0.4rem 0.4rem 0;
	}

	.pick-item {
		color: #000;
		font-weight: normal;
		border: 1px solid #D3653C;
		width: 25%;
		font-size: 32rpx;
		line-height: 64rpx;
	}

	.pick-active {
		color: #fff;
		background-color: #D3653C;
	}

	.picker-view .picker-inner {
		background-color: #fff;
		display: block;
		font-size: 30rpx;
		text-align: center;
		width: 100%;
	}

	.picker-view .picker-inner .time {
		display: block;
		height: 400rpx;
		padding: 20rpx;
		position: relative;
	}

	.picker-view .picker-inner .time.show {
		display: block;
	}

	.picker-view .picker-inner .time .hm-span {
		position: absolute;
		right: 20%;
		top: 197rpx;
	}

	.picker-view .picker-inner .type {
		border-top: 1rpx solid #eee;
		height: 80rpx;
	}

	.picker-view .picker-inner .btn-wrap {
		padding: 3rem;
		display: flex;
		justify-content: space-between;
	}

	.wrap-btn {
		border: 1px solid #D3653C;
		border-radius: 8rpx;
		width: 100%;
		font-size: 32rpx;
		line-height: 64rpx;
	}

	.btn-cancel {
		color: #D3653C;
		background-color: #fff;
	}

	.btn-confirm {
		margin-left: 48rpx;
		color: #fff;
		background-color: #D3653C;
	}

	.picker-view .picker-inner .btns .confirm {
		width: 409rpx;
		height: 71rpx;
		color: #fff;
		margin: 0 auto;
		font-size: 43rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.item {
		color: #000;
		font-weight: normal;
		/* height: 80rpx; */
		line-height: 80rpx;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	:deep(.uni-input-input){
		color: #333;
	}
</style>