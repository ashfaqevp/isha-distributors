import { onAuthStateChanged } from 'firebase/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { auth } = useFirebaseStore()

  const router = useRouter()

  onAuthStateChanged(auth, (user) => {
    if (!user && to.path !== '/login')
      router.push({ path: '/login' })

    else if (to.path === '/login' && user?.auth?.currentUser?.uid)
      router.push({ path: '/shops' })
  })
})
