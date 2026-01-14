<script setup>
import { ref } from 'vue'
import { supabase } from '@/supabase'

const file = ref(null)
const status = ref('')

const uploadTest = async () => {
  if (!file.value) {
    status.value = '❌ Файл не выбран'
    return
  }

  const fileName = `test-${Date.now()}.png`

  const { data, error } = await supabase
      .storage
      .from('writing-images')
      .upload(fileName, file.value, {
        cacheControl: '3600',
        upsert: false,
      })

  if (error) {
    status.value = '❌ Ошибка: ' + error.message
    console.error(error)
  } else {
    status.value = '✅ Файл загружен: ' + data.path
    console.log(data)
  }
}
</script>

<template>
  <div style="padding:20px">
    <input type="file" @change="e => file = e.target.files[0]" />
    <br /><br />
    <button @click="uploadTest">Upload test</button>

    <p>{{ status }}</p>
  </div>
</template>
