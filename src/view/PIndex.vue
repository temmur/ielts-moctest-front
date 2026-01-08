<template>
  <div class="min-h-screen bg-white flex items-center justify-center">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

      <!-- Loading -->
      <div v-if="loading" class="text-center">
        <p class="text-gray-500">Загрузка теста...</p>
      </div>

      <!-- No test -->
      <div v-else-if="!test" class="text-center space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">
          Тест не назначен
        </h2>

        <p class="text-gray-500 text-sm">
          Пожалуйста, ожидайте инструкций преподавателя
        </p>

        <button
            @click="logout"
            class="w-full mt-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition"
        >
          Logout
        </button>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            Student Dashboard
          </h2>

          <span
              class="px-3 py-1 rounded-full text-xs font-semibold
                   bg-indigo-50 text-indigo-600"
          >
            {{ test.status.toUpperCase() }}
          </span>
        </div>

        <p class="text-sm text-gray-500">
          Нажмите кнопку ниже, чтобы начать текущий этап теста
        </p>

        <!-- Actions -->
        <div class="space-y-3">
          <button
              v-if="test.status === 'listening'"
              @click="startListening"
              class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                   text-white font-semibold transition"
          >
            Начать Listening
          </button>

          <button
              v-if="test.status === 'reading'"
              @click="startReading"
              class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                   text-white font-semibold transition"
          >
            Начать Reading
          </button>

          <button
              v-if="test.status === 'writing'"
              @click="startWriting"
              class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                   text-white font-semibold transition"
          >
            Начать Writing
          </button>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t">
          <button
              @click="logout"
              class="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100
                   text-red-600 font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

const test = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    router.push('/login')
    return
  }

  const { data, error } = await supabase
      .from('student_tests')
      .select('*')
      .eq('student_id', session.user.id)
      .single()

  if (error) {
    console.warn('Тест не найден')
  } else {
    test.value = data
  }

  loading.value = false
})

const startListening = () => {
  router.push(`/test/listening/${test.value.id}`)
}

const startReading = () => {
  router.push(`/test/reading/${test.value.id}`)
}

const startWriting = () => {
  router.push(`/test/writing/${test.value.id}`)
}
</script>

