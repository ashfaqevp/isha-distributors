<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const router = useRouter()

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
    else
      console.log('Document does not exist')
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

const todayPurchaseList = ref([])

const today = new Date()
const date = today.toISOString().split('T')[0]

async function fetchTodayPurchase() {
  try {
    const billRef = doc(db, 'bills', date)
    const dbRef = collection(billRef, id)
    const querySnapshot = await getDocs(dbRef)
    todayPurchaseList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted (async () => {
  await fetchShop()
  await fetchTodayPurchase()
  // other functions
})
</script>

<template>
  <div class="h-full relative flex flex-col gap-3">
    <div class="border">
      {{ shop }}
    </div>

    <div class="border">
      {{ todayPurchaseList }}
    </div>

    <div class="absolute w-full bottom-5 flex justify-end">
      <BaseButton class="w-[100px]" @click="goToBill">
        BILL
      </BaseButton>
    </div>
  </div>
</template>
