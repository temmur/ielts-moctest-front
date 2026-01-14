<template>
  <div class="flex flex-col min-h-screen bg-dark">
    <CHeader />
    <main class="h-full grow">
      <router-view />
    </main>
  </div>
</template>
<script setup lang="ts">
import CHeader from "@/components/layout/CHeader.vue";
</script>
