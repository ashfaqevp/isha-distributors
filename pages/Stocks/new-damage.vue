<script setup>
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { setToast } = useMainStore()
const router = useRouter()

const today = new Date()
const date = today.toISOString().split('T')[0]
const monthYear = today.toISOString().slice(0, 7)

const form = ref()
const loading = ref(false)
const saveLoading = ref(false)
const body = ref({})
const productList = ref([])
const stockList = ref([])
const currentStockList = ref({})

async function fetchProducts() {
  loading.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    productList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }

  finally {
    loading.value = false
  }
}

async function fetchCurrentStock() {
  loading.value = true
  try {
    const docRef = doc(db, 'stocks', 'current')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      currentStockList.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    loading.value = false
  }
}

async function addProduct() {
  const { valid } = await form.value.validate()

  if (!valid) {
    setToast(true, 'Complete all required fields', 'error')
    return
  }
  const newItem = body.value?.product

  if (newItem && newItem.id !== undefined) {
    const existingItem = stockList.value.find(item => item.id === newItem.id)
    const quantityToAdd = Number.parseFloat(body.value?.qnty) || 0

    if (existingItem) {
      existingItem.qnty = (existingItem.qnty || 0) + quantityToAdd
    }
    else {
      newItem.qnty = quantityToAdd
      stockList.value.push(newItem)
    }
  }
  body.value = {}
}

const currentStock = computed(() => {
  const newStocks = { ...currentStockList.value }
  stockList.value.forEach((item) => {
    const { id, qnty } = item
    if (newStocks[id] !== undefined)
      newStocks[id] = (Number.parseInt(newStocks[id], 10) - Number.parseInt(qnty, 10)) || 0 - (qnty)
    else
      newStocks[id] = 0 - (qnty)
  })
  return newStocks || {}
})

// SAVING THE DATA
async function addToDamge() {
  saveLoading.value = true
  try {
    const damagedDbRef = doc(db, 'stocks', 'damaged')
    const damagedRef = collection(damagedDbRef, monthYear)

    const currentRef = doc(db, 'stocks', 'current')

    for (const item of stockList.value) {
      const stockItem = {}
      stockItem.id = item.id
      stockItem.date = date
      stockItem.qnty = item.qnty
      stockItem.name = item.name
      stockItem.cost = item.cost
      await addDoc(damagedRef, stockItem)
    }

    await setDoc(currentRef, currentStock.value, { merge: true })
    saveLoading.value = false
    setToast(true, 'Damaged Stock Updated Successfully', 'success')
    router.push('/stocks')
  }
  catch (error) {
    console.error('An error occurred:', error)
    saveLoading.value = false
    setToast(true, 'New Damages not Saved', 'error')
  }
}

onMounted (async () => {
  await fetchProducts()
  await fetchCurrentStock()
})
</script>

<template>
  <v-app-bar
    class="px-0 "
    color="primary"
    :elevation="0"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="24" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        New Damage
      </v-app-bar-title>
    </div>
  </v-app-bar>

  <v-main class="bg-gray-50 !h-screen">
    <v-sheet width="full" color="primary" class="!w-full !h-fit  pb-3 " :elevation="10">
      <v-form ref="form" class="">
        <div class="py-2 grid grid-cols-6 gap-4 px-3">
          <v-select
            v-model="body.product"
            :items="productList"
            class="!h-[58px] col-span-3 !brightness-80 "
            label="Product"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            item-title="name"

            return-object
          />

          <v-text-field
            v-model="body.qnty"
            label="Qnty"
            type="number"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            class="!h-[58px] col-span-2 "
          />

          <v-btn
            color="primary"
            size="small"
            rounded
            class=" !h-[52px] !w-[52px] bg-white col-span-1 "
            :class="(!body?.product?.id?.length || !body?.qnty?.length) ? '!opacity-50 ' : '!opacity-100'"
            :disabled="saveLoading || loading "
            @click=" addProduct"
          >
            <Icon name="material-symbols:add" size="36" />
          </v-btn>
        </div>
      </v-form>
    </v-sheet>
    <v-container fluid>
      <div class="flex flex-col !px-0">
        <div v-if="stockList?.length" class="!h-full !shadow-md !rounded-[10px] ">
          <v-table
            fixed-header
          >
            <thead class="">
              <tr class="">
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  No
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Product
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Qnty
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Amount
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in stockList"
                :key="item.id"
                class="w-full"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.qnty }}</td>
                <td>{{ item.qnty * item.cost }}</td>
                <td class=" px-0" @click="stockList.splice(index, 1)">
                  <Icon name="typcn:delete" color="red" size="28" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div v-else class="w-full flex items-center justify-center !h-[300px] rounded-[10px]">
          No Data !
        </div>
      </div>
    </v-container>

    <div class="h-fit w-full absolute bottom-0 !w-full !px-10 py-6 ">
      <v-btn color="primary" size="x-large" class=" !w-full !text-sm" :loading="saveLoading" rounded @click="addToDamge()">
        ADD TO DAMAGE
      </v-btn>
    </div>
  </v-main>
</template>
