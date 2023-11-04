<script setup>
import { defineStore, storeToRefs } from 'pinia'

const mainStore = useMainStore()
const { setToast } = mainStore
const { toast } = storeToRefs(mainStore)

const newToast = ref({ value: false, message: '', status: '' })

watch(() => toast, () => {
  if (toast.value?.value === true)
    newToast.value = toast.value
}, { deep: true, immediate: true })

watch(() => newToast, () => {
  if (newToast.value?.value === false)
    setToast(false, '', '')
}, { deep: true, immediate: false })
</script>

<template>
  <v-snackbar
    v-model="newToast.value"
    class="z-100 opacity-90"
    :timeout="2000"
    :color=" newToast?.status === 'success' ? 'success' : 'error'"
    absolute
    top
  >
    <p>{{ newToast?.message }}</p>
  </v-snackbar>
</template>
