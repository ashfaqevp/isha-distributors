<script setup>
import { collection, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency } = useUtils()
const router = useRouter()

const openAddProduct = ref(false)
const openSearch = ref(false)
const searchName = ref('')
const loading = ref(false)

const shopList = ref([])

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

const filterdShops = computed(() => {
  if (shopList.value?.length)
    return shopList.value.filter(item => item.name.toLowerCase().includes(searchName.value.toLowerCase()))
})

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
      return '#174EA6'

    case 'discount':
      return '#34A853'

    case 'special' :
      return '#f44336'

    case 'dealer':
      return '#4285F4'

    default:
      return '#9AA0A6'
  }
}

onMounted (async () => {
  await fetchData()
})

watch(() => openSearch, () => {
  if (openSearch.value === true) {
    const searchIput = (document.getElementsByClassName('search_input'))
    searchIput[0]?.querySelectorAll('input')[0].focus()
  }
}, { deep: true, immediate: true })

function goToAddShop() {
  router.push('/shops/add')
}

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
        Shops
      </v-app-bar-title>
    </div>

    <template v-if="!openSearch" #append>
      <v-app-bar-nav-icon @click="openSearch = true">
        <Icon name="gg:search" size="22" />
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon @click="openAddProduct = true ">
        <Icon name="gg:add" size="22" @click="goToAddShop" />
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

  <v-main class="bg-gray-50 h-screen">
    <v-container v-if="loading" fluid>
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </v-container>

    <v-container v-else fluid>
      <v-list v-for="(shop, index) in filterdShops" lines="two" class="!bg-gray-50 !my-0 py-1 ">
        <!-- <template v-for="(shop, index) in shopList"> -->
        <v-list-item class="!py-2" @click="goToShop(shop.id)">
          <template #prepend>
            <v-avatar :color="formatColor(shop.type)" size="46">
              <span class="font-bold">
                {{ formatAvatar(shop.name) }}
              </span>
            </v-avatar>
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
            <span class="font-semibold text-red">
              {{ formatAsCurrency(shop.pending || 0) }}
            </span>
          </template>
        </v-list-item>

        <v-divider
          v-if="index < shopList?.length - 1"
          :key="`${index}-divider`"
          class=""
          inset
        />
      </v-list>
    </v-container>
  </v-main>
  <!-- <ProductsAddDialog v-model="openAddProduct" @refresh="fetchProducts" /> -->
</template>

<style>
.v-divider {
  border-color: #000000 !important;
}
 .v-label {
    font-size: 2px;
}
</style>
