<script setup>
import { doc, getDoc } from 'firebase/firestore'

const { db } = useFirebaseStore()

const userList = ref([])

const selectedIndex = ref(0)

const openAddUser = ref(false)
const openDeleteUser = ref(false)

const loading = ref(false)

async function fetchUsers() {
  try {
    loading.value = true
    const docRef = doc(db, 'others', 'users')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      userList.value = docSnapshot.data().user_list || []
  }
  catch (error) {
    console.error('Error fetching Users:', error)
  }
  finally {
    loading.value = false
  }
}

onMounted (async () => {
  loading.value = true
  await fetchUsers()
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
          Users
        </span>
      </v-app-bar-title>
    </div>

    <template #append>
      <v-app-bar-nav-icon>
        <Icon name="gg:add" size="24" @click="openAddUser = true" />
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

        <div v-else-if="userList?.length" id="table-list" class="!h-full !shadow-md !rounded-[10px]">
          <v-table
            fixed-header
          >
            <thead class="py-0">
              <tr class="">
                <th class="text-left text-sm !bg-primary text-white !font-semibold">
                  No
                </th>
                <th class="text-left text-sm  !bg-primary text-white !font-semibold">
                  User
                </th>
                <!-- <th class="text-center text-sm  !bg-primary text-white !font-semibold">
                  Shops
                </th> -->

                <th class="text-end text-sm  !bg-primary text-white !font-semibold">
                  {{ '' }}
                </th>
              </tr>
            </thead>

            <tbody class="text-sm">
              <tr
                v-for="(item, index) in userList"
                :key="item"
                class="w-full !py-10 !h-10 text-sm"
              >
                <td class="text-xs">
                  {{ index + 1 }}
                </td>
                <td class="w-fit text-xs">
                  {{ item }}
                </td>

                <td class="text-end text-xs ">
                  <span class="  text-end ">
                    <button>
                      <Icon name="icon-park-outline:more-one" size="22" class="" />
                    </button>

                    <v-menu activator="parent" width="110px" class="!w-[50px]">
                      <v-list>
                        <v-list-item @click="openDeleteUser = true ; selectedIndex = index">
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

        <div v-else-if="!userList?.length" class="!h-[200px]  w-full  flex  rounded-b-[10px] items-center justify-center mt-[200px]">
          <ImagesNoData class="scale-40 " />
        </div>
      </div>
    </v-container>
  </v-main>

  <UsersDialogAdd v-model="openAddUser" :user-list="userList" @refresh="fetchUsers" />
  <UsersDialogDelete v-model="openDeleteUser" :user-list="userList" :index="selectedIndex" @refresh="fetchUsers" />
</template>
