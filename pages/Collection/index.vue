<script setup>
import moment from 'moment'
import { collection, doc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency } = useUtils()
const router = useRouter()

const today = moment()
const date = today.format('YYYY-MM-DD')

const shopList = ref([])
const collectionList = ref([])

const loading = ref(false)

const collectionFilter = ref('all')

async function fetchShops() {
  loading.value = true
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
    loading.value = false
  }
}

async function fetchCollection() {
  loading.value = true
  const docRef = doc(db, 'cash', date)
  try {
    const fetchPromises = shopList.value.map(async (shop) => {
      const querySnapshot = await getDocs(collection(docRef, shop?.id))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        shop_id: shop?.id,
        shop_name: shop?.name,
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
    loading.value = false
  }
}

const totalCollection = computed(() => {
  let total = 0
  let online = 0
  let direct = 0
  collectionList.value.forEach((shop) => {
    total = total + (shop?.cash || 0)
    if (shop.method === 'online')
      online = online + (shop?.cash || 0)
    else
      direct = direct + (shop?.cash || 0)
  })

  const cashTotal = { total, online, direct }
  return cashTotal
})

const tableHeight = ref(0)
const screenHeight = ref(0)

onMounted (async () => {
  await fetchShops()
  await fetchCollection()

  screenHeight.value = window?.screen?.height

  const divElement = document.getElementById('table-list')
  tableHeight.value = divElement?.offsetHeight
})
</script>

<template>
  <v-app-bar
    class="px-0 !z-20 "
    height="60"
  >
    <div class="flex ml-6 w-full">
      <v-app-bar-title>
        <span class=" font-semibold text-xl">
          Collection
        </span>
        <span class="mx-2">
          <Icon v-if="collectionFilter === 'direct'" name="tdesign:undertake-transaction" color="white" size="24" />
          <Icon v-else-if="collectionFilter === 'online'" name="fa-brands:google-pay" size="42" color="white" />
        </span>
      </v-app-bar-title>
    </div>

    <template #append>
      <v-app-bar-nav-icon>
        <Icon name="ic:outline-history" size="24" />
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon>
        <v-button>
          <Icon name="mingcute:filter-line" size="24" />
        </v-button>

        <v-menu activator="parent" width="150px" class="!w-[50px]">
          <v-list>
            <v-list-item @click="collectionFilter = 'all'">
              <template #append>
                <Icon name="ic:round-clear-all" size="24" cclass="text-blue-900" />
              </template>
              <v-list-item-title>
                All
              </v-list-item-title>
            </v-list-item>

            <v-list-item @click="collectionFilter = 'direct'">
              <template #append>
                <Icon name="tdesign:undertake-transaction" color="green" size="20" />
              </template>
              <v-list-item-title>
                Direct
              </v-list-item-title>
            </v-list-item>

            <v-list-item @click="collectionFilter = 'online'">
              <template #append>
                <Icon name="logos:google-pay" size="32" class="font-bold text-black" />
              </template>
              <v-list-item-title>
                Online
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar-nav-icon>
    </template>
  </v-app-bar>

  <v-main class="bg-gray-50 ">
    <v-container id="qq" fluid class="">
      <div class="flex flex-col !px-0  ">
        <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div v-else-if="collectionList?.length" id="table-list" class="!h-full !shadow-md !rounded-[10px]">
          <v-table
            fixed-header
            :height="tableHeight > (screenHeight - 465) ? `${screenHeight - 465}px` : ''"
          >
            <thead class="py-0">
              <tr class="">
                <th class="text-left text-sm !bg-primary text-white !font-semibold">
                  No
                </th>
                <th class="text-left text-sm  !bg-primary text-white !font-semibold">
                  Shop
                </th>
                <th v-if=" collectionFilter === 'all'" class="text-left text-sm  !bg-primary text-white !font-semibold">
                  Method
                </th>
                <th v-else-if="collectionFilter === 'online'" class="text-left text-sm  !bg-primary text-white !font-semibold">
                  Tran ID
                </th>
                <th class="text-end text-sm  !bg-primary text-white !font-semibold">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody class="text-sm">
              <tr
                v-for="(item, index) in (collectionFilter !== 'all'
                  ? (collectionList.filter(item => item.method === (collectionFilter === 'direct' ? 'direct' : 'online'))) : collectionList)"
                :key="item.id"
                class="w-full !py-10 !h-10 text-sm"
              >
                <td class="text-xs">
                  {{ index + 1 }}
                </td>
                <td class="w-fit text-xs">
                  {{ item.shop_name }}
                </td>
                <td v-if="collectionFilter === 'all' || collectionFilter === 'online' " class="text-xs capitalize text-start ">
                  <div v-if="collectionFilter === 'all'" class="text-center">
                    <Icon v-if=" item.method === 'direct'" name="tdesign:undertake-transaction" color="green" size="20" />
                    <Icon v-else name="logos:google-pay" size="32" class="font-bold text-black" />
                  </div>
                  <div v-else>
                    {{ (item.trans_id).slice(-4) }}
                  </div>
                </td>

                <td class="text-end text-xs  !min-w-[120px]">
                  {{ formatAsCurrency(item.cash) }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div v-else class="!h-[200px]  w-full  flex  rounded-b-[10px] items-center justify-center mt-[200px]">
          <ImagesNoData class="scale-40 " />
        </div>

        <div v-if="!loading && collectionList?.length" class=" py-3 text-end align-end flex flex-col gap-y-1">
          <div class="text-sm mb-2 w-fit flex ">
            <span class="">
              Direct:
            </span>
            <b class="font-semibold opacity-80 min-w-[80px]  "> {{ formatAsCurrency(totalCollection.direct) }}</b>
          </div>
          <div class="text-sm mb-2 w-fit flex ">
            <span class=" ">
              Online:
            </span>
            <b class="font-semibold opacity-80 min-w-[80px]"> {{ formatAsCurrency(totalCollection.online) }}</b>
          </div>
          <hr class="h-[1px] w-50 bg- my-1 ">
          <div class="">
            Total:
            <b class=""> {{ formatAsCurrency(totalCollection.total) }}</b>
          </div>
        </div>
      </div>
    </v-container>
  </v-main>
</template>
