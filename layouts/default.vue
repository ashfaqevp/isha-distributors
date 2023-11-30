<template>
  <!-- <div class="flex flex-col border h-screen">
    <div class="">
      <Header />
    </div>

    <main class="flex-grow ">
      <Content>
        <slot />
      </Content>
    </main>
  </div> -->

  <!-- <v-layout> -->
  <div class="h-screen flex flex-col">
    <div class=" bg-gray-50 h-full ">
      <slot />
    </div>

    <!-- <div class=" h-16 bg-green-100 border-t border-[1px] w-full flex items-center justify-center ">
      <button class="bg-blue-100" @click="console.log('helloe')">
        Home
      </button>
    </div> -->
  </div>

  <!-- </v-layout> -->
</template>
