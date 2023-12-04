<script setup>
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
  shop: Number,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()
const { setToast } = useMainStore()

const { today } = useUtils()
const loading = ref(false)
const isOpen = ref(false)

const currentStocks = ref({})

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue)
    isOpen.value = true
}, { deep: true, immediate: true })

function onCancel() {
  emit('update:modelValue', false)
  isOpen.value = false
}

async function deleteItem(id, qnty, productId, shopId, shopPending, total) {
  loading.value = true
  try {
    const billRef = doc(db, 'bills', today, shopId, id)
    const currentRef = doc(db, 'stocks', 'current')
    const shopRef = doc(db, 'shops', shopId)

    await deleteDoc(billRef)

    await fetchCurrentStock()
    const currentStock = await { [productId]: (Number.parseInt(currentStocks.value[productId], 10) + Number.parseInt(qnty, 10)) }
    await setDoc(currentRef, currentStock, { merge: true })

    const currentPending = await { pending: (Number.parseInt(shopPending, 10) - Number.parseInt(total, 10)) }
    await setDoc(shopRef, currentPending, { merge: true })

    setToast(true, 'Bill item Deleted Successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (error) {
    console.error('An error occurred:', error)
    loading.value = false
    setToast(true, ' Item not deleted', 'error')
  }

  finally {
    loading.value = false
  }
}

async function fetchCurrentStock() {
  try {
    const docRef = doc(db, 'stocks', 'current')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      currentStocks.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    width="514"
  >
    <v-card title="Delete Bill Item" class="w-full">
      <v-card-text>
        <div class="mb-5">
          Are you sure dd you want to delete {{ item.qnty }} {{ item.name }} from bill ?
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
                class="!font-semibold"
                :disabled="loading"
                height="44"
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
                class="!font-semibold"
                :loading="loading"
                height="44"
                @click="deleteItem(item.id, item.qnty, item.product_id, shop.id, shop.pending, item.total)"
              >
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-footer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
