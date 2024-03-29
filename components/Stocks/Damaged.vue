<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import moment from 'moment'

const { db } = useFirebaseStore()
const { formatAsCurrency } = useUtils()

const today = new Date()
const date = today.toISOString().split('T')[0]
const monthYear = today.toISOString().slice(0, 7)

const damagedList = ref([])
const loading = ref(false)
const selectedStock = ref({})
const openDeleteStock = ref(false)

async function fetchDamagedStock() {
  loading.value = true
  try {
    const stockRef = doc(db, 'stocks', 'damaged')
    const dbRef = collection(stockRef, monthYear)
    const querySnapshot = await getDocs(dbRef)
    damagedList.value = querySnapshot.docs.map(doc => ({
      stock_id: doc.id,
      ...doc.data(),
    }))
    loading.value = false
  }
  catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

const totalAmount = computed(() => {
  let price = 0
  damagedList.value.forEach((item) => {
    price = price + item?.qnty * item?.cost
  })
  return price || 0
})

onMounted (async () => {
  await fetchDamagedStock()
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

      <div v-else-if="damagedList?.length" id="table-stock" class="!h-full !shadow-md !rounded-[10px]">
        <v-table
          fixed-header
          :height="tableHeight > (screenHeight - 300) ? `${screenHeight - 300}px` : ''"
        >
          <thead class="">
            <tr class="">
              <th class="text-left !bg-primary text-sm text-white !font-semibold">
                No
              </th>
              <th class="text-left !bg-primary text-sm text-white !font-semibold">
                Product
              </th>
              <th class=" text-center !bg-primary text-sm text-white !font-semibold">
                Qnty
              </th>
              <th class="text-left !bg-primary text-sm text-white !font-semibold">
                Date
              </th>

              <th class="text-left !bg-primary text-sm text-white !font-semibold" />
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in damagedList"
              :key="item.id"
              class="w-full !py-10 !h-10 text-xs "
            >
              <td class="w-fit text-xs  ">
                {{ index + 1 }}
              </td>
              <td class="font-semibold w-fit text-xs ">
                {{ item.name }}
              </td>
              <td class="font-semibold text-xs text-center ">
                {{ item.qnty }}
              </td>
              <td class="text-start text-xs  items-end relative ">
                {{ moment(item.date).format('DD MMM YYYY') }}
              </td>

              <td>
                <span class=" text-end ">
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

      <p v-if="!loading && damagedList?.length" class=" py-3 text-end align-end">
        Total:
        <b> {{ formatAsCurrency(totalAmount) }}</b>
      </p>
    </div>
  </v-container>

  <StocksDialogRemoveDamage v-model="openDeleteStock" :stock="selectedStock" @refresh="{}" />
</template>
