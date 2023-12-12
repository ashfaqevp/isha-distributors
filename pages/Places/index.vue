<script setup>
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

const { db } = useFirebaseStore()

const shopList = ref([])
const placesList = ref([])

const selectedIndex = ref(0)

const openAddPlace = ref(false)
const openDeletePlace = ref(false)

const loading = ref(false)

async function fetchShops() {
  try {
    loading.value = true
    const querySnapshot = await getDocs(collection(db, 'shops'))
    shopList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
  finally {
    loading.value = false
  }
}

async function fetchPlaces() {
  try {
    loading.value = true
    const docRef = doc(db, 'others', 'places')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      placesList.value = docSnapshot.data().place_list || []
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
  finally {
    loading.value = false
  }
}

function getShopCount(place) {
  const count = shopList.value?.filter(item => item.place === place).length
  return count
}

onMounted (async () => {
  loading.value = true
  await fetchShops()
  await fetchPlaces()
})
</script>

<template>
  <v-app-bar
    class="px-0 !z-20 "
    height="60"
  >
    <div class="flex ml-6 w-full">
      <v-app-bar-title>
        <span class=" font-semibold text-xl">
          Places
        </span>
      </v-app-bar-title>
    </div>

    <template #append>
      <v-app-bar-nav-icon>
        <Icon name="gg:add" size="24" @click="openAddPlace = true" />
      </v-app-bar-nav-icon>
    </template>
  </v-app-bar>

  <v-main class="bg-gray-50 ">
    <v-container id="qq" fluid class="">
      <div class="flex flex-col !px-0  ">
        <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div v-else-if="placesList?.length" id="table-list" class="!h-full !shadow-md !rounded-[10px]">
          <v-table
            fixed-header
          >
            <thead class="py-0">
              <tr class="">
                <th class="text-left text-sm !bg-primary text-white !font-semibold">
                  No
                </th>
                <th class="text-left text-sm  !bg-primary text-white !font-semibold">
                  Places
                </th>
                <th class="text-center text-sm  !bg-primary text-white !font-semibold">
                  Shops
                </th>

                <th class="text-end text-sm  !bg-primary text-white !font-semibold">
                  {{ '' }}
                </th>
              </tr>
            </thead>

            <tbody class="text-sm">
              <tr
                v-for="(item, index) in placesList"
                :key="item"
                class="w-full !py-10 !h-10 text-sm"
              >
                <td class="text-xs">
                  {{ index + 1 }}
                </td>
                <td class="w-fit text-xs">
                  {{ item }}
                </td>

                <td class="w-fit text-xs text-center">
                  {{ getShopCount(item) }}
                </td>

                <td class="text-end text-xs ">
                  <span class="  text-end ">
                    <button>
                      <Icon name="icon-park-outline:more-one" size="22" class="" />
                    </button>

                    <v-menu activator="parent" width="110px" class="!w-[50px]">
                      <v-list>
                        <v-list-item @click="openDeletePlace = true ; selectedIndex = index">
                          <template #append>
                            <Icon name="mdi:delete-outline" size="18" />
                          </template>
                          <v-list-item-title>
                            Delete
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div v-else-if="!placesList?.length" class="!h-[200px]  w-full  flex  rounded-b-[10px] items-center justify-center mt-[200px]">
          <ImagesNoData class="scale-40 " />
        </div>
      </div>
    </v-container>
  </v-main>

  <PlacesDialogAdd v-model="openAddPlace" :places-list="placesList" @refresh="fetchPlaces" />
  <PlacesDialogDelete v-model="openDeletePlace" :places-list="placesList" :index="selectedIndex" @refresh="fetchPlaces" />
</template>
