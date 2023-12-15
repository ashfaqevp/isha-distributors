<script setup>
import moment from 'moment'
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const route = useRoute()
const router = useRouter()
const { formatAsCurrency, formatColor, formatAvatar, today, shopCategories } = useUtils()
const { setToast } = useMainStore()

const { shop_id } = route?.query

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
    if (shop.value?.type === shopCategories[3])
      body.value.price = body.value?.product.price_d

    else if (shop.value?.type === shopCategories[2])
      body.value.price = body.value?.product.price_c

    else if (shop.value?.type === shopCategories[1])
      body.value.price = body.value?.product.price_b

    else
      body.value.price = body.value?.product.price_a

    return prices.map(key => body.value?.product[key])
  }
})

const creditBalance = computed(() => {
  const pending = shop.value?.pending || 0
  const creditLimit = 100000
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
    cost: body.value.product.cost,
    total: body.value.price * body.value.qnty,
  }

  purchaseList.value.push(purchaseItem)
  const divElement = document.getElementById('table-list')
  tableHeight.value = divElement?.offsetHeight + 40
  console.log(tableHeight.value)
  body.value = {}
}

// SAVING THE DATA
async function save() {
  saveLoading.value = true
  try {
    const billDbRef = doc(db, 'bills', today)
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
    const shopUpdated = { pending: ((Number.parseInt(shop.value?.pending, 10) + Number.parseInt(total.value, 10))), last_update: today }
    if (shop.value?.last_update?.length && shop.value?.last_update !== today)
      shopUpdated.prev_update = shop.value?.last_update
    await setDoc(shopRef, shopUpdated, { merge: true })

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

const tableHeight = ref(0)
const screenHeight = ref(0)

onMounted (async () => {
  await fetchShop()
  await fetchProducts()
  await fetchCurrentStock()

  screenHeight.value = window?.screen?.height
  const divElement = document.getElementById('table-list')
  tableHeight.value = divElement?.offsetHeight
})

// #495372
</script>

<template>
  <v-app-bar
    class="px-0 "
    :elevation="0"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="24" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        <v-avatar :color="formatColor(shop?.type)" size="42">
          <span class="font-bold text-[18px]">

            {{ formatAvatar(shop?.name || '') }}
          </span>
        </v-avatar>
        <span class=" !font-semibold !text-xl ml-2 ">
          {{ shop?.name || '' }}
          <!-- {{ tableHeight }} -->
        </span>
      </v-app-bar-title>
    </div>

    <template #append>
      <v-app-bar-title>
        <div v-if="shop?.name?.length" class="flex flex-col h-15 gap-y-1 mr-3">
          <p class="opacity-50 text-[10px] h-4 ">
            Credit Balance
          </p>
          <span class=" !text-[14px] font-bold text-indigo  font-semibold">
            {{ formatAsCurrency(creditBalance - (total || 0)) }}
          </span>
        </div>
      </v-app-bar-title>
    </template>
  </v-app-bar>

  <div class="z-30 sticky top-[63px] ">
    <v-sheet width="full" elevation="2" class="!w-full !h-fit  pb-3 ">
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
            size="small"
            rounded
            class=" !h-[50px] !w-[50px] !bg-secondary  col-span-1 "
            :class="(!body?.product?.id?.length || !body?.qnty?.length) ? '!opacity-50 ' : '!opacity-100 !text-white'"
            :disabled="saveLoading || loading "
            @click=" addProduct"
          >
            <Icon name="material-symbols:add" size="36" class="text-white" />
          </v-btn>
        </div>
      </v-form>
    </v-sheet>
  </div>

  <!-- <div class="relative h-full"> -->
  <v-main class="bg-gray-50 h-full ">
    <v-container fluid>
      <!-- <div class="flex flex-col h-full !px-0  " :class="`!h-[${700}px]`"> -->
      <div class="flex flex-col h-full !px-0  ">
        <div v-show="purchaseList?.length" id="table-list" class="!h-full !shadow-md !rounded-[10px] !bg-red mb-[68px] ">
          <v-table
            fixed-header
            :height="tableHeight > (screenHeight - 460) ? `${screenHeight - 460}px` : ''"
          >
            <thead class="">
              <tr class="text-sm">
                <th class="text-left !bg-primary text-white !font-semibold flex items-center gap-x-1.5">
                  <span class="!w-6">
                    No
                  </span>
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
              <!-- v-for="(item, index) in purchaseList" -->
              <!-- v-for="(item, index) in [...purchaseList, ...purchaseList, ...purchaseList, ...purchaseList]" -->
              <tr
                v-for="(item, index) in purchaseList"
                :key="item.id"
                class="w-full"
              >
                <td class="text-xs flex items-center  ">
                  <span class="!w-8   ">
                    {{ index + 1 }}
                  </span>
                  <span class="w-full font-semibold">
                    {{ item.name }}
                  </span>
                </td>
                <td class="text-xs w-fit gap-x-3 ">
                  <span class="font-semibold mr-3 "> {{ item.qnty }}</span>
                  <span class="font-100 !text-xs text-gray-400">x{{ item.price }}</span>
                </td>
                <td class=" text-start text-xs  !min-w-[130px] items-end relative  ">
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

        <!-- <div v-else class="w-full flex items-center justify-center !h-[300px] rounded-[10px]">
          No Data !
        </div> -->

        <div v-if="!purchaseList?.length" class="!h-full flex items-center">
          <ImagesNoData class="!scale-20 relative bottom-1" />
        </div>
      </div>
      <!-- </v-container>
    <CoreNavSpacer /> -->
    </v-container>
  </v-main>

  <div class="h-fit w-full !fixed !bottom-[76px]   !w-full !px-10  ">
    <v-btn :disabled="!purchaseList?.length" size="x-large" class="!text-white !w-full !text-sm !font-semibold !bg-secondary" :loading="saveLoading" rounded @click="save()">
      <span class="mr-4">
        {{ 'BILL' }}
      </span>
      <span class="text-sm !font-semibold">
        {{ `${formatAsCurrency(total || 0)}` }}
      </span>
    </v-btn>
  </div>

  <BaseOverlay v-if="saveLoading" />
</template>
