<script setup>
import { doc, getDoc, setDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  placesList: Array,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()

const { setToast } = useMainStore()

const places = ref([])

const body = ref({})
const form = ref()
const isOpen = ref(false)
const loading = ref(false)

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue) {
    isOpen.value = true
    places.value = props.placesList
  }
}, { deep: true, immediate: true })

function onCancel() {
  form.value.reset()
  form.value.resetValidation()
  emit('update:modelValue', false)
  isOpen.value = false
}

async function addPlace() {
  const { valid } = await form.value.validate()

  if (!valid) {
    setToast(true, 'Complete all required fields', 'error')
    return
  }

  loading.value = true

  try {
    const newPlaceList = { place_list: [body.value?.name, ...props.placesList] }

    const updateRef = doc(db, 'others', 'places')
    await setDoc(updateRef, newPlaceList)

    setToast(true, 'Place added successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (e) {
    setToast(true, 'Place not saved', 'error')
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
    <v-card class="w-full">
      <v-card-title>
        <div class=" flex gap-x-3 mt-2 font-semibold ">
          <button>
            <Icon name="eva:arrow-back-outline" size="24" @click="onCancel" />
          </button>
          Add New Place
        </div>
      </v-card-title>

      <hr class=" border-[1px]   w-full">

      <v-card-text>
        <v-form ref="form" class="mt-1">
          <v-text-field
            v-model="body.name"
            :rules="[v => !!v || '']"
            label="Place"
            required
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
                  @click="addPlace()"
                >
                  ADD
                </v-btn>
              </v-col>
            </v-row>
          </v-footer>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
