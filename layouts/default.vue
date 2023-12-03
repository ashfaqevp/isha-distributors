<script setup>
const router = useRouter()
const selectedItem = ref(3)

function navigate(route) {
  router.push({ path: route })
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 relative ">
    <!-- <v-main> -->
    <div class="  h-full !mb-10 !absolute !botoom-[100px] w-full " :style="{ marginBottom: '200px' }">
      <slot />

      <v-bottom-navigation v-model="selectedItem" height="60" class="!bg-gray-50 px-30" color="blue">
        <v-btn :active="selectedItem === 0" @click="navigate('/reports')">
          <Icon :name=" selectedItem === 0 ? 'bxs:bar-chart-square' : 'bx:bar-chart-square'" size="25" />
        </v-btn>

        <v-btn :active="selectedItem === 1" @click="navigate('/collection')">
          <Icon :name=" selectedItem === 1 ? 'fluent:money-24-filled' : 'fluent:money-24-regular'" size="28" />
        </v-btn>

        <v-btn :active="selectedItem === 2" @click="navigate('/shops')">
          <Icon :name=" selectedItem === 2 ? 'icon-park-solid:shop' : 'icon-park-outline:shop'" size="22" :class="selectedItem === 'shops' ? 'dd' : ''" />
        </v-btn>

        <v-btn :active="selectedItem === 3" @click="navigate('/reports')">
          <Icon :name=" selectedItem === 3 ? 'material-symbols:list-alt' : 'material-symbols:list-alt-outline'" size="26" />
        </v-btn>

        <v-btn :active="selectedItem === 4" @click="navigate('/products')">
          <Icon :name=" selectedItem === 4 ? 'mingcute:more-3-fill' : 'mingcute:more-3-line'" size="25" />
        </v-btn>
      </v-bottom-navigation>
    </div>
  </div>
</template>
