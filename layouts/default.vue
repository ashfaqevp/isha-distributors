<script setup>
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

const { firestoreDB, auth } = useFirebaseStore()

const router = useRouter()
const selectedItem = ref(2)

const loading = ref(false)
const adminList = ref([])
const isAdmin = ref(false)

async function fetchAdmins() {
  try {
    loading.value = true
    const docRef = doc(firestoreDB, 'users', 'admins')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      adminList.value = docSnapshot.data().admin_list || []

      const email = auth?.currentUser?.email
      const emailMatches = adminList.value.includes(email)

      if (emailMatches)
        isAdmin.value = true
    }
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
  finally {
    loading.value = false
  }
}

function navigate(route) {
  router.push({ path: route })
}

watch(() => router, () => {
  const path = router.currentRoute.value?.path
  console.log(path)

  switch (path) {
    case '/shops' :
      selectedItem.value = 2
      return

    case '/bill' :
      selectedItem.value = 2
      return

    case '/shop' :
      selectedItem.value = 2
      return

    case '/reports' :
      selectedItem.value = 0
      return

    case '/collection' :
      selectedItem.value = 1
      return

    case '/stocks' :
      selectedItem.value = 3
      return

    case '/products' :
      selectedItem.value = 4
      return

    case '/profile' :
      selectedItem.value = 4
      return

    case '/places' :
      selectedItem.value = 4
      return

    case '/users' :
      selectedItem.value = 4
      return

    default:
      selectedItem.value = 2
  }
}, { deep: true, immediate: true })

onMounted (async () => {
  await fetchAdmins()
})
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 relative ">
    <!-- <v-main> -->
    <div class="  h-full !mb-10 !absolute !botoom-[100px] w-full " :style="{ marginBottom: '200px' }">
      <slot />

      <v-bottom-navigation v-model="selectedItem" height="60" class="!bg-gray-50 px-30" color="white">
        <v-btn :active="selectedItem === 0" @click="navigate('/reports')">
          <Icon :name=" selectedItem === 0 ? 'bxs:bar-chart-square' : 'bx:bar-chart-square'" :class="selectedItem === 0 ? '!text-primary text-[32px]' : 'text-[25px]'" />
        </v-btn>

        <v-btn :active="selectedItem === 1" @click="navigate('/collection')">
          <Icon :name=" selectedItem === 1 ? 'fluent:money-24-filled' : 'fluent:money-24-regular'" :class="selectedItem === 1 ? '!text-primary text-[38px]' : 'text-[28px]'" />
        </v-btn>

        <v-btn :active="selectedItem === 2" @click="navigate('/shops')">
          <Icon :name=" selectedItem === 2 ? 'icon-park-solid:shop' : 'icon-park-outline:shop'" :class="selectedItem === 2 ? '!text-primary text-[30px]' : 'text-[22px]'" />
        </v-btn>

        <v-btn :active="selectedItem === 3" @click="navigate('/stocks')">
          <Icon :name=" selectedItem === 3 ? 'material-symbols:list-alt' : 'material-symbols:list-alt-outline'" :class="selectedItem === 3 ? '!text-primary text-[32px]' : 'text-[26px]'" />
        </v-btn>

        <v-btn :active="selectedItem === 4" @click="selectedItem = 4">
          <v-menu activator="parent" width="180px" class="!w-[50px]" :persistent="selectedItem === 4">
            <v-list>
              <v-list-item :class="router.currentRoute.value?.path === '/profile' ? 'text-primary font-semibold' : ''" @click="navigate('/profile')">
                <template #append>
                  <Icon name="iconamoon:profile-fill" size="24" />
                </template>
                <v-list-item-title>
                  Profile
                </v-list-item-title>
              </v-list-item>

              <hr>

              <div v-if="isAdmin">
                <v-list-item :class="router.currentRoute.value?.path === '/users' ? 'text-primary font-semibold' : ''" @click="navigate('/users')">
                  <template #append>
                    <Icon name="mdi:users" size="27" />
                  </template>
                  <v-list-item-title>
                    Users
                  </v-list-item-title>
                </v-list-item>

                <hr>
              </div>

              <v-list-item :class="router.currentRoute.value?.path === '/places' ? 'text-primary font-semibold' : ''" @click="navigate('/places')">
                <template #append>
                  <Icon name="ic:baseline-place" size="26" />
                </template>
                <v-list-item-title>
                  Places
                </v-list-item-title>
              </v-list-item>

              <hr>

              <v-list-item :class="router.currentRoute.value?.path === '/products' ? 'text-primary font-semibold' : ''" @click="navigate('/products')">
                <template #append>
                  <Icon name="ep:menu" size="24" />
                </template>
                <v-list-item-title>
                  Products
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <Icon :name=" selectedItem === 4 ? 'mingcute:more-3-fill' : 'mingcute:more-3-line'" :class="selectedItem === 4 ? '!text-primary text-[34px]' : 'text-[26px]'" />
        </v-btn>
      </v-bottom-navigation>
    </div>
  </div>
</template>
