<script setup>
import moment from 'moment'
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  cashList: Array,
  shop: Object,
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const { formatAsCurrency, today } = useUtils()
const { setToast } = useMainStore()
const { db } = useFirebaseStore()

const body = ref({})
const form = ref()
const isOpen = ref(false)
// const loading = ref(false)

const paymentTypes = ref([{ name: 'Direct', value: 'direct' }, { name: 'Online', value: 'online' }])
const saveLoading = ref(false)

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue) {
    isOpen.value = true
    body.value.method = { name: 'Direct', value: 'direct' }
  }
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
      cashItem.trans_id = body.value?.trans_id || 'g-pay'

    // create shop update
    const shopUpdated = { pending: ((Number.parseInt(props.shop?.pending, 10) - Number.parseInt(body.value?.cash, 10))), last_update: today }

    if (props.shop?.last_update?.length && props.shop?.last_update !== today)
      shopUpdated.prev_update = props.shop?.last_update

    // create ref
    const paidDbRef = doc(db, 'cash', today)
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

async function openDeleteCash(item) {
  saveLoading.value = true
  try {
    const cashRef = doc(db, 'cash', today, props.shop.id, item.id)
    const shopRef = doc(db, 'shops', props.shop.id)

    await deleteDoc(cashRef)

    const currentPending = await { pending: (Number.parseInt(props.shop?.pending, 10) + Number.parseInt(item.cash, 10)) }
    await setDoc(shopRef, currentPending, { merge: true })

    setToast(true, 'Cash deleted  successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (error) {
    console.error('An error occurred:', error)
    setToast(true, ' cash not deleted', 'error')
  }

  finally {
    saveLoading.value = false
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
          <span class="font-semibold">
            Cash
          </span>
        </div>
      </v-card-title>

      <hr class=" border-[1px]   w-full">

      <v-card-text>
        <div class="">
          <div v-if="cashList?.length" class="!h-full !shadow-md  !mb-8 !rounded-[10px]">
            <v-table
              fixed-header
            >
              <thead class="">
                <tr class="">
                  <th class="text-left text-sm !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
                    <span>
                      No
                    </span>
                  </th>
                  <th class="text-left text-sm !bg-primary text-white !font-semibold !w-fit">
                    <span>
                      Method
                    </span>
                  </th>
                  <th class="text-left text-sm !bg-primary text-white !font-semibold">
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
                  <td class="text-xs flex justify-center  ">
                    <p class="w-full text-xs flex items-center justify-center !w-4  text-center">
                      {{ index + 1 }}
                    </p>
                  </td>
                  <td class="text-xs w-fit gap-x-3 text-xs  ">
                    <span class=" capitalize flex items-center justify-center">

                      {{ item.method }}

                      <!-- <Icon v-if=" item.method === 'direct'" name="tdesign:undertake-transaction" color="green" size="20" />
                      <Icon v-else name="logos:google-pay" size="32" class="font-bold text-black" /> -->

                    </span>
                    <div v-if="item.method === 'online'" class="text-[10px] !max-w-[80px] text-center  truncate">
                      {{ item.trans_id }}
                    </div>
                  </td>
                  <td class=" text-start text-xs   !min-w-[100px] items-end relative   ">
                    {{ formatAsCurrency(item.cash) }}

                    <span class=" absolute right-1 text-end font-normal top-4  ">
                      <button>
                        <Icon name="icon-park-outline:more-one" size="22" class="" />
                      </button>

                      <v-menu activator="parent" width="110px">
                        <v-list>
                          <v-list-item @click="openDeleteCash(item) ">
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

            <!-- <v-text-field
              v-if="body.method?.value === 'online'"
              v-model="body.trans_id"
              label="Transaction ID"
              :rules="body.method?.value === 'online' && [v => !!v || '']"
              variant="outlined"
              required
              class="!h-[48px] col-span-6 "
              density="comfortable"
            /> -->

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
