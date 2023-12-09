<script setup>
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  product: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const { productCategories } = useUtils()
const { setToast } = useMainStore()

const body = ref({})
const form = ref()
const isOpen = ref(false)
const loading = ref(false)
const productLoading = ref(false)

const currentName = ref('')

const productsList = ref([])

function onCancel() {
  form.value.reset()
  form.value.resetValidation()
  emit('update:modelValue', false)
  isOpen.value = false
}

async function updateProduct(productId) {
  const { valid } = await form.value.validate()

  if (productsList.value.some(name => name.toLowerCase() === body.value?.name.toLowerCase()) && (body.value?.name.toLowerCase() !== currentName.value.toLowerCase())) {
    setToast(true, 'This product name already exist!', 'error')
    return
  }

  if (!valid) {
    setToast(true, 'complete all required fields', 'error')
    return
  }

  loading.value = true

  try {
    const product = body.value
    const productRef = doc(db, 'products', productId)
    await updateDoc(productRef, product)
    setToast(true, 'Product updated succesfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (e) {
    setToast(true, 'Product not updated', 'error')
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

async function getProduct(id) {
  productLoading.value = true
  try {
    const docRef = doc(db, 'products', id)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      body.value = docSnapshot.data()
      currentName.value = body.value.name
      body.value.price_b = body.value?.price_b || body.value?.price_a
      body.value.price_c = body.value?.price_c || body.value?.price_a
      body.value.price_d = body.value?.price_d || body.value?.price_a
    }

    else { console.log('Document does not exist') }
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }

  finally {
    productLoading.value = false
  }
}

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue) {
    isOpen.value = true
    getProduct(props?.product?.id)
  }
}, { deep: true, immediate: true })

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
    width="514"
  >
    <v-card class="w-full">
      <v-card-title>
        <div class=" flex gap-x-3 mt-2 font-semibold ">
          <button>
            <Icon name="eva:arrow-back-outline" size="24" @click="onCancel" />
          </button>
          Edit Product
        </div>
      </v-card-title>

      <hr class=" border-[1px]   w-full">

      <v-card-text v-if="productLoading" fluid>
        <div class=" w-full flex pt-6 pb-20 h-full justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>
      </v-card-text>

      <v-card-text v-else>
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
                  @click="updateProduct(product.id)"
                >
                  Update
                </v-btn>
              </v-col>
            </v-row>
          </v-footer>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
