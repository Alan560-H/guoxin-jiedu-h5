<template>
	<view p-3>
		<u-form :model="yangPanformData" ref="uFormRef">
			<u-form-item :border-bottom="false" label="盘式" label-position="top">
				<view class="flex_column fill_width gap_05rem">
					<view class="flex_row gap_1rem fill_width">
						<view class=" flex_1 f_center default" v-for="(item,index) in list " :key="index"
							@click="choosePanShi(item)" :class="yangPanformData.panType==item.value?'active':''">
							{{item.name}}
						</view>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="局式" label-position="top">
				<view class="flex_column fill_width gap_05rem">
					<view class="flex_row gap_1rem fill_width">
						<view class=" flex_1 f_center default" v-for="(item,index) in list2 " :key="index"
							@click="chooseJuShi(item)" :class="yangPanformData.setType==item.value?'active':''">
							{{item.name}}
						</view>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="标记旬空" label-position="top">
				<view class="flex_column fill_width gap_05rem">
					<view class="flex_row gap_1rem fill_width">
						<view class=" flex_1 f_center default active" @click="chooseJuShi(item)">
							{{yangPanformData.xunkongValue}}
						</view>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="当前寄宫" label-position="top">
				<view class="flex_column fill_width gap_05rem">
					<view class="flex_row gap_1rem fill_width">
						<view class=" flex_1 f_center default active" @click="chooseJuShi(item)">
							{{yangPanformData.jiGongValue}}
						</view>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="选择日期" prop="birthDay" label-position="top">
				<view class="fill_width common_input_border com_input com_input--trail-arrow f_center">
					<u-text color="#999999">
						<LunarDatetimePickerVue ref="lunarPicker" :hasSizhu="false" 
							@confirm="dateConfirm" />
					</u-text>
					<view class="com_icon">
						<u-icon name="arrow-right" color="#666666" size="36"></u-icon>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false">
				<view class="fill_width">
					<u-button @click="submit" type="primary">立即排盘</u-button>
				</view>
			</u-form-item>
		</u-form>
		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup lang="ts">
	import type { YangPanFormData } from "@/models/customForm"
	import { $u } from 'uview-pro'
	import LunarDatetimePickerVue from "@/components/lunar_datetime_picker/LunarDatetimePicker.vue"
	import { reactive, ref, onMounted, toRaw } from "vue"
	import { getXingHeQimenH5 } from "@/api/yangPan"
	import pick from 'lodash.pick';
	import type { ResponseData } from "@/models/responseData";
    import type { PanInfo } from "@/models/panModel/panInfo"
	import { yangPanStore } from "@/stores/yangPanStore"
	import { RouterPaths } from "@/routerPaths"
    	// 定义列表数据接口
	interface RadioItem {
		name : string
		disabled : boolean
        value:number
		imageDetault : string
		imageActive : string
	}

    const yangPan = yangPanStore();

	// 表单数据
	const yangPanformData = reactive<YangPanFormData>({
		birthDay: $u.timeFormat(new Date().getTime(), 'yyyy-mm-dd hh:MM'),
		panType: 0,//盘式  0：转盘 1：是飞盘
		setType: 0,//局式  0：拆补，1：置润 2：茅山 3：手工
		xunkongValue: '时空',//标记旬空  ["时空", "日空", "月空", "年空"]
		jiGongValue: '寄坤宫',//当前寄宫  ["寄坤宫", "阳艮阴坤", "寄四维", "随节令"]
		isKe: 4,
		question: "",
	})
	// 出生日期选择器
	const dateConfirm = ({ cYear, cMonth, cDay, hour, minute }) => {
		yangPanformData.birthDay = `${cYear}-${cMonth}-${cDay} ${hour}:${minute}`
	}
	//盘式
	const list = ref<RadioItem[]>([
		{
			name: '转盘',
			value: 0,
			disabled: false,
			imageDetault: '/static/common/default.png',
			imageActive: '/static/common/choosed.png'
		}
	])
	// 选择盘式
	const choosePanShi = (item : RadioItem) => {
		yangPanformData.panType = item.value;
	}
	//局式
	const list2 = ref<RadioItem[]>([
		{
			name: '拆补',
			value: 0,
			disabled: false,
			imageDetault: '/static/common/default.png',
			imageActive: '/static/common/choosed.png'
		}
	])
	// 选择盘式
	const chooseJuShi = (item : RadioItem) => {
		yangPanformData.setType = item.value;
	}
	const uFormRef = ref();
	const rules = {
		// userName: [
		// 	{
		// 		required: true,
		// 		message: '请输入姓名',
		// 		// 可以单个或者同时写两个触发验证方式 
		// 		trigger: ['change', 'blur']
		// 	}
		// ],
	};
	const submit = () => {
		uFormRef.value?.validate((valid : boolean) => {
			if (valid) {
				const tempFormData : YangPanFormData = pick(toRaw(yangPanformData), ['birthDay', 'isKe', 'question']);
				getXingHeQimenH5(tempFormData).then((res:ResponseData<PanInfo>) => {
                    yangPan.setYangPanInfo(res.data);
				
					uni.$u.route({
						url: RouterPaths.yangPanDetails
					});
				})
			}
		});
	}
	onMounted(() => {
		uFormRef.value?.setRules(rules);
	});
</script>

<style lang="scss">
	.default {
		border: 2rpx solid #666666;
		background: #fff;
		border-radius: 10rpx;
		height: 80rpx;
		color: #999999;
	}

	.active {
		border: 2rpx solid #D3653C;
		background: #FFD7C7;
		color: #DD6B18;
	}
</style>