<script setup>
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const route = useRoute()
const router = useRouter()
const { formatAsCurrency } = useUtils()
const { setToast } = useMainStore()

const { shop_id } = route?.query

const today = new Date()
const date = today.toISOString().split('T')[0]

const form = ref()
const shop = ref({})
const loading = ref(false)
const saveLoading = ref(false)
const body = ref({})
const productList = ref([])
const purchaseList = ref([])
const currentStockList = ref({})

async function fetchShop() {
  try {
    const docRef = doc(db, 'shops', shop_id)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      shop.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

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

async function fetchCurrentStock() {
  loading.value = true
  try {
    const docRef = doc(db, 'stocks', 'current')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      currentStockList.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    loading.value = false
  }
}

const priceList = computed(() => {
  const prices = ['price_a', 'price_b', 'price_c', 'price_d']
  if (body.value?.product?.id) {
    body.value.price = body.value?.product.price_a
    return prices.map(key => body.value?.product[key])
  }
})

const creditBalance = computed(() => {
  const pending = shop.value?.pending || 0
  const creditLimit = shop.value?.credit_limit || 5000
  return creditLimit - pending
})

const total = computed(() => {
  if (purchaseList?.value?.length)
    return purchaseList?.value.reduce((total, item) => total + item.total, 0)
  else return 0
})

const currentStock = computed(() => {
  const newStocks = { ...currentStockList.value }
  purchaseList.value.forEach((item) => {
    const { product_id, qnty } = item
    if (newStocks[product_id] !== undefined)
      newStocks[product_id] = (Number.parseInt(newStocks[product_id], 10) - Number.parseInt(qnty, 10))
    else
      newStocks[product_id] = (0 - qnty)
  })
  return newStocks || {}
})

async function addProduct() {
  const { valid } = await form.value.validate()

  if (!valid) {
    setToast(true, 'Complete all required fields', 'error')
    return
  }

  if (creditBalance.value < (total.value + (body.value.qnty * body.value.price))) {
    setToast(true, 'Insuffisient credit balance', 'error')
    return
  }

  const purchaseItem = {
    product_id: body.value.product.id,
    name: body.value.product.name,
    price: body.value.price,
    qnty: body.value.qnty || 1,
    total: body.value.price * body.value.qnty,
  }

  purchaseList.value.push(purchaseItem)
  body.value = {}
}

// SAVING THE DATA
async function save() {
  saveLoading.value = true
  try {
    const billDbRef = doc(db, 'bills', date)
    const billRef = collection(billDbRef, shop_id)

    const currentRef = doc(db, 'stocks', 'current')

    const shopRef = doc(db, 'shops', shop_id)

    // update bill
    for (const item of purchaseList.value) {
      const productItem = item
      await addDoc(billRef, productItem)
    }

    // update stock
    await setDoc(currentRef, currentStock.value, { merge: true })

    // update shop details
    const newShopDetails = { pending: (shop.value?.pending + total.value), last_update: date }
    await setDoc(shopRef, newShopDetails, { merge: true })

    saveLoading.value = false
    setToast(true, 'Bill added to shop successfully', 'success')
    router.push({ path: '/shop', query: { id: shop_id } })
  }
  catch (error) {
    console.error('An error occurred:', error)
    saveLoading.value = false
    setToast(true, 'Bill not Saved', 'error')
  }
}

onMounted (async () => {
  await fetchShop()
  await fetchProducts()
  await fetchCurrentStock()
})

// #495372
</script>

<template>
  <v-app-bar
    class="px-0 "
    color="#495372"
    :elevation="0"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="24" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        <span class="  font-semibold">
          {{ shop?.name || 'New Bill' }}
        </span>
      </v-app-bar-title>
    </div>

    <template #append>
      <v-app-bar-title>
        <div v-if="shop?.name?.length" class="flex flex-col h-15 gap-y-1">
          <p class="opacity-50 text-[10px] h-4 ">
            Credit Balance
          </p>
          <span class=" !text-[16px] font-semibold">
            {{ formatAsCurrency(creditBalance - (total || 0)) }}
          </span>
        </div>
      </v-app-bar-title>
    </template>
  </v-app-bar>

  <!-- <div class="relative h-full"> -->
  <v-main class="bg-gray-50 ">
    <v-sheet width="full" color="#495372" class="!w-full !h-fit  pb-3 " :elevation="10">
      <v-form ref="form" class="">
        <div class="py-2 grid grid-cols-6 gap-4 px-3 !gap-y-[18px]">
          <v-autocomplete
            v-model="body.product"
            :items="productList"
            class="!h-[48px] col-span-4 !brightness-80 "
            label="Product"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            item-title="name"
            return-object
            density="comfortable"
          />

          <v-select
            v-model="body.price"
            :items="priceList"
            class="!h-[48px] col-span-2 !brightness-80 "
            label="Price"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            item-title="name"
            density="comfortable"
          />

          <v-text-field
            v-model="body.qnty"
            label="Qnty"
            type="number"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            class="!h-[48px] col-span-2 "
            density="comfortable"
          />

          <v-text-field
            :model-value=" formatAsCurrency((body.qnty * body.price) || 0)"
            readonly
            label="Total"
            :rules="[v => !!v || '']"
            variant="outlined"
            required
            class="!h-[48px] col-span-3"
            density="comfortable"
          />

          <v-btn
            color="primary"
            size="small"
            rounded
            class=" !h-[50px] !w-[50px] bg-white col-span-1 "
            :class="(!body?.product?.id?.length || !body?.qnty?.length) ? '!opacity-50 ' : '!opacity-100'"
            :disabled="saveLoading || loading "
            @click=" addProduct"
          >
            <Icon name="material-symbols:add" size="36" class="text-[#495372]" />
          </v-btn>
        </div>
      </v-form>
    </v-sheet>
    <v-container fluid>
      <div class="flex flex-col !px-0">
        <div v-if="purchaseList?.length" class="!h-full !shadow-md !rounded-[10px] ">
          <v-table
            fixed-header
          >
            <thead class="">
              <tr class="">
                <!-- <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  No
                </th> -->
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold flex items-center gap-x-1.5">
                  <span class="!w-6">
                    No
                  </span>
                  <span>
                    Product
                  </span>
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold !w-fit">
                  <span>
                    Qnty
                  </span>
                  <!-- <span class="">
                    Qty
                  </span> -->
                </th>
                <th class="text-left !bg-[#8f9bc4] text-white !font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in purchaseList"
                :key="item.id"
                class="w-full"
              >
                <td class="text-sm flex items-center  ">
                  <span class="!w-8 font-semibold  ">
                    {{ index + 1 }}
                  </span>
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

                  <span class=" absolute right-2.5 text-end ">
                    <button @click=" purchaseList.splice(index, 1)">
                      <Icon name="typcn:minus" color="red" size="19" class="bg-red-100 rounded-full p-[3px] " />
                    </button>
                  </span>
                </td>
                <!-- <td class=" px-0" @click="stockList.splice(index, 1)" /> -->
              </tr>
            </tbody>
          </v-table>
        </div>

        <div v-else class="w-full flex items-center justify-center !h-[300px] rounded-[10px]">
          No Data !
        </div>
      </div>
    </v-container>
  </v-main>

  <div class="h-fit w-full sticky !bottom-0 !w-full !px-10 py-6 ">
    <v-btn color="#495372" size="x-large" class=" !w-full !text-sm !font-bold" :loading="saveLoading" rounded @click="save()">
      <span class="mr-4">
        {{ 'BILL' }}
      </span>
      <span class="text-sm !font-semibold">
        {{ `${formatAsCurrency(total || 0)}` }}
      </span>
    </v-btn>
  </div>
</template>
