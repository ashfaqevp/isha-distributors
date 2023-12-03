import { Body } from '#build/components';
<script setup>
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const { shopCategories } = useUtils()
const { setToast } = useMainStore()

const placeList = ref([])

const body = ref({})
const form = ref()
const isOpen = ref(false)
const loading = ref(false)

const toast = ref({ value: false, message: '', status: '' })

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue) {
    isOpen.value = true
    body.value.type = 'normal'
    body.value.credit_limit = 1000
    body.value.pending = 0
  }
}, { deep: true, immediate: true })

function onCancel() {
  form.value.reset()
  form.value.resetValidation()
  emit('update:modelValue', false)
  isOpen.value = false
}

async function addShop() {
  const { valid } = await form.value.validate()

  if (!valid) {
    setToast(true, 'Complete all required fields', 'error')
    return
  }

  loading.value = true

  try {
    const shop = body.value
    const dbRef = collection(db, 'shops')
    await addDoc(dbRef, shop)
    setToast(true, 'Shop added to shop successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (e) {
    setToast(true, 'Shop not saved', 'error')
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

async function fetchPlaces() {
  try {
    const docRef = doc(db, 'others', 'places')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      placeList.value = docSnapshot.data().place_list || []
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
}

onMounted (async () => {
  await fetchPlaces()
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
          Add New Shop
        </div>
      </v-card-title>

      <hr class=" border-[1px]   w-full">

      <v-card-text>
        <v-form ref="form" class="mt-1">
          <v-text-field
            v-model="body.name"
            :rules="[v => !!v || '']"
            label="Shop Name"
            required
            variant="outlined"
          />

          <v-select
            v-model="body.place"
            :items="placeList"
            :rules="[v => !!v || '']"
            label="Place"
            required
            variant="outlined"
          />

          <v-text-field
            v-model="body.phone"
            :rules="[v => !!v || '', v => (v && v.length === 10) || '']"
            label="Phone"
            required
            type="number"
            prefix="+91"
            variant="outlined"
          />

          <v-row dense>
            <v-col
              cols="6"
              sm="6"
            >
              <v-select
                v-model="body.type"
                :items="shopCategories"
                :rules="[v => !!v || '']"
                label="Type"
                required
                variant="outlined"
              />
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-text-field
                v-model="body.credit_limit"
                label="Credit Limit"
                required
                prefix="₹"
                type="number"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="body.pending"
            label="Pending"
            required
            prefix="₹"
            type="number"

            variant="outlined"
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
                  height="44"
                  class="!font-semibold"
                  :loading="loading"
                  @click="addShop()"
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
