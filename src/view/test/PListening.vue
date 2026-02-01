<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

import SentenceCompletion from '@/components/questions/SentenceCompletion.vue'
import MultipleChoice from '@/components/questions/MultipleChoice.vue'
import Matching from '@/components/questions/Matching.vue'

/* =========================
   STATE
========================= */
const router = useRouter()
const locked = ref(false)
const timeLeft = ref(0)
let timer: number | null = null

const audioRef = ref<HTMLAudioElement | null>(null)
const answers = ref<Record<number, any>>({})

const test = ref<any>(null)
const parts = ref<any[]>([])
const currentPartIndex = ref(0)
const userId = ref<string | null>(null)

/* =========================
   COMPUTED
========================= */
const allQuestions = computed(() => {
  let counter = 1
  return parts.value.map(part => ({
    ...part,
    questions: part.questions.map(q => ({
      ...q,
      number: counter++
    }))
  }))
})

/* =========================
   TIMER
========================= */
const startTimer = () => {
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else finishListening()
  }, 1000)
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* =========================
   FETCH DATA
========================= */
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return router.push('/login')
  userId.value = user.id

  // TEST
  const { data: testData } = await supabase
      .from('tests')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single()

  if (!testData) return
  test.value = testData
  timeLeft.value = testData.duration ?? 0

  // LISTENING SECTION
  const { data: section } = await supabase
      .from('sections')
      .select('*')
      .eq('test_id', testData.id)
      .eq('type', 'listening')
      .single()

  if (!section) return

  // QUESTIONS
  const { data: rawQuestions } = await supabase
      .from('questions')
      .select('*')
      .eq('section_id', section.id)
      .order('id')

  if (!rawQuestions || !rawQuestions.length) return

  parts.value = [{
    part: 1,
    questions: rawQuestions.map(q => ({
      id: q.id,
      type: q.type ?? 'unknown',
      ...(q.data ?? {}),        // 🔥 SAFETY KEY
      correct: q.correct ?? null
    }))
  }]

  // init answers
  parts.value[0].questions.forEach(q => {
    if (answers.value[q.id] === undefined) {
      answers.value[q.id] = q.type === 'matching' ? {} : ''
    }
  })

  startTimer()
  console.log('TEST:', testData)
  console.log('LISTENING SECTION:', listeningSection)
  console.log('RAW QUESTIONS:', rawQuestions)

})

/* =========================
   NAVIGATION
========================= */
const nextPart = () => {
  if (currentPartIndex.value < allQuestions.value.length - 1)
    currentPartIndex.value++
}

/* =========================
   FINISH
========================= */
const finishListening = async () => {
  if (timer) clearInterval(timer)
  locked.value = true

  localStorage.setItem('listeningAnswers', JSON.stringify(answers.value))

  router.push('/test/reading')
}

/* =========================
   CLEANUP
========================= */
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(answers, v => {
  localStorage.setItem('listeningAnswers', JSON.stringify(v))
}, { deep: true })
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- HEADER -->
    <div class="sticky top-0 bg-white border-b">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between">
        <h1 class="text-xl font-bold">
          <span class="text-red-600 text-3xl mr-2">IELTS</span> Listening
        </h1>
        <div class="text-red-600 font-mono">
          ⏱ {{ formatTime(timeLeft) }}
        </div>
      </div>
    </div>

    <!-- AUDIO -->
    <div class="max-w-6xl mx-auto px-6 py-4">
      <audio
          v-if="test?.audio_url"
          ref="audioRef"
          :src="test.audio_url"
          autoplay
          controls
          class="w-full"
      />
      <p class="text-sm text-gray-500 mt-2">
        Audio will be played once only.
      </p>
    </div>

    <!-- QUESTIONS -->
    <div v-if="allQuestions.length" class="max-w-6xl mx-auto px-6 py-6">
      <div v-for="q in allQuestions[currentPartIndex].questions" :key="q.id" class="mb-6">
        <p class="font-medium mb-2">
          {{ q.number }}. {{ q.text || q.question || q.before || 'Question' }}
        </p>

        <SentenceCompletion
            v-if="q.type === 'sentence'"
            :question="q"
            v-model="answers[q.id]"
            :locked="locked"
        />

        <MultipleChoice
            v-else-if="q.type === 'mcq'"
            :question="q"
            v-model="answers[q.id]"
            :locked="locked"
        />

        <Matching
            v-else-if="q.type === 'matching'"
            :question="q"
            v-model="answers[q.id]"
            :locked="locked"
        />

        <p v-else class="text-gray-400 text-sm">
          Unsupported question type
        </p>
      </div>
    </div>

    <!-- ACTION -->
    <div class="text-center py-6">
      <button
          @click="finishListening"
          class="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-500"
      >
        Finish Listening
      </button>
    </div>

  </div>
</template>
