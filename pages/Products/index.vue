<script setup>
import { collection, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency, productCategories } = useUtils()
const router = useRouter()

const productList = ref([])
const selectedProduct = ref({})

const openAddProduct = ref(false)
const openEditProduct = ref(false)
const openDeleteProduct = ref(false)

const openSearch = ref(false)
const searchName = ref('')

const loading = ref(false)

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

function getProductIcon(input) {
  switch (input) {
    case productCategories[0] :
      return { name: 'icon-park-outline:milk-one', color: '#174EA6' }

    case productCategories[1]:
      return { name: 'game-icons:covered-jar', color: '#34A853' }

    case productCategories[2]:
      return { name: 'fontisto:test-bottle', color: '#E37400' }

    case productCategories[3]:
      return { name: 'material-symbols:icecream', color: '#4285F4' }

    case productCategories[4]:
      return { name: 'fluent:cookies-20-filled', color: '#f44336' }

    default:
      return { name: 'ep:menu', color: '#9AA0A6' }
  }
}

const filterdProducts = computed(() => {
  if (productList.value?.length)
    return productList.value.filter(item => item.name.toLowerCase().includes(searchName.value.toLowerCase()))
})

onMounted (async () => {
  await fetchProducts()
  // other functions
})
</script>

<!-- density="compact" -->

<template>
  <v-app-bar
    class="px-0 "
    elevation="2"
    height="60"
  >
    <div v-if="!openSearch" class="flex justify-left w-full">
      <v-app-bar-title>
        <span class=" font-bold text-xl ml-6 ">
          Products
        </span>
      </v-app-bar-title>
    </div>

    <template v-if="!openSearch" #append>
      <v-app-bar-nav-icon @click="openSearch = true">
        <Icon name="gg:search" size="24" />
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon @click="openAddProduct = true ">
        <Icon name="gg:add" size="24" />
      </v-app-bar-nav-icon>
    </template>

    <!-- <template #extension>
      <div>
        <v-tabs
          v-model="tab"
          align-tabs="title"
        >
          <v-tab
            v-for="item in allTabs"
            :key="item"
            :value="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
      </div>
    </template> -->

    <div v-if="openSearch" class="w-full  mt-3 pt-2 ">
      <v-text-field
        v-model="searchName"
        class="flex-full-width px-3 my-3 brightness-10"
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

  <v-main class="bg-gray-50 h-screen">
    <v-container v-if="loading" fluid class="bg-gray-50">
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </v-container>

    <v-container v-else class="bg-gray-50" fluid>
      <v-row dense>
        <v-col
          v-for="(product, index) in filterdProducts"
          :key="index"
          cols="6"
          md="4"
          lg="3"
        >
          <v-card
            rounded="lg"
            color="grey-lighten-9"
            height="140px"
            class="pa-4 text-center mx-1 my-1"
            elevation="1"
            @click="openEditProduct = true ; selectedProduct = product"
          >
            <div class="flex-col relative">
              <v-avatar size="48" class="mb-3" :color="getProductIcon(product?.category).color">
                <Icon :name="getProductIcon(product?.category).name" size="24" color="white" />
              </v-avatar>
              <p class="text-sm font-semibold truncate">
                {{ product?.name }}
              </p>
              <span class="text-[12px] text-slate-400">Price : </span>
              <span class="text-[12px] font-semibold text-slate-400">{{ formatAsCurrency(product?.price_a) }}</span>

              <button class="absolute -top-1 -right-2 rounded-full hover:bg-gray-100 px-1  pb-1">
                <Icon name="icon-park-outline:more-one" size="22" />
                <v-menu activator="parent">
                  <v-list>
                    <v-list-item @click="openEditProduct = true ; selectedProduct = product">
                      <v-list-item-title class="w-[70px]">
                        {{ "Edit" }}
                      </v-list-item-title>
                      <template #append>
                        <Icon name="mdi:edit-outline" size="18" />
                      </template>
                    </v-list-item>

                    <v-list-item @click="openDeleteProduct = true ; selectedProduct = product">
                      <template #append>
                        <Icon name="mdi:delete-outline" size="18" />
                      </template>
                      <v-list-item-title>
                        Delete
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </button>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <CoreNavSpacer />

    <ProductsAddDialog v-model="openAddProduct" @refresh="fetchProducts" />
    <ProductsEditDialog v-model="openEditProduct" :product="selectedProduct" @refresh="fetchProducts" />
    <ProductsDeleteDialog v-model="openDeleteProduct" :product="selectedProduct" @refresh="fetchProducts" />
  </v-main>
</template>

<style>
.v-divider {
  border-color: #000000 !important;
}
 .v-label {
    font-size: 12px;
}
</style>
