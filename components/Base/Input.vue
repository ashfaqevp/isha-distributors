<script setup>

const props = defineProps({
    data: {
        type: [String, Number],
        default: '',
    },

    type: {
        type: String,
        default: 'text',
    },

    placeholder: {
        type: String,
        default: '',
    },

    readonly : {
        type: Boolean ,
        default: false,
    },

    modelValue: String,

})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event) => {
    emit('update:modelValue', event.target.value)
}

</script>

<template>
    <div>
        <input  :readonly="readonly" class="p-2 border rounded  w-full" :placeholder="placeholder" :type="type" :value="modelValue" @input="updateValue" />
    </div>
</template>  