<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

// const props = defineProps({
//   currentStocks: Object,
// })

const { db } = useFirebaseStore()

const { formatAsCurrency } = useUtils()

const loading = ref(false)
const currentStocks = ref({})
const productList = ref([])

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
      currentStocks.value = docSnapshot.data()
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
    if (item.id in currentStocks.value) {
      const stockItem = item
      stockItem.qnty = currentStocks.value[item.id]
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
  await fetchCurrentStock()

  const divElement = document.getElementById('table-stock')
  tableHeight.value = divElement?.offsetHeight
})
</script>

<template>
  <v-container id="qq" fluid class="">
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
              <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                No
              </th>
              <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                Product
              </th>
              <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                Qnty
              </th>
              <th class="text-end !bg-[#8f9bc4] text-white !font-semibold">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in stockList"
              :key="item.id"
              class="w-full !py-10 !h-10 text-sm"
            >
              <td>{{ index + 1 }}</td>
              <td class="font-semibold w-fit text-sm">
                {{ item.name }}
              </td>
              <td class="font-semibold text-sm">
                {{ item.qnty }}
              </td>
              <td class="text-end text-sm  !min-w-[120px]">
                {{ formatAsCurrency(item.qnty * item.cost) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div v-else class="w-full flex items-center justify-center !h-[300px] rounded-[10px]">
        No Data !
      </div>

      <p v-if="!loading && stockList?.length" class=" py-3 text-end align-end">
        Total:
        <b> {{ formatAsCurrency(totalAmount) }}</b>
      </p>
    </div>
  </v-container>
</template>
