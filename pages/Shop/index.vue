<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const router = useRouter()

const { formatAsCurrency } = useUtils()

const route = useRoute()
const { id } = route?.query

function goToBill() {
  router.push({ path: '/bill', query: { shop_id: id } })
}

const shop = ref({})

async function fetchShop() {
  try {
    const docRef = doc(db, 'shops', id)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      shop.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

const todayData = ref({})

const today = new Date()
const date = today.toISOString().split('T')[0]

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
      return accumulator + todayData.value.purchaseList.price
    }, 0)
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted (async () => {
  await fetchShop()
  await fetchTodayPurchase()
})
</script>

<template>
  <div class="relative">
    <v-app-bar
      class="px-0 !z-20 pb-10"
      color="primary"
      density="default"
    >
      <template #prepend>
        <v-app-bar-nav-icon class="mx-0">
          <Icon name="eva:arrow-back-outline" size="22" @click="router.back()" />
        </v-app-bar-nav-icon>
      </template>

      <div class="flex justify-left w-full">
        <v-app-bar-title>
          {{ shop?.name || '' }}
        </v-app-bar-title>
      </div>

      <template #append>
        <v-app-bar-nav-icon>
          <Icon name="icon-park-outline:more-one" size="28" />
        </v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <div class="z-30 sticky top-[70px] px-4">
      <v-card class=" ">
        <v-card-text>
          <div class="b!h-[100px] w-full flex items-center">
            <div class="w-full !pr-2 text-center ">
              <p class="font-semibold text-gray-400 text-sm">
                Pending
              </p>
              <p class="py-1 font-bold text-red-600 text-lg">
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
            <!-- <p class="font-semibold text-gray-400 text-sm  ">
              ({{ formatAsCurrency(shop?.pending || 6700) }})
            </p> -->
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-main class="bg-gray-50 h-full">
      <!-- <v-container v-if="loading" fluid>
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
      absolute -top-10
    </v-container> -->

      <v-container fluid>
        <!-- TODAY -->
        <v-card class="mt-3">
          <v-card-item>
            <v-card-title>
              <div class=" flex justify-between">
                Today
                <button>
                  <Icon name="ic:baseline-share" class="" />
                </button>
              </div>
            </v-card-title>
          </v-card-item>

          <v-card-text>
            <div v-if="todayData?.purchaseList?.length" class="!h-full !shadow-md !rounded-[10px] ">
              <v-table
                fixed-header
              >
                <thead class="">
                  <tr class="">
                    <th class="text-left !bg-[#8f9bc4] text-white !font-semibold flex items-center gap-x-1.5">
                      <span>
                        Product
                      </span>
                    </th>
                    <th class="text-left !bg-[#8f9bc4] text-white !font-semibold !w-fit">
                      <span>
                        Qnty
                      </span>
                    </th>
                    <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
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
                    <td class=" ext-start text-sm  !min-w-[130px] items-end relative  ">
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

            <div class="w-full justify-end flex">
              <div class="w-full flex flex-col w-40 justify-end text-end !px-3 pt-3 gap-y-2 bg-yellow-0">
                <span class="flex justify-between">
                  <spna>
                    Total :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    OB :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Cash :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Balance :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- YESTERDAY -->

        <v-card class="mt-3">
          <v-card-item>
            <v-card-title>
              <div class=" flex justify-between">
                Yesterday
                <button>
                  <Icon name="ic:baseline-share" class="" />
                </button>
              </div>
            </v-card-title>
          </v-card-item>

          <v-card-text>
            <div v-if="todayData?.purchaseList?.length" class="!h-full !shadow-md !rounded-[10px] ">
              <v-table
                fixed-header
              >
                <thead class="">
                  <tr class="">
                    <th class="text-left !bg-[#8f9bc4] text-white !font-semibold flex items-center gap-x-1.5">
                      <span>
                        Product
                      </span>
                    </th>
                    <th class="text-left !bg-[#8f9bc4] text-white !font-semibold !w-fit">
                      <span>
                        Qnty
                      </span>
                    </th>
                    <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
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
                    <td class=" ext-start text-sm  !min-w-[100px] items-end relative  ">
                      {{ formatAsCurrency(item.total) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div class="w-full justify-end flex">
              <div class="w-50 flex flex-col w-40 justify-end text-end !px-3 pt-3 gap-y-2 bg-yellow-100">
                <span class="flex justify-between">
                  <spna>
                    Total :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    OB :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Cash :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>

                <span class="flex justify-between">
                  <spna>
                    Balance :
                  </spna>
                  <span>
                    {{ formatAsCurrency(0) }}
                  </span>
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- BOTTOM ACTION BUTTON -->

    <div class=" !fixed !bottom-[16px] flex justify-end px-5 !h-100 right-0  ">
      <v-btn
        v-model="fab"
        color="blue darken-2"
        dark
        class="!rounded-full my-3"
        height="62"
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
              @click="goToBill"
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
</template>
