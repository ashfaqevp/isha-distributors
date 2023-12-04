<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import moment from 'moment'

const { db } = useFirebaseStore()
const router = useRouter()

const { formatAsCurrency, formatColor, formatAvatar, today } = useUtils()

const route = useRoute()
const { id } = route?.query

const loading = ref(false)
const shop = ref({})
const todayData = ref({})
const lastdayData = ref({})

const lastPurchaseDate = computed(() => {
  if (shop?.value?.last_update === today && shop.value?.prev_update)
    return shop.value?.prev_update
  else if (shop?.value?.last_update !== today)
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
    const billRef = doc(db, 'bills', today)
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
    const paidDbRef = doc(db, 'cash', today)
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

const selectedItem = ref({})
const openDeleteItem = ref(false)
</script>

<template>
  <div class="relative">
    <v-app-bar
      class="px-0 !z-20 pb-0"
      elevation="2"
    >
      <template #prepend>
        <v-app-bar-nav-icon class="mx-0">
          <Icon name="eva:arrow-back-outline" size="26" @click="gotoShops" />
        </v-app-bar-nav-icon>
      </template>

      <div class="flex justify-left w-full">
        <v-app-bar-title>
          <v-avatar :color="formatColor(shop?.type)" size="42">
            <span class="font-bold text-[18px]">
              {{ formatAvatar(shop?.name || '') }}
            </span>
          </v-avatar>
          <span class=" !font-semi-bold !text-xl ml-2 ">
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
        <v-card rounded="10" class="!border-[0px] border-primary !rounded-[8px] !mb-2">
          <v-card-text>
            <div class="b!h-[100px] w-full flex items-center">
              <div class="w-full !pr-2 text-center ">
                <p class="text-xs text-slate-500 my-1">
                  Pending
                </p>
                <p class="py-1 font-bold text-red-600 text-[16px] ml-2  rounded-full">
                  {{ formatAsCurrency(shop?.pending || 0) }}
                </p>
              </div>
              <div class="h-[70px] border-r-[1px] border-gray-300" />

              <div class=" w-full  align-end text-center ">
                <p class="text-xs text-slate-500 py-1">
                  Credit Balance
                </p>
                <p class="py-1 font-bold text-indigo  text-[16px] ml-2">
                  {{ formatAsCurrency(shop?.credit_limit || 0) }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- TODAY -->
        <v-card v-if="todayData?.total || todayData?.cash" class="!mt-4 mb-5 !rounded-[8px]">
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
            <div v-if="todayData?.purchaseList?.length" class="!h-full !shadow-sm   !border-b-[0px]    ">
              <v-table
                fixed-header
              >
                <thead class="">
                  <tr class="">
                    <th class="text-left text-sm !bg-primary text-white !font-semibold !w-fit">
                      No
                    </th>

                    <th class="text-left  text-sm !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
                      <span>
                        Product
                      </span>
                    </th>
                    <th class="text-left text-sm !bg-primary text-white text-center !font-semibold !w-fit">
                      <span>
                        Qnty
                      </span>
                    </th>
                    <th class="text-end !pr-[36px] text-sm  text-white !font-semibold !bg-primary">
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
                    <td class="text-xs text-center   ">
                      <span class="!w-fit">
                        {{ index + 1 }}
                      </span>
                    </td>

                    <td class="text-xs flex items-center  ">
                      <span class="w-full">
                        {{ item.name }}
                      </span>
                    </td>
                    <td class="text-xs w-fit gap-x-3 ">
                      <span class="mr-3"> {{ item.qnty }}</span>
                      <span class="font-100 !text-xs text-gray-400">x{{ item.price }}</span>
                    </td>
                    <td class=" text-xs  !min-w-[130px] text-end  items-end relative">
                      <span class="pr-3">
                        {{ formatAsCurrency(item.total) }}
                      </span>

                      <span class=" absolute right-1 text-end ">
                        <button>
                          <Icon name="icon-park-outline:more-one" size="22" class="" />
                        </button>

                        <v-menu activator="parent" width="110" class=" ">
                          <v-list>
                            <v-list-item @click="openDeleteItem = true ; selectedItem = item">
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
                <p class="  text-slate-500 px-2 text-gray text-xs ">
                  OB :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold !text-[13px] text-center text-fuchsia-900 mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency((shop?.pending || 0) + (todayData?.cash || 0) - (todayData?.total || 0)) }}
                </p>
              </div>

              <div class="px-2 py-1   w-full flex flex-col items-center ">
                <p class=" px-2 text-slate-500 py-1 text-xs">
                  Total :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold  text-[13px]text-center text-primary mb-2 px-2  rounded-[16px] ">
                  {{ formatAsCurrency(todayData?.total || 0) }}
                </p>
              </div>
            </div>

            <div class="w-full flex h-fit   ">
              <div class="px-2 py-1  !border-r-[1px] w-full flex flex-col items-center ">
                <p class="  px-2 text-slate-500 text-xs ">
                  Collection :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold text-[13px]text-center text-green mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(todayData?.cash) }}
                </p>
              </div>

              <div class="px-2 py-1  w-full flex flex-col items-center ">
                <p class=" px-2 text-slate-500 text-xs ">
                  Balance :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold text-[13px]text-center text-red mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(shop?.pending) }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- LASTDAY -->

        <v-card v-if="lastdayData?.total || lastdayData?.cash" class="!mt-4 mb-5 !rounded-[8px]">
          <v-card-title class="  py-3 !bg-primary !text-white  ">
            <div class=" flex justify-between font-semibold ">
              {{ moment(lastPurchaseDate).format('DD MMM dddd') }}
              <button>
                <Icon name="ic:baseline-share" class="" />
              </button>
            </div>
          </v-card-title>

          <!-- <hr class=" border-[1px]   w-full"> -->

          <v-card-text class="px-0 py-0">
            <div v-if="lastdayData?.purchaseList?.length" class="!h-full !shadow-sm   !border-b-[0px]    ">
              <v-table
                fixed-header
              >
                <thead class="">
                  <tr class="">
                    <th class="text-left text-sm !bg-primary text-white !font-semibold !w-fit">
                      No
                    </th>

                    <th class="text-left  text-sm !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
                      <span>
                        Product
                      </span>
                    </th>
                    <th class="text-left text-sm !bg-primary text-white text-center !font-semibold !w-fit">
                      <span>
                        Qnty
                      </span>
                    </th>
                    <th class="text-end text-sm !bg-primary text-white !font-semibold">
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
                    <td class="text-xs text-center   ">
                      <span class="!w-fit ">
                        {{ index + 1 }}
                      </span>
                    </td>

                    <td class="text-xs flex items-center  ">
                      <span class="w-full">
                        {{ item.name }}
                      </span>
                    </td>
                    <td class="text-xs w-fit gap-x-3 ">
                      <span class="mr-3"> {{ item.qnty }}</span>
                      <span class="font-100 !text-xs text-gray-400">x{{ item.price }}</span>
                    </td>
                    <td class="text-end text-xs  !min-w-[130px] items-end relative">
                      {{ formatAsCurrency(item.total) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div class="w-full flex h-fit  !border-t-[1px]  !border-b-[1px] ">
              <div class="px-2 py-1  !border-r-[1px] !border-b-[1px]] w-full flex flex-col items-center ">
                <p class="  text-slate-500 px-2 text-gray text-xs ">
                  OB :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold !text-[13px] text-center text-fuchsia-900 mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(((shop.pending + ((todayData?.cash - todayData?.total) || 0)) + lastdayData.cash - lastdayData.total || 0)) }}
                </p>
              </div>

              <div class="px-2 py-1   w-full flex flex-col items-center ">
                <p class=" px-2 text-slate-500 py-1 text-xs">
                  Total :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold  text-[13px]text-center text-primary mb-2 px-2  rounded-[16px] ">
                  {{ formatAsCurrency(lastdayData.total || 0) }}
                </p>
              </div>
            </div>

            <div class="w-full flex h-fit   ">
              <div class="px-2 py-1  !border-r-[1px] w-full flex flex-col items-center ">
                <p class="  px-2 text-slate-500 text-xs ">
                  Collection :
                </p>
                <p class="!bg-pink-00 w-fit font-semibold text-[13px]text-center text-green mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(lastdayData?.cash || 0) }}
                </p>
              </div>

              <div class="px-2 py-1  w-full flex flex-col items-center ">
                <p class=" px-2 text-slate-500 text-xs ">
                  Balance :
                </p>
                <p class="w-fit font-semibold text-[13px]text-center text-red mb-2 px-2 py-1 rounded-[16px] ">
                  {{ formatAsCurrency(((shop.pending + ((todayData.cash - todayData.total) || 0)))) }}
                </p>
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
  <ShopDialogDeleteBillItem v-model="openDeleteItem" :item="selectedItem" :shop="shop" @refresh="fetchDb" />
  <ShopDialogCash v-model="openCash" :shop="shop" :cash-list="todayData.cashList" @refresh="fetchDb" />
</template>
