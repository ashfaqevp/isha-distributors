<script setup>
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const route = useRoute()
const router = useRouter()

const { shop_id } = route?.query

const productQnty = ref(null)

const selectedProduct = ref(null)
const selectedPrice = ref(null)

const productList = ref([
  { id: 32, name: 'Peda', price: 50, purchase_price: 50, price_b: 30, price_c: 35, group: 'sweets' },
  { id: 42, name: 'Curd', price: 50, purchase_price: 50, price_b: 30, price_c: 35, group: 'sweets' },
  { id: 72, name: 'Lassi', price: 50, purchase_price: 50, price_b: 30, price_c: 35, group: 'sweets' },
  { id: 31, name: 'Sugar', price: 50, purchase_price: 50, price_b: 30, price_c: 35, group: 'sweets' },
])

const priceList = computed(() => {
  const prices = ['price', 'price_b', 'price_c']
  if (selectedProduct.value) {
    selectedPrice.value = selectedProduct.value?.price
    return prices.map(key => selectedProduct?.value[key])
  }
})

const productTotal = computed(() => {
  if (selectedProduct.value) {
    const qnty = productQnty.value ? productQnty.value : 1
    return selectedPrice.value * qnty
  }
})

const purchaseList = ref([])

function addProduct() {
  const purchaseItem = {
    product: selectedProduct.value.name,
    price: selectedPrice.value,
    qnty: productQnty.value || 1,
    total: productTotal.value,
  }

  purchaseList.value.push(purchaseItem)
  selectedProduct.value = {}
  productQnty.value = null
}

function deletePurchaseItem(idx) {
  purchaseList.value.splice(idx, 1)
}

const total = computed(() => {
  if (purchaseList?.value?.length)
    return purchaseList?.value.reduce((total, item) => total + item.total, 0)
})

const today = new Date()
const date = today.toISOString().split('T')[0]

async function addToBill() {
  try {
    // const dbRef = collection(db, "Bill")
    const billRef = doc(db, 'bills', date)
    const dbRef = collection(billRef, shop_id)

    for (const item of purchaseList.value) {
      await addDoc(dbRef, item)
      console.log('Document written:', item)
      gotoShop()
    }
    // const addedDocRef = await addDoc(dbRef, )
  }
  catch (e) {
    alert('Error!')
    console.error(e)
  }
}

function gotoShop() {
  router.push({ path: '/shops/shop', query: { id: shop_id } })
}
</script>

<template>
  <div class="h-full relative flex flex-col gap-3">
    <div class="flex flex-col gap-3 p-3 w-full border-[1px] items-center">
      <div class="flex gap-5 w-full">
        <div class="flex flex-col w-full">
          <label>Product :</label>
          <select v-model="selectedProduct" placeholder="fhewjr" class="border rounded p-2">
            <option value="" disabled>
              Select an option
            </option>
            <option v-for="product in productList" :key="product.id" :value="product">
              {{ product.name }}
            </option>
          </select>
        </div>

        <div class="flex flex-col w-60 ">
          <label>Price :</label>
          <select v-model="selectedPrice" class="border rounded p-2">
            <option v-for="price in priceList" :key="price" :value="price">
              {{ price }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex gap-4 w-full ">
        <div class="flex flex-col w-fit items-center w-50 ">
          <BaseInput v-model="productQnty" placeholder="Qnty" type="number" />
        </div>
        <div class="flex flex-col w-full ">
          <BaseInput v-model="productTotal" placeholder="Total" class="w-full" readonly type="number" />
        </div>
        <BaseButton class="w-full text-[22px]" @click="addProduct">
          +
        </BaseButton>
      </div>
    </div>

    <div class="min-h-[100px] border">
      <table class="table w-full ">
        <!-- <thead class="w-full">
                    <tr class="">
                        <th class="w-10">ID</th>
                        <th>Name</th>

                    </tr>
                </thead> -->
        <tbody>
          <tr v-for="(item, index) in purchaseList" :key="index" class="flex gap-2 w-full border-1 bg-gray-100">
            <td class="w-10">
              {{ index + 1 }}
            </td>
            <td class="w-20">
              {{ item.product }}
            </td>
            <td class="w-15 bg-red-200">
              {{ item.price }}
            </td>
            <td class="w-10 ">
              {{ item.qnty }}
            </td>
            <td class="w-20 bg-yellow-100">
              {{ item.total }}
            </td>
            <td>
              <button class="bg-red-100 text-red-500 p-1 px-2" @click="deletePurchaseItem(index)">
                X
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-between w-full absolute bottom-5">
      <span>Total : {{ total }}</span>

      <BaseButton class="min-w-[100px]" @click="addToBill">
        SAVE
      </BaseButton>
    </div>
  </div>
</template>
