<script setup>
import { signOut } from 'firebase/auth'

const { auth } = useFirebaseStore()
const router = useRouter()

const loading = ref(false)

async function logout() {
  await signOut(auth)
  router.push({ path: '/login' })
}

onMounted (async () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
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
          Profile
        </span>
      </v-app-bar-title>
    </div>
  </v-app-bar>
  <v-main class="bg-gray-50 ">
    <v-container id="qq" fluid class="w-full">
      <div class="flex flex-col !px-0 w-full items-center gap-y-1 mt-5 ">
        <div v-if="loading" class=" w-full flex py-20 h-full justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div v-else class="flex flex-col !px-0 w-full items-center gap-y-1 mt-5 text-center ">
          <div>
            <img :src="auth.currentUser?.photoURL" width="180" height="180" class="rounded-full ">
            <div class="text-lg font-semibold !mt-[10px]">
              {{ auth?.currentUser?.displayName }}
            </div>

            <div>
              {{ auth?.currentUser?.email }}
            </div>

            <v-btn :loading="loading" size="x-large" class=" !w-full !text-sm !font-semibold !rounded-[8px] mt-10 " @click="logout">
              <div class="flex gap-x-5 items-center justify-between !w-full">
                <Icon name="material-symbols:logout-rounded" color="red" size="24" />
                <span class="">
                  {{ 'Logout' }}
                </span>
              </div>
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>
  </v-main>
</template>
