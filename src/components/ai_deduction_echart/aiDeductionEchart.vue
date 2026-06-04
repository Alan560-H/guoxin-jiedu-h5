<!-- AiDeductionECharts.vue -->
<template>
	<view class="pic u-relative">
		<view class="u-absolute flex_row gap_05rem" style="top: 0; right: 0;">
			<u-button :ripple="true" ripple-bg-color="#d3653c" @click="handleZoom('in')">
				<u-text text="+" size="24px"></u-text>
			</u-button>
			<u-button :ripple="true" ripple-bg-color="#d3653c" @click="handleZoom('out')">
				<u-text text="-" size="24px"></u-text>
			</u-button>
		</view>
		<l-echart ref="containerRef" @finished="initChart"></l-echart>
	</view>

</template>

<script lang="ts" setup>
	import { ref, toRaw, watch,onUnmounted } from "vue";
	import type { RowEChartData } from "@/models/customAiBaZiInput";

	const props = defineProps<{
		rowData : Record<string, RowEChartData>; // 接收你传入的 rowEChartData
	}>();

	const containerRef = ref(null)

	let chartInstance = null; // ECharts 实例

	// 放大缩小
	// 放大缩小
	const handleZoom = (direction : 'in' | 'out') => {
		// 1. 校验：图表实例不存在则直接返回，避免报错
		if (!chartInstance) return;

		try {
			// 2. 获取当前图表的配置项（重点读取dataZoom配置）
			const option = chartInstance.getOption();
			if (!option.dataZoom || option.dataZoom.length === 0) {
				console.warn('图表未配置dataZoom组件，无法缩放');
				return;
			}

			// 3. 提取当前dataZoom的起止百分比
			const currentDataZoom = option.dataZoom[0];
			const currentStart = currentDataZoom.start ?? 0; // 当前可视区域起始百分比
			const currentEnd = currentDataZoom.end ?? 100;   // 当前可视区域结束百分比
			const currentRange = currentEnd - currentStart;  // 当前可视区域范围

			// 4. 根据缩放方向计算新的范围（和React版本逻辑一致）
			let newRange;
			if (direction === 'in') {
				// 放大：范围缩小为原来的70%，最小不小于20%（避免只显示1-2个数据点）
				newRange = Math.max(currentRange * 0.7, 20);
			} else {
				// 缩小：范围扩大为原来的140%，最大不超过100%（显示全部数据）
				newRange = Math.min(currentRange * 1.4, 100);
			}

			// 5. 以当前可视区域中点为中心，计算新的起止点
			const center = (currentStart + currentEnd) / 2;
			let newStart = center - newRange / 2;
			let newEnd = center + newRange / 2;

			// 6. 边界校验：避免超出0-100%的范围
			if (newStart < 0) {
				newStart = 0;
				newEnd = newRange;
			}
			if (newEnd > 100) {
				newEnd = 100;
				newStart = 100 - newRange;
			}

			// 7. 触发ECharts的dataZoom动作，更新可视区域（核心步骤）
			chartInstance.dispatchAction({
				type: 'dataZoom',
				start: newStart,
				end: newEnd
			});

		} catch (error) {
			console.error('缩放操作失败:', error);
		}
	};

	// 4. 构建 ECharts 配置项（和 React 版本完全一致）
	const getChartOption = () => {
		// 把传入的 rowData 转成数组并排序（保证年份顺序）
		const res = Object.values(props.rowData).sort((a, b) =>
			Number(a.year) - Number(b.year)
		);

		let dataList = [];
		res.map((item) => {
			dataList.push(toRaw(item))
		})


		// 提取图表所需数据
		const dates = dataList.map(item => `${item.year}\n${item.ganzhi}`);
		const dataValues = dataList.map(item => item.values);
		return {
			backgroundColor: 'transparent',
			grid: {
				left: '5%',
				right: '5%',
				bottom: '10%',
				top: '15%',
				containLabel: true
			},
			tooltip: {
				trigger: 'axis',
				confine: true,
				axisPointer: { type: 'cross', label: { show: false, backgroundColor: '#666' } },
				backgroundColor: 'rgba(255, 255, 255, 0.98)',
				borderColor: '#854d0e',
				borderWidth: 1,
				padding: 16,
				extraCssText: 'max-width: 280px; white-space: normal; word-break: break-all; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: #333;',
				textStyle: { color: '#333', fontFamily: '"Songti SC", serif' },
				formatter: (params : any) => {
					if (!params || params.length === 0) return '';
					const index = params[0].dataIndex;
					const item = dataList[index];
					const v = item.values;
					console.log("我哦哦哦");
					return `
          <div style="font-family: 'Songti SC', serif;">
            <div style="font-size:20px; font-weight:bold; color:#854d0e; margin-bottom:12px; border-bottom: 1px solid #e5e0d6; padding-bottom: 8px;">
              ${item.year} ${item.ganzhi} <span style="font-size:16px; color:#666;">[${item.nayin}]</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:16px;">
              <span style="color:#666;">岁启:</span>
              <span style="font-weight:bold; color:${v[0] > 0 ? '#c23531' : '#2e7d32'}">${v[0]}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:16px;">
              <span style="color:#666;">定局:</span>
              <span style="font-weight:bold; color:${v[1] > 0 ? '#c23531' : '#2e7d32'}">${v[1]}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:16px;">
              <span style="color:#666;">乘旺:</span>
              <span style="font-weight:bold; color:#c23531">${v[3]}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:16px;">
              <span style="color:#666;">否极:</span>
              <span style="font-weight:bold; color:#2e7d32">${v[2]}</span>
            </div>
            <div style="background:#f9f8f6; border-left: 3px solid #854d0e; padding: 10px; font-size: 16px; color: #444; line-height: 1.6; white-space: normal; word-wrap: break-word;">
              "${item.note}"
            </div>
          </div>
        `;
				}
			},
			xAxis: {
				type: 'category',
				data: dates,
				axisLine: { lineStyle: { color: '#a8a29e' } },
				axisLabel: {
					color: '#44403c',
					fontSize: 14,
					interval: 0,
					fontWeight: 'bold',
					fontFamily: 'serif'
				}
			},
			yAxis: {
				scale: true,
				splitLine: { lineStyle: { color: '#e7e5e4' } },
				axisLine: { lineStyle: { color: '#a8a29e' } },
				axisLabel: {
					color: '#57534e',
					fontSize: 12,
					formatter: (value : number) => {
						if (value > 0) return '+' + value;
						return value.toString();
					}
				}
			},
			dataZoom: [
				{
					type: 'inside',
					startValue: 0,
					endValue: 7,
					zoomLock: true,
					zoomOnMouseWheel: false,
					zoomOnTouch: false,
					moveOnMouseMove: true,
					moveOnTouch: true,
					preventDefaultMouseMove: false
				}
			],
			series: [
				{
					name: '运势K线',
					type: 'candlestick',
					data: dataValues,
					itemStyle: {
						color: '#dc2626',
						color0: '#16a34a',
						borderColor: '#b91c1c',
						borderColor0: '#15803d'
					},
					markLine: {
						symbol: ['none', 'none'],
						data: [
							{ yAxis: 0, label: { show: false }, lineStyle: { color: '#a8a29e', type: 'dashed', width: 1 } }
						],
						animation: false
					}
				}
			],
			animationDuration: 500,
			animationEasing: 'cubicOut'
		};
	};

	// 5. 初始化图表
	const initChart = async () => {
		if (!containerRef.value) return
		try {
			chartInstance = await containerRef.value.init()
			chartInstance.setOption(getChartOption())
		} catch (error) {
			console.error('图表初始化失败:', error)
		}
	};

	



	// // 8. 监听 rowData 变化，更新图表
	watch(
		() => props.rowData,
		(newVal, oldVal) => {
			console.log('===== rowData 发生变化 =====');
			console.log('旧值：', toRaw(oldVal)); // toRaw避免看到Vue响应式代理，只看真实数据
			console.log('新值：', toRaw(newVal));
			if (chartInstance) {
				chartInstance.setOption(getChartOption());
			}
		},
		{ deep: true } // 深度监听对象变化
	);

	onUnmounted(() => {
	  if (chartInstance) {
	    chartInstance.dispose();
	    chartInstance = null;
	  }
	});
</script>

<style lang="scss" scoped>
	.pic {
		height: 380px;
	}
</style>