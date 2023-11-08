<script setup>
import { collection, getDocs } from 'firebase/firestore'

definePageMeta({
  layout: 'default',
})

const { db } = useFirebaseStore()
const router = useRouter()

function goToAddShop() {
  router.push('/shops/add')
}

function goToShop(id) {
  router.push({ path: '/shop', query: { id } })
}

const shopList = ref([])

async function fetchData() {
  try {
    const querySnapshot = await getDocs(collection(db, 'shops'))
    shopList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted (async () => {
  await fetchData()
  // other functions
})
</script>

<template>
  <div class="flex flex-col w-full h-full relative">
    <div class="border my-3">
      <input class="w-full px-2 py-1 rounded " placeholder="search">
    </div>

    <div class=" flex flex-col gap-5">
      <div v-for="(shop, index) in shopList" :key="index" class=" border rounded-[12px] bg-white p-2 shadow-md hover:shadow-md" @click="goToShop(shop.id)">
        <div class="flex justify-between gap-2">
          <div>
            <div class="w-10 h-10 bg-gray-100 rounded-[50%]" />
          </div>
          <div class=" w-full flex flex-col">
            <span>{{ shop.name }}</span>
            <span class="text-gray-200 text-[12px]">{{ shop.place }}</span>
          </div>
          <div>
            <span class="text-red-500">{{ shop.pending }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end absolute bottom-0 w-full p-5">
      <button class="bg-blue-500 text-white font-semibold rounded-[8px] px-2 py-1" @click="goToAddShop">
        ADD +
      </button>
    </div>
  </div>
</template>
