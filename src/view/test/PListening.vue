<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const test = ref<any>(null)
const sections = ref<any[]>([])
const answers = ref<Record<string, string>>({})
const timeLeft = ref(0)

const audioRef = ref<HTMLAudioElement | null>(null)
let timer: any = null

// 🔹 Load test
onMounted(async () => {
  const testId = route.params.studentTestId

  // listening test
  const { data: listeningTest } = await supabase
      .from('listening_tests')
      .select('*')
      .eq('id', testId)
      .single()

  test.value = listeningTest
  timeLeft.value = listeningTest.audio_duration

  // sections + questions
  const { data } = await supabase
      .from('listening_sections')
      .select(`
      id,
      title,
      order_number,
      listening_questions (
        id,
        order_number,
        text_before,
        text_after
      )
    `)
      .eq('test_id', testId)
      .order('order_number')

  sections.value = data || []

  startTimer()
  loading.value = false
})

// 🔹 Timer
const startTimer = () => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      submitListening()
    }
  }, 1000)
}

window.addEventListener('beforeunload', (e) => {
  e.preventDefault()
  e.returnValue = ''
})
// 🔹 Auto submit
const submitListening = async () => {
  clearInterval(timer)
  alert('Listening finished (submit logic next)')
  router.push('/')
}

// 🔹 Format time
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b z-10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">
          <span class="text-red-500 text-4xl mr-2 font-bold">IELTS</span>Listening
        </h1>

        <div class="text-lg font-mono text-red-600">
          ⏱ {{ formatTime(timeLeft) }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center mt-20">
      Loading listening test...
    </div>

    <!-- Content -->
    <div v-else class="max-w-6xl mx-auto px-6 py-8">
      <!-- Audio -->
      <div class="mb-8 p-4 border rounded-lg bg-gray-50">
        <audio
            ref="audioRef"
            :src="test.audio_url"
            autoplay
            controls
            class="w-full"
        />
        <p class="text-sm text-gray-500 mt-2">
          Audio will be played only once. Do not refresh the page.
        </p>
      </div>

      <!-- Sections -->
      <div
          v-for="section in sections"
          :key="section.id"
          class="mb-12"
      >
        <h2 class="text-lg font-semibold mb-6">
          Section {{ section.order_number }}
        </h2>

        <div
            v-for="q in section.listening_questions"
            :key="q.id"
            class="flex flex-wrap items-center gap-2 mb-4"
        >
          <span class="font-medium">
            {{ q.order_number }}.
          </span>

          <span>{{ q.text_before }}</span>

          <input
              v-model="answers[q.id]"
              type="text"
              class="w-32 border-b border-gray-400 focus:outline-none focus:border-indigo-600"
          />

          <span>{{ q.text_after }}</span>
        </div>
      </div>

      <!-- Submit -->
      <div class="text-center mt-16">
        <button
            @click="submitListening"
            class="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
        >
          Submit Listening
        </button>
      </div>
    </div>
  </div>
</template>

