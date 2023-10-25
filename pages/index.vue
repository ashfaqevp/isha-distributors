<script setup>
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()

const billList = ref([])

// const fetchData = async () => {
//     try {
//         const querySnapshot = await getDocs(collection(db, 'Bill'));
//         billList.value = querySnapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data(),
//         }));
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// };

// onMounted (async () => {
//     await fetchData();
//     //other functions
// })

const router = useRouter()

function gotoShops() {
  router.push({ path: '/shops' })
}

function goToProducts() {
  router.push({ path: '/products' })
}
function gotoStocks() {
  router.push({ path: '/stocks' })
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-5">
      <BaseButton class="h-[60px]" @click="gotoShops">
        SHOPS
      </BaseButton>

      <BaseButton class="h-[60px]" @click="goToProducts">
        PRODUCTS
      </BaseButton>

      <BaseButton class="h-[60px]" @click="gotoStocks">
        STOCK
      </BaseButton>

      <BaseButton class="h-[60px]" @click="gotoShops">
        REPORT
      </BaseButton>
    </div>
  </div>
</template>
