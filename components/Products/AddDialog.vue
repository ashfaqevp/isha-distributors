<script setup>
import { addDoc, collection, getDocs } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const { productCategories } = useUtils()
const { setToast } = useMainStore()

const body = ref({})
const form = ref()
const isOpen = ref(false)
const loading = ref(false)

const productsList = ref([])

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue)
    isOpen.value = true
}, { deep: true, immediate: true })

function onCancel() {
  form.value.reset()
  form.value.resetValidation()
  emit('update:modelValue', false)
  isOpen.value = false
}

async function addProduct() {
  const { valid } = await form.value.validate()

  if (productsList.value.some(name => name.toLowerCase() === body.value?.name.toLowerCase())) {
    setToast(true, 'This product name already exist!', 'error')
    return
  }

  if (!valid) {
    setToast(true, 'complete all required fields', 'error')
    return
  }

  loading.value = true

  try {
    body.value.price_b = body.value?.price_b || body.value?.price_a
    body.value.price_c = body.value?.price_c || body.value?.price_a
    body.value.price_d = body.value?.price_d || body.value?.price_a
    const product = body.value
    const dbRef = collection(db, 'products')
    const addedDocRef = await addDoc(dbRef, product)
    setToast(true, 'New product added', 'success')
    emit('refresh')
    onCancel()
  }
  catch (e) {
    setToast(true, 'Product not saved', 'error')
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

async function fetchProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    productsList.value = querySnapshot.docs.map(doc => doc.data().name)
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted (async () => {
  await fetchProducts()
})
</script>

<template>
  <v-dialog
    v-model="isOpen"

    persistent
    width="420"
  >
    <v-card class="w-full">
      <v-card-title>
        <div class=" flex gap-x-3 mt-2 font-semibold ">
          <button>
            <Icon name="eva:arrow-back-outline" size="24" @click="onCancel" />
          </button>
          Add Product
        </div>
      </v-card-title>

      <hr class=" border-[1px]   w-full">
      <v-card-text>
        <v-form ref="form" class="mt-1">
          <v-text-field
            v-model="body.name"
            :rules="[v => !!v || '']"
            label="Product Name"
            required
            variant="outlined"
          />

          <v-select
            v-model="body.category"
            :items="productCategories"
            :rules="[v => !!v || '']"
            label="Category"
            required
            variant="outlined"
          />

          <v-row dense>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.price_a"
                :rules="[v => !!v || '']"
                label="Price"
                required
                type="number"
                prefix="₹"
                variant="outlined"
              />
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.price_b"
                label="Discount Price"
                prefix="₹"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.price_c"
                label="Special Price "
                prefix="₹"
                variant="outlined"
              />
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.price_d"
                label="Dealer Price"
                prefix="₹"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="body.cost"
            :rules="[v => !!v || '']"
            label="Cost"
            required
            type="number"
            prefix="₹"
            variant="outlined"
          />

          <v-footer class="px-0 pt-0">
            <v-row dense>
              <v-col
                cols="6"
                sm="6"
              >
                <v-btn
                  block
                  variant="outlined"
                  height="44"
                  class="!font-semibold"
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
                  color="primary"
                  block
                  flat
                  :loading="loading"
                  height="44"
                  class="!font-semibold"
                  @click="addProduct"
                >
                  Save
                </v-btn>
              </v-col>
            </v-row>
          </v-footer>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
