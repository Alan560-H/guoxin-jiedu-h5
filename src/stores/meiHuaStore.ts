import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 梅花起盘结果 payload（与老 details 的 info 查询参数结构一致） */
export type MeiHuaPanPayload = Record<string, string | number>

export const meiHuaStore = defineStore('meiHuaStore', () => {
  const lastPanPayload = ref<MeiHuaPanPayload | null>(null)

  function setLastPan(payload: MeiHuaPanPayload) {
    lastPanPayload.value = payload
  }

  function clearLastPan() {
    lastPanPayload.value = null
  }

  return { lastPanPayload, setLastPan, clearLastPan }
})
