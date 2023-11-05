<script setup>
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  stock: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const router = useRouter()
const { db } = useFirebaseStore()
const { setToast } = useMainStore()

const today = new Date()
const date = today.toISOString().split('T')[0]
const monthYear = today.toISOString().slice(0, 7)

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

async function deleteStock(id, qnty, stock_id) {
  loading.value = true
  try {
    const currentRef = doc(db, 'stocks', 'current')
    const damagedRef = doc(db, 'stocks', 'damaged', monthYear, stock_id)

    await fetchCurrentStock()
    const currentStock = await { [id]: (Number.parseInt(currentStocks.value[id], 10) + Number.parseInt(qnty, 10)) }

    await setDoc(currentRef, currentStock, { merge: true })
    await deleteDoc(damagedRef)

    setToast(true, 'Damaged Stock Removed Successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (error) {
    console.error('An error occurred:', error)
    loading.value = false
    setToast(true, ' damaged stock not removed', 'error')
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
    <v-card title="Remove from Damged Stock" class="w-full">
      <v-card-text>
        <div class="mb-5">
          Are you sure you want to remove {{ stock.qnty }} {{ stock.name }} from damaged stock ?
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
                :loading="loading"
                height="44"
                @click="deleteStock(stock.id, stock.qnty, stock.stock_id)"
              >
                Remove
              </v-btn>
            </v-col>
          </v-row>
        </v-footer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
