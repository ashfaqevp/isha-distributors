<script setup>
import { collection, collectionGroup, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency } = useUtils()
const router = useRouter()

const today = new Date()
const date = today.toISOString().split('T')[0]

const todayStocks = ref({})
const productList = ref([])
const shopList = ref([])
const collectionList = ref([])
const saleList = ref([])

const loading = ref(false)
const shopLoading = ref(false)
const collectionLoading = ref(false)
const purchaseLoading = ref(false)
const saleLoading = ref(false)

// METHODS

function gotoShops() {
  router.push({ path: '/shops' })
}

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
    // loading.value = false
  }
}

async function fetchPending() {
  shopLoading.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'shops'))
    shopList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
  finally {
    shopLoading.value = false
  }
}

async function fetchCollection() {
  collectionLoading.value = true
  const docRef = doc(db, 'cash', date)
  try {
    const fetchPromises = shopList.value.map(async (shop) => {
      const querySnapshot = await getDocs(collection(docRef, shop?.id))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    })

    const results = await Promise.all(fetchPromises)
    collectionList.value.push(...results.flat())
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    collectionLoading.value = false
  }
}

async function fetchSale() {
  saleLoading.value = true
  const docRef = doc(db, 'bills', date)
  try {
    const fetchPromises = shopList.value.map(async (shop) => {
      const querySnapshot = await getDocs(collection(docRef, shop?.id))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    })
    const results = await Promise.all(fetchPromises)
    saleList.value.push(...results.flat())
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    saleLoading.value = false
  }
}

async function fetchTodayStock() {
  purchaseLoading.value = true
  try {
    const docRef = doc(db, 'purchase_history', date)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      todayStocks.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    purchaseLoading.value = false
  }
}

// COMPUTED FUNCTIONS

const totalSales = computed(() => {
  let sale = 0
  let cost = 0
  saleList.value.forEach((item) => {
    sale = sale + Number.parseInt(item?.total || 0)
    cost = cost + Number.parseInt(item?.cost || 0)
  })
  return { sale, cost }
})

const stockList = computed(() => {
  const stocks = []
  productList.value.forEach((item) => {
    if (item.id in todayStocks.value) {
      const stockItem = item
      stockItem.qnty = todayStocks.value[item.id]
      stocks.push(stockItem)
    }
  })
  return stocks || {}
})

const totalPurchase = computed(() => {
  let price = 0
  stockList.value.forEach((item) => {
    price = price + item?.qnty * item?.cost
  })
  return price || 0
})

const totalPending = computed(() => {
  let pending = 0
  shopList.value.forEach((shop) => {
    pending += Number(shop?.pending || 0)
  })
  return pending || 0
})

const totalCollection = computed(() => {
  let collection = 0
  collectionList.value.forEach((shop) => {
    collection = collection + (shop?.cash || 0)
  })
  return collection || 0
})

const mergedSaleList = computed(() => {
  const merged = saleList.value.reduce((acc, curr) => {
    const foundIndex = acc.findIndex(item => item.product_id === curr.product_id && item.name === curr.name)

    if (foundIndex !== -1) {
      // Check if the properties are string representations of numbers
      if (!isNaN(Number(curr.qnty)))
        acc[foundIndex].qnty += Number.parseInt(curr.qnty)

      if (!isNaN(Number(curr.cost)))
        acc[foundIndex].cost += Number.parseInt(curr.cost)

      if (!isNaN(Number(curr.total)))
        acc[foundIndex].total += Number.parseInt(curr.total)
    }
    else {
      const newItem = { ...curr }
      newItem.qnty = !isNaN(Number(newItem.qnty)) ? Number.parseInt(newItem.qnty) : 0
      newItem.cost = !isNaN(Number(newItem.cost)) ? Number.parseInt(newItem.cost) : 0
      newItem.total = !isNaN(Number(newItem.total)) ? Number.parseInt(newItem.total) : 0
      acc.push(newItem)
    }

    return acc
  }, [])

  return merged.map(item => ({
    id: item.product_id,
    name: item.name,
    qnty: item.qnty,
    cost: item.cost,
    total: item.total,
  }))
})

const tableHeight = ref(0)
const screenHeight = ref(0)

onMounted (async () => {
  loading.value = true
  await fetchProducts()
  await fetchPending()
  await fetchCollection()
  await fetchTodayStock()
  await fetchSale()
  loading.value = false

  screenHeight.value = window?.screen?.height

  const divElement = document.getElementById('table-stock')
  tableHeight.value = divElement?.offsetHeight
})
</script>

<template>
  <div class="relative">
    <v-app-bar
      class="px-0 !z-20 "
      height="60"
    >
      <div class="flex ml-6 w-full">
        <v-app-bar-title>
          <span class=" font-semibold text-xl">
            Reports
          </span>
        </v-app-bar-title>
      </div>

      <template #append>
        <v-app-bar-nav-icon>
          <Icon name="ic:outline-history" size="24" />
        </v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-main class="bg-gray-50 h-full">
      <v-container fluid>
        <div class="grid grid-cols-6 gap-4 ">
          <v-card
            :loading="collectionLoading"
            rounded="md"
            class="col-span-3 "
            elevation="1"
          >
            <div class="bg-gradient-to-r from-emerald-500 to-lime-600 h-full p-1 px-3 text-white flex flex-col justify-center">
              <span class="text-xs opacity-80">
                Collection
              </span>
              <span class="w-full text-center font-semibold">
                {{ formatAsCurrency(totalCollection) }}
              </span>
            </div>
          </v-card>

          <v-card
            rounded="md"
            class="col-span-3 "
            :loading="shopLoading"
            elevation="1"
          >
            <div class="bg-gradient-to-r from-rose-500 via-red-400 to-red-500 h-full p-1 px-3 text-white flex flex-col justify-center">
              <span class="text-xs opacity-80">
                Pending
              </span>
              <span class="w-full text-center font-semibold">
                {{ formatAsCurrency(totalPending) }}
              </span>
            </div>
          </v-card>
        </div>

        <div class="flex flex-col !px-0 mt-5">
          <div v-if="!mergedSaleList?.length || saleLoading" class="w-full  mb-9 !rounded-b-[10px] shadow-lg">
            <div class="text-sm w-full flex w-full justify-between h-[52px]  ">
              <span class=" rounded-tl-[10px] text-left !bg-primary w-full text-white !font-semibold flex items-center gap-x-1.5 px-4">
                <span class="">
                  No
                </span>
                <span>
                  Product
                </span>
              </span>

              <span class="text-center !bg-primary  text-white !font-semibold !w-fit items-center flex  justify-center px-4">
                Qnty
              </span>

              <span class="text-left !bg-primary text-white !font-semibold w-fit px-4 items-center flex ">
                Cost
              </span>

              <span class=" rounded-tr-[10px] text-left !bg-primary text-white !font-semibold w-fit px-4 items-center flex ">
                Sale
              </span>
            </div>
            <div v-if="saleLoading || loading" class="h-20 bg-[#fff] w-full  flex  rounded-b-[10px] items-center justify-center">
              <Icon name="eos-icons:loading" size="28" color="primary" />
            </div>
            <!-- <div v-else class="!h-[200px] bg-[#fff] w-full  flex  rounded-b-[10px] items-center justify-center">
              <ImagesNoData class="scale-50 " />
            </div> -->
          </div>

          <div v-else id="table-stock" class="!h-full !shadow-md !rounded-[10px] ">
            <v-table
              fixed-header
              :loading="true"
              :height="tableHeight > (screenHeight - 440) ? `${screenHeight - 440}px` : ''"
            >
              <thead class="text-sm ">
                <tr class="">
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
                    Cost
                  </th>

                  <th class="text-left !bg-primary text-white !font-semibold">
                    Sale
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in mergedSaleList"
                  :key="item.id"
                  class="w-full"
                >
                  <td class="text-xs flex items-center  ">
                    <span class="!w-8  ">
                      {{ index + 1 }}
                    </span>
                    <span class="w-full text-xs  font-semibold">
                      {{ item.name }}
                    </span>
                  </td>

                  <td class="text-xs w-fit text-center ">
                    <span class="font-semibold mr-3"> {{ item.qnty }}</span>
                  </td>
                  <td class="text-xs w-fit ">
                    <span class=""> {{ item.cost }}</span>
                  </td>
                  <td class="text-xs w-fit  ">
                    <span class=" "> {{ item.total }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-container>
    </v-main>

    <!-- BOTTOM ACTION BUTTON -->
    <div class=" !fixed !bottom-[70px] flex  flex-col px-5 !h-150 w-full  ">
      <div class="grid grid-cols-9  gap-x-2 mb-3 ">
        <v-card
          rounded="md"
          class="col-span-3 "
          elevation="1"
          :loading="purchaseLoading"
        >
          <div class=" opacity-80 h-full p-2 px-3 flex flex-col justify-center text-sm">
            <span class="text-xs opacity-80">
              Purchase
            </span>
            <span class="w-full text-center font-semibold text-blue-900  text-sm">
              {{ formatAsCurrency(totalPurchase) }}
            </span>
          </div>
        </v-card>

        <v-card
          rounded="md"
          class="col-span-3 "
          elevation="1"
          :loading="saleLoading"
        >
          <div class=" opacity-80 h-full p-2 px-3 text-black flex flex-col justify-center text-sm">
            <span class="text-xs opacity-80">
              Cost
            </span>
            <span class="w-full text-center font-semibold text-red-900  text-sm">
              {{ formatAsCurrency(totalSales.cost) }}
            </span>
          </div>
        </v-card>

        <v-card
          rounded="md"
          class="col-span-3 "
          elevation="1"
          :loading="saleLoading"
        >
          <div class=" opacity-80 h-full p-2 px-3 text-black  flex flex-col justify-center text-sm">
            <span class="text-xs opacity-80">
              Sale
            </span>
            <span class="w-full text-center font-semibold text-green-900 ">
              {{ formatAsCurrency(totalSales.sale) }}
            </span>
          </div>
        </v-card>
      </div>

      <div class="grid grid-cols-6 gap-4 w-full ">
        <v-card
          :loading="purchaseLoading || collectionLoading"
          rounded="md"
          class="col-span-3 "
          elevation="1"
        >
          <div class="bg-gradient-to-r from-cyan-500 to-blue-500  h-full p-1 px-3 text-white flex flex-col justify-center">
            <span class="text-xs opacity-80">
              Returns
            </span>
            <span class="w-full text-center font-semibold">
              {{ formatAsCurrency(totalCollection - totalPurchase) }}
            </span>
          </div>
        </v-card>

        <v-card
          rounded="md"
          :loading="saleLoading"
          class="col-span-3 "
          elevation="1"
        >
          <div class="bg-gradient-to-r from-emerald-500 to-emerald-900 h-full p-1 px-3 text-white flex flex-col justify-center">
            <span class="text-xs opacity-80">
              Profit
            </span>
            <span class="w-full text-center font-semibold">
              {{ formatAsCurrency(totalSales.sale - totalSales.cost) }}
            </span>
          </div>
        </v-card>
      </div>
    </div>
  </div>
  <!-- POPUP -->
</template>
