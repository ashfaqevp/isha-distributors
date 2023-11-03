<script setup>
import { collection, doc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { formatAsCurrency, productCategories } = useUtils()
const router = useRouter()

const body = ref({})

const productList = ref([])

// const selectedProduct = ref({})

// const openAddProduct = ref(false)
// const openEditProduct = ref(false)
// const openDeleteProduct = ref(false)

// const openSearch = ref(false)
// const searchName = ref('')

const today = new Date()
const date = today.toISOString().split('T')[0]

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

const stockList = ref([])

function addProduct() {
  const item = body.value?.product
  item.qnty = body.value?.qnty

  stockList.value.push(item)
  body.value = {}
}

const saveLoading = ref(false)

const dataToUpdateOrAdd = {
  // 23674127: 10,
  21345235: 60,
  9999335: 60,
}

function save() {
  saveLoading.value = true

  const docRef = doc(db, 'purchase_history', date)

  setDoc(docRef, dataToUpdateOrAdd, { merge: true })
    .then(() => {
      console.log('Document updated or added successfully')
    })
    .catch((error) => {
      console.error('Error updating or adding document: ', error)
    }).finally(() => {
      saveLoading.value = false
    })

  // setDoc(docRef, dataToUpdateOrAdd, { merge: true })
  // .then(() => {
  //   console.log('Document updated or added successfully')
  // })
  // .catch((error) => {
  //   console.error('Error updating or adding document: ', error)
  // }).finally(() => {
  //   saveLoading.value = false
  // })
}

onMounted (async () => {
  await fetchProducts()
})
</script>

<template>
  <v-app-bar
    class="px-0 "
    color="primary"
    :elevation="0"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="24" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        New Stocks
      </v-app-bar-title>
    </div>

    <template #append>
      <!-- <v-app-bar-nav-icon @click="openAdd">
        <Icon name="gg:add" size="24" />
      </v-app-bar-nav-icon> -->
    </template>

    <!-- <template #extension /> -->
  </v-app-bar>

  <v-main class="bg-gray-50 !h-screen">
    <v-sheet width="full" color="primary" class="!w-full !h-fit  pb-3 " :elevation="10">
      <div class="py-2 grid grid-cols-6 gap-4 px-3">
        <v-select
          v-model="body.product"
          :items="productList"
          class="!h-[58px] col-span-3 !brightness-80 "

          label="Product"
          variant="outlined"
          required
          item-title="name"

          return-object
        />

        <v-text-field
          v-model="body.qnty"
          label="Qnty"
          variant="outlined"
          class="!h-[58px] col-span-2 "
        />

        <v-btn
          color="primary"
          size="small"
          rounded
          class=" !h-[54px] bg-white col-span-1 "
          :disabled="false"
          @click="addProduct"
        >
          <Icon name="material-symbols:add" size="32" />
        </v-btn>
      </div>
    </v-sheet>
    <v-container fluid>
      <div class="flex flex-col !px-0">
        <div class="!h-full ">
          <v-table
            fixed-header
            class=" !rounded-[10px] !shadow-md"
            rounded
          >
            <thead class="">
              <tr class="">
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  No
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Product
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Qnty
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Amount
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in stockList"
                :key="item.id"
                class="w-full"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.qnty }}</td>
                <td>{{ item.qnty * item.cost }}</td>
                <td class=" px-0">
                  <Icon name="typcn:delete" color="red" size="28" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </v-container>

    <div class="h-fit w-full absolute bottom-0 !w-full !px-10 py-6 ">
      <v-btn color="primary" size="x-large" class=" !w-full " :loading="saveLoading" rounded @click="save()">
        ADD TO STOCK
      </v-btn>
    </div>
  </v-main>
</template>
