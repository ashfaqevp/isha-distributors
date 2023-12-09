<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency, today, formatAvatar, formatColor } = useUtils()
const router = useRouter()

const openAddShop = ref(false)
const openSearch = ref(false)
const searchName = ref('')
const loading = ref(false)

const shopList = ref([])
const placeList = ref([])

const filter = ref('')
const filterPlace = ref('')

async function fetchData() {
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
}

async function fetchPlaces() {
  loading.value = true
  try {
    const docRef = doc(db, 'others', 'places')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      placeList.value = docSnapshot.data().place_list || []
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
  finally {
    loading.value = false
  }
}

watch(() => openSearch, () => {
  if (openSearch.value === true) {
    filter.value = ''
    const searchIput = (document.getElementsByClassName('search_input'))
    searchIput[0]?.querySelectorAll('input')[0].focus()
  }
}, { deep: true, immediate: true })

const filterdShops = computed(() => {
  if (shopList.value?.length)
    return shopList.value?.filter(item => (item?.name || '').toLowerCase().includes(searchName.value?.toLowerCase()))
})

const pendingSortedShops = computed(() => {
  if (shopList.value?.length) {
    const sortedArray = [...filterdShops.value].sort((a, b) => {
      const pendingA = a?.pending || 0
      const pendingB = b?.pending || 0

      return pendingB - pendingA
    })
    return sortedArray
  }
})

onMounted (async () => {
  router.push({ path: '/shops' })
  // loading.value = true
  // await fetchData()
  // await fetchPlaces()
  // loading.value = false
})

function goToShop(id) {
  router.push({ path: '/shop', query: { id } })
}
</script>

<template>
  <v-app-bar
    class="px-0 "
    elevation="2"
    height="60"
  >
    <!-- <template v-if="!openSearch" #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="22" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template> -->

    <div v-if="!openSearch" class="flex justify-left w-full">
      <v-app-bar-title>
        <span class=" font-bold text-xl ml-6 ">
          Shops
        </span>

        <span v-if="filter === 'pending_sort'" class="capitalize opacity-50 text-sm ml-2">
          <span>
            Pending
            <Icon name="pepicons-pop:sort" size="20" />
          </span>
        </span>

        <span v-else-if="filter === 'place'" class="capitalize !max-w-[20px] truncate  opacity-50 text-sm ml-2 ">
          {{ filterPlace }}
        </span>
      </v-app-bar-title>
    </div>

    <template v-if="!openSearch" #append>
      <v-app-bar-nav-icon @click="openSearch = true">
        <Icon name="gg:search" size="24" />
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon>
        <Icon name="gg:add" size="24" @click="openAddShop = true" />
      </v-app-bar-nav-icon>

      <v-app-bar-nav-icon>
        <v-button>
          <Icon name="mingcute:filter-line" size="24" />
        </v-button>

        <v-menu activator="parent" width="180px" class="!w-[50px]">
          <v-list>
            <v-list-item @click="filter = ''">
              <template #append>
                <Icon name="ic:round-clear-all" size="24" cclass="text-blue-900" />
              </template>
              <v-list-item-title>
                All
              </v-list-item-title>
            </v-list-item>
            <hr>
            <v-list-item
              v-for="(item, index) in placeList"
              :key="item"
              @click="() => { filter = 'place', filterPlace = item }"
            >
              <v-list-item-title>
                <span class="capitalize">
                  {{ item }}
                </span>
              </v-list-item-title>
            </v-list-item>
            <hr>
            <v-list-item @click="filter = 'pending_sort'">
              <template #append>
                <Icon name="pepicons-pop:sort" color="red" size="20" />
              </template>
              <v-list-item-title>
                Pending
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar-nav-icon>
    </template>

    <div v-show="openSearch" class="w-full  mt-3 pt-2 ">
      <v-text-field
        v-model="searchName"
        class="px-3 "
        placeholder="Search Products"
        density="compact"
        dense
        flat
        filled
      >
        <Icon slot="prepend-inner-icon" name="gg:search" size="18" class=" mt-[6px] mr-3" />
        <Icon slot="append-inner-icon" name="gg:close" size="18" class=" absolute  mt-[6px]  right-5 cursor-pointer" @click="openSearch = flase ; searchName = ''" />
      </v-text-field>
    </div>
  </v-app-bar>

  <v-main class="bg-gray-50 h-screen ">
    <v-container v-if="loading" fluid class="bg-gray-50">
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </v-container>

    <div
      v-else-if="(!filter.length ? !(filterdShops?.length)
        : filter === 'pending_sort' ? !pendingSortedShops?.length : !(filterdShops.filter(item => (item.place === filterPlace)))?.length)" class="!h-[200px]  w-full  flex  rounded-b-[10px] items-center justify-center mt-[200px]"
    >
      <ImagesNoData class="scale-60 " />
    </div>

    <v-container v-else fluid class="bg-gray-50 !px-1 !py-1 ">
      <v-list
        v-for="(shop, index) in (!filter.length ? (filterdShops)
          : filter === 'pending_sort' ? pendingSortedShops : (filterdShops.filter(item => (item.place === filterPlace))))"
        lines="two" class="!bg-gray-50 !my-0 py-1"
      >
        <!-- <template v-for="(shop, index) in shopList"> -->
        <div>
          <v-list-item class="!py-2" @click="goToShop(shop.id)">
            <template #prepend>
              <div class="relative mr-5">
                <v-avatar :color="formatColor(shop?.type)" size="46">
                  <span class="font-bold">
                    {{ formatAvatar(shop?.name || 'SH') }}
                  </span>
                </v-avatar>
                <span v-if="shop?.last_update === today" class="absolute -bottom-1 -right-2">
                  <Icon name="lets-icons:check-fill" size="22" color="green" class="" />
                </span>
              </div>
            </template>

            <template #title>
              <span class="font-semibold text-[15px]">
                {{ shop.name }}
              </span>
            </template>

            <template #subtitle>
              <span class=" capitalize">
                {{ shop.place }}
              </span>
            </template>

            <template #append>
              <div class="relative flex">
                <span class="font-semibold !text-[14px] text-red-500 bg-pink-100 px-2.5 py-1 rounded-[24px] !min-w-[30px] text-center">
                  {{ formatAsCurrency(shop.pending || 0) }}
                </span>
              </div>
            </template>
          </v-list-item>
        </div>

        <v-divider
          v-if="index < shopList?.length - 1"
          :key="`${index}-divider`"
          class=""
          inset
        />
      </v-list>
    </v-container>
    <CoreNavSpacer />
  </v-main>
  <ShopsDialogAdd v-model="openAddShop" @refresh="fetchData" />
</template>

<style>
.v-divider {
  border-color: #000000 !important;
}
</style>
