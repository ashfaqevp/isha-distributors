<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import moment from 'moment'

const { db } = useFirebaseStore()
const router = useRouter()

const { formatAsCurrency, formatColor, formatAvatar } = useUtils()

const route = useRoute()
const { id } = route?.query

const today = moment()
const date = today.format('YYYY-MM-DD')

const loading = ref(false)
const shop = ref({})
const todayData = ref({})
const lastdayData = ref({})

const lastPurchaseDate = computed(() => {
  if (shop?.value?.last_update === date && shop.value?.prev_update)
    return shop.value?.prev_update
  else if (shop?.value?.last_update !== date)
    return shop?.value?.last_update
})

async function fetchShop() {
  try {
    const docRef = doc(db, 'shops', id)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      shop.value = docSnapshot.data()
      shop.value.id = id
    }
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Fetch Today Data
async function fetchTodayPurchase() {
  try {
    const billRef = doc(db, 'bills', date)
    const dbRef = collection(billRef, id)
    const querySnapshot = await getDocs(dbRef)
    todayData.value.purchaseList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    todayData.value.total = todayData.value.purchaseList.reduce((accumulator, currentItem) => {
      return accumulator + currentItem.total
    }, 0)
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

async function fetchTodayCash() {
  try {
    const paidDbRef = doc(db, 'cash', date)
    const paidRef = collection(paidDbRef, id)

    const querySnapshot = await getDocs(paidRef)
    todayData.value.cashList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    todayData.value.cash = todayData.value.cashList.reduce((accumulator, currentItem) => {
      return (Number.parseInt(accumulator, 10) + Number.parseInt(currentItem.cash, 10))
    }, 0)
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Fetch Last Date Data
async function fetchLastPurchase() {
  try {
    const billRef = doc(db, 'bills', lastPurchaseDate.value)
    const dbRef = collection(billRef, id)
    const querySnapshot = await getDocs(dbRef)
    lastdayData.value.purchaseList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    lastdayData.value.total = lastdayData.value.purchaseList.reduce((accumulator, currentItem) => {
      return accumulator + currentItem.total
    }, 0)
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

async function fetchLastCash() {
  try {
    const paidDbRef = doc(db, 'cash', lastPurchaseDate.value)
    const paidRef = collection(paidDbRef, id)

    const querySnapshot = await getDocs(paidRef)
    lastdayData.value.cashList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    lastdayData.value.cash = lastdayData.value.cashList.reduce((accumulator, currentItem) => {
      return (Number.parseInt(accumulator, 10) + Number.parseInt(currentItem.cash, 10))
    }, 0)
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

function goToBill() {
  router.push({ path: '/bill', query: { shop_id: id } })
}

async function fetchDb() {
  loading.value = true
  await fetchShop()
  await fetchTodayPurchase()
  await fetchTodayCash()

  loading.value = false
}

onMounted (async () => {
  console.log(today)
  console.log(date)

  await fetchDb()

  loading.value = await true
  if (lastPurchaseDate.value) {
    await fetchLastPurchase()
    await fetchLastCash()
  }
  loading.value = await false
})

function gotoShops() {
  router.push({ path: '/shops' })
}

const openCash = ref(false)
</script>

<template>
  <div class="relative">
    <v-app-bar
      class="px-0 !z-20 pb-10"
      elevation="5"
      height="65"
    >
      <template #prepend>
        <v-app-bar-nav-icon class="mx-0">
          <Icon name="eva:arrow-back-outline" size="22" @click="gotoShops" />
        </v-app-bar-nav-icon>
      </template>

      <div class="flex justify-left w-full">
        <v-app-bar-title>
          <v-avatar :color="formatColor(shop?.type)" size="46">
            <span class="font-bold">
              {{ formatAvatar(shop?.name || '') }}
            </span>
          </v-avatar>
          <span class=" font-bold text-xl ml-2 ">
            {{ shop?.name || '' }}
          </span>
        </v-app-bar-title>
      </div>

      <template #append>
        <v-app-bar-nav-icon>
          <Icon name="icon-park-outline:more-one" size="28" />
        </v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <div class="z-30 sticky top-[70px] px-4 ">
      <!-- <div class="bg-pink-100 mb-10 w-[130px] flex flex-col items-center py-2 rounded-[60px]">
        <p class="font-semibold text-gray-400 text-sm ">
          Pending
        </p>
        <p class="py-1 font-bold text-red-600 text-lg  rounded-full">
          {{ formatAsCurrency(shop?.pending || 0) }}
        </p>
      </div> -->
      <v-card elevation="5" rounded="10" class="!border-[0px] border-primary !rounded-[8px]">
        <v-card-text>
          <div class="b!h-[100px] w-full flex items-center">
            <div class="w-full !pr-2 text-center ">
              <p class="font-semibold text-gray-400 text-sm ">
                Pending
              </p>
              <p class="py-1 font-bold text-red-600 text-lg  rounded-full">
                {{ formatAsCurrency(shop?.pending || 0) }}
              </p>
            </div>
            <div class="h-[70px] border-r-[1px] border-gray-300" />

            <div class=" w-full  align-end text-center ">
              <p class="font-semibold text-gray-400 text-sm">
                Credit Balance
              </p>
              <p class="py-1 font-bold text-indigo text-lg">
                {{ formatAsCurrency(shop?.credit_limit || 0) }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-main class="bg-gray-50 h-full">
      <v-container v-if="loading" fluid>
        <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>
      </v-container>

      <!-- 8f9bc4 -->

      <v-container v-else fluid>
        <!-- TODAY -->
        <v-card v-if="todayData?.total || todayData?.cash" class="my-3 mb-5 !rounded-[8px]">
          <v-card-title class="  py-3 !bg-primary !text-white  ">
            <div class=" flex justify-between font-semibold ">
              Today
              <button>
                <Icon name="ic:baseline-share" class="" />
              </button>
            </div>
          </v-card-title>

          <!-- <hr class=" border-[1px]   w-full"> -->

          <v-card-text class="px-0 py-0">
            <div v-if="todayData?.purchaseList?.length" class="!h-full !shadow-sm  !rounded-[4px] !border-b-[0px]    ">
              <v-table
                fixed-header
              >
                <thead class="">
                  <tr class="">
                    <th class="text-left !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
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
                    v-for="(item, index) in todayData.purchaseList"
                    :key="item.id"
                    class="w-full"
                  >
                    <td class="text-sm flex items-center  ">
                      <span class="w-full">
                        {{ item.name }}
                      </span>
                    </td>
                    <td class="text-sm w-fit gap-x-3 ">
                      <span class="font-semibold mr-3"> {{ item.qnty }}</span>
                      <span class="font-100 !text-xs text-gray-400">x{{ item.price }}</span>
                    </td>
                    <td class="text-start text-sm  !min-w-[130px] items-end relative">
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

            <div class="w-full flex h-fit  !border-t-[1px]  !border-b-[1px] ">
              <div class="px-2 py-1  !border-r-[1px] !border-b-[1px]] w-full flex flex-col items-center ">
                <p class="text-sm  text-lefst px-2 text-gray ">
                  OB :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold !text-[15px]  text-center text-fuchsia-900 mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(todayData?.total || 0) }}
                </p>
              </div>

              <div class="px-2 py-1   w-full flex flex-col items-center ">
                <p class=" px-2 text-gray py-1">
                  Total :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold  text-[15px] text-center text-primary mb-2 px-2 rounded-[16px] ">
                  {{ formatAsCurrency(shop?.pending || 0 + ((todayData?.cash || 0 - todayData?.total || 0) || 0)) }}
                </p>
              </div>
            </div>

            <div class="w-full flex h-fit   ">
              <div class="px-2 py-1  !border-r-[1px] w-full flex flex-col items-center ">
                <p class=" text-lefst px-2 text-gray ">
                  Collection :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold text-[15px] text-center text-green mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(todayData?.cash) }}
                </p>
              </div>

              <div class="px-2 py-1  w-full flex flex-col items-center ">
                <p class=" px-2 text-gray ">
                  Pending :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold text-[15px] text-center text-red mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(shop?.pending) }}
                </p>
              </div>
            </div>

            <!-- <div class="w-full justify-end flex">
              <div class="min-w-[180px] flex flex-col  justify-end text-end !px-3 pt-3 gap-y-2">
                <span class="flex justify-between">
                  <spna>
                    Total :
                  </spna>
                  <span>
                    {{ formatAsCurrency(todayData?.total || 0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    OB :
                  </spna>
                  <span>
                    {{ formatAsCurrency(shop?.pending || 0 + ((todayData?.cash || 0 - todayData?.total || 0) || 0)) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Cash :
                  </spna>
                  <span class="text-green font-semibold">
                    {{ formatAsCurrency(todayData?.cash) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Balance :
                  </spna>
                  <span class="text-red font-semibold">
                    {{ formatAsCurrency(shop?.pending) }}
                  </span>
                </span>
              </div>
            </div> -->
          </v-card-text>
        </v-card>

        <!-- LASTDAY -->

        <v-card v-if="lastdayData?.total || lastdayData?.cash" class="mt-3">
          <v-card-item>
            <v-card-title>
              <div class=" flex justify-between">
                {{ lastPurchaseDate }}
                <button>
                  <Icon name="ic:baseline-share" class="" />
                </button>
              </div>
            </v-card-title>
          </v-card-item>

          <v-card-text>
            <div v-if="lastdayData?.purchaseList?.length" class="!h-full !shadow-md !rounded-[5px] ">
              <v-table
                fixed-header
              >
                <thead class="">
                  <tr class="">
                    <th class="text-left !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
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
                    v-for="(item, index) in lastdayData.purchaseList"
                    :key="item.id"
                    class="w-full"
                  >
                    <td class="text-sm flex items-center  ">
                      <span class="w-full">
                        {{ item.name }}
                      </span>
                    </td>
                    <td class="text-sm w-fit gap-x-3 ">
                      <span class="font-semibold mr-3"> {{ item.qnty }}</span>
                      <span class="font-100 !text-xs text-gray-400">x{{ item.price }}</span>
                    </td>
                    <td class=" ext-start text-sm  !min-w-[100px] items-end relative  ">
                      {{ formatAsCurrency(item.total) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div class="w-full justify-end flex">
              <div class="min-w-[180px] flex flex-col  justify-end text-end !px-3 pt-3 gap-y-2">
                <span class="flex justify-between">
                  <spna>
                    Total :
                  </spna>
                  <span>
                    {{ formatAsCurrency(lastdayData.total || 0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    OB :
                  </spna>
                  <span>
                    {{ formatAsCurrency(((shop.pending + ((todayData?.cash - todayData?.total) || 0)) + lastdayData.cash - lastdayData.total || 0)) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Cash :
                  </spna>
                  <span class="text-green font-semibold">
                    {{ formatAsCurrency(lastdayData?.cash || 0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Balance :
                  </spna>
                  <span class="text-red font-semibold">
                    {{ formatAsCurrency(((shop.pending + ((todayData.cash - todayData.total) || 0)))) }}
                  </span>
                </span>
              </div>
            </div>

            <!-- {{ todayData }} --------

            {{ lastdayData }} -->
          </v-card-text>
        </v-card>
      </v-container>
      <CoreNavSpacer />
    </v-main>

    <!-- BOTTOM ACTION BUTTON -->

    <div class=" !fixed !bottom-[56px] flex justify-end px-5 !h-100 right-0  ">
      <v-btn
        v-model="fab"
        color="blue darken-2"
        dark
        rounded
        size="58"
        class="!rounded-full my-3 "
      >
        <Icon name="fluent:add-12-filled" size="24" />

        <v-menu
          activator="parent" class="!w-[50px]   fixed !w-full  "
          transition="slide-y-reverse-transition"
        >
          <div class="flex flex-col  items-center">
            <v-btn
              color="green"
              dark
              class="!rounded-full my-1 "
              size="small"
              height="52"
              width="52"
              @click="openCash = true "
            >
              <Icon name="mdi:cash-edit" size="28" />
            </v-btn>

            <v-btn
              color="indigo"
              dark
              class="!rounded-full my-1 mb-2"
              size="small"
              height="52"
              width="52"
              @click="goToBill"
            >
              <Icon name="icon-park-solid:delivery" size="24" />
            </v-btn>
          </div>
        </v-menu>
      </v-btn>
    </div>
  </div>
  <ShopDialogCash v-model="openCash" :shop="shop" :cash-list="todayData.cashList" @refresh="fetchDb" />
</template>
