<script setup>
import { collection, deleteDoc, doc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  product: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const loading = ref(false)
const isOpen = ref(false)
const toast = ref({ value: false, message: '', status: '' })

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue)
    isOpen.value = true
}, { deep: true, immediate: true })

function onCancel() {
  emit('update:modelValue', false)
  isOpen.value = false
}

async function deleteProduct(productId) {
  loading.value = true
  try {
    const productRef = doc(db, 'products', productId)
    await deleteDoc(productRef)
    toast.value = { value: true, message: 'Product deleted successfully', status: 'success' }
    emit('refresh')
    onCancel()
  }
  catch (e) {
    toast.value = { value: true, message: 'Error deleting product', status: 'error' }
    console.error(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    width="514"
  >
    <v-card title="Delete Product" class="w-full">
      <v-card-text>
        <div class="mb-5">
          Are you sure you want to delete {{ product.name }} ?
        </div>

        <v-footer class="px-0 pt-0">
          <v-row dense>
            <v-col
              cols="6"
              sm="6"
            >
              <v-btn
                color="gray"
                variant="outlined"
                block
                :disabled="loading"
                @click="onCancel"
              >
                Cancel
              </v-btn>
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-btn
                color="error"
                block
                :loading="loading"
                @click="deleteProduct(product.id)"
              >
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-footer>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="toast.value"
    class="z-100 opacity-90"
    :timeout="2000"
    :color=" toast?.status === 'success' ? 'success' : 'error'"
    absolute
    top
  >
    <p>{{ toast?.message }}</p>
  </v-snackbar>
</template>
