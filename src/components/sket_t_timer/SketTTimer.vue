<template>
	<view class="container flex_row gap_05rem p-3">
		<view class="pc_clock">
			<view class="clock_item" :style="'width:'+z_size+'rpx;height:'+z_size+'rpx;'">
				<view class="scale" v-for="item in 30"
					:style="'transform: rotate('+(item*6)+'deg);background-color:'+border+';'"></view>
				<view class="bacone"
					:style="'width:'+(z_size-20)+'rpx;height:'+(z_size-20)+'rpx;background-color:'+color+';'"></view>
				<view class="perpend" v-for="item,index in 6"
					:style="'transform: rotate('+(index*30)+'deg);background-color:'+border+';'"></view>
				<view class="clock_boxs"
					:style="'width:'+(z_size-35)+'rpx;height:'+(z_size-35)+'rpx;background-color:'+color+';'">
					<view class="hour" :style="'position: absolute;transform: rotate('+(hour*30)+'deg);'">
						<view class="needle" :style="'background-color:'+pointer[0]+';'"></view>
					</view>
					<view class="minute" :style="'position: absolute;transform: rotate('+(minute*6)+'deg);'">
						<view class="needle" :style="'background-color:'+pointer[1]+';'"></view>
					</view>
					<view class="second" :style="'position: absolute;transform: rotate('+(second*6)+'deg);'">
						<view class="needle" :style="'background-color:'+pointer[2]+';'"></view>
					</view>
					<view class="cover" :style="'width:'+(z_size/10)+'rpx;height:'+(z_size/10)+'rpx;'">
						{{point.slice(0,1)}}</view>
				</view>
			</view>

		</view>
		<div class="flex_1 flex_column gap_05rem f_a_center right_info">
			<view class="flex_1 flex_row fill_width">
				<view class="flex_1 f_center flex_column u-font-lg" v-for="(item,index) in siZhu" :key="index">
					<span v-for="(txt,i) in item" :key="i" style="font-weight: bold;">
						{{txt}}
					</span>
				</view>
			</view>
			<div class="fill_width flex_column gap_05rem" style="padding-left: 80rpx;">
				<view class="u-font-xs">公历：{{solarDate}}</view>
				<view class="u-font-xs">农历：{{lunarDate}}</view>
			</div>
		</div>
	</view>
</template>

<script>
	import {
		Lunar,
		Solar
	} from 'lunar-javascript';
	export default {
		name: 'pc-clock',
		props: {
			size: {
				type: [String, Number],
				default: 200
			},
			color: {
				type: String,
				default: 'white'
			},
			border: {
				type: String,
				default: '#333'
			},
			pointer: {
				type: Array,
				default: () => ['#000000', '#409EFF', '#ff0000']
			},
			model: {
				type: String,
				default: 'default'
			}
		},
		data() {
			return {
				z_size: 200,
				hour: 0,
				minute: 0,
				second: 0,
				point: 'AM',
				intes: true,
				dates: [
					['', ''],
					['', ''],
					['', ''],
					['', ''],
					['', '']
				],
				solarDate: "", // 公里
				lunarDate: "", // 农历
				siZhu: ["", "", "", ""], //0:年柱，1：月柱,2:日柱,3:时柱

			}
		},
		created() {
			if (this.size && this.size > 199) {
				this.z_size = this.size
			} else {
				this.z_size = 300
			}
			this.settimes()
		},
		beforeDestroy() {
			this.intes = false
		},
		methods: {
			settimes() {
				let time = new Date();
				let hours = time.getHours();
				const solar = Solar.fromDate(time);
				// 转换为农历
				const lunar = Lunar.fromDate(time);
				if (Number(hours) > 12) {
					this.hour = Number(hours) - 12
					this.point = 'PM'
				} else {
					this.hour = Number(hours)
					this.point = 'AM'
				}
				this.minute = time.getMinutes();
				this.second = time.getSeconds();
				this.siZhu[0] = lunar.getYearInGanZhi();
				this.siZhu[1] = lunar.getMonthInGanZhi();
				this.siZhu[2] = lunar.getDayInGanZhi();
				this.siZhu[3] = lunar.getTimeInGanZhi();
				// 格式化公历（示例：2026年01月12日 星期一）
				this.solarDate =
					`${solar.getYear()}年${solar.getMonth().toString().padStart(2, '0')}月${solar.getDay().toString().padStart(2, '0')}日 ${this.hour}:${this.minute<10?'0'+this.minute:this.minute}:${this.second<10?'0'+this.second:this.second}`;

				// 格式化农历（示例：二〇二五年十一月廿三日 乙丑月 辛卯日）
				this.lunarDate =
					`${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日 ${lunar.getTimeZhi()}时`;


				if (this.intes) {
					setTimeout(() => {
						this.settimes()
					}, 500)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		border: 1px solid #333;
		border-radius: 10rpx;
	}

	.right_info {
		text-align: left;
	}

	.notxt {
		white-space: nowrap;
	}

	.pc_clock {
		position: relative;

		.clock_item {
			position: relative;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;

			.scale {
				height: 100%;
				width: 1px;
				position: absolute;
				z-index: 5;
			}

			.bacone {
				position: absolute;
				z-index: 10;
				border-radius: 50%;
			}

			.perpend {
				width: 1px;
				height: 100%;
				position: absolute;
				z-index: 15;
			}

			.clock_boxs {
				position: absolute;
				z-index: 20;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.hour {
					z-index: 26;
					height: 80%;
					width: 3px;
					display: flex;
					justify-content: center;

					.needle {
						width: 3px;
						height: 50%;
					}
				}

				.minute {
					z-index: 27;
					height: 80%;
					width: 3px;
					display: flex;
					justify-content: center;

					.needle {
						width: 2px;
						height: 50%;
					}
				}

				.second {
					z-index: 28;
					height: 80%;
					width: 3px;
					transform: rotate(180deg);
					display: flex;
					justify-content: center;

					.needle {
						width: 1px;
						height: 50%;
					}
				}

				.cover {
					position: absolute;
					background-color: #000;
					border-radius: 50%;
					z-index: 30;
					display: flex;
					align-items: center;
					justify-content: center;
					overflow: hidden;
					color: #FFFFFF;
					font-size: 10%;
				}
			}
		}

		.personality {
			display: flex;
			align-items: center;
			justify-content: center;

			.lines {
				position: relative;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.bold {
					font-weight: bold;
				}

				.hour {
					width: 50upx;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;

					.needle {
						position: absolute;
						border-radius: 50%;
						z-index: 50;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: bold;
						overflow: hidden;
					}
				}

				.minute {
					width: 50upx;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;

					.needle {
						position: absolute;
						border-radius: 50%;
						z-index: 80;
						display: flex;
						align-items: center;
						justify-content: center;
						font-weight: bold;
						overflow: hidden;
					}
				}

				.second {
					width: 50upx;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;

					.needle {
						position: absolute;
						border-radius: 50%;
						z-index: 100;
						display: flex;
						align-items: center;
						justify-content: center;
						color: #FFFFFF;
						overflow: hidden;
					}
				}
			}
		}

		.paging {
			display: flex;
			padding: 20upx;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;

			.gansder {
				font-weight: bold;
				position: absolute;
			}

			.hour {
				flex: 1;
				font-weight: bold;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				padding-right: 15%;
			}

			.flex1 {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				position: relative;

				.minute {
					flex: 1;
					display: flex;
					align-items: center;
					width: 100%;
					font-weight: bold;
					padding-left: 10%;
				}

				.second {
					flex: 1;
					display: flex;
					align-items: center;
					width: 100%;
					font-weight: bold;
					padding-left: 10%;
				}
			}
		}
	}
</style>