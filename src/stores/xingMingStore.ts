import type { XingMingFormData } from '@/models/xingMingForm'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

function defaultForm(): XingMingFormData {
  return {
    firstName: '',
    lastName: '',
    sex: 1,
    type: 0,
  }
}

export const xingMingStore = defineStore('xingMingStore', () => {
  const form = reactive<XingMingFormData>(defaultForm())
  /** 校验通过后固化的快照，供后续详情页使用 */
  const lastSubmit = ref<XingMingFormData | null>(null)

  const setForm = (partial: Partial<XingMingFormData>) => {
    Object.assign(form, partial)
  }

  const resetForm = () => {
    Object.assign(form, defaultForm())
  }

  const setLastSubmitFromForm = () => {
    lastSubmit.value = {
      firstName: form.firstName,
      lastName: form.lastName,
      sex: form.sex,
      type: form.type,
    }
  }

  return {
    form,
    lastSubmit,
    setForm,
    resetForm,
    setLastSubmitFromForm,
  }
}, {
  persist: true,
})
