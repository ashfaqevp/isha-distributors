<script setup>
import moment from 'moment'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()
const { setToast } = useMainStore()

const lastUpdated = ref('')
const loading = ref(false)
const shopList = ref([])
const stockList = ref({})

async function fetchPending() {
  try {
    const querySnapshot = await getDocs(collection(db, 'shops'))
    shopList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      pending: doc.data().pending,
    }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

async function fetchStocks() {
  // loading.value = true
  try {
    const docRef = doc(db, 'stocks', 'current')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      stockList.value = docSnapshot.data()
  }
  catch (error) {
    console.error('Error fetching current stock:', error)
  }
  finally {
    // loading.value = false
  }
}

async function checkAndUpdate() {
  let i = 1
  while (i < 5) {
    const date = moment()
    const currentDate = await date.subtract(i, 'days').format('YYYY-MM-DD')

    if (currentDate !== lastUpdated.value) {
      loading.value = true
      try {
        const pendingRef = doc(db, 'pending_history', currentDate)
        await fetchPending()
        const allPendings = await shopList.value.reduce((acc, item) => {
          const parsedPending = Number(item.pending) // Convert pending to number
          acc[item.id] = !isNaN(parsedPending) ? parsedPending : 0 // Set NaN to 0
          return acc
        }, {})
        await setDoc(pendingRef, allPendings)

        const stockRef = doc(db, 'stock_history', currentDate)
        await fetchStocks()
        await setDoc(stockRef, stockList.value)

        loading.value = false
      }
      catch (error) {
        console.error('An error occurred:', error)
        loading.value = false
        setToast(true, 'App not updated', 'error')
      }
    }
    else {
      break
    }
    i++
  }
  const date = moment()
  const yesterday = await date.subtract(1, 'days').format('YYYY-MM-DD')
  if (yesterday !== lastUpdated.value) {
    const updateRef = doc(db, 'others', 'last_updated')
    const updatedDate = { date: yesterday }
    await setDoc(updateRef, updatedDate)
    await fetchData()
  }
  loading.value = false
}

async function fetchData() {
  try {
    const docRef = doc(db, 'others', 'last_updated')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      lastUpdated.value = docSnapshot.data().date
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
}

onMounted (async () => {
  await fetchData()
  await checkAndUpdate()
  document.addEventListener('visibilitychange', checkAndUpdate)
})
</script>

<template>
  <div>
    <div v-if="loading" class="relative">
      <div class="overlay">
        <Icon name="eos-icons:loading" size="62" class="text-primary" />
      </div>
    </div>

    <VitePwaManifest />
    <v-app>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <BaseToast />
    </v-app>
  </div>
</template>
