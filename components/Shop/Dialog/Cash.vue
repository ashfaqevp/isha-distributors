<script setup>
import moment from 'moment'
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  cashList: Array,
  shop: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const { formatAsCurrency } = useUtils()
const { setToast } = useMainStore()
const { db } = useFirebaseStore()

const today = moment()
const date = today.format('YYYY-MM-DD')

const body = ref({})
const form = ref()
const isOpen = ref(false)
// const loading = ref(false)

const paymentTypes = ref([{ name: 'Direct', value: 'direct' }, { name: 'Online', value: 'online' }])
const saveLoading = ref(false)

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

// SAVING THE DATA
async function savePaid() {
  const { valid } = await form.value.validate()

  if (!valid) {
    setToast(true, 'Complete all required fields', 'error')
    return
  }

  saveLoading.value = true
  try {
    // create cash item
    const cashItem = { cash: (Number.parseInt(body.value?.cash, 10)), method: body.value?.method?.value }
    if (cashItem.method !== 'direct')
      cashItem.trans_id = body.value?.trans_id

    // create shop update
    const shopUpdated = { pending: ((Number.parseInt(props.shop?.pending, 10) - Number.parseInt(body.value?.cash, 10))), last_update: date }

    if (props.shop?.last_update?.length && props.shop?.last_update !== date)
      shopUpdated.prev_update = props.shop?.last_update

    // create ref
    const paidDbRef = doc(db, 'cash', date)
    const paidRef = collection(paidDbRef, props.shop.id)

    const shopRef = doc(db, 'shops', props.shop.id)

    // update cash
    await addDoc(paidRef, cashItem)

    // update shop details
    await setDoc(shopRef, shopUpdated, { merge: true })

    saveLoading.value = false
    setToast(true, 'Cash added to shop successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (error) {
    console.error('An error occurred:', error)
    saveLoading.value = false
    setToast(true, 'Cash not Saved', 'error')
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
        <div class=" flex gap-x-3 mt-3 ">
          <button>
            <Icon name="eva:arrow-back-outline" size="24" @click="onCancel" />
          </button>
          Cash
        </div>
      </v-card-title>

      <v-card-text>
        <div class="">
          <div v-if="cashList?.length" class="!h-full !shadow-md !rounded-[5px] !mb-8">
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
                    <span class="mr-3 capitalize"> {{ item.method }}</span>
                  </td>
                  <td class=" text-start text-sm font-semibold   !min-w-[100px] items-end relative  ">
                    {{ formatAsCurrency(item.cash) }}

                    <span class=" absolute right-1 text-end font-normal  ">
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

        <v-form ref="form" class=" mb-4">
          <div class="grid grid-cols-6 gap-4  !gap-y-[18px]">
            <v-text-field
              v-model="body.cash"
              label="Amount"
              type="number"
              :rules="[v => !!v || '']"
              variant="outlined"
              required
              class="!h-[48px] col-span-3 "
              density="comfortable"
            />

            <v-select
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
              :rules="body.method?.value === 'online' && [v => !!v || '']"
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
              :disabled="saveLoading"
              height="44"
              @click="onCancel"
            >
              Cancel
            </v-btn>

            <v-btn
              block
              color="green"
              :loading="saveLoading"
              class=" col-span-3 "
              height="44"
              @click="savePaid"
            >
              Paid
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- <v-snackbar
    v-model="toast.value"
    class="z-100 opacity-90"
    :timeout="2000"
    :color=" toast?.status === 'success' ? 'success' : 'error'"
    absolute
    top
  >
    <p>{{ toast?.message }}</p>
  </v-snackbar> -->
</template>
