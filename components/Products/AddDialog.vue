<script setup>
import { addDoc, collection } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const { productCategories } = useUtils()

const body = ref({})
const form = ref()
const isOpen = ref(false)
const loading = ref(false)

const toast = ref({ value: false, message: '', status: '' })

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

  if (!valid) {
    toast.value = { value: true, message: 'complete all required fields', status: 'error' }
    return
  }

  loading.value = true

  try {
    const product = body.value
    const dbRef = collection(db, 'products')
    const addedDocRef = await addDoc(dbRef, product)
    toast.value = { value: true, message: 'New product added', status: 'success' }
    emit('refresh')
    onCancel()
  }
  catch (e) {
    toast.value = { value: true, message: 'Product not saved', status: 'error' }
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
    width="420"
  >
    <v-card title="Add New Product" class="w-full">
      <v-divider class="my-2" />
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
                  color="primary"
                  block
                  :loading="loading"
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
