<template>
	<view p-3>
		<u-form :model="formData" ref="uFormRef">
			<u-form-item :border-bottom="false" label="您的姓名（选填）" prop="userName" label-position="top">
				<view class="fill_width common_input_border com_input com_input--trail">
					<u-input v-model="formData.userName" placeholder="请输入您的姓名" />
					<view class="com_icon">
						<u-icon name="account" color="#999999" size="36"></u-icon>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="性别" prop="sex" label-position="top">
				<view class="fill_width flex_column gap_05rem">
					<view class="flex_row gap_1rem fill_width">
						<view class=" flex_1 f_center default" :class="formData.sex==1?'active':''"
							@tap.stop="formData.sex = 1">男</view>
						<view class=" flex_1 f_center default" :class="formData.sex==0?'active':''" s
							@tap.stop="formData.sex = 0">女</view>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="出生时间" prop="birthDay" label-position="top">
				<view class="fill_width common_input_border com_input com_input--trail-arrow f_center">
					<u-text color="#999999">
						<LunarDatetimePickerVue ref="lunarPicker" :hasSizhu="false" :date.sync="formData.date"
							@confirm="dateConfirm" />
					</u-text>
					<view class="com_icon">
						<u-icon name="arrow-right" color="#666666" size="36"></u-icon>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false" label="出生地点" label-position="top">
				<view class="fill_width common_input_border com_input com_input--trail-arrow f_center" @click="showPicker">
					<view class="fill_width">
						<u-text color="#999999">{{choosedArea.label||"请选择出生地点"}}</u-text>
					</view>
					<view class="com_icon">
						<u-icon name="arrow-right" color="#666666" size="36"></u-icon>
					</view>

				</view>
				<u-picker mode="region" v-model="show" @confirm="confirm"></u-picker>
			</u-form-item>
			<u-form-item :border-bottom="false" label="排盘选项" label-position="top">
				<view class="flex_column fill_width gap_05rem">
					<view class="flex_row gap_1rem fill_width">
						<view class=" flex_1 f_center default" v-for="(item,index) in list " :key="index"
							@click="choosePaiPan(item)" :class="formData.solar==item.value?'active':''">{{item.name}}
						</view>
					</view>
				</view>
			</u-form-item>
			<u-form-item :border-bottom="false">
				<view class="fill_width">
					<u-button @click="submit" type="primary">提交</u-button>
				</view>

			</u-form-item>
		</u-form>
		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted } from "vue"
	import type { FormData } from "@/models/customForm"
	import LunarDatetimePickerVue from "@/components/lunar_datetime_picker/LunarDatetimePicker.vue"
	import { getBaZiPanInfo } from "@/api/bazi"
	import { $u } from 'uview-pro'
	import { shengPingStore } from "@/stores/shengPingStore"
	import { RouterPaths } from "@/routerPaths"
	// 定义列表数据接口
	interface RadioItem {
		name : string
		disabled : boolean
		imageDetault : string
		imageActive : string
	}
	// 选中得地区
	interface ChoosedArea {
		code : number
		label : string
	}
	shengPingStore().initShengPingStore();
	const uFormRef = ref();
	onMounted(() => {
		uFormRef.value?.setRules(rules);
	});

	// 表单数据
	const formData = reactive<FormData>({
		userName: "",
		birthDay: $u.timeFormat(new Date().getTime(), 'yyyy-mm-dd hh:MM'),//生辰
		sex: 1, // 性别：1：男 0：女
		solar: true,//是否使用真太阳时 true：使用，false：不适用
		districtGeocode: 0 // 地区编码
	})
	const uToastRef = ref()
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
				if (formData.solar && formData.districtGeocode == 0) {
					uToastRef.value?.show({
						position: "top",
						title: '请选择你得出生地',
						type: 'error',
					})
					return;
				}
				let tempFormData = Object.assign(formData, {});
				if (formData.sex == 1) {
					tempFormData.sex = "男"
				} else {
					tempFormData.sex = "女"
				}
				getBaZiPanInfo(tempFormData).then((res) => {
					res.data.solar = tempFormData.solar;
					shengPingStore().setBaZiInfo(res.data);
					uni.$u.route({
						url: RouterPaths.shengPingDetails
					});
				})
			}
		});
	}

	// 出生日期选择器
	const dateConfirm = ({ cYear, cMonth, cDay, hour, minute }) => {
		formData.birthDay = `${cYear}-${cMonth}-${cDay} ${hour}:${minute}`
	}
	//排盘选项
	const list = ref<RadioItem[]>([
		{
			name: '真太阳时',
			value: true,
			disabled: false,
			imageDetault: '/static/common/default.png',
			imageActive: '/static/common/choosed.png'
		},
		{
			name: '早晚子时',
			value: false,
			disabled: false,
			imageDetault: '/static/common/default.png',
			imageActive: '/static/common/choosed.png'
		}
	])
	// 是否使用真太阳时
	const choosePaiPan = (item : RadioItem) => {
		formData.solar = item.value;
	}

	// 是否显示地区选择器
	const show = ref(false)
	const choosedArea = reactive<ChoosedArea>({
		label: "",
		code: 110100
	})
	// 打开地区选择器
	const showPicker = () => {
		choosedArea.value = {
			label: "",
			code: 110102
		}
		show.value = true
	}
	// 选择器确定事件
	const confirm = ({ province, city, area }) => {
		choosedArea.label = `${province.label}-${city.label}-${area.label}`;
		choosedArea.value = area.value;
		formData.districtGeocode = area.value;
	}
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