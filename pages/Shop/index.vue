<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()
const router = useRouter()

const { formatAsCurrency } = useUtils()

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

const direction = ref('top')
const fab = ref(false)
const fling = ref(false)
const hover = ref(false)
const tabs = ref(null)
const top = ref(false)
const right = ref(true)
const bottom = ref(true)
const left = ref(false)
const transition = 'slide-y-reverse-transition'

const activeFab = computed(() => {
  switch (tabs.value) {
    case 'one': return { class: 'purple', icon: 'account_circle' }
    case 'two': return { class: 'red', icon: 'edit' }
    case 'three': return { class: 'green', icon: 'keyboard_arrow_up' }
    default: return {}
  }
})

watch(top, (val) => {
  bottom.value = !val
})

watch(right, (val) => {
  left.value = !val
})

watch(bottom, (val) => {
  top.value = !val
})

watch(left, (val) => {
  right.value = !val
})
</script>

<template>
  <v-app-bar
    class="px-0 !z-20 pb-10"
    color="primary"
    density="default"
  >
    <template #prepend>
      <v-app-bar-nav-icon class="mx-0">
        <Icon name="eva:arrow-back-outline" size="22" @click="router.back()" />
      </v-app-bar-nav-icon>
    </template>

    <div class="flex justify-left w-full">
      <v-app-bar-title>
        Melethil Store
      </v-app-bar-title>
    </div>

    <template #append>
      <!-- <v-app-bar-nav-icon @click="openSearch = true">
        <Icon name="gg:search" size="22" />
      </v-app-bar-nav-icon> -->
      <v-app-bar-nav-icon @click="openAddProduct = true ">
        <Icon name="icon-park-outline:more-one" size="28" />
      </v-app-bar-nav-icon>
    </template>

    <!-- <template #extension>
      <div>
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
    </template> -->
  </v-app-bar>

  <div class="z-30 sticky top-[70px] px-4">
    <v-card class=" ">
      <v-card-text>
        <div class="b!h-[100px] w-full flex items-center">
          <div class="w-full !pr-2  ">
            <p class="font-semibold text-gray-400 text-sm">
              Pending
            </p>
            <p class="py-1 font-bold text-red-600 text-lg">
              {{ formatAsCurrency(shop?.pending || 345345) }}
            </p>
          </div>
          <div class="h-[70px] border-r-[1px] border-gray-300" />

          <div class=" w-full !pl-2 !h-full">
            djh
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>

  <v-main class="bg-gray-50 h-screen">
    <!-- <v-container v-if="loading" fluid>
      <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
      absolute -top-10
    </v-container> -->

    <v-container fluid>
      <v-card class="mt-3">
        <v-card-item>
          <v-card-title>Today</v-card-title>

          <v-card-subtitle>This is a subtitle</v-card-subtitle>
        </v-card-item>

        <v-card-text>
          This is content
        </v-card-text>
      </v-card>

      <v-card class="mt-3 ">
        <v-card-item>
          <v-card-title>Yesterday</v-card-title>

          <v-card-subtitle>This is a subtitle</v-card-subtitle>
        </v-card-item>

        <v-card-text>
          This is content

          <v-btn
            absolute
            dark
            fab
            rounded
            color="pink"
          >
            <Icon name="gg:add" />
          </v-btn>
        </v-card-text>
      </v-card>

      <v-speed-dial
        v-model="fab"
        :top="top"
        :bottom="bottom"
        :right="right"
        :left="left"
        direction="top"
        :open-on-hover="false"
        transition="slide-y-reverse-transition"
      >
        345235
      </v-speed-dial>
    </v-container>
  </v-main>

  <div id="" class="bg-red-100  px-20 !h-30 mt-50 bottom-10">
    {{ fab }}

    <span class=" absolute right-1 text-end ">
      <v-btn
        v-model="fab"
        color="blue darken-2"
        dark
        fab
      >
        23
      </v-btn>

      <v-menu
        activator="parent" width="100px" class="!w-[50px]"
        transition="slide-y-reverse-transition"
      >
        <v-btn
          fab
          dark
          small
          color="green"
        >
          33
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="indigo"
        >
          44
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="red"
        >
          66
        </v-btn>
      </v-menu>
    </span>

    <v-card id="create">
      <v-speed-dial
        v-model="fab"
        :top="top"
        :bottom="bottom"
        :right="right"
        :left="left"
        direction="top"
        :open-on-hover="false"
        transition="slide-y-reverse-transition"
      >
        <template #activator>
          {{ 'whfj' }}
          <v-btn
            v-model="fab"
            color="blue darken-2"
            dark
            fab
          >
            2
          </v-btn>
        </template>
        <v-btn
          fab
          dark
          small
          color="green"
        >
          33
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="indigo"
        >
          44
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="red"
        >
          66
        </v-btn>
      </v-speed-dial>
    </v-card>
  </div>

  <!-- <div class="h-full relative flex flex-col gap-3">
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
  </div> -->
</template>

<style>
  /* This is for documentation purposes and will not be needed in your application */
  #create .v-speed-dial {
    position: absolute;
  }

  #create .v-btn--floating {
    position: relative;
  }
</style>
