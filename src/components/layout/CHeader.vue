<template>
  <header class="w-full bg-blue-500/20 border-b border-gray-200 shadow-sm backdrop-blur-xl">
    <div class="container mx-auto  sm:px-6 lg:px-8">
      <div class="flex items-center justify-between py-3">
        <!-- Left: Branding -->
        <div class="flex items-center">
          <div class="flex flex-col cursor-pointer">
            <h1 class="text-xl font-bold text-blue-900 tracking-tight">
              <span class="text-3xl font-[900] text-red-500 uppercase">IELTS</span> Mock Test
            </h1>
            <p class="text-sm text-blue-900 hidden sm:block">
              Practice like the real exam
            </p>
          </div>
        </div>

        <!-- Right: Logout -->
        <div class="flex items-center space-x-4">
          <CButton
              text="Log out"
              variant="red"
              size="small"
              @click="logout"
              buttonClass="flex items-center gap-2"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import CButton from "@/components/forms/CButton.vue";
import {useAuth} from "@/composables/useAuth.js";
const {logout} = useAuth()



</script>
