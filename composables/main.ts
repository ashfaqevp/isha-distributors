import { defineStore, storeToRefs } from 'pinia'

export const useMainStore = defineStore('main', () => {
  const toast = ref({ value: false, message: '', status: '' })
  const setToast = (value: boolean, message: string, status: string) => {
    toast.value = { value, message, status }
  }

  return {
    toast,
    setToast,
  }
})
