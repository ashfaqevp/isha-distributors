<script setup>
import { doc, getDoc, setDoc } from 'firebase/firestore'

const props = defineProps({
  modelValue: Boolean,
  userList: Array,
  index: Number,
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { db } = useFirebaseStore()
const { setToast } = useMainStore()

const loading = ref(false)
const isOpen = ref(false)

watch(() => props?.modelValue?.length, () => {
  if (props?.modelValue)
    isOpen.value = true
}, { deep: true, immediate: true })

function onCancel() {
  emit('update:modelValue', false)
  isOpen.value = false
}

async function deleteItem() {
  loading.value = true

  try {
    const currentUsers = [...props.userList]
    const newUserList = { user_list: [...currentUsers.slice(0, props.index), ...currentUsers.slice(props.index + 1)] }
    const updateRef = doc(db, 'others', 'users')
    await setDoc(updateRef, newUserList)

    setToast(true, 'User deleted successfully', 'success')
    emit('refresh')
    onCancel()
  }
  catch (e) {
    setToast(true, 'User not deleted', 'error')
    console.error(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    width="514"
  >
    <v-card title="Delete User" class="w-full">
      <v-card-text>
        <div class="mb-5">
          Are you sure want to delete this user?
        </div>

        <v-footer class="px-0 pt-0">
          <v-row dense>
            <v-col
              cols="6"
              sm="6"
            >
              <v-btn
                color="gray"
                variant="outlined"
                block
                class="!font-semibold"
                :disabled="loading"
                height="44"
                @click="onCancel"
              >
                Cancel
              </v-btn>
            </v-col>
            <v-col
              cols="6"
              sm="6"
            >
              <v-btn
                color="error"
                block
                class="!font-semibold"
                :loading="loading"
                height="44"
                @click="deleteItem()"
              >
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-footer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
