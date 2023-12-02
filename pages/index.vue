<script setup>
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()

const billList = ref([])

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

function gotoReports() {
  router.push({ path: '/reports' })
}

function gotoCollection() {
  router.push({ path: '/collection' })
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-5">
      <BaseButton class="h-[60px]" @click="gotoShops">
        SHOPS
      </BaseButton>

      <BaseButton class="h-[60px]" @click="gotoCollection">
        COLLECTION
      </BaseButton>

      <BaseButton class="h-[60px]" @click="goToProducts">
        PRODUCTS
      </BaseButton>

      <BaseButton class="h-[60px]" @click="gotoStocks">
        STOCK
      </BaseButton>

      <BaseButton class="h-[60px]" @click="gotoReports">
        REPORT
      </BaseButton>
    </div>
  </div>
</template>
