import { ProductsAddDialog } from '#build/components';
<script setup>
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  product: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const { productCategories } = useUtils()

const body = ref({})
const form = ref()
const isOpen = ref(false)
const loading = ref(false)
const productLoading = ref(false)

const toast = ref({ value: false, message: '', status: '' })

function onCancel() {
  form.value.reset()
  form.value.resetValidation()
  emit('update:modelValue', false)
  isOpen.value = false
}

async function updateProduct(productId) {
  const { valid } = await form.value.validate()

  if (!valid) {
    toast.value = { value: true, message: 'Complete all required fields', status: 'error' }
    return
  }

  loading.value = true

  try {
    const product = body.value
    const productRef = doc(db, 'products', productId)
    await updateDoc(productRef, product)
    toast.value = { value: true, message: 'Product updated succesfully', status: 'success' }
    emit('refresh')
    onCancel()
  }
  catch (e) {
    toast.value = { value: true, message: 'Error updating product', status: 'error' }
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
    if (docSnapshot.exists())
      body.value = docSnapshot.data()
    else
      console.log('Document does not exist')
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
</script>

<template>
  <v-dialog
    v-model="isOpen"

    persistent
    width="514"
  >
    <v-card title="Edit Product" class="w-full">
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
            variant="solo"
            density="compact"
          />

          <v-select
            v-model="body.category"
            :items="productCategories"
            :rules="[v => !!v || '']"
            label="Category"
            required
            variant="solo"
            density="compact"
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
                variant="solo"
                prefix="₹"
                density="compact"
              />
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.price_b"
                label="Discount Price"
                variant="solo"
                prefix="₹"
                density="compact"
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
                variant="solo"
                prefix="₹"
                density="compact"
              />
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.price_d"
                label="Dealer Price"
                variant="solo"
                prefix="₹"
                density="compact"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="body.cost"
            :rules="[v => !!v || '']"
            label="Cost"
            required
            variant="solo"
            type="number"
            prefix="₹"
            density="compact"
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
