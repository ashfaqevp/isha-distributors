<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency, today } = useUtils()

const loading = ref(false)
const todayStocks = ref({})
const productList = ref([])

const selectedStock = ref({})
const openDeleteStock = ref(false)

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

async function fetchTodayStock() {
  loading.value = true
  try {
    const docRef = doc(db, 'purchase_history', today)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      todayStocks.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    loading.value = false
  }
}

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

const totalAmount = computed(() => {
  let price = 0
  stockList.value.forEach((item) => {
    price = price + item?.qnty * item?.cost
  })
  return price || 0
})

const tableHeight = ref(0)
const screenHeight = window.screen.height

onMounted (async () => {
  await fetchProducts()
  await fetchTodayStock()

  const divElement = document.getElementById('table-stock')
  tableHeight.value = divElement?.offsetHeight
})
</script>

<template>
  <v-container fluid class="">
    <div class="flex flex-col !px-0  ">
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>

      <div v-else-if="stockList?.length" id="table-stock" class="!h-full !shadow-md !rounded-[10px]">
        <v-table
          fixed-header
          :height="tableHeight > (screenHeight - 300) ? `${screenHeight - 300}px` : ''"
        >
          <thead class="">
            <tr class="">
              <th class="text-left text-sm !bg-primary text-white !font-semibold">
                No
              </th>
              <th class="text-left text-sm !bg-primary text-white !font-semibold">
                Product
              </th>
              <th class="text-left text-sm !bg-primary text-white !font-semibold">
                Qnty
              </th>
              <th class="text-left text-sm !bg-primary text-white !font-semibold">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in stockList"
              :key="item.id"
              class="w-full !py-10 !h-10 text-xs "
            >
              <td class=" w-fit text-xs  ">
                {{ index + 1 }}
              </td>
              <td class="font-semibold w-fit text-xs ">
                {{ item.name }}
              </td>
              <td class="font-semibold text-xs text-center ">
                {{ item.qnty }}
              </td>
              <td class="text-start text-xs  !min-w-[130px] items-end relative ">
                {{ formatAsCurrency(item.qnty * item.cost) }}

                <span class=" absolute right-1 text-end ">
                  <button>
                    <Icon name="icon-park-outline:more-one" size="22" class="" />
                  </button>

                  <v-menu activator="parent" width="110px" class="!w-[50px]">
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

      <div v-else class="h-full  w-full  flex  rounded-b-[10px] items-center justify-center mt-10">
        <ImagesNoData class="scale-60 " />
      </div>

      <p v-if="!loading && stockList?.length" class=" py-3 text-end align-end">
        Total:
        <b> {{ formatAsCurrency(totalAmount) }}</b>
      </p>
    </div>
  </v-container>

  <StocksDialogDeleteStock v-model="openDeleteStock" :stock="selectedStock" @refresh="fetchTodayStock" />
</template>
