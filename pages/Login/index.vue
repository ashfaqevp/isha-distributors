<script setup>
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

definePageMeta({ layout: 'empty' })

const { firestoreDB, auth, db } = useFirebaseStore()
const router = useRouter()

const user = ref({})
const loading = ref(false)

const userList = ref([])
const adminList = ref([])

const errorMessage = ref('')

async function fetchUsers() {
  try {
    loading.value = true
    const docRef = doc(db, 'others', 'users')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      userList.value = docSnapshot.data().user_list || []
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
  finally {
    loading.value = false
  }
}

async function fetchAdmins() {
  try {
    loading.value = true
    const docRef = doc(firestoreDB, 'users', 'admins')
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists())
      adminList.value = docSnapshot.data().admin_list || []
  }
  catch (error) {
    console.error('Error fetching Places:', error)
  }
  finally {
    loading.value = false
  }
}

async function signInWithGoogle() {
  errorMessage.value = ''
  try {
    const provider = new GoogleAuthProvider()

    provider.setCustomParameters({
      prompt: 'select_account',
    })
    const result = await signInWithPopup(auth, provider)

    const allowedEmails = [...userList.value, ...adminList.value]
    const emailMatches = allowedEmails.includes(result.user.email)

    if (emailMatches) {
      user.value = result.user
      router.push({ path: '/shops' })
    }

    else {
      await signOut(auth)
      errorMessage.value = 'Unauthorized email. Please try another.'
    }
  }
  catch (error) {
    console.error(error)
  }
}

onMounted (async () => {
  // if
  await fetchUsers()
  await fetchAdmins()
})
</script>

<template>
  <v-main class="bg-gray-50 ">
    <v-container fluid class="  ">
      <div class=" w-full mt-[100px] h-full min-h-[500px] ">
        <ImagesLogin class="!scale-150" />
      </div>
    </v-container>
  </v-main>

  <div class="h-fit  !fixed !bottom-[96px] w-full flex flex-col items-center ">
    <v-btn :loading="loading" size="x-large" class=" !max-w-[320px] !px-10 mx-auto   w-full !text-sm !font-semibold !rounded-[12px] " @click="signInWithGoogle">
      <div class="flex gap-5 items-center justify-between !w-full">
        <Icon name="devicon:google" size="24" />
        <span class="mr-4 mt-2">
          {{ 'Login with Google' }}
        </span>
      </div>
    </v-btn>

    <div class="text-red text-center mt-2">
      {{ errorMessage }}
    </div>
  </div>
</template>
