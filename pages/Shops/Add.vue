<script setup>

import {  collection, addDoc } from 'firebase/firestore'

const router = useRouter()
const { db } = useFirebaseStore()

const shopTyeList = ['normal', 'special', 'dealer']

const name = ref('')
const place = ref('')
const phone = ref('')
const type = ref('normal')

const addShop = async () => {
    try {
        const shop ={
            name : name.value,
            place : place.value,
            phone : phone.value,
            type : type.value,
            pending : 0
        }
        const dbRef = collection(db, "shops")
        const addedDocRef = await addDoc(dbRef, shop)
        router.push('/shops/');

    } catch (e) {
        alert("Error!")
        console.error(e)
    }
}

</script>
<template>
    <div class="w-full flex justify-center h-full border-[5px] ">
        <div class="flex flex-col gap-5 w-[220px]  mt-5">

            <div class="flex flex-col gap-1">
                <label >Name :</label>
                <input class="px-2 py-1 border rounded" v-model='name'>
            </div>
            <div class="flex flex-col gap-1">
                <label>Place :</label>
                <input class="px-2 py-1 border rounded" v-model='place'>
            </div>
            <div class="flex flex-col gap-1">
                <label>Phone :</label>
                <input class="px-2 py-1 border rounded" v-model='phone'>
            </div>

            <div class="flex flex-col gap-1">
                <label>Type :</label>
                <select class="px-2 py-1 border rounded" v-model="type">
                    <option v-for="shopType in shopTyeList" :key="shopType" :value="shopType">
                        <span class="capitalize"> {{ shopType }}</span>
                    </option>
                </select>
            </div>

            <div>
                <button class="bg-blue-500 px-2 py-1 w-full rounded text-white font-semibold" @click="addShop">ADD SHOP</button>
            </div>
        </div>
    </div>

</template>