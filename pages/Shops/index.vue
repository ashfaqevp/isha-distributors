<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency, today } = useUtils()
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

function formatAvatar(inputString) {
  const words = inputString.split(' ')
  const formattedWords = words.map((word) => {
    const firstTwoLetters = words.length === 1 ? word.slice(0, 2) : word.slice(0, 1)
    const capitalizedLetters = firstTwoLetters.toUpperCase()
    return capitalizedLetters
  })
  const formattedString = formattedWords.join('')
  return formattedString
}

function formatColor(input) {
  switch (input) {
    case 'normal' :
      return '#1BAFD0'

    case 'discount':
      return '#6967CE'

    case 'special' :
      return '#FFB900'

    case 'dealer':
      return '#FD636B'

    default:
      return '#9AA0A6'
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
    return shopList.value.filter(item => item.name.toLowerCase().includes(searchName.value.toLowerCase()))
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
  loading.value = true
  await fetchData()
  await fetchPlaces()
  loading.value = false
})

function goToShop(id) {
  router.push({ path: '/shop', query: { id } })
}
</script>

<template>
  <v-app-bar
    class="px-0"
    color="primary"
  >
    <template v-if="!openSearch" #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="22" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div v-if="!openSearch" class="flex justify-left w-full">
      <v-app-bar-title>
        <span class="font-semibold">
          Shops
        </span>

        <span v-if="filter === 'pending_sort'" class="capitalize opacity-50 text-sm ml-2">
          <span>
            Pending
            <Icon name="pepicons-pop:sort" color="white" size="20" />
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
        class="search_input flex-full-width px-3 my-3 opacity-80"
        placeholder="Search Products"
        rounded
        theme="light"
        variant="solo"
        density="compact"
      >
        <Icon slot="prepend-inner-icon" name="gg:search" size="18" class=" mt-[6px] mr-3" />
        <Icon slot="append-inner-icon" name="gg:close" size="18" class=" absolute  mt-[6px]  right-5 cursor-pointer" @click="openSearch = flase ; searchName = ''" />
      </v-text-field>
    </div>
  </v-app-bar>

  <v-main class="bg-gray-50 h-screen ">
    <v-container v-if="loading" fluid>
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

    <v-container v-else fluid class="bg-gray-50 ">
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
                <v-avatar :color="formatColor(shop.type)" size="46">
                  <span class="font-bold">
                    {{ formatAvatar(shop.name) }}
                  </span>
                </v-avatar>
                <span v-if="shop?.last_update === today" class="absolute -bottom-1 -right-2">
                  <Icon name="lets-icons:check-fill" size="22" color="green" class="" />
                </span>
              </div>
            </template>

            <template #title>
              <span class="font-semibold">
                {{ shop.name }}
              </span>
            </template>

            <template #subtitle>
              {{ shop.place }}
            </template>

            <template #append>
              <div class="relative flex">
                <span class="font-semibold text-red bg-red-100 px-2.5 py-1 rounded-[24px] !min-w-[30px] text-center">
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
 .v-label {
    font-size: 2px;
}
</style>
