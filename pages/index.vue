<script setup>
    import { doc, setDoc, getDocs , collection, addDoc } from 'firebase/firestore'

    const { db } = useFirebaseStore()

    const billList = ref([]);

    // const fetchData = async () => {
    //     try {
    //         const querySnapshot = await getDocs(collection(db, 'Bill'));
    //         billList.value = querySnapshot.docs.map(doc => ({
    //             id: doc.id,
    //             ...doc.data(),
    //         }));
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // };

    // onMounted (async () => {
    //     await fetchData();
    //     //other functions
    // })

    const router = useRouter()

    const gotoShops = () => {
        router.push({ path: '/shops'});
    }

</script>
<template>
    <div>
        <div class="flex flex-col gap-5">
            <BaseButton class="h-[60px]" @click="gotoShops">
                SHOPS
            </BaseButton>

            <BaseButton class="h-[60px]" @click="gotoShops">
                PRODUCTS
            </BaseButton>

            <BaseButton class="h-[60px]" @click="gotoShops">
                STOCK
            </BaseButton>

            <BaseButton class="h-[60px]" @click="gotoShops">
                REPORT
            </BaseButton>
        </div>
    </div>
</template>