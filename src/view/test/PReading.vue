<template>

</template>
<script setup lang="ts">
window.addEventListener('beforeunload', (e) => {
  e.preventDefault()
  e.returnValue = ''
})
</script>
