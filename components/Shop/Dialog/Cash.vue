<script setup>
import { addDoc, collection } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  cashList: Array,
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const { formatAsCurrency, productCategories } = useUtils()

const { db } = useFirebaseStore()

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

const paymentTypes = ref([{ name: 'Direct', value: 'direct' }, { name: 'Online', value: 'online' }])
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    width="420"
  >
    <v-card class="w-full">
      <v-card-title>
        <div class=" flex gap-x-3 mt-3 ">
          <button>
            <Icon name="eva:arrow-back-outline" size="24" @click="router.back()" />
          </button>
          Cash
        </div>
      </v-card-title>

      <v-card-text>
        <div class="pb-8 ">
          <div v-if="cashList?.length" class="!h-full !shadow-md !rounded-[10px]  ">
            <v-table
              fixed-header
            >
              <thead class="">
                <tr class="">
                  <th class="text-left !bg-[#8f9bc4] text-white !font-semibold flex items-center gap-x-1.5">
                    <span>
                      No
                    </span>
                  </th>
                  <th class="text-left !bg-[#8f9bc4] text-white !font-semibold !w-fit">
                    <span>
                      Method
                    </span>
                  </th>
                  <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in cashList"
                  :key="item.id"
                  class="w-full"
                >
                  <td class="text-sm flex items-center  ">
                    <span class="w-full">
                      {{ index + 1 }}
                    </span>
                  </td>
                  <td class="text-sm w-fit gap-x-3 ">
                    <span class="font-semibold mr-3"> {{ item.qnty }}</span>
                  </td>
                  <td class=" ext-start text-sm  !min-w-[100px] items-end relative  ">
                    {{ formatAsCurrency(item.total) }}

                    <span class=" absolute right-1 text-end ">
                      <button>
                        <Icon name="icon-park-outline:more-one" size="22" class="" />
                      </button>

                      <v-menu activator="parent" width="100px" class="!w-[50px]">
                        <v-list>
                          <v-list-item @click="openDeleteStock = true ; selectedStock = item">
                            <template #append>
                              <Icon name="mdi:delete-outline" size="18" />
                            </template>
                            <v-list-item-title>
                              Delete
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>

        <v-form ref="form" class=" my-2">
          <div class="grid grid-cols-6 gap-4  !gap-y-[18px]">
            <v-text-field
              v-model="body.qnty"
              label="Amount"
              type="number"
              :rules="[v => !!v || '']"
              variant="outlined"
              required
              class="!h-[48px] col-span-3 "
              density="comfortable"
            />

            <v-autocomplete
              v-model="body.method"
              :items="paymentTypes"
              class="!h-[48px] col-span-3 !brightness-80 "
              label="Method"
              :rules="[v => !!v || '']"
              variant="outlined"
              required
              item-title="name"
              return-object
              density="comfortable"
            />

            <v-text-field
              v-if="body.method?.value === 'online'"
              v-model="body.trans_id"
              label="Transaction ID"
              type="number"
              :rules="[v => !!v || '']"
              variant="outlined"
              required
              class="!h-[48px] col-span-6 "
              density="comfortable"
            />

            <v-btn
              color="gray"
              variant="outlined"
              class="col-span-3 "
              block
              :disabled="loading"
              height="44"
            >
              Cancel
            </v-btn>

            <v-btn
              block
              color="green"
              :loading="loading"
              class=" col-span-3 "
              height="44"
            >
              Paid
            </v-btn>
          </div>
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
