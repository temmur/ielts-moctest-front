

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import SentenceCompletion from '@/components/questions/SentenceCompletion.vue'
import MultipleChoice from '@/components/questions/MultipleChoice.vue'
import Matching from '@/components/questions/Matching.vue'

/* =========================
   BASIC STATE
========================= */
const router = useRouter()

const locked = ref(false)
const timeLeft = ref(180)
let timer: number | null = null

const audioRef = ref<HTMLAudioElement | null>(null)
const answers = ref<Record<number, any>>({})

/* =========================
   TEST DATA
========================= */
const test = ref({
  id: 1,
  title: 'Cambridge Academic Listening Test 1',
  audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  duration: 180
})

const currentPartIndex = ref(0)

const parts = ref([
  {
    part: 1,
    questions: [
      { id: 101, type: 'sentence', before: 'The library opens at', after: 'in the morning.', correct: '8 am' },
      { id: 102, type: 'sentence', before: 'The train arrives at', after: 'every day.', correct: '7 am' }
    ]
  },
  {
    part: 2,
    questions: [
      { id: 201, type: 'mcq', text: 'What time does the tour start?', options: ['9 am', '10 am', '11 am'], correct: '10 am' }
    ]
  },
  {
    part: 3,
    questions: [
      {
        id: 301,
        type: 'matching',
        left: ['John', 'Mary'],
        right: ['Reception', 'Library', 'Cafeteria'],
        correct: {
          0: 'Library',
          1: 'Cafeteria'
        }
      }
    ]
  },
  {
    part: 4,
    questions: [
      {
        id: 401,
        type: 'mcq',
        text: 'Where Anna is going on her holiday?',
        options: ['London', 'New York', 'Great Britain'],
        correct: 'Great Britain'
      }
    ]
  }
])

/* =========================
   INITIALIZE MATCHING ANSWERS
========================= */
parts.value.forEach(part => {
  part.questions.forEach(q => {
    if (q.type === 'matching' && !answers.value[q.id]) {
      answers.value[q.id] = {}
    }
  })
})

/* =========================
   TIMER
========================= */
const startTimer = () => {
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      locked.value = true
      submitListening()
    }
  }, 1000)
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* =========================
   NAVIGATION
========================= */
const nextPart = () => {
  if (currentPartIndex.value < parts.value.length - 1) {
    currentPartIndex.value++
  }
}

/* =========================
   SUBMIT + SCORING
========================= */
const submitListening = () => {
  if (timer) clearInterval(timer)

  let total = 0
  let correctCount = 0

  parts.value.forEach(part => {
    part.questions.forEach(q => {
      total++

      if (q.type === 'matching') {
        const student = answers.value[q.id]
        const correct = q.correct

        let isCorrect = true
        Object.keys(correct).forEach(key => {
          if (student?.[key] !== correct[key]) {
            isCorrect = false
          }
        })

        if (isCorrect) correctCount++
      } else {
        if (answers.value[q.id] === q.correct) correctCount++
      }
    })
  })

  alert(`Your score: ${correctCount} / ${total}`)

  localStorage.setItem('listeningAnswers', JSON.stringify(answers.value))
  localStorage.setItem('listeningScore', `${correctCount}/${total}`)

  router.push('/test/reading')
}

/* =========================
   LIFECYCLE
========================= */
onMounted(() => {
  timeLeft.value = test.value.duration
  startTimer()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(answers, val => {
  localStorage.setItem('listeningAnswers', JSON.stringify(val))
}, { deep: true })
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- HEADER -->
    <div class="sticky top-0 bg-white border-b z-10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between">
        <h1 class="text-xl font-bold">
          <span class="text-red-600 text-4xl mr-2">IELTS</span>
          Listening
        </h1>
        <div class="text-lg font-mono text-red-600">
          ⏱ {{ formatTime(timeLeft) }}
        </div>
      </div>
    </div>

    <!-- AUDIO -->
    <div class="max-w-6xl mx-auto px-6 py-6">
      <audio
          ref="audioRef"
          :src="test.audio_url"
          autoplay
          class="w-full"
      />
      <p class="text-sm text-gray-500 mt-2">
        Audio will be played once only.
      </p>
    </div>

    <!-- QUESTIONS -->
    <div class="max-w-6xl mx-auto px-6 py-6">
      <h2 class="text-lg font-semibold mb-4">
        Section {{ parts[currentPartIndex].part }}
      </h2>

      <div
          v-for="q in parts[currentPartIndex].questions"
          :key="q.id"
          class="mb-6"
      >
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
      </div>
    </div>

    <!-- BUTTONS -->
    <div class="max-w-6xl mx-auto px-6 py-6 text-center">
      <button
          v-if="currentPartIndex < parts.length - 1"
          @click="nextPart"
          class="px-8 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Next Section
      </button>

      <button
          v-else
          @click="submitListening"
          class="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-500"
      >
        Finish Listening
      </button>
    </div>

  </div>
</template>
