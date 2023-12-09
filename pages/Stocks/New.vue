<script setup>
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { setToast } = useMainStore()
const router = useRouter()

const { formatAsCurrency, today } = useUtils()

const form = ref()
const loading = ref(false)
const saveLoading = ref(false)
const body = ref({})
const productList = ref([])
const stockList = ref([])
const currentStockList = ref({})
const todayStockList = ref({})

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

async function fetchTodayStock() {
  loading.value = true
  try {
    const docRef = doc(db, 'purchase_history', today)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      todayStockList.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching today stock:', error)
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

      const divElement = document.getElementById('table-list')
      tableHeight.value = divElement?.offsetHeight + 40
    }
  }

  body.value = {}
}

const currentStock = computed(() => {
  const newStocks = { ...currentStockList.value }

  for (const key in newStocks) {
    if (newStocks[key] === 0)
      delete newStocks[key]
  }
  stockList.value.forEach((item) => {
    const { id, qnty } = item
    if (newStocks[id] !== undefined)
      newStocks[id] = (Number.parseInt(newStocks[id], 10) + Number.parseInt(qnty, 10))
    else
      newStocks[id] = qnty
  })
  return newStocks || {}
})

const todayStock = computed(() => {
  const newStocks = { ...todayStockList.value }
  stockList.value.forEach((item) => {
    const { id, qnty } = item
    if (newStocks[id] !== undefined)
      newStocks[id] = (Number.parseInt(newStocks[id], 10) + Number.parseInt(qnty, 10))
    else
      newStocks[id] = qnty
  })
  return newStocks || {}
})

const total = computed(() => {
  if (stockList?.value?.length)
    return stockList?.value.reduce((total, item) => total + (item.qnty * item.cost), 0)
  else return 0
})

// SAVING THE DATA
async function save() {
  try {
    saveLoading.value = true

    const currentRef = doc(db, 'stocks', 'current')
    const todayRef = doc(db, 'purchase_history', today)

    await setDoc(currentRef, currentStock.value)

    await setDoc(todayRef, todayStock.value, { merge: true })
    saveLoading.value = false

    setToast(true, 'New Stock Added Successfully', 'success')
    router.push('/stocks')
  }
  catch (error) {
    console.error('An error occurred:', error)
    saveLoading.value = false
    setToast(true, 'New Stock not Saved', 'error')
  }
}

const tableHeight = ref(0)
const screenHeight = ref(0)

onMounted (async () => {
  await fetchProducts()
  await fetchCurrentStock()
  await fetchTodayStock()

  screenHeight.value = window?.screen?.height
  const divElement = document.getElementById('table-list')
  tableHeight.value = divElement?.offsetHeight
})
</script>

<template>
  <v-app-bar
    class="px-0 "
    :elevation="0"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="24" @click=" router.push('/stocks')" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        <span class=" !font-semibold !text-xl ml-2 ">
          New Stocks
        </span>
      </v-app-bar-title>
    </div>
  </v-app-bar>

  <div class="z-30 sticky top-[63px] ">
    <v-sheet width="full" elevation="2" class="!w-full !h-fit  pb-3 ">
      <v-form ref="form" class="">
        <div class="py-2 grid grid-cols-6 gap-4 px-3 !gap-y-[18px]">
          <v-autocomplete
            v-model="body.product"
            :items="productList"
            label="Product"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            item-title="name"
            class="!h-[48px] col-span-3 !brightness-80 "
            density="comfortable"
            return-object
          />

          <v-text-field
            v-model="body.qnty"
            label="Qnty"
            type="number"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            class="!h-[48px] col-span-2 !brightness-80 "
            density="comfortable"
          />

          <v-btn
            size="small"
            rounded
            :class="(!body?.product?.id?.length || !body?.qnty?.length) ? '!opacity-50 ' : '!opacity-100 !text-white'"
            class=" !h-[50px] !w-[50px] !bg-secondary  col-span-1 !text-white' "
            :disabled="saveLoading || loading "
            @click=" addProduct"
          >
            <Icon name="material-symbols:add" size="36" class="text-white" />
          </v-btn>
        </div>
      </v-form>
    </v-sheet>
  </div>

  <v-main class="bg-gray-50 ">
    <v-container fluid>
      <div class="flex flex-col h-full !px-0  ">
        <div v-show="stockList?.length" id="table-list" class="!h-full !shadow-md !rounded-[10px] ">
          <v-table
            fixed-header
            :height="tableHeight > (screenHeight - 400) ? `${screenHeight - 400}px` : ''"
          >
            <thead class="">
              <tr class=" text-sm">
                <th class="text-left !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
                  <span class="!w-6">
                    No
                  </span>
                  <span>
                    Product
                  </span>
                </th>
                <th class="text-left !bg-primary text-white !font-semibold !w-fit">
                  <span>
                    Qnty
                  </span>
                </th>
                <th class="text-left !bg-primary text-white !font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in stockList"
                :key="item.id"
                class="w-full"
              >
                <td class="text-xs flex items-center  ">
                  <span class="!w-8   ">
                    {{ index + 1 }}
                  </span>
                  <span class="w-full font-semibold">
                    {{ item.name }}
                  </span>
                </td>
                <td class="text-xs w-fit gap-x-3 text-center">
                  <span class="font-semibold mr-3 text-center"> {{ item.qnty }}</span>
                  <!-- <span class="font-100 !text-xs text-gray-400">x{{ item.cost }}</span> -->
                </td>
                <td class=" text-start text-xs  !min-w-[130px] items-end relative  ">
                  {{ formatAsCurrency(item.qnty * item.cost) }}

                  <span class=" absolute right-2.5 text-end ">
                    <button @click="stockList?.splice(index, 1)">
                      <Icon name="typcn:minus" color="red" size="19" class="bg-red-100 rounded-full p-[3px] " />
                    </button>
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div v-if="!stockList?.length" class="!h-full flex items-center">
          <ImagesNoData class="!scale-20 relative bottom-1" />
        </div>
      </div>
    </v-container>

    <!-- <div class="h-fit w-full absolute bottom-0 !w-full !px-10 py-6 ">
      <v-btn color="primary" size="x-large" class=" !w-full !text-sm !font-bold" :loading="saveLoading" rounded @click="save()">
        ADD TO STOCK
      </v-btn>
    </div> -->
  </v-main>

  <div class="h-fit w-full !fixed !bottom-[76px]   !w-full !px-10  ">
    <v-btn :disabled="!stockList?.length" size="x-large" class="!text-white !w-full !text-sm !font-semibold !bg-secondary" :loading="saveLoading" rounded @click="save()">
      <span class="mr-4">
        {{ 'ADD TO STOCK' }}
      </span>
      <span class="text-sm !font-semibold">
        {{ `${formatAsCurrency(total || 0)}` }}
      </span>
    </v-btn>
  </div>

  <BaseOverlay v-if="saveLoading" />
</template>
