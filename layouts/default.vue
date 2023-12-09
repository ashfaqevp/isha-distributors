<script setup>
const router = useRouter()
const selectedItem = ref(3)

// const route = useRoute()
console.log(router)

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

    default:
      selectedItem.value = 2
  }
}, { deep: true, immediate: true })
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

        <v-btn :active="selectedItem === 4" @click="navigate('/products')">
          <Icon :name=" selectedItem === 4 ? 'mingcute:more-3-fill' : 'mingcute:more-3-line'" :class="selectedItem === 4 ? '!text-primary text-[34px]' : 'text-[26px]'" />
        </v-btn>
      </v-bottom-navigation>
    </div>
  </div>
</template>
