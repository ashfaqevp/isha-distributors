<script setup>
// Import necessary components or libraries

// Define your layout
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 relative ">
    <!-- <v-main> -->
    <div class="  h-full !mb-10 !absolute !botoom-[100px] w-full " :style="{ marginBottom: '200px' }">
      <slot />
    </div>
  </div>
</template>

<style>
/* Your styles here */
</style>
