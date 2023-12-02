<template>
  <div class="h-screen flex flex-col bg-gray-50 relative ">
    <!-- <v-main> -->
    <div class="  h-full !mb-10 !absolute !botoom-[100px] w-full " :style="{ marginBottom: '200px' }">
      <slot />

      <v-bottom-navigation v-model="selectedItem">
        <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
          Shops
        </v-btn>

        <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
          Stocks
        </v-btn>

        <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
          Reports
        </v-btn>

        <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
          More
        </v-btn>
      </v-bottom-navigation>
    </div>

    <!-- </v-main> -->

    <!-- <v-bottom-navigation v-model="selectedItem">
      <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
        Shops
      </v-btn>

      <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
        Stocks
      </v-btn>

      <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
        Reports
      </v-btn>

      <v-btn :active="selectedItem === 'home'" @click="navigate('home')">
        More
      </v-btn>
    </v-bottom-navigation> -->
  </div>
</template>
