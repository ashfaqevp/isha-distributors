<script setup>
import { collection, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const router = useRouter()

const loading = ref(false)

async function fetchNewStock() {
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
}

onMounted (async () => {
  await fetchNewStock()
  // other functions
})

const tab = ref(null)
const allTabs = ['Current', 'New', 'Damaged']

function openAdd() {
  router.push({ path: '/stocks/new' })
}
</script>

<template>
  <v-app-bar
    class="px-0"
    color="primary"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="24" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        Stocks
      </v-app-bar-title>
    </div>

    <template #append>
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
            {{ item }}
          </v-tab>
        </v-tabs>
      </div>
    </template>
  </v-app-bar>
  <!-- <v-window v-model="tab">
    <v-window-item value="Current">
      One
    </v-window-item>

    <v-window-item value="two">
      Two
    </v-window-item>

    <v-window-item value="three">
      Three
    </v-window-item>
  </v-window> -->

  <!-- <div>
    jhew
  </div>

  {{ 'tab' }} -->

  <v-main class="bg-gray-50 h-screen ">
    <!-- <v-container v-if="loading" fluid>
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </v-container> -->

    <v-window v-model="tab">
      <v-window-item value="Current">
        <StocksCurrent />
      </v-window-item>

      <v-window-item value="New">
        Two
      </v-window-item>

      <v-window-item value="Damaged">
        Three
      </v-window-item>
    </v-window>

    <!-- <v-container fluid>
      <div>
        {{ tab }}
      </div>
    </v-container> -->
  </v-main>
</template>
