<!-- ai解读 等待 -->
<template>
	<u-mask :show="isLoading" :custom-style="{background: 'rgba(245, 242, 235)'}">
		<view class="ai_loading fill_div f_center flex_column gap_05rem">
			<!-- 图标 -->
			<view class="loading_container u-relative f_center">
				<u-loading :show="true" size="150" color="#854d0e">
				</u-loading>
				<view class="u-absolute centerText f_center" p-2>
					<view class="">
						<u-text text="乾" color="#854d0e" size="46" bold></u-text>
					</view>
				</view>
			</view>
			<!-- 文字 -->
			<view>
				<u-text :text="currentTxt" color="#7f7c77" size="36" bold></u-text>
			</view>
			<view>
				<u-text text="人工智能计算中，等待大约1-3分钟，请勿退出" bold color="#b89873" size="18"></u-text>
			</view>
		</view>
	</u-mask>

</template>

<script lang="ts" setup>
	import { ref, computed,onUnmounted } from "vue"
	const props = defineProps({
		isLoading: {
			type: Boolean,
			required: true, // 设为非必填
			default: false   // 默认值为 false
		}
	});
	// 模拟 AI 演算过程
	const steps = [
		"正在连接天机量化引擎...",
		"解析四柱八字结构...",
		"推演五行旺衰强弱...",
		"计算大运流年干支...",
		"生成十年运势K线..."
	];
	const step = ref(0);
	const currentTxt = computed(() => {
		return steps[step.value];
	});

	let timer : NodeJS.Timeout | null = null;
	setInterval(() => {
		step.value = (step.value + 1) % steps.length;
	}, 1500)

	// 组件卸载时清除定时器，防止内存泄漏
	onUnmounted(() => {
	});
</script>

<style lang="scss" scoped>
	:deep(.u-loading-circle)  {
		border: 6px solid;
	}

	.ai_loading {
		.loading_container {
			width: 150rpx;
			height: 150rpx;

			.centerText {
				width: 100rpx;
				height: 100rpx;
				background: #fcf7f0;
				border-radius: 50%;
				border: 2px #e5e0d6 solid;
			}
		}
	}
</style>