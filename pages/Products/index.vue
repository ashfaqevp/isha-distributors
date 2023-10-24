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

onMounted (async () => {
  await fetchProducts()
  // other functions
})

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

// const tab = ref(null)
// const allTabs = ['web', 'shopping', 'videos']
</script>

<!-- density="compact" -->

<template>
  <v-app-bar
    class="px-0"
    color="primary"
    :density="openSearch ? 'default' : 'compact'"
  >
    <template v-if="!openSearch" #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="22" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div v-if="!openSearch" class="flex justify-left w-full">
      <v-app-bar-title>
        Products
      </v-app-bar-title>
    </div>

    <template v-if="!openSearch" #append>
      <v-app-bar-nav-icon @click="openSearch = true">
        <Icon name="gg:search" size="22" />
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon @click="openAddProduct = true ">
        <Icon name="gg:add" size="22" />
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
        class="flex-full-width px-3 my-3 opacity-80"
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
      <v-row dense>
        <v-col
          v-for="(product, index) in filterdProducts"
          :key="index"
          cols="6"
        >
          <v-card
            rounded="lg"
            color="grey-lighten-9"
            height="120px"
            class="pa-4 text-center mx-1 my-1"
            elevation="1"
            @click="openEditProduct = true ; selectedProduct = product"
          >
            <div class="flex-col relative">
              <v-avatar class="mb-3" :color="getProductIcon(product?.category).color">
                <Icon :name="getProductIcon(product?.category).name" size="24" color="white" />
              </v-avatar>
              <p class="text-sm font-semibold truncate">
                {{ product?.name }}
              </p>
              <span class="text-xs">Price : </span>
              <span class="text-xs font-semibold text-grey-600">{{ formatAsCurrency(product?.price_a) }}</span>

              <button class="absolute -top-2 -right-2 rounded-full hover:bg-gray-100 px-1  pb-1">
                <Icon name="icon-park-outline:more-one" size="18" />
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

    <ProductsAddDialog v-model="openAddProduct" @refresh="fetchProducts" />
    <ProductsEditDialog v-model="openEditProduct" :product="selectedProduct" @refresh="fetchProducts" />
    <ProductsDeleteDialog v-model="openDeleteProduct" :product="selectedProduct" @refresh="fetchProducts" />
  </v-main>

  <!-- <v-container color="#000000">
    <v-list lines="two">
      <template v-for="(folder, index) in items">
        <v-list-item>
          <template #prepend>
            <v-avatar color="#3b3b3b">
              AS
            </v-avatar>
          </template>

          <template #title>
            Summer BBQ <span class="text-grey-lighten-1">4</span>
          </template>

          <template #subtitle>
            <span class="font-weight-bold">to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.
          </template>

          <template #append>
            <v-btn
              variant="text"
            >
              37
            </v-btn>
          </template>
        </v-list-item>
        <v-divider
          v-if="index < items.length - 1"
          :key="`${index}-divider`"

          inset
        >
          />
        </v-divider>
      </template>
    </v-list>
  </v-container> -->
</template>

<style>
.v-divider {
  border-color: #000000 !important;
}
 .v-label {
    font-size: 12px;
}
</style>
