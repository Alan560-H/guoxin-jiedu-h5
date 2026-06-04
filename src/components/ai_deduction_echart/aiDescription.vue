<template>
	<!-- 图例说明 -->
	<u-collapse>
		<u-collapse-item :open="isOpen">
			<template #title-all="scope">
				<view class="collapse_title fill_div flex_row f_j_sb " p-3 @click.stop="isOpen=!isOpen">
					<view class="f_center flex_row flex_1 gap_05rem">
						<u-icon name="info-circle"></u-icon>
						<u-text text="图谱核心释义"></u-text>
					</view>
					<view class=" flex_row f_j_end flex_1 gap_05rem">
						<view>
							<u-text :text="isOpen?'展开图例':'收起图例'"></u-text>
						</view>
						<u-icon :name="isOpen?'arrow-down':'arrow-up'"></u-icon>
					</view>

				</view>
			</template>
			<view class="aiDescContainer flex_column gap_05rem" p-3 >
				<view class="flex_row">
					<view><u-text text="岁启：" bold size="18px"></u-text></view>
					<u-text text="流年基调，年初之时运" type="info"></u-text>
				</view>
				<view class="flex_row">
					<view><u-text text="定局：" bold size="18px"></u-text></view>
					<u-text text="最终结果，年初之得失" type="info"></u-text>
				</view>
				<view class="flex_row">
					<view><u-text text="承旺：" color="red" bold size="18px"></u-text></view>
					<u-text text="高光时刻，运势最高点" type="info"></u-text>
				</view>
				<view class="flex_row">
					<view><u-text text="否极：" color="green" bold size="18px"></u-text></view>
					<u-text text="至暗时刻，运势最低点" type="info" align="left"></u-text>
				</view>
				<view class="flex_row gap_05rem">
					<view class="comCir" style="background-color: red;">
					</view>
					<view class="flex_column">
						<u-text text="红柱（阳）" color="red" bold></u-text>
						<u-text text="运势上升，结果优于开局" type="info" size="18"></u-text>
					</view>
				</view>
				<view class="flex_row gap_05rem">
					<view class="comCir" style="background-color: green;">
					</view>
					<view class="flex_column">
						<u-text text="绿柱（阴）" color="red" bold></u-text>
						<u-text text="运势下滑，结果不如预期" type="info" size="18"></u-text>
					</view>
				</view>
				<view class="flex_row gap_05rem">
					<view class="comCir custom_divider f_center">
						<u-divider bg-color="transparent" half-width="40" border-color="#a8a29e">·</u-divider>
					</view>
					<view class="flex_column">
						<u-text text="影线形态" bold></u-text>
						<u-text text="长影线：波动剧烈，多为冲刑，心累奔波" type="info" size="18"></u-text>
						<u-text text="短影线：平稳安定，多为合局，岁月静好" type="info" size="18"></u-text>
					</view>
				</view>
				
			</view>
		</u-collapse-item>
	</u-collapse>
</template>

<script lang="ts" setup>
	import { ref, reactive } from "vue"
	const isOpen = ref(true) // 是否打开图谱说明
</script>

<style scoped lang="scss">
	:deep(.u-divider-text){
		padding:0;
	}
	.aiDescContainer{
		background: #fcfaf7;
		border-radius: 0 0 10rpx 10rpx;
		border:4rpx solid #f5f2eb;
	}
	.comCir {
		width: 40rpx;
		height: 60rpx;
		border-radius: 10rpx;
	}
	.custom_divider{
		transform: rotateZ(90deg);
	}
	.collapse_title {
		background: #f5f5f4;
		border-radius: 10rpx 10rpx 0 0;
	}
</style>