<script setup>
// import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
// const { db } = useFirebaseStore()
const router = useRouter()

const tab = ref(null)
const allTabs = ['Current', 'Today', 'Damaged']

function openAdd() {
  if (tab.value === 'Damaged')
    router.push({ path: '/stocks/new-damage' })
  else
    router.push({ path: '/stocks/new' })
}

// async function fetchProducts() {
//   loading.value = true
//   try {
//     const querySnapshot = await getDocs(collection(db, 'products'))
//     productList.value = querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }))
//   }
//   catch (error) {
//     console.error('Error fetching data:', error)
//   }

//   finally {
//     loading.value = false
//   }
// }

// async function fetchCurrentStock() {
//   loading.value = true
//   try {
//     const docRef = doc(db, 'stocks', 'current')
//     const docSnapshot = await getDoc(docRef)
//     if (docSnapshot.exists())
//       currentStocks.value = docSnapshot.data()
//   }
//   catch (error) {
//     console.error('Error fetching current stock:', error)
//   }
//   finally {
//     loading.value = false
//   }
// }

onMounted (async () => {
  // await fetchProducts()
  // await fetchCurrentStock()
})

// TODO: NEED TO FETCH ALL PRODUCTS AND CURRENT STOCK FROM HERE AND UPDATE WHILE DELETING STOCK
</script>

<template>
  <v-app-bar
    class="px-0"
  >
    <div class="flex justify-left w-full ml-6">
      <v-app-bar-title>
        <span class=" font-bold text-xl  ">
          Stocks
        </span>
      </v-app-bar-title>
    </div>

    <template #append>
      <v-app-bar-nav-icon>
        <Icon name="ic:outline-history" size="24" />
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon @click="openAdd">
        <Icon name="gg:add" size="24" />
      </v-app-bar-nav-icon>
    </template>

    <template #extension>
      <div class="w-full px-0">
        <v-tabs
          v-model="tab"
          align-tabs="title"
        >
          <v-tab
            v-for="item in allTabs"
            :key="item"
            :value="item"
          >
            <span :class=" tab === item ? 'font-semibold ' : ''">
              {{ item }}
            </span>
          </v-tab>
        </v-tabs>
      </div>
    </template>
  </v-app-bar>

  <v-main class="bg-gray-50 h-screen ">
    <v-window v-model="tab" color="primary">
      <v-window-item value="Current">
        <StocksCurrent />
      </v-window-item>

      <v-window-item value="Today">
        <StocksToday />
      </v-window-item>

      <v-window-item value="Damaged">
        <StocksDamaged />
      </v-window-item>
    </v-window>
  </v-main>
</template>
