import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

import type { RowEChartData } from "@/models/customAiBaZiInput";
import type { ResponseData, AIChat, rowData, AIContent, LiuYue } from "@/models/responseData";
import type { AIChatFormData, AIContentFormData, AIHistoryFormData } from "@/models/customForm"
import { RouterPaths } from '@/routerPaths'
import { getTimes, postAIChat, postAIContent, getAILogs } from "@/api/bazi"
export const aiDeductionStore = defineStore('aiDeductionStore',
	() => {
		const count = ref(0)
		const getCount = async () => {
			try {
				const res : ResponseData = await getTimes();
				setCount(res.data)
			} catch (error) {

			}
		}
		//  设置今日剩余推演次数
		const setCount = (_count : number) => {
			count.value = _count;
		}

		const aiChat : AIChat = reactive({
			chatId: "",
			conversationId: "",
			status: "completed"
		});
		// 获取ai聊天会话id
		const postAIChatStore = async (param : AIContentFormData) => {
			const res : ResponseData<AIChat> = await postAIChat(param);
			Object.assign(aiChat, res.data);
			return res;
		}


		// 暂时不需要页码
		// ai 测算历史记录
		const aiLogsArr = reactive<rowData[]>([])
		const chooseHistory = reactive<rowData>({
			id: 0,
			userid: 0,
			birthday: '',
			generateDate: '',
			bazi: [],
			startYear: '',
			endYear: '',
			chatId: '',
			conversationId: '',
			gender: '',
			status: '',
			userName: '',
			districtGeocode: '',
			daYun: '',
			liuYue: [],
			content: {}
		})
		const historyTotal = ref(0);
		// 获取ai生成记录
		const getAILogsStoreFN = async (param : AIHistoryFormData) => {
			try {
				const res : ResponseData<any> = await getAILogs(param);

				if (res.code == 200 && res.rows) {
					Object.assign(aiLogsArr, res.rows)
					historyTotal.value = res.total ?? 0;
				}
				return res;
			} catch (e) {
				uni.showToast({
					title: "网络错误",
					icon: "error"
				})
			}
		}
		const chooseHistoryFN = (row : rowData) => {
			Object.assign(chooseHistory, row);
			console.log("复制前后", chooseHistory, row)
			uni.$u.route({
				url: RouterPaths.aiDeductionHistoryPage
			});
		}
		// 获取历史记录上下十年
		// 先查记录，如果有则返回结果，如果没有，则走生成接口
		const changeLiuNianHistory = async (daYun : string, startYear : any, endYear : any) : Promise<ResponseData<any>> => {
			try {
				let historyParam : AIHistoryFormData = {
					pageNum: 1,
					pageSize: 10,
					gender: chooseHistory.gender,
					birthday: chooseHistory.birthday,
					userName: chooseHistory.userName,
					districtGeocode: chooseHistory.districtGeocode,
					solar: chooseHistory.solar,
					startYear: startYear,
					endYear: endYear,
				}
				const res : ResponseData<any> = await getAILogs(historyParam);
				// console.log(chooseHistory, "当前记录", historyParam);
				if (res.rows) {
					Object.assign(chooseHistory, res.rows[0]);
				}
				console.log(res, "当前选中", startYear, endYear);
				return res;
			} catch (e) {
				console.log("查找历史记录失败");
				return {
					data: null,
					code: 200,
					msg: "查找历史记录失败",
					rows: [],//测算历史记录
					total: 0//总条数
				};
			}
		}
		// 获取ai生成得内容（历史记录专用）
		const postAIContentStoreHistoryFN = async (param : AIChatFormData) : Promise<ResponseData<AIContent>> => {
			const res : ResponseData<AIContent> = await postAIContent(param);
			if (res.data.message) {
				chooseHistory.content = res.data.message;
			}
			return res;
		}

		// 获取ai生成得内容
		const postAIContentStoreFN = async (param : AIChatFormData) : Promise<ResponseData<AIContent>> => {
			const res : ResponseData<AIContent> = await postAIContent(param);
			setRowEChartData(res.data.message as Record<string, RowEChartData>)
			return res;
		}

		const setRowEChartData = (value : Record<string, RowEChartData>) => {
			Object.keys(rowEChartData).forEach(key => delete rowEChartData[key]);
			Object.assign(rowEChartData, value)
		}

		// 图表数据
		const rowEChartData = reactive<Record<string, RowEChartData>>({});
		// 当前八字
		return {
			count, rowEChartData, getCount, postAIChatStore, aiChat,
			postAIContentStoreFN, setRowEChartData, aiLogsArr, getAILogsStoreFN,
			chooseHistory, chooseHistoryFN, historyTotal, changeLiuNianHistory, postAIContentStoreHistoryFN
		}
	},
	{
		persist: true,
	}
)