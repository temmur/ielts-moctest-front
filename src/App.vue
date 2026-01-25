<template>
<router-view></router-view>
</template>
<script setup>
import {ref} from 'vue'
import BaseInput from "@/components/forms/BaseInput.vue";
const password = ref('')
const isLoading = ref(true)
const username = ref('')
const usernameError = ref(true)

</script>
