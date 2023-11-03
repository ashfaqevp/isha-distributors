<script setup>
const items = ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd']
</script>

<template>
  <v-container fluid class="">
    <v-list lines="two" class="!bg-gray-50">
      <template v-for="(folder, index) in items">
        <v-list-item>
          <template #prepend>
            <v-avatar color="#3b3b3b">
              AS
            </v-avatar>
          </template>

          <template #title>
            Milk
          </template>

          <!-- <template #subtitle>
            <span class="font-weight-bold">to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.
          </template> -->

          <template #append>
            37
          </template>
        </v-list-item>
        <v-divider
          v-if="index < items.length - 1"
          :key="`${index}-divider`"

          inset
        >
          />
        </v-divider>
      </template>
    </v-list>
  </v-container>
</template>
